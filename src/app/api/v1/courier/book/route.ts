import { NextRequest, NextResponse } from "next/server";
import { hashApiKey, decryptVaultData } from "@/lib/crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { bookSteadfastParcel } from "@/lib/couriers/steadfast";
import { bookPathaoParcel } from "@/lib/couriers/pathao";
import { ParcelBookingPayload } from "@/lib/couriers/types";

export async function POST(req: NextRequest) {
  try {
    const apiKeyHeader = req.headers.get("X-API-KEY") || req.headers.get("x-api-key");
    if (!apiKeyHeader) {
      return NextResponse.json({ status: "error", message: "Missing X-API-KEY header" }, { status: 401 });
    }

    const body = await req.json();
    const { courierCode, invoiceId, recipientName, recipientPhone, recipientAddress, codAmount, note } = body;

    if (!courierCode || !invoiceId || !recipientName || !recipientPhone || !recipientAddress) {
      return NextResponse.json(
        { status: "error", message: "Missing required parcel booking fields" },
        { status: 422 }
      );
    }

    if (!isSupabaseConfigured) {
      // Demo response
      return NextResponse.json({
        status: "success",
        success: true,
        courierCode,
        consignmentId: "DEMO_CONS_987654",
        trackingCode: "TRK_BD_DEMO_12345",
        message: "Order placed successfully in Demo Mode",
      });
    }

    // Verify merchant
    const hashedKey = hashApiKey(apiKeyHeader);
    const { data: keyRecord } = await supabaseAdmin
      .from("merchant_api_keys")
      .select("user_id, is_active")
      .eq("key_hash", hashedKey)
      .single();

    if (!keyRecord || !keyRecord.is_active) {
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 });
    }

    // Fetch merchant credentials for this courier
    const { data: credRecord } = await supabaseAdmin
      .from("merchant_courier_credentials")
      .select("*")
      .eq("user_id", keyRecord.user_id)
      .eq("courier_code", courierCode)
      .eq("is_active", true)
      .single();

    if (!credRecord) {
      return NextResponse.json(
        {
          status: "error",
          message: `No active credentials found for ${courierCode}. Please add your API key in FraudChecker dashboard.`,
        },
        { status: 404 }
      );
    }

    const apiKey = decryptVaultData(credRecord.api_key_encrypted);
    const apiSecret = credRecord.api_secret_encrypted ? decryptVaultData(credRecord.api_secret_encrypted) : undefined;
    const credentials = { apiKey, apiSecret, additionalConfig: credRecord.additional_config };

    const payload: ParcelBookingPayload = {
      invoiceId,
      recipientName,
      recipientPhone,
      recipientAddress,
      codAmount: Number(codAmount || 0),
      note,
    };

    let result;
    if (courierCode === "steadfast") {
      result = await bookSteadfastParcel(payload, credentials);
    } else if (courierCode === "pathao") {
      result = await bookPathaoParcel(payload, credentials);
    } else {
      return NextResponse.json(
        { status: "error", message: `Courier ${courierCode} does not support automatic booking yet.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: result.success ? "success" : "failed",
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
