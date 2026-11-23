"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Flame, Clock, Sparkles, ShieldCheck, ArrowRight, Zap, HelpCircle } from "lucide-react";
import { PlatformConfig, PricingPlan } from "@/lib/settings";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const flashSale = config?.flashSale;
  const discountPct = flashSale?.isActive ? flashSale.discountPct : 0;

  const calculatePrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    if (discountPct > 0) {
      return Math.round(basePrice * (1 - discountPct / 100));
    }
    return basePrice;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-14 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#085DAE] flex items-center justify-center gap-1.5 mb-2">
              <Zap className="w-4 h-4" />
              স্বচ্ছ ও সাশ্রয়ী মার্চেন্ট প্রাইসিং
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              আপনার ব্যবসার সাইজ অনুযায়ী <br className="hidden sm:inline" />
              <span className="text-[#085DAE]">সেরা প্ল্যানটি বেছে নিন</span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              কোনো লুকানো চার্জ নেই। আপনার নিজস্ব কুরিয়ার এপিআই দিয়ে সম্পূর্ণ ফ্রিতে ব্যবহার করতে পারেন, অথবা বড় স্টোরের জন্য প্রো অটোমেশন নিন।
            </p>

            {/* Flash Sale Banner on Pricing Page */}
            {flashSale?.isActive && (
              <div className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-xs animate-fadeIn">
                <Flame className="w-4 h-4 text-amber-500 flex-shrink-0 animate-bounce" />
                <span>{flashSale.titleBn}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono text-[11px]">
                  কুপন: {flashSale.couponCode}
                </span>
              </div>
            )}

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                মাসিক বিলিং
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <span>বার্ষিক বিলিং</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold border border-emerald-500/20">
                  ২ মাস ফ্রি
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {(config?.plans || []).map((plan) => {
              const basePrice = billingCycle === "monthly" ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
              const finalPrice = calculatePrice(basePrice);
              const hasDiscount = discountPct > 0 && plan.monthlyPrice > 0;

              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all ${
                    plan.isPopular
                      ? "bg-white dark:bg-slate-900 border-2 border-[#085DAE] shadow-2xl shadow-[#085DAE]/15 scale-100 lg:-translate-y-2"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300"
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#085DAE] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      ★ সবচেয়ে জনপ্রিয় / মোস্ট পপুলার
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {plan.nameBn}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">{plan.name}</p>

                    {/* Price Display */}
                    <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-lg line-through text-slate-400 font-mono">
                            ৳{basePrice}
                          </span>
                        )}
                        <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white">
                          ৳{finalPrice}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/মাস</span>
                      </div>

                      {hasDiscount && (
                        <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>স্পেশাল অফার: {discountPct}% ছাড় প্রযোজ্য!</span>
                        </div>
                      )}

                      {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          বছরে ৳{calculatePrice(plan.yearlyPrice)} এককালীন বিল
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {plan.featuresBn.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Link
                      href={plan.id === "free" ? "/register" : `/register?plan=${plan.id}`}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        plan.isPopular
                          ? "bg-[#085DAE] hover:bg-[#074c82] text-white shadow-lg shadow-[#085DAE]/25 hover:shadow-xl"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                      }`}
                    >
                      <span>{plan.buttonTextBn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      {plan.id === "free" ? "কোনো ক্রেডিট কার্ডের প্রয়োজন নেই" : "যে কোনো সময় বাতিলযোগ্য"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-3xl mx-auto shadow-xs">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ৭ দিনের মানি-ব্যাক গ্যারান্টি
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              প্রো বা বিজনেস প্ল্যান নিয়ে সন্তুষ্ট না হলে ৭ দিনের মধ্যে জানালেই ১০০% রিফান্ড প্রদান করা হবে। কোনো প্রশ্ন করা হবে না।
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
