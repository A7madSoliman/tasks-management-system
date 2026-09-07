import { describe, expect, it } from "vitest";
import {
  getPasswordRequirementState,
  loginSchema,
  signUpSchema,
} from "./schema";

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

describe("signUpSchema", () => {
  const validInput = {
    name: "Élodie O'Connor",
    email: "elodie@example.com",
    jobTitle: "Editor",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  it("accepts a Unicode name and optional job title", () => {
    expect(signUpSchema.safeParse(validInput).success).toBe(true);
    expect(
      signUpSchema.safeParse({
        name: validInput.name,
        email: validInput.email,
        password: validInput.password,
        confirmPassword: validInput.confirmPassword,
      }).success,
    ).toBe(true);
  });

  it.each(["", "Al", "a".repeat(51), "User 123"])(
    "rejects invalid names",
    (name) =>
      expect(signUpSchema.safeParse({ ...validInput, name }).success).toBe(
        false,
      ),
  );

  it("rejects an invalid email", () => {
    expect(
      signUpSchema.safeParse({ ...validInput, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it.each([
    "Short1!",
    "securepass123!",
    "SECUREPASS123!",
    "SecurePassword!",
    "SecurePass123",
  ])("rejects every password requirement failure", (password) =>
    expect(
      signUpSchema.safeParse({
        ...validInput,
        password,
        confirmPassword: password,
      }).success,
    ).toBe(false),
  );

  it("rejects confirmation mismatches", () => {
    expect(
      signUpSchema.safeParse({
        ...validInput,
        confirmPassword: "DifferentPass123!",
      }).success,
    ).toBe(false);
  });

  it("shares grouped password requirements with the live indicator state", () => {
    expect(getPasswordRequirementState("")).toEqual({
      hasMinimumLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasDigit: false,
      hasUppercaseLowercaseAndDigit: false,
      hasSpecialCharacter: false,
    });
    expect(getPasswordRequirementState("Abcdefgh1!")).toEqual({
      hasMinimumLength: true,
      hasUppercase: true,
      hasLowercase: true,
      hasDigit: true,
      hasUppercaseLowercaseAndDigit: true,
      hasSpecialCharacter: true,
    });
  });
});
