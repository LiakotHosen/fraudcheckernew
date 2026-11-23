import { NextRequest, NextResponse } from "next/server";
import { loginLocalUser, createSessionCookieString } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক।" },
        { status: 400 }
      );
    }

    const result = loginLocalUser(email, password);
    if (!result.success || !result.user) {
      return NextResponse.json({ status: "error", message: result.message }, { status: 401 });
    }

    const redirectUrl = result.user.role === "super_admin" || result.user.role === "admin" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      status: "success",
      message: "সফলভাবে লগইন হয়েছে!",
      user: result.user,
      redirectUrl,
    });

    response.cookies.set("fc_session", createSessionCookieString(result.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
