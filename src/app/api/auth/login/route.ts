import { NextResponse } from "next/server";
import { login, parseLoginInput } from "@/features/auth/server/auth-server";

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    await login(parseLoginInput(input));
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
            error.status >= 400 && error.status < 600 ? error.status : 401,
        },
      );
    }
    return NextResponse.json(
      { message: "Unable to authenticate. Check your details and try again." },
      { status: 401 },
    );
  }
}
