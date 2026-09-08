import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginValues = z.output<typeof loginSchema>;

const namePattern = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;

export function getPasswordRequirementState(password: string) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  return {
    hasMinimumLength: password.length >= 8,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasUppercaseLowercaseAndDigit: hasUppercase && hasLowercase && hasDigit,
    hasSpecialCharacter: /[^\p{L}\p{N}\s]/u.test(password),
  };
}

const passwordSchema = z.string().superRefine((password, context) => {
  if (!password) {
    context.addIssue({ code: "custom", message: "Enter a password." });
    return;
  }

  const requirements = getPasswordRequirementState(password);
  if (!requirements.hasMinimumLength) {
    context.addIssue({
      code: "custom",
      message: "Password must be at least 8 characters.",
    });
  }
  if (!requirements.hasUppercase) {
    context.addIssue({
      code: "custom",
      message: "Password must include an uppercase letter.",
    });
  }
  if (!requirements.hasLowercase) {
    context.addIssue({
      code: "custom",
      message: "Password must include a lowercase letter.",
    });
  }
  if (!requirements.hasDigit) {
    context.addIssue({
      code: "custom",
      message: "Password must include a digit.",
    });
  }
  if (!requirements.hasSpecialCharacter) {
    context.addIssue({
      code: "custom",
      message: "Password must include a special character.",
    });
  }
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter your full name.")
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name must be 50 characters or fewer.")
      .regex(
        namePattern,
        "Name can contain letters, spaces, apostrophes, and hyphens only.",
      ),
    email: z.string().trim().email("Enter a valid email address."),
    jobTitle: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpInput = z.input<typeof signUpSchema>;
export type SignUpValues = z.output<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
});

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordValues = z.output<typeof forgotPasswordSchema>;
