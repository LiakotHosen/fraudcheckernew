import { NextRequest, NextResponse } from "next/server";
import { normalizeBDPhone } from "@/lib/phone";
import { hashApiKey, decryptVaultData } from "@/lib/crypto";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { querySteadfast } from "@/lib/couriers/steadfast";
import { queryPathao } from "@/lib/couriers/pathao";
import { queryRedX } from "@/lib/couriers/redx";
import { evaluateFraudRisk } from "@/lib/scoring";
import { CourierQueryResult } from "@/lib/couriers/types";

export async function POST(req: NextRequest) {
  return handleFraudCheck(req);
}

export async function GET(req: NextRequest) {
  return handleFraudCheck(req);
}

async function handleFraudCheck(req: NextRequest) {
  try {
    let rawPhone = "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        rawPhone = body.phone || "";
      } catch {
        return NextResponse.json({ status: "error", message: "Invalid JSON body" }, { status: 400 });
      }
    } else {
      const { searchParams } = new URL(req.url);
      rawPhone = searchParams.get("phone") || "";
    }

    // 1. Validate Bangladeshi phone number
    const phoneVal = normalizeBDPhone(rawPhone);
    if (!phoneVal.isValid) {
      return NextResponse.json(
        {
          status: "error",
          message: phoneVal.error || "Invalid Bangladeshi phone number",
          phone: rawPhone,
        },
        { status: 422 }
      );
    }

    const cleanPhone = phoneVal.normalized;

    // 2. Authentication via X-API-KEY
    const apiKeyHeader = req.headers.get("X-API-KEY") || req.headers.get("x-api-key");
    let merchantUserId: string | null = null;
    let merchantProfile: any = null;

    if (apiKeyHeader && isSupabaseConfigured) {
      const hashedKey = hashApiKey(apiKeyHeader);
      const { data: keyRecord } = await supabaseAdmin
        .from("merchant_api_keys")
        .select("id, user_id, is_active")
        .eq("key_hash", hashedKey)
        .single();

      if (!keyRecord || !keyRecord.is_active) {
        return NextResponse.json(
          { status: "error", message: "Invalid or inactive API Key" },
          { status: 401 }
        );
      }

      merchantUserId = keyRecord.user_id;

      // Check merchant quota
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", merchantUserId)
        .single();

      if (profile) {
        merchantProfile = profile;
        if (profile.used_quota >= profile.monthly_quota && profile.tier === "free") {
          return NextResponse.json(
            {
              status: "error",
              message: "Monthly API quota exceeded. Upgrade to Pro for unlimited checks.",
              quota: { used: profile.used_quota, limit: profile.monthly_quota },
            },
            { status: 429 }
          );
        }
      }

      // Update last used at
      await supabaseAdmin
        .from("merchant_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyRecord.id);
    }

    // 3. Fetch Merchant's Vaulted Courier Credentials
    const courierResults: CourierQueryResult[] = [];
    if (merchantUserId && isSupabaseConfigured) {
      const { data: credsList } = await supabaseAdmin
        .from("merchant_courier_credentials")
        .select("*")
        .eq("user_id", merchantUserId)
        .eq("is_active", true);

      if (credsList && credsList.length > 0) {
        const promises = credsList.map(async (cred) => {
          const apiKey = decryptVaultData(cred.api_key_encrypted);
          const apiSecret = cred.api_secret_encrypted ? decryptVaultData(cred.api_secret_encrypted) : undefined;
          const credentials = { apiKey, apiSecret, additionalConfig: cred.additional_config };

          if (cred.courier_code === "steadfast") {
            return querySteadfast(cleanPhone, credentials);
          } else if (cred.courier_code === "pathao") {
            return queryPathao(cleanPhone, credentials);
          } else if (cred.courier_code === "redx") {
            return queryRedX(cleanPhone, credentials);
          }
          return null;
        });

        const resolved = await Promise.all(promises);
        for (const r of resolved) {
          if (r) courierResults.push(r);
        }
      }
    }

    // 4. Fetch Crowdsourced Community Reports and Phone Cache
    let cachedDbRecord = null;
    let communityReports: any[] = [];

    if (isSupabaseConfigured) {
      const [recordRes, reportsRes] = await Promise.all([
        supabaseAdmin.from("phone_records").select("*").eq("phone", cleanPhone).maybeSingle(),
        supabaseAdmin.from("fraud_reports").select("*").eq("phone", cleanPhone).eq("status", "verified"),
      ]);

      cachedDbRecord = recordRes.data;
      communityReports = reportsRes.data || [];
    } else {
      // Mock / Offline Demo Mode when Supabase is not yet connected
      if (cleanPhone.endsWith("88") || cleanPhone.endsWith("77")) {
        cachedDbRecord = {
          phone: cleanPhone,
          total_orders: 45,
          delivered_orders: 43,
          cancelled_orders: 2,
        };
      } else if (cleanPhone.endsWith("00") || cleanPhone.endsWith("13")) {
        cachedDbRecord = {
          phone: cleanPhone,
          total_orders: 14,
          delivered_orders: 4,
          cancelled_orders: 10,
        };
        communityReports = [
          {
            report_code: "rep_fake_01",
            title: "Fake Order / Refused to Receive at Doorstep",
            incident_type: "refused_delivery",
            order_amount: 1450,
            courier_name: "Steadfast",
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ];
      }
    }

    // 5. Evaluate Fraud Risk & Calculate Score
    const evaluation = evaluateFraudRisk(cleanPhone, courierResults, communityReports, cachedDbRecord);

    // 6. Update Database Cache & Increment Merchant Quota
    if (isSupabaseConfigured) {
      // Upsert phone record
      supabaseAdmin
        .from("phone_records")
        .upsert(
          {
            phone: cleanPhone,
            total_orders: evaluation.totalParcel,
            delivered_orders: evaluation.successParcel,
            cancelled_orders: evaluation.cancelParcel,
            calculated_score: evaluation.score,
            risk_level: evaluation.status,
            courier_breakdown: evaluation.courierBreakdown,
            last_queried_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone" }
        )
        .then();

      // Log search
      supabaseAdmin
        .from("search_logs")
        .insert({
          user_id: merchantUserId,
          phone: cleanPhone,
          score: evaluation.score,
          status: evaluation.status,
          source: apiKeyHeader ? "api" : "web",
        })
        .then();

      // Increment quota if merchant
      if (merchantUserId && merchantProfile) {
        supabaseAdmin
          .from("profiles")
          .update({ used_quota: merchantProfile.used_quota + 1 })
          .eq("id", merchantUserId)
          .then();
      }
    }

    // 7. Return Structured API Response
    return NextResponse.json(
      {
        status: "success",
        phone: evaluation.phone,
        operator: phoneVal.operator,
        formattedPhone: phoneVal.formatted,
        score: evaluation.score,
        riskLevel: evaluation.status,
        statusLabel: evaluation.status,
        totalParcel: evaluation.totalParcel,
        successParcel: evaluation.successParcel,
        cancelParcel: evaluation.cancelParcel,
        unresolvedReports: evaluation.unresolvedReports,
        source: evaluation.source,
        recommendation: {
          bn: evaluation.recommendationBn,
          en: evaluation.recommendationEn,
        },
        response: evaluation.courierBreakdown,
        communityReports: evaluation.communityReports,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fraud check error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
