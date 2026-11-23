import { NextRequest, NextResponse } from "next/server";
import { hashApiKey } from "@/lib/crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get("X-API-KEY") || req.headers.get("x-api-key");
  if (!apiKeyHeader) {
    return NextResponse.json(
      { status: "error", message: "Missing X-API-KEY header" },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: "success",
      data: {
        type: "merchant_demo",
        total: 1000,
        used: 12,
        remaining: 988,
        tier: "free",
        resets_at: new Date(Date.now() + 86400000 * 20).toISOString(),
      },
    });
  }

  const hashedKey = hashApiKey(apiKeyHeader);
  const { data: keyRecord } = await supabaseAdmin
    .from("merchant_api_keys")
    .select("user_id, is_active")
    .eq("key_hash", hashedKey)
    .single();

  if (!keyRecord || !keyRecord.is_active) {
    return NextResponse.json(
      { status: "error", message: "Invalid or revoked API key" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("tier, monthly_quota, used_quota, quota_resets_at")
    .eq("id", keyRecord.user_id)
    .single();

  const total = profile?.monthly_quota ?? 100;
  const used = profile?.used_quota ?? 0;
  const remaining = Math.max(0, total - used);

  return NextResponse.json({
    status: "success",
    data: {
      type: "merchant_monthly",
      tier: profile?.tier || "free",
      total,
      used,
      remaining,
      resets_at: profile?.quota_resets_at || new Date().toISOString(),
    },
  });
}
