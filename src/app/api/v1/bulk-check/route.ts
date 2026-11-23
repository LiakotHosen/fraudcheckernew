import { NextRequest, NextResponse } from "next/server";
import { normalizeBDPhone } from "@/lib/phone";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { evaluateFraudRisk } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phones: string[] = body.phones || [];

    if (!Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ status: "error", message: "phones array is required" }, { status: 400 });
    }

    if (phones.length > 300) {
      return NextResponse.json({ status: "error", message: "Maximum 300 phone numbers per batch" }, { status: 400 });
    }

    // Normalize all phones
    const normalizedMap = new Map<string, string>();
    const validCleanPhones: string[] = [];

    for (const raw of phones) {
      const val = normalizeBDPhone(String(raw));
      if (val.isValid) {
        normalizedMap.set(String(raw), val.normalized);
        validCleanPhones.push(val.normalized);
      }
    }

    // Batch query database cache if configured
    const cacheMap = new Map<string, any>();
    if (isSupabaseConfigured && validCleanPhones.length > 0) {
      const { data } = await supabaseAdmin
        .from("phone_records")
        .select("*")
        .in("phone", validCleanPhones);

      if (data) {
        for (const item of data) {
          cacheMap.set(item.phone, item);
        }
      }
    }

    // Process results
    const results = phones.map((raw) => {
      const clean = normalizedMap.get(String(raw));
      if (!clean) {
        return {
          originalPhone: raw,
          cleanPhone: "",
          isValid: false,
          score: 0,
          status: "Invalid Phone",
          riskColor: "gray",
          totalParcel: 0,
          successParcel: 0,
          cancelParcel: 0,
        };
      }

      const cached = cacheMap.get(clean);
      const evalResult = evaluateFraudRisk(clean, [], [], cached);

      let riskColor = "emerald";
      if (evalResult.status === "High Risk") riskColor = "red";
      else if (evalResult.status === "Moderate Risk") riskColor = "amber";
      else if (evalResult.status === "New Customer") riskColor = "blue";

      return {
        originalPhone: raw,
        cleanPhone: clean,
        isValid: true,
        score: evalResult.score,
        status: evalResult.status,
        riskColor,
        totalParcel: evalResult.totalParcel,
        successParcel: evalResult.successParcel,
        cancelParcel: evalResult.cancelParcel,
        unresolvedReports: evalResult.unresolvedReports,
        recommendation: evalResult.recommendationBn,
      };
    });

    return NextResponse.json({
      status: "success",
      totalSubmitted: phones.length,
      totalValid: validCleanPhones.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
