import { NextResponse } from "next/server";
import { getCurrentUserSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserSession();
  return NextResponse.json({
    status: "success",
    authenticated: Boolean(session),
    user: session,
  });
}
