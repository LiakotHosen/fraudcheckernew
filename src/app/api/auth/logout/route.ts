import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ status: "success", message: "লগআউট সফল হয়েছে।" });
  response.cookies.delete("fc_session");
  return response;
}
