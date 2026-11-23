import { NextRequest, NextResponse } from "next/server";
import { registerLocalUser, createSessionCookieString } from "@/lib/auth";
import { normalizeBDPhone } from "@/lib/phone";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, companyName, phone } = body;

    if (!email || !password || !companyName || !phone) {
      return NextResponse.json(
        { status: "error", message: "সবগুলো ফিল্ড পূরণ করা আবশ্যক।" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: "error", message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" },
        { status: 400 }
      );
    }

    const phoneVal = normalizeBDPhone(phone);
    if (!phoneVal.isValid) {
      return NextResponse.json(
        { status: "error", message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।" },
        { status: 400 }
      );
    }

    const result = registerLocalUser({
      email,
      password,
      companyName,
      phone: phoneVal.normalized,
    });

    if (!result.success || !result.user) {
      return NextResponse.json({ status: "error", message: result.message }, { status: 400 });
    }

    const response = NextResponse.json({
      status: "success",
      message: "নিবন্ধন সফল হয়েছে!",
      user: result.user,
    });

    // Set HTTP-only session cookie
    response.cookies.set("fc_session", createSessionCookieString(result.user), {
      httpOnly: false, // accessible to client for reactive UI
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
