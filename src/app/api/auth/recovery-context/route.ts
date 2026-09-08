import { NextResponse } from "next/server";
import { z } from "zod";
import { establishRecoveryContext } from "@/features/auth/server";

const recoveryCaptureSchema = z.object({
  type: z.literal("recovery"),
  accessToken: z.string().min(1),
});

const INVALID_RECOVERY_MESSAGE = "Invalid or expired reset link.";

export async function POST(request: Request) {
  try {
    const input = recoveryCaptureSchema.parse(await request.json());
    if (!(await establishRecoveryContext(input.accessToken))) {
      return NextResponse.json(
        { message: INVALID_RECOVERY_MESSAGE },
        { status: 401 },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: INVALID_RECOVERY_MESSAGE },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const { clearRecoveryContext } = await import("@/features/auth/server");
  await clearRecoveryContext();
  return new NextResponse(null, { status: 204 });
}
