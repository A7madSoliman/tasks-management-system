export type ShellUserProfile = {
  displayName: string;
  jobTitle?: string;
  initials: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deriveInitials(source: string): string {
  const cleaned = source.trim();
  if (!cleaned) return "US";

  // Split on whitespace or common delimiter characters for email local-parts
  const words = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "US";

  if (words.length === 1) {
    const chars = Array.from(words[0] ?? "");
    if (chars.length >= 2) {
      return ((chars[0] ?? "") + (chars[1] ?? "")).toUpperCase();
    }
    return (chars[0] ?? "").toUpperCase();
  }

  const firstChars = Array.from(words[0] ?? "");
  const secondChars = Array.from(words[1] ?? "");
  return ((firstChars[0] ?? "") + (secondChars[0] ?? "")).toUpperCase();
}

function deriveNameInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "US";

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "US";

  if (words.length === 1) {
    const chars = Array.from(words[0] ?? "");
    if (chars.length >= 2) {
      return ((chars[0] ?? "") + (chars[1] ?? "")).toUpperCase();
    }
    return (chars[0] ?? "").toUpperCase();
  }

  const firstChars = Array.from(words[0] ?? "");
  const secondChars = Array.from(words[1] ?? "");
  return ((firstChars[0] ?? "") + (secondChars[0] ?? "")).toUpperCase();
}

/**
 * Maps untrusted user/session data to a minimal, safe display profile.
 * Only safely narrowed name, email, job_title, and legacy department are read.
 * No raw user IDs, tokens, secrets, or arbitrary metadata are returned.
 */
export function mapShellUserProfile(user: unknown): ShellUserProfile {
  if (!isRecord(user)) {
    return {
      displayName: "User",
      initials: "US",
    };
  }

  const metadata = isRecord(user.user_metadata) ? user.user_metadata : null;

  // Safe narrowing for name
  const rawName =
    metadata && typeof metadata.name === "string" ? metadata.name : null;
  const normalizedName = rawName ? rawName.trim().replace(/\s+/g, " ") : "";

  // Prefer the current title field, then support legacy department metadata.
  const rawJobTitle =
    metadata && typeof metadata.job_title === "string"
      ? metadata.job_title
      : null;
  const rawDepartment =
    metadata && typeof metadata.department === "string"
      ? metadata.department
      : null;
  const normalizedTitle = rawJobTitle?.trim() || rawDepartment?.trim() || "";

  // Safe narrowing for email fallback
  const rawEmail = typeof user.email === "string" ? user.email : null;
  const trimmedEmail = rawEmail ? rawEmail.trim() : "";
  const isValidEmail = Boolean(
    trimmedEmail &&
    trimmedEmail.includes("@") &&
    trimmedEmail.split("@")[0]?.trim(),
  );

  // Scenario 1: Usable name
  if (normalizedName) {
    const initials = deriveNameInitials(normalizedName);
    const profile: ShellUserProfile = {
      displayName: normalizedName,
      initials,
    };
    if (normalizedTitle) {
      profile.jobTitle = normalizedTitle;
    }
    return profile;
  }

  // Scenario 2: Missing/malformed name, but valid email (omit jobTitle per approved truth table)
  if (isValidEmail) {
    const localPart = trimmedEmail.split("@")[0] ?? "";
    const initials = deriveInitials(localPart);
    return {
      displayName: trimmedEmail,
      initials: initials || "US",
    };
  }

  // Scenario 3: Neither usable name nor email
  return {
    displayName: "User",
    initials: "US",
  };
}
