import { NextRequest, NextResponse } from "next/server";
import { generateMerchantApiKey } from "@/lib/crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  // In a real app with Supabase Auth, extract user from session token
  const userId = req.headers.get("x-user-id") || "demo_merchant_user_1";

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: "success",
      keys: [
        {
          id: "demo-key-1",
          name: "WooCommerce Primary Store",
          keyPrefix: "fc_live_7a9c18d4",
          isActive: true,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    });
  }

  const { data: keys, error } = await supabaseAdmin
    .from("merchant_api_keys")
    .select("id, name, key_prefix, is_active, created_at, last_used_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "success", keys });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo_merchant_user_1";
    const body = await req.json();
    const name = body.name || "My Store API Key";

    const { rawKey, keyPrefix, keyHash } = generateMerchantApiKey();

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin
        .from("merchant_api_keys")
        .insert({
          user_id: userId,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: "success",
      message: "API Key created successfully. Store this key safely as it will not be shown again.",
      apiKey: rawKey,
      keyPrefix,
      name,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
