import { describe, expect, it } from "vitest";
import { deriveInitials, mapShellUserProfile } from "./profile";

describe("profile helpers & mapper (T004)", () => {
  describe("deriveInitials", () => {
    it("derives initials from two or more words", () => {
      expect(deriveInitials("Ahmed Soliman")).toBe("AS");
      expect(deriveInitials("Ahmed Ali Soliman")).toBe("AA");
    });

    it("derives first two characters from a single word", () => {
      expect(deriveInitials("Ahmed")).toBe("AH");
    });

    it("derives single character from a one-character string", () => {
      expect(deriveInitials("A")).toBe("A");
    });

    it("handles email local-part delimiters (dot, underscore, hyphen)", () => {
      expect(deriveInitials("ahmed.soliman")).toBe("AS");
      expect(deriveInitials("ahmed_ali")).toBe("AA");
      expect(deriveInitials("ahmed-soliman")).toBe("AS");
      expect(deriveInitials("ahmed")).toBe("AH");
      expect(deriveInitials("a")).toBe("A");
    });

    it("handles empty or whitespace-only inputs safely", () => {
      expect(deriveInitials("")).toBe("US");
      expect(deriveInitials("   ")).toBe("US");
    });
  });

  describe("mapShellUserProfile Truth Table", () => {
    it('row 1: "Ahmed Soliman" with valid title', () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        email: "ahmed@example.com",
        user_metadata: {
          name: "Ahmed Soliman",
          job_title: "Project Manager",
        },
      });
      expect(result).toEqual({
        displayName: "Ahmed Soliman",
        initials: "AS",
        jobTitle: "Project Manager",
      });
    });

    it('row 2: "Ahmed Ali Soliman" with valid title', () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Ahmed Ali Soliman",
          job_title: "  Lead Architect  ",
        },
      });
      expect(result).toEqual({
        displayName: "Ahmed Ali Soliman",
        initials: "AA",
        jobTitle: "Lead Architect",
      });
    });

    it('row 3: "Ahmed" (single word) with valid title', () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Ahmed",
          job_title: "Engineer",
        },
      });
      expect(result).toEqual({
        displayName: "Ahmed",
        initials: "AH",
        jobTitle: "Engineer",
      });
    });

    it("row 4: leading and repeated whitespace name", () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "   Ahmed    Soliman   ",
          job_title: "Staff Developer",
        },
      });
      expect(result).toEqual({
        displayName: "Ahmed Soliman",
        initials: "AS",
        jobTitle: "Staff Developer",
      });
    });

    it("row 5: Unicode valid name", () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Émile Zola",
          job_title: "Writer",
        },
      });
      expect(result).toEqual({
        displayName: "Émile Zola",
        initials: "ÉZ",
        jobTitle: "Writer",
      });

      const singleUnicode = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "José",
        },
      });
      expect(singleUnicode).toEqual({
        displayName: "José",
        initials: "JO",
      });
    });

    it("row 6: one-character name (does not invent a second character)", () => {
      const result = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "A",
          job_title: "Designer",
        },
      });
      expect(result).toEqual({
        displayName: "A",
        initials: "A",
        jobTitle: "Designer",
      });
    });

    it("row 7: non-string / malformed user_metadata.name with valid email (omits jobTitle)", () => {
      const withNumberName = mapShellUserProfile({
        id: "usr-123",
        email: "ahmed.soliman@example.com",
        user_metadata: {
          name: 12345,
          job_title: "QA Engineer",
        },
      });
      expect(withNumberName).toEqual({
        displayName: "ahmed.soliman@example.com",
        initials: "AS",
      });
      expect(withNumberName).not.toHaveProperty("jobTitle");

      const withBooleanNameNoEmail = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: true,
          job_title: "QA Engineer",
        },
      });
      expect(withBooleanNameNoEmail).toEqual({
        displayName: "User",
        initials: "US",
      });
    });

    it("row 8: valid name + no usable title (omits jobTitle)", () => {
      const emptyTitle = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Ahmed Soliman",
          job_title: "   ",
        },
      });
      expect(emptyTitle).toEqual({
        displayName: "Ahmed Soliman",
        initials: "AS",
      });
      expect(emptyTitle).not.toHaveProperty("jobTitle");

      const nonStringTitle = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Ahmed Soliman",
          job_title: 999,
        },
      });
      expect(nonStringTitle).toEqual({
        displayName: "Ahmed Soliman",
        initials: "AS",
      });
      expect(nonStringTitle).not.toHaveProperty("jobTitle");

      const missingTitle = mapShellUserProfile({
        id: "usr-123",
        user_metadata: {
          name: "Ahmed Soliman",
        },
      });
      expect(missingTitle).toEqual({
        displayName: "Ahmed Soliman",
        initials: "AS",
      });
      expect(missingTitle).not.toHaveProperty("jobTitle");
    });

    it("prefers job_title over legacy department", () => {
      expect(
        mapShellUserProfile({
          user_metadata: {
            name: "Ahmed Soliman",
            job_title: "Engineering Lead",
            department: "Engineering",
          },
        }),
      ).toMatchObject({ jobTitle: "Engineering Lead" });
    });

    it.each([
      ["department only", { department: "Engineering" }, "Engineering"],
      [
        "blank job_title",
        { job_title: "   ", department: "Engineering" },
        "Engineering",
      ],
      [
        "malformed job_title",
        { job_title: 42, department: "Engineering" },
        "Engineering",
      ],
    ])("uses department legacy fallback for %s", (_label, metadata, expected) => {
      expect(
        mapShellUserProfile({ user_metadata: { name: "Ahmed", ...metadata } }),
      ).toMatchObject({ jobTitle: expected });
    });

    it("omits title when neither title field is valid", () => {
      expect(
        mapShellUserProfile({
          user_metadata: { name: "Ahmed", job_title: 42, department: "   " },
        }),
      ).not.toHaveProperty("jobTitle");
    });

    it("row 9: missing name + valid email (derives initials, omits unusable title)", () => {
      const validEmailMissingName = mapShellUserProfile({
        id: "usr-123",
        email: "ahmed.soliman@example.com",
        user_metadata: {
          job_title: "   ",
        },
      });
      expect(validEmailMissingName).toEqual({
        displayName: "ahmed.soliman@example.com",
        initials: "AS",
      });
      expect(validEmailMissingName).not.toHaveProperty("jobTitle");

      const validEmailMissingNameValidTitle = mapShellUserProfile({
        id: "usr-123",
        email: "ahmed.soliman@example.com",
        user_metadata: {
          job_title: "Senior Architect",
        },
      });
      expect(validEmailMissingNameValidTitle).toEqual({
        displayName: "ahmed.soliman@example.com",
        initials: "AS",
      });
      expect(validEmailMissingNameValidTitle).not.toHaveProperty("jobTitle");

      const singleWordEmail = mapShellUserProfile({
        id: "usr-123",
        email: "ahmed@example.com",
      });
      expect(singleWordEmail).toEqual({
        displayName: "ahmed@example.com",
        initials: "AH",
      });
    });

    it("row 10: neither usable name nor email (User / US / omits title)", () => {
      const completelyEmpty = mapShellUserProfile({});
      expect(completelyEmpty).toEqual({
        displayName: "User",
        initials: "US",
      });
      expect(completelyEmpty).not.toHaveProperty("jobTitle");

      const emptyStrings = mapShellUserProfile({
        email: "   ",
        user_metadata: {
          name: "   ",
          job_title: "Director",
        },
      });
      expect(emptyStrings).toEqual({
        displayName: "User",
        initials: "US",
      });
      expect(emptyStrings).not.toHaveProperty("jobTitle");
    });

    it("handles null, undefined, and non-object inputs safely", () => {
      expect(mapShellUserProfile(null)).toEqual({
        displayName: "User",
        initials: "US",
      });
      expect(mapShellUserProfile(undefined)).toEqual({
        displayName: "User",
        initials: "US",
      });
      expect(mapShellUserProfile("string-user")).toEqual({
        displayName: "User",
        initials: "US",
      });
      expect(mapShellUserProfile(12345)).toEqual({
        displayName: "User",
        initials: "US",
      });
    });

    it("strictly prevents raw profile and auth leakage", () => {
      const rawUser = {
        id: "secret-uuid-123",
        email: "ahmed@example.com",
        access_token: "secret-jwt-token",
        refresh_token: "secret-refresh-token",
        app_metadata: { provider: "email", roles: ["admin"] },
        user_metadata: {
          name: "Ahmed Soliman",
          job_title: "Project Manager",
          secret_field: "do-not-leak",
        },
        internal_code: 9999,
      };

      const result = mapShellUserProfile(rawUser);
      const keys = Object.keys(result);

      expect(keys.sort()).toEqual(
        ["displayName", "initials", "jobTitle"].sort(),
      );
      expect(result).not.toHaveProperty("id");
      expect(result).not.toHaveProperty("email");
      expect(result).not.toHaveProperty("access_token");
      expect(result).not.toHaveProperty("refresh_token");
      expect(result).not.toHaveProperty("app_metadata");
      expect(result).not.toHaveProperty("user_metadata");
      expect(result).not.toHaveProperty("secret_field");
      expect(result).not.toHaveProperty("internal_code");
    });
  });
});
