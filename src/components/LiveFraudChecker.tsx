"use client";

import { useState } from "react";
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Copy, Check, Info, PhoneCall, Truck } from "lucide-react";

interface LiveFraudCheckerProps {
  lang?: "bn" | "en";
}

export default function LiveFraudChecker({ lang = "bn" }: LiveFraudCheckerProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/v1/fraud-check?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        setError(data.message || (lang === "bn" ? "ফোন নম্বর যাচাই করা যায়নি" : "Failed to verify phone number"));
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = () => {
    if (!result) return;
    const text = lang === "bn"
      ? `[FraudChecker BD রিপোর্ট]\nফোন: ${result.phone} (${result.operator || ""})\nডেলিভারি স্কোর: ${result.score}%\nস্ট্যাটাস: ${result.riskLevel}\nসফল ডেলিভারি: ${result.successParcel} | রিটার্ন: ${result.cancelParcel} (মোট: ${result.totalParcel})\nপরামর্শ: ${result.recommendation?.bn}`
      : `[FraudChecker BD Report]\nPhone: ${result.phone} (${result.operator || ""})\nDelivery Score: ${result.score}%\nRisk Level: ${result.riskLevel}\nDelivered: ${result.successParcel} | Returns: ${result.cancelParcel} (Total: ${result.totalParcel})\nAdvice: ${result.recommendation?.en}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="checker" className="w-full max-w-4xl mx-auto">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#085DAE]/20 shadow-xl shadow-[#085DAE]/10">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 flex items-center gap-1.5 text-slate-400">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">🇧🇩 +88</span>
            <span className="text-slate-300">|</span>
          </div>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={lang === "bn" ? "কাস্টমারের ফোন নম্বর লিখুন (e.g. 01712345678)" : "Enter customer phone (e.g. 01712345678)"}
            className="w-full pl-24 pr-4 py-3.5 rounded-xl bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base outline-none focus:ring-2 focus:ring-[#085DAE]/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] disabled:opacity-70 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#085DAE]/25 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {lang === "bn" ? "যাচাই হচ্ছে..." : "Checking..."}
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              {lang === "bn" ? "ফ্রড রিস্ক চেক করুন" : "Check Fraud Risk"}
            </>
          )}
        </button>
      </form>

      {/* Error notification */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fadeIn">
          {/* Header Bar */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-950/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{result.formattedPhone || result.phone}</span>
                {result.operator && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-[#085DAE] border border-blue-500/20">
                    {result.operator}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === "bn" ? "৫টি শীর্ষ কুরিয়ার ও মার্চেন্ট রেকর্ড স্ক্যান সম্পন্ন" : "Scanned across 5 couriers & merchant pool"}
              </p>
            </div>

            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (lang === "bn" ? "কপি হয়েছে!" : "Copied!") : (lang === "bn" ? "সামারি কপি" : "Copy Summary")}
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score Meter */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                  {result.score}%
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                  {lang === "bn" ? "ডেলিভারি সাকসেস রেট" : "Delivery Success Rate"}
                </span>

                {/* Risk Badge */}
                <div className="mt-4">
                  {result.riskLevel === "Safe" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {lang === "bn" ? "নিরাপদ কাস্টমার (COD অনুমোদিত)" : "Safe Customer (COD Approved)"}
                    </span>
                  )}
                  {result.riskLevel === "Moderate Risk" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {lang === "bn" ? "মাঝারি ঝুঁকি (কনফার্মেশন দরকার)" : "Moderate Risk (Needs Call)"}
                    </span>
                  )}
                  {result.riskLevel === "High Risk" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {lang === "bn" ? "উচ্চ ঝুঁকি (অগ্রিম ডেলিভারি ফি)" : "High Risk (Advance Required)"}
                    </span>
                  )}
                  {result.riskLevel === "New Customer" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-[#085DAE] border border-blue-500/20">
                      <Info className="w-3.5 h-3.5" />
                      {lang === "bn" ? "নতুন কাস্টমার (পূর্ব রেকর্ড নেই)" : "New Customer"}
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-2xl font-bold font-mono text-slate-800 dark:text-white">
                      {result.totalParcel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {lang === "bn" ? "মোট পার্সেল" : "Total Parcels"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center">
                    <span className="block text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {result.successParcel}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {lang === "bn" ? "সফল ডেলিভারি" : "Delivered"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-center">
                    <span className="block text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                      {result.cancelParcel}
                    </span>
                    <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {lang === "bn" ? "রিটার্ন / বাতিল" : "Cancelled / Return"}
                    </span>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-[#085DAE] block mb-1">
                    {lang === "bn" ? "💡 মার্চেন্ট পরামর্শ:" : "💡 Merchant Recommendation:"}
                  </span>
                  <p>{lang === "bn" ? result.recommendation?.bn : result.recommendation?.en}</p>
                </div>
              </div>
            </div>

            {/* Courier Breakdown Details */}
            {result.response && Object.keys(result.response).length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#085DAE]" />
                  {lang === "bn" ? "কুরিয়ার ভিত্তিক রিপোর্ট" : "Courier Network Breakdown"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(result.response).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">{key}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span>সফল: {val?.data?.success ?? 0}</span>
                        <span>রিটার্ন: {val?.data?.cancel ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
