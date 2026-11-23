import { NextRequest, NextResponse } from "next/server";
import { encryptVaultData, decryptVaultData } from "@/lib/crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { querySteadfast } from "@/lib/couriers/steadfast";
import { queryPathao } from "@/lib/couriers/pathao";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo_merchant_user_1";

  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: "success",
      couriers: [
        { courier_code: "steadfast", is_active: true, status: "connected", last_verified_at: new Date().toISOString() },
        { courier_code: "pathao", is_active: false, status: "pending", last_verified_at: null },
      ],
    });
  }

  const { data, error } = await supabaseAdmin
    .from("merchant_courier_credentials")
    .select("courier_code, is_active, status, last_verified_at, additional_config")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "success", couriers: data });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "demo_merchant_user_1";
    const body = await req.json();
    const { courierCode, apiKey, apiSecret, additionalConfig, testConnection } = body;

    if (!courierCode || !apiKey) {
      return NextResponse.json({ status: "error", message: "courierCode and apiKey are required" }, { status: 400 });
    }

    // Optional connection diagnostic test
    let testResult = { success: true, message: "Credentials saved." };
    if (testConnection) {
      if (courierCode === "steadfast") {
        const res = await querySteadfast("01700000000", { apiKey, apiSecret });
        testResult = {
          success: res.status,
          message: res.status ? "Steadfast API connected successfully!" : (res.message || "Failed to connect to Steadfast"),
        };
      } else if (courierCode === "pathao") {
        const res = await queryPathao("01700000000", { apiKey, apiSecret });
        testResult = {
          success: res.status,
          message: res.status ? "Pathao API connected successfully!" : (res.message || "Failed to connect to Pathao"),
        };
      }
    }

    const encryptedApiKey = encryptVaultData(apiKey);
    const encryptedApiSecret = apiSecret ? encryptVaultData(apiSecret) : null;

    if (isSupabaseConfigured) {
      const { error } = await supabaseAdmin.from("merchant_courier_credentials").upsert(
        {
          user_id: userId,
          courier_code: courierCode,
          api_key_encrypted: encryptedApiKey,
          api_secret_encrypted: encryptedApiSecret,
          additional_config: additionalConfig || {},
          status: testResult.success ? "connected" : "failed",
          last_verified_at: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,courier_code" }
      );

      if (error) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      status: "success",
      message: `Credentials for ${courierCode} saved securely in vault.`,
      diagnostic: testResult,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
