"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Tag,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Flame,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from "lucide-react";
import { PlatformConfig, PricingPlan, FlashSaleConfig } from "@/lib/settings";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"flash-sale" | "pricing" | "merchants">("flash-sale");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Platform Config State
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, statsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/stats"),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setConfig(sData.config);
      }

      if (statsRes.ok) {
        const stData = await statsRes.json();
        setStats(stData.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setMessage({ type: "success", text: "✅ প্ল্যাটফর্ম সেটিংস ও অফার সফলভাবে সেভ হয়েছে!" });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: data.message || "সংরক্ষণ করা যায়নি।" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const updateFlashSale = (field: keyof FlashSaleConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      flashSale: {
        ...config.flashSale,
        [field]: value,
      },
    });
  };

  const updatePlan = (planId: string, field: keyof PricingPlan, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      plans: config.plans.map((p) => (p.id === planId ? { ...p, [field]: value } : p)),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm">
        লোড হচ্ছে Super Admin Control Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                Super Admin Panel
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                  ROOT ACCESS
                </span>
              </span>
              <p className="text-[11px] text-slate-400">FraudChecker BD Platform Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              লাইভ সাইট দেখুন <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              মোট নিবন্ধিত মার্চেন্ট
            </span>
            <span className="text-2xl font-extrabold font-mono text-white">
              {stats?.totalMerchants ?? 1} জন
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              স্পেশাল ডিসকাউন্ট মোড
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  config?.flashSale.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                }`}
              />
              <span className="font-bold text-sm">
                {config?.flashSale.isActive ? "সক্রিয় (Active)" : "বন্ধ (Disabled)"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              বর্তমান ডিসকাউন্ট রেট
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {config?.flashSale.discountPct}% OFF
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              সক্রিয় কুপন কোড
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {config?.flashSale.couponCode || "None"}
            </span>
          </div>
        </div>

        {/* Action Alert Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
              message.type === "success"
                ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-300"
                : "bg-red-950/60 border border-red-500/50 text-red-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("flash-sale")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "flash-sale"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-4 h-4" />
            স্পেশাল ডিসকাউন্ট ও অফার মোড
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "pricing"
                ? "border-[#085DAE] text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            প্রাইসিং প্ল্যান ম্যানেজার
          </button>
          <button
            onClick={() => setActiveTab("merchants")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "merchants"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            মার্চেন্ট তালিকা ({stats?.totalMerchants ?? 1})
          </button>
        </div>

        {/* TAB 1: FLASH SALE & DISCOUNT CONTROLLER */}
        {activeTab === "flash-sale" && config && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  স্পেশাল অফার ও ফ্ল্যাশ সেল কনফিগারেশন
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  এই মোড অন করলে সম্পূর্ণ ওয়েবসাইটের শীর্ষে একটি আকর্ষণীয় অ্যানিমেটেড কাউন্টডাউন ব্যানার প্রদর্শিত হবে এবং প্রাইসিং কার্ডে স্বয়ংক্রিয় ডিসকাউন্ট প্রাইস দেখাবে।
                </p>
              </div>

              {/* Master ON/OFF Switch */}
              <button
                type="button"
                onClick={() => updateFlashSale("isActive", !config.flashSale.isActive)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
                  config.flashSale.isActive
                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {config.flashSale.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {config.flashSale.isActive ? "অফার চালু আছে (ACTIVE)" : "অফার বন্ধ (OFF)"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ডিসকাউন্ট শতকরা হার (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={config.flashSale.discountPct}
                    onChange={(e) => updateFlashSale("discountPct", Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono text-white outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-400">% ছাড়</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  কুপন কোড
                </label>
                <input
                  type="text"
                  value={config.flashSale.couponCode}
                  onChange={(e) => updateFlashSale("couponCode", e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono text-white outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  অফার শেষ হওয়ার সময় (কাউন্টডাউন টাইমার)
                </label>
                <input
                  type="datetime-local"
                  value={
                    config.flashSale.endsAt
                      ? new Date(config.flashSale.endsAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => updateFlashSale("endsAt", new Date(e.target.value).toISOString())}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টপ বার ব্যানার টেক্সট (বাংলা)
                </label>
                <input
                  type="text"
                  value={config.flashSale.titleBn}
                  onChange={(e) => updateFlashSale("titleBn", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টপ বার ব্যানার টেক্সট (English)
                </label>
                <input
                  type="text"
                  value={config.flashSale.titleEn}
                  onChange={(e) => updateFlashSale("titleEn", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "সেভ হচ্ছে..." : "অফার কনফিগারেশন সেভ করুন"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING PLANS EDITOR */}
        {activeTab === "pricing" && config && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {config.plans.map((plan) => (
                <div key={plan.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-white text-base">{plan.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                        {plan.id.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">প্ল্যানের নাম (বাংলা)</label>
                        <input
                          type="text"
                          value={plan.nameBn}
                          onChange={(e) => updatePlan(plan.id, "nameBn", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">মাসিক মূল্য (টাকা)</label>
                        <input
                          type="number"
                          value={plan.monthlyPrice}
                          onChange={(e) => updatePlan(plan.id, "monthlyPrice", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">বার্ষিক মূল্য (টাকা)</label>
                        <input
                          type="number"
                          value={plan.yearlyPrice}
                          onChange={(e) => updatePlan(plan.id, "yearlyPrice", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">মাসিক সার্চ লিমিট</label>
                        <input
                          type="number"
                          value={plan.monthlyChecks}
                          onChange={(e) => updatePlan(plan.id, "monthlyChecks", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono outline-none"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={Boolean(plan.isPopular)}
                            onChange={(e) => updatePlan(plan.id, "isPopular", e.target.checked)}
                            className="rounded bg-slate-800"
                          />
                          "জনপ্রিয় / Most Popular" ব্যাজ দেখান
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500 block">
                      ফিচার সংখ্যা: {plan.featuresBn.length}টি অন্তর্ভুক্ত
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "সেভ হচ্ছে..." : "সব প্রাইসিং প্ল্যান সেভ করুন"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED MERCHANTS */}
        {activeTab === "merchants" && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <h3 className="text-base font-bold text-white mb-4">
              নিবন্ধিত মার্চেন্ট তালিকা ({stats?.merchantsList?.length ?? 0} জন)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">কোম্পানি / শপ</th>
                    <th className="py-3 px-3">ইমেইল</th>
                    <th className="py-3 px-3">ফোন নম্বর</th>
                    <th className="py-3 px-3">সাবস্ক্রিপশন প্ল্যান</th>
                    <th className="py-3 px-4">নিবন্ধনের তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(stats?.merchantsList || []).map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-sans font-bold text-white">{m.companyName}</td>
                      <td className="py-3 px-3 text-slate-300">{m.email}</td>
                      <td className="py-3 px-3 text-slate-300">{m.phone}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-cyan-400 border border-blue-500/20 uppercase">
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
