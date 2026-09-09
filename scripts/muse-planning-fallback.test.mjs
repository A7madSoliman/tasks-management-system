import { describe, expect, it } from "vitest";
import {
  classifyRelayFailure,
  runPlanningPass,
} from "./muse-planning-fallback.mjs";

const success = { status: "completed", exitCode: 0, finalMessage: "advisory" };
const failed = (evidence) => ({
  status: "failed",
  exitCode: 1,
  stderrTail: [evidence],
});

describe("Muse graceful fallback classifier", () => {
  it.each([
    [
      "actual HTTP/provider 429",
      failed("provider returned HTTP status 429: Too Many Requests"),
    ],
    ["provider 429", failed("provider returned 429")],
    ["quota exceeded", failed("Your quota has been exceeded")],
    ["usage allocation", failed("usage allocation exhausted")],
    ["rate limit", failed("rate-limit exhausted")],
  ])("allows fallback only for %s", (_, result) =>
    expect(classifyRelayFailure(result)).toBe("quota"),
  );

  it.each([
    "HTTP 401 authentication failure",
    "HTTP 403 forbidden",
    "EEXIST: file already exists",
    "opencode not found on PATH",
    "invalid model requested",
    "getaddrinfo ENOTFOUND provider.example",
    "request timeout",
    "sandbox preflight failed",
    "an unavailable service encountered an error",
    "limit mentioned without an explicit quota or rate condition",
  ])("denies fallback for %s", (evidence) =>
    expect(classifyRelayFailure(failed(evidence))).toBe("nonQuota"),
  );

  it.each([
    "HTTP 401 authentication failure; prior request said quota exceeded",
    "HTTP 403 forbidden; provider rate-limit exhausted in nested diagnostics",
    "getaddrinfo ENOTFOUND; quota exceeded text from cached metadata",
    "sandbox failure; HTTP 429 from an unrelated prior event",
  ])("denies ambiguous non-quota plus quota-looking evidence: %s", (evidence) =>
    expect(classifyRelayFailure(failed(evidence))).toBe("nonQuota"),
  );
});

describe("Muse graceful fallback orchestration", () => {
  it("uses Muse success without fallback", () => {
    const calls = [];
    const outcome = runPlanningPass({
      brief: "bounded brief",
      state: { fallbackActive: false },
      runRelay: (call) => {
        calls.push(call);
        return success;
      },
    });
    expect(outcome.status).toBe("muse");
    expect(calls.map((call) => call.lane)).toEqual(["planning"]);
  });

  it("sends the same bounded brief only to the read-only advisory fallback after quota evidence", () => {
    const calls = [];
    const outcome = runPlanningPass({
      brief: "bounded planning brief",
      state: { fallbackActive: false },
      runRelay: (call) => {
        calls.push(call);
        return call.lane === "planning"
          ? failed("HTTP 429 Too Many Requests")
          : success;
      },
    });
    expect(outcome.status).toBe("fallback");
    expect(calls).toEqual([
      {
        cwd: expect.any(String),
        lane: "planning",
        brief: "bounded planning brief",
      },
      {
        cwd: expect.any(String),
        lane: "planningFallback",
        brief: "bounded planning brief",
      },
    ]);
    expect(outcome.notification).toContain(
      "agy high: temporary read-only advisory review",
    );
  });

  it("stops for non-quota evidence without invoking planningFallback", () => {
    const calls = [];
    const outcome = runPlanningPass({
      brief: "bounded planning brief",
      state: { fallbackActive: false },
      runRelay: (call) => {
        calls.push(call);
        return failed("HTTP 401 authentication failure");
      },
    });
    expect(outcome.status).toBe("stopped");
    expect(calls.map((call) => call.lane)).toEqual(["planning"]);
  });

  it("restores normal workflow after a prior fallback when Muse succeeds", () => {
    const state = { fallbackActive: true };
    const outcome = runPlanningPass({
      brief: "bounded brief",
      state,
      runRelay: () => success,
    });
    expect(outcome.status).toBe("muse");
    expect(state.fallbackActive).toBe(false);
    expect(outcome.notification).toContain("Muse available again.");
  });
});
