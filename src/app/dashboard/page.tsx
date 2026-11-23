"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Key, Shield, Smartphone, RefreshCw, Copy, Check, CheckCircle2, AlertTriangle, ExternalLink, Plus, Lock, Eye, EyeOff } from "lucide-react";

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState<"couriers" | "api-keys" | "plugin-setup">("couriers");

  // Couriers Vault State
  const [steadfastKey, setSteadfastKey] = useState("");
  const [steadfastSecret, setSteadfastSecret] = useState("");
  const [pathaoToken, setPathaoToken] = useState("");
  const [pathaoStoreId, setPathaoStoreId] = useState("");

  const [savingCourier, setSavingCourier] = useState(false);
  const [courierStatus, setCourierStatus] = useState<Record<string, string>>({
    steadfast: "connected",
    pathao: "pending",
    redx: "not_configured",
  });
  const [vaultMessage, setVaultMessage] = useState<string | null>(null);

  // API Key State
  const [apiKeys, setApiKeys] = useState<any[]>([
    {
      id: "key-1",
      name: "WooCommerce Primary Store",
      keyPrefix: "fc_live_9a4f8b2c",
      isActive: true,
      createdAt: "Today",
    },
  ]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const saveCourierCredentials = async (courierCode: string) => {
    setSavingCourier(true);
    setVaultMessage(null);

    const payload = {
      courierCode,
      apiKey: courierCode === "steadfast" ? steadfastKey : pathaoToken,
      apiSecret: courierCode === "steadfast" ? steadfastSecret : pathaoStoreId,
      testConnection: true,
    };

    try {
      const res = await fetch("/api/merchant/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setCourierStatus((prev) => ({ ...prev, [courierCode]: "connected" }));
        setVaultMessage(`✅ ${courierCode.toUpperCase()} credentials encrypted & saved successfully!`);
      } else {
        setVaultMessage(`⚠️ ${data.message || "Failed to save"}`);
      }
    } catch (err: any) {
      setVaultMessage(`Error: ${err.message}`);
    } finally {
      setSavingCourier(false);
    }
  };

  const generateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const res = await fetch("/api/merchant/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Store Key ${apiKeys.length + 1}` }),
      });
      const data = await res.json();
      if (res.ok && data.apiKey) {
        setNewKey(data.apiKey);
        setApiKeys((prev) => [
          {
            id: `key-${Date.now()}`,
            name: data.name,
            keyPrefix: data.keyPrefix,
            isActive: true,
            createdAt: "Just now",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Stats Banner */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              মার্চেন্ট ড্যাশবোর্ড ও এপিআই ভল্ট
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আপনার কুরিয়ার এপিআই কানেক্ট করুন, উ-কমার্স এপিআই কি জেনারেট করুন এবং কোটা পর্যবেক্ষণ করুন।
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                মাসিক সার্চ কোটা
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">24 / 100</span>
                <span className="text-xs font-semibold text-emerald-600 font-mono">76 বাকি</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                <div className="h-full bg-[#085DAE] rounded-full w-[24%]" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                সাবস্ক্রিপশন প্ল্যান
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">Free Tier</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-[#085DAE] border border-blue-500/20">
                  Zero Cost
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">নিজস্ব কুরিয়ার এপিআই থাকলে আনলিমিটেড ফ্রি</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                সংযুক্ত কুরিয়ার অ্যাকাউন্ট
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-emerald-600">১ / ৫</span>
                <span className="text-xs text-slate-500">সক্রিয়</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Steadfast Live | AES-256 Encrypted</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("couriers")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "couriers"
                  ? "border-[#085DAE] text-[#085DAE]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shield className="w-4 h-4" />
              কুরিয়ার এপিআই ভল্ট (BYOK)
            </button>
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "api-keys"
                  ? "border-[#085DAE] text-[#085DAE]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Key className="w-4 h-4" />
              মার্চেন্ট এপিআই কি
            </button>
            <button
              onClick={() => setActiveTab("plugin-setup")}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "plugin-setup"
                  ? "border-[#085DAE] text-[#085DAE]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              উ-কমার্স প্লাগইন সেটআপ
            </button>
          </div>

          {/* Tab 1: Courier Vault */}
          {activeTab === "couriers" && (
            <div className="space-y-6">
              {vaultMessage && (
                <div className="p-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 animate-fadeIn">
                  {vaultMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Steadfast Courier Box */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 font-bold flex items-center justify-center text-sm">
                        SF
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Steadfast Courier</h3>
                        <p className="text-[11px] text-slate-400">Fraud check & Consignment booking</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Steadfast API Key
                      </label>
                      <input
                        type="password"
                        value={steadfastKey}
                        onChange={(e) => setSteadfastKey(e.target.value)}
                        placeholder="e.g. 7f8a9b2c..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Steadfast Secret Key
                      </label>
                      <input
                        type="password"
                        value={steadfastSecret}
                        onChange={(e) => setSteadfastSecret(e.target.value)}
                        placeholder="e.g. sec_908a71..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                      />
                    </div>
                    <button
                      onClick={() => saveCourierCredentials("steadfast")}
                      disabled={savingCourier || !steadfastKey}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      {savingCourier ? "সংরক্ষণ হচ্ছে..." : "সেভ ও কানেকশন টেস্ট করুন"}
                    </button>
                  </div>
                </div>

                {/* Pathao Courier Box */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 font-bold flex items-center justify-center text-sm">
                        PT
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pathao Courier</h3>
                        <p className="text-[11px] text-slate-400">Order rating & Hermes dispatch</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Pathao Bearer Token / API Secret
                      </label>
                      <input
                        type="password"
                        value={pathaoToken}
                        onChange={(e) => setPathaoToken(e.target.value)}
                        placeholder="Pathao API Access Token"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Store ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={pathaoStoreId}
                        onChange={(e) => setPathaoStoreId(e.target.value)}
                        placeholder="e.g. 10245"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none"
                      />
                    </div>
                    <button
                      onClick={() => saveCourierCredentials("pathao")}
                      disabled={savingCourier || !pathaoToken}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      {savingCourier ? "সংরক্ষণ হচ্ছে..." : "সেভ ও কানেকশন টেস্ট করুন"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: API Keys Management */}
          {activeTab === "api-keys" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    আপনার মার্চেন্ট এপিআই কি (API Keys)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    এই কি দিয়ে আপনি আপনার ওয়ার্ডপ্রেস উ-কমার্স বা কাস্টম ওয়েবসাইটে ফ্রড চেকার কানেক্ট করতে পারবেন।
                  </p>
                </div>
                <button
                  onClick={generateApiKey}
                  disabled={generatingKey}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {generatingKey ? "জেনারেট হচ্ছে..." : "নতুন এপিআই কি তৈরি করুন"}
                </button>
              </div>

              {/* Just Created Key Banner */}
              {newKey && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs mb-6 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      নতুন এপিআই কি সফলভাবে তৈরি হয়েছে!
                    </span>
                    <button
                      onClick={() => copyToClipboard(newKey)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold"
                    >
                      {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey ? "কপি হয়েছে" : "কপি করুন"}
                    </button>
                  </div>
                  <p className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 break-all select-all">
                    {newKey}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1.5">
                    ⚠️ এটি নিরাপদে সংরক্ষণ করুন। নিরাপত্তার স্বার্থে এই পুরো কি-টি পরবর্তীতে আর প্রদর্শন করা হবে না।
                  </p>
                </div>
              )}

              {/* Keys Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">নাম</th>
                      <th className="py-3 px-3">কী প্রিফিক্স</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3">তৈরির সময়</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">
                          {k.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {k.keyPrefix}...
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-500">{k.createdAt}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => copyToClipboard(k.keyPrefix)}
                            className="text-xs text-[#085DAE] hover:underline font-sans"
                          >
                            Copy Prefix
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Plugin Setup Guide */}
          {activeTab === "plugin-setup" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                ওয়ার্ডপ্রেস উ-কমার্স (WooCommerce) ইনস্টলেশন গাইড
              </h3>
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-[#085DAE]/10 text-[#085DAE] font-bold flex items-center justify-center flex-shrink-0">
                    ১
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">
                      প্লাগইন জিপ ফাইল ডাউনলোড করুন
                    </strong>
                    <p className="mt-1">
                      আমাদের অফিসিয়াল <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">fraudchecker-bd.zip</code> প্লাগইন ডাউনলোড করুন।
                    </p>
                    <a
                      href="/plugin/download"
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#085DAE] text-white text-xs font-bold"
                    >
                      প্লাগইন জিপ ডাউনলোড (v1.0.0)
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-[#085DAE]/10 text-[#085DAE] font-bold flex items-center justify-center flex-shrink-0">
                    ২
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">
                      ওয়ার্ডপ্রেসে আপলোড ও অ্যাক্টিভেট করুন
                    </strong>
                    <p className="mt-1">
                      আপনার ওয়ার্ডপ্রেস অ্যাডমিন প্যানেলে লগইন করে <strong>Plugins &gt; Add New &gt; Upload Plugin</strong>-এ গিয়ে জিপ ফাইলটি আপলোড এবং অ্যাক্টিভেট করুন।
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-[#085DAE]/10 text-[#085DAE] font-bold flex items-center justify-center flex-shrink-0">
                    ৩
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">
                      API Key সেভ করুন
                    </strong>
                    <p className="mt-1">
                      ওয়ার্ডপ্রেস সাইডবারের <strong>FraudChecker BD &gt; Settings</strong> অপশনে গিয়ে আপনার ড্যাশবোর্ডের API Key বসিয়ে সেভ করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
