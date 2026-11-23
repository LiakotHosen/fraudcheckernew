import { CourierQueryResult } from "./couriers/types";

export type RiskLevel = "Safe" | "Moderate Risk" | "High Risk" | "New Customer";

export interface FraudEvaluationResult {
  phone: string;
  score: number;
  status: RiskLevel;
  totalParcel: number;
  successParcel: number;
  cancelParcel: number;
  unresolvedReports: number;
  source: "database_cache" | "live_courier_fetch";
  recommendationBn: string;
  recommendationEn: string;
  courierBreakdown: Record<string, any>;
  communityReports: any[];
}

export function evaluateFraudRisk(
  phone: string,
  courierResults: CourierQueryResult[],
  communityReports: any[] = [],
  cachedDbRecord?: any
): FraudEvaluationResult {
  let totalParcel = 0;
  let successParcel = 0;
  let cancelParcel = 0;
  const breakdown: Record<string, any> = {};

  // Aggregate live courier results
  for (const c of courierResults) {
    if (c.status && c.data) {
      totalParcel += c.data.total;
      successParcel += c.data.success;
      cancelParcel += c.data.cancel;
    }
    breakdown[c.courierCode] = {
      status: c.status,
      message: c.message,
      data: c.data,
    };
  }

  // Merge with cached DB historical data if available and greater
  if (cachedDbRecord) {
    const cachedTotal = Number(cachedDbRecord.total_orders || 0);
    const cachedSuccess = Number(cachedDbRecord.delivered_orders || 0);
    const cachedCancel = Number(cachedDbRecord.cancelled_orders || 0);

    if (cachedTotal > totalParcel) {
      totalParcel = Math.max(totalParcel, cachedTotal);
      successParcel = Math.max(successParcel, cachedSuccess);
      cancelParcel = Math.max(cancelParcel, cachedCancel);
    }
  }

  const unresolvedReports = communityReports.filter(
    (r) => r.status === "verified" || r.status === "pending"
  ).length;

  let score = 100;
  if (totalParcel > 0) {
    score = Number(((successParcel / totalParcel) * 100).toFixed(2));
  }

  let status: RiskLevel = "Safe";
  let recBn = "";
  let recEn = "";

  if (totalParcel === 0 && unresolvedReports === 0) {
    status = "New Customer";
    score = 0;
    recBn = "নতুন কাস্টমার (কুরিয়ারে পূর্ব রেকর্ড পাওয়া যায়নি)। ডেলিভারি পাঠানোর আগে ফোনে যোগাযোগ করে নিশ্চিত হতে পারেন।";
    recEn = "New Customer (No prior parcel record found). A quick confirmation phone call before shipping is recommended.";
  } else if (unresolvedReports > 0 || score < 50) {
    status = "High Risk";
    recBn = "উচ্চ ঝুঁকি (সতর্কতা)! এই নম্বরে পূর্বে অর্ডার বাতিল/রিটার্ন বা ফ্রড অভিযোগ রয়েছে। পণ্য পাঠানোর আগে অবশ্যই বিকাশ/নগদে ডেলিভারি চার্জ অগ্রিম নিন।";
    recEn = "High Risk! Customer has high return rates or merchant fraud complaints. Strictly collect delivery charge in advance via bKash/Nagad.";
  } else if (score >= 50 && score < 80) {
    status = "Moderate Risk";
    recBn = "মাঝারি ঝুঁকি। কিছু পার্সেল রিটার্নের রেকর্ড আছে। পার্সেল বুক করার আগে গ্রাহককে ফোন করে ঠিকানা ও আগ্রহ নিশ্চিত করুন।";
    recEn = "Moderate Risk. Customer has minor return records. Confirm address and order intent via phone call before dispatch.";
  } else {
    status = "Safe";
    recBn = "নিরাপদ কাস্টমার। সন্তোষজনক ডেলিভারি ট্র্যাক রেকর্ড (ক্যাশ অন ডেলিভারি অনুমোদিত)।";
    recEn = "Safe Customer. Excellent delivery completion record. Recommended for instant Cash on Delivery (COD) dispatch.";
  }

  return {
    phone,
    score,
    status,
    totalParcel,
    successParcel,
    cancelParcel,
    unresolvedReports,
    source: courierResults.length > 0 ? "live_courier_fetch" : "database_cache",
    recommendationBn: recBn,
    recommendationEn: recEn,
    courierBreakdown: breakdown,
    communityReports,
  };
}
