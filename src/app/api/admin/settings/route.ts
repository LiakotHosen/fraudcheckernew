import { NextRequest, NextResponse } from "next/server";
import { getPlatformConfig, savePlatformConfig, PlatformConfig } from "@/lib/settings";
import { getCurrentUserSession } from "@/lib/auth";

export async function GET() {
  const config = getPlatformConfig();
  return NextResponse.json({ status: "success", config });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    // Allow if super_admin or admin
    if (!session || (session.role !== "super_admin" && session.role !== "admin")) {
      return NextResponse.json(
        { status: "error", message: "অনুমতি নেই। শুধুমাত্র সুপার অ্যাডমিন এই সেটিংস পরিবর্তন করতে পারেন।" },
        { status: 403 }
      );
    }

    const body: PlatformConfig = await req.json();
    if (!body || !body.flashSale || !Array.isArray(body.plans)) {
      return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
    }

    const saved = savePlatformConfig(body);
    if (!saved) {
      return NextResponse.json({ status: "error", message: "Failed to persist settings" }, { status: 500 });
    }

    return NextResponse.json({
      status: "success",
      message: "প্ল্যাটফর্ম সেটিংস ও প্রাইসিং সফলভাবে আপডেট হয়েছে!",
      config: body,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
