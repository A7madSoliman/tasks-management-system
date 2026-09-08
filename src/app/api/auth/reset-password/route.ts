import { NextResponse } from "next/server";
import {
  parseResetPasswordInput,
  updateRecoveryPassword,
} from "@/features/auth/server/auth";

const INVALID_RECOVERY_MESSAGE = "Invalid or expired reset link.";
const UPDATE_FAILURE_MESSAGE =
  "Unable to update your password. Please try again.";

export async function POST(request: Request) {
  try {
    await updateRecoveryPassword(parseResetPasswordInput(await request.json()));
    return NextResponse.json({ success: true });
  } catch (error) {
    const invalid =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error.status === 401 || error.status === 403);
    return NextResponse.json(
      { message: invalid ? INVALID_RECOVERY_MESSAGE : UPDATE_FAILURE_MESSAGE },
      { status: invalid ? 401 : 400 },
    );
  }
}
