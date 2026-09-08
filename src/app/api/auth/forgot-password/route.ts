import { NextResponse } from "next/server";
import {
  parseForgotPasswordInput,
  requestPasswordRecovery,
} from "@/features/auth/server/auth";

export const RECOVERY_SUCCESS_MESSAGE =
  "If an account exists with this email, we’ve sent a password reset link.";
const RECOVERY_FAILURE_MESSAGE =
  "Unable to send the reset link right now. Please try again.";

function safeStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 600
  ) {
    return error.status;
  }
  return 400;
}

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    await requestPasswordRecovery(parseForgotPasswordInput(input));
    return NextResponse.json({
      success: true,
      message: RECOVERY_SUCCESS_MESSAGE,
    });
  } catch (error) {
    return NextResponse.json(
      { message: RECOVERY_FAILURE_MESSAGE },
      { status: safeStatus(error) },
    );
  }
}
