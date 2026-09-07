import { describe, expect, it } from "vitest";
import { loginSchema } from "./schema";

describe("loginSchema", () => {
  it("validates required email and password fields", () => {
    const missingBoth = loginSchema.safeParse({});
    expect(missingBoth.success).toBe(false);
    if (!missingBoth.success) {
      expect(missingBoth.error.issues.length).toBeGreaterThanOrEqual(2);
      expect(missingBoth.error.flatten().fieldErrors.email).toBeDefined();
      expect(missingBoth.error.flatten().fieldErrors.password).toBeDefined();
    }

    const emptyStrings = loginSchema.safeParse({
      email: "",
      password: "",
    });
    expect(emptyStrings.success).toBe(false);
    if (!emptyStrings.success) {
      const fieldErrors = emptyStrings.error.flatten().fieldErrors;
      expect(fieldErrors.email).toContain("Enter a valid email address.");
      expect(fieldErrors.password).toContain("Enter your password.");
    }

    const whitespaceOnly = loginSchema.safeParse({
      email: "   ",
      password: "",
    });
    expect(whitespaceOnly.success).toBe(false);
    if (!whitespaceOnly.success) {
      const fieldErrors = whitespaceOnly.error.flatten().fieldErrors;
      expect(fieldErrors.email).toContain("Enter a valid email address.");
      expect(fieldErrors.password).toContain("Enter your password.");
    }
  });

  it("rejects invalid email formats", () => {
    const invalidEmails = [
      "not-an-email",
      "missing-at-sign.com",
      "@no-local-part.com",
      "user@.com",
      "user@domain@domain.com",
    ];

    for (const email of invalidEmails) {
      const result = loginSchema.safeParse({
        email,
        password: "valid-password-123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.email).toContain("Enter a valid email address.");
      }
    }
  });

  it("parses valid input and trims email whitespace", () => {
    const result = loginSchema.safeParse({
      email: "  curator@workspace.com  ",
      password: "valid-password-123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("curator@workspace.com");
      expect(result.data.password).toBe("valid-password-123");
      expect(result.data.rememberMe).toBe(false);
    }
  });

  it("defaults rememberMe to false when omitted", () => {
    const result = loginSchema.safeParse({
      email: "curator@workspace.com",
      password: "valid-password-123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(false);
    }
  });

  it("accepts explicit rememberMe boolean values", () => {
    const trueResult = loginSchema.safeParse({
      email: "curator@workspace.com",
      password: "valid-password-123",
      rememberMe: true,
    });
    expect(trueResult.success).toBe(true);
    if (trueResult.success) {
      expect(trueResult.data.rememberMe).toBe(true);
    }

    const falseResult = loginSchema.safeParse({
      email: "curator@workspace.com",
      password: "valid-password-123",
      rememberMe: false,
    });
    expect(falseResult.success).toBe(true);
    if (falseResult.success) {
      expect(falseResult.data.rememberMe).toBe(false);
    }
  });
});
