import { NextResponse } from "next/server";
import { parseSignUpInput, signUp } from "@/features/auth/server/auth";

const FALLBACK_ERROR = "Unable to create your account. Please try again.";

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    await signUp(parseSignUpInput(input));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return NextResponse.json(
        { message: error.message },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 400,
        },
      );
    }

    return NextResponse.json({ message: FALLBACK_ERROR }, { status: 400 });
  }
}
