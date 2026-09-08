import { NextResponse } from "next/server";
import { logout } from "@/features/auth/server/auth-server";

/** Server-side logout capability for the verified Auth contract; no UI exists yet. */
export async function POST() {
  await logout();
  return new NextResponse(null, { status: 204 });
}
