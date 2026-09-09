#!/usr/bin/env node
/**
 * Codex-owned planning relay orchestration. Muse is always attempted first.
 * Only explicit provider quota/rate-limit evidence may route the same brief to
 * the read-only planningFallback lane. This script never selects write lanes.
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const PLANNING_LANE = "planning";
const FALLBACK_LANE = "planningFallback";
const FALLBACK_NOTICE = [
  "Muse fallback activated.",
  "Reason: verified Muse/OpenCode quota or rate-limit condition.",
  "",
  "Planning review redistributed to:",
  "- agy high: temporary read-only advisory review",
  "- Codex: independent analysis + final decision",
  "",
  "Muse will be attempted again at the next eligible M1/M2 pass.",
].join("\n");
const RECOVERY_NOTICE =
  "Muse available again.\nNormal Muse M1/M2 workflow restored.";

/** Convert relay fields and textual artifacts into a searchable, non-secret summary. */
export function normalizeRelayEvidence(result = {}) {
  const fields = [
    result.status,
    result.exitCode,
    result.error,
    result.stderrTail,
    result.finalMessage,
    result.events,
    result.eventsText,
  ];
  return fields
    .flat(Infinity)
    .filter((value) => value !== undefined && value !== null)
    .map((value) => (typeof value === "string" ? value : JSON.stringify(value)))
    .join("\n");
}

/**
 * Deny-by-default classification. HTTP status may only be inferred from text;
 * a bare number or generic "limit" word never permits fallback.
 */
export function classifyRelayFailure(result = {}) {
  const text = normalizeRelayEvidence(result).toLowerCase();
  // A known non-quota failure wins over quota-looking text. Relays can preserve
  // nested provider diagnostics, so positive evidence is not sufficient when
  // the same artifact also establishes auth, runtime, sandbox, or network loss.
  const explicitNonQuota =
    /\b(?:401|403)\b|\beexist\b|\b(?:not found on path|enoent|spawn\s+[^\n]*\s+not found)\b|\bsandbox\b|\binvalid model\b|\btimeout\b|\b(?:enotfound|getaddrinfo|dns|network)\b/.test(
      text,
    );
  if (explicitNonQuota) return "nonQuota";
  const explicit429 =
    /(?:\bhttp(?:\s+status)?\s*[:=]?\s*429\b|\bprovider(?:\s+(?:returned|response|error))?\s*[:=]?\s*429\b|\bstatus(?:\s+code)?\s*[:=]?\s*429\b|\b429\s+(?:too many requests|rate limit(?:ed)?))/.test(
      text,
    );
  const quotaExceeded =
    /\b(?:quota|allocation)\s+(?:has\s+been\s+)?(?:exceeded|exhausted)\b|\binsufficient\s+quota\b/.test(
      text,
    );
  const usageLimit =
    /\busage\s+limit\s+(?:has\s+been\s+)?(?:reached|exceeded|exhausted)\b/.test(
      text,
    );
  const rateLimit =
    /\brate[-\s]*limit(?:ed)?\s+(?:has\s+been\s+)?(?:reached|exceeded|exhausted)\b/.test(
      text,
    );
  return explicit429 || quotaExceeded || usageLimit || rateLimit
    ? "quota"
    : "nonQuota";
}

export function isRelaySuccess(result) {
  return result?.status === "completed" && result?.exitCode === 0;
}

function statePath(cwd) {
  try {
    const gitPath = execFileSync(
      "git",
      [
        "-C",
        cwd,
        "rev-parse",
        "--git-path",
        "delegate-skills/muse-planning-fallback.json",
      ],
      { encoding: "utf8" },
    ).trim();
    return resolve(cwd, gitPath);
  } catch {
    return null;
  }
}

function readFallbackActive(cwd) {
  const path = statePath(cwd);
  if (!path || !existsSync(path)) return false;
  try {
    return JSON.parse(readFileSync(path, "utf8")).fallbackActive === true;
  } catch {
    return false;
  }
}

function writeFallbackActive(cwd, fallbackActive) {
  const path = statePath(cwd);
  if (!path) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify({ fallbackActive })}\n`, "utf8");
}

function relayPath(implementer) {
  const override =
    implementer === "opencode"
      ? process.env.DELEGATE_OPENCODE_RELAY
      : process.env.DELEGATE_AGY_RELAY;
  if (override) return resolve(override);
  return join(
    homedir(),
    ".agents",
    "skills",
    `${implementer}-delegate`,
    "scripts",
    "relay.mjs",
  );
}

function readOptional(path) {
  return path && existsSync(path) ? readFileSync(path, "utf8") : "";
}

/** Execute an installed relay with a fixed planning lane; used only by the CLI entrypoint. */
export function executeRelay({ cwd, lane, brief }) {
  const implementer = lane === PLANNING_LANE ? "opencode" : "agy";
  const relay = relayPath(implementer);
  const outDir = mkdtempSync(join(tmpdir(), "taskly-muse-planning-"));
  const briefPath = join(outDir, "brief.txt");
  writeFileSync(briefPath, brief, "utf8");
  const child = spawnSync(
    process.execPath,
    [
      relay,
      "--cd",
      cwd,
      "--lane",
      lane,
      "--brief",
      briefPath,
      "--out-dir",
      outDir,
    ],
    {
      cwd,
      encoding: "utf8",
    },
  );
  const resultPath = join(outDir, "result.json");
  const result = existsSync(resultPath)
    ? JSON.parse(readFileSync(resultPath, "utf8"))
    : {
        status: "failed",
        exitCode: child.status ?? 1,
        error: "relay did not produce result.json",
      };
  return {
    ...result,
    stderrTail:
      result.stderrTail ??
      child.stderr?.split(/\r?\n/).filter(Boolean).slice(-20) ??
      [],
    finalMessage:
      result.finalMessage ?? readOptional(join(outDir, "final.txt")),
    eventsText: readOptional(join(outDir, "events.jsonl")),
    artifactDir: outDir,
  };
}

/** Injectable core for deterministic synthetic tests and future Codex orchestration. */
export function runPlanningPass({
  brief,
  cwd = process.cwd(),
  runRelay = executeRelay,
  state = null,
}) {
  const wasFallbackActive = state?.fallbackActive ?? readFallbackActive(cwd);
  const setFallbackActive = (value) => {
    if (state) state.fallbackActive = value;
    else writeFallbackActive(cwd, value);
  };
  const muse = runRelay({ cwd, lane: PLANNING_LANE, brief });
  if (isRelaySuccess(muse)) {
    if (wasFallbackActive) setFallbackActive(false);
    return {
      status: "muse",
      muse,
      fallback: null,
      notification: wasFallbackActive ? RECOVERY_NOTICE : null,
    };
  }
  if (classifyRelayFailure(muse) !== "quota") {
    return {
      status: "stopped",
      muse,
      fallback: null,
      notification:
        "Muse planning failed for an infrastructure or unclassified non-quota reason. Fallback was not activated.",
    };
  }
  setFallbackActive(true);
  const fallback = runRelay({ cwd, lane: FALLBACK_LANE, brief });
  return {
    status: isRelaySuccess(fallback) ? "fallback" : "fallbackFailed",
    muse,
    fallback,
    notification: FALLBACK_NOTICE,
  };
}

function main(argv) {
  const briefIndex = argv.indexOf("--brief");
  if (briefIndex === -1 || !argv[briefIndex + 1])
    throw new Error(
      "usage: node scripts/muse-planning-fallback.mjs --brief <file> [--cwd <dir>]",
    );
  const cwdIndex = argv.indexOf("--cwd");
  const cwd = cwdIndex === -1 ? process.cwd() : resolve(argv[cwdIndex + 1]);
  const brief = readFileSync(resolve(argv[briefIndex + 1]), "utf8");
  if (!brief.trim()) throw new Error("planning brief must not be empty");
  const outcome = runPlanningPass({ brief, cwd });
  process.stdout.write(`${JSON.stringify(outcome, null, 2)}\n`);
  process.exit(
    outcome.status === "muse" || outcome.status === "fallback" ? 0 : 1,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`muse planning fallback: ${error.message}\n`);
    process.exit(2);
  }
}
