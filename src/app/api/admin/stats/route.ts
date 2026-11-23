import { NextResponse } from "next/server";
import { getAllLocalUsers, getCurrentUserSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUserSession();
  if (!session || (session.role !== "super_admin" && session.role !== "admin")) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
  }

  const users = getAllLocalUsers();
  const merchants = users.filter((u) => u.role !== "super_admin");

  return NextResponse.json({
    status: "success",
    stats: {
      totalMerchants: merchants.length,
      totalCouriersConnected: 5,
      activePlans: {
        free: merchants.filter((m) => m.tier === "free").length,
        pro: merchants.filter((m) => m.tier === "pro").length,
        business: merchants.filter((m) => m.tier === "business").length,
      },
      merchantsList: merchants.map((m) => ({
        id: m.id,
        email: m.email,
        companyName: m.companyName,
        phone: m.phone,
        tier: m.tier,
        createdAt: m.createdAt,
      })),
    },
  });
}
