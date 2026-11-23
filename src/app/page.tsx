"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveFraudChecker from "@/components/LiveFraudChecker";
import { ShieldAlert, Zap, Layers, Smartphone, ArrowRight, CheckCircle2, Terminal, HelpCircle } from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<"bn" | "en">("bn");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "bn" ? "en" : "bn")} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#085DAE]/10 border border-[#085DAE]/20 text-[#085DAE] dark:text-[#38bdf8] text-xs font-bold mb-6 animate-fadeIn">
              <Zap className="w-3.5 h-3.5" />
              {lang === "bn" ? "১০০% ফ্রি কুরিয়ার ফ্রড ও ডেলিভারি রেট চেকার" : "100% Free Courier Fraud Screening"}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
              {lang === "bn" ? (
                <>
                  প্রতিটি ভুয়া অর্ডারে <span className="text-[#085DAE] underline decoration-wavy decoration-[#085DAE]/40">৳১৫০ লস বন্ধ করুন</span>
                </>
              ) : (
                <>
                  Stop Losing <span className="text-[#085DAE]">৳150 on Fake COD Orders</span>
                </>
              )}
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {lang === "bn"
                ? "ক্যাশ অন ডেলিভারিতে পার্সেল বুক করার আগে গ্রাহকের অতীতের ডেলিভারি সাকসেস রেট, রিটার্ন সংখ্যা এবং মার্চেন্ট ফ্রড রিপোর্ট যাচাই করে নিন এক ক্লিকেই।"
                : "Check customer delivery track record across Steadfast, Pathao & RedX before shipping parcels. Prevent COD returns and fake orders."}
            </p>

            {/* Interactive Search Tool */}
            <div className="mt-8 sm:mt-12">
              <LiveFraudChecker lang={lang} />
            </div>

            {/* Mini Trust Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === "bn" ? "৫টি কুরিয়ার নেটওয়ার্ক সংযুক্ত" : "5 Couriers Connected"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === "bn" ? "ওয়ার্ডপ্রেস উ-কমার্স সাপোর্ট" : "WooCommerce Support"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === "bn" ? "কোনো হিডেন চার্জ নেই" : "Zero Hidden Fees"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {lang === "bn" ? "মার্চেন্টদের জন্য কমপ্লিট সলিউশন" : "Complete Fraud Prevention Suite"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                {lang === "bn" ? "শুধু সার্চ নয়—আপনার সম্পূর্ণ ই-কমার্স ডেলিভারি অটোমেশন" : "Everything you need from verification to 1-click booking"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: WooCommerce Plugin */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-[#085DAE]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#085DAE]/10 text-[#085DAE] flex items-center justify-center mb-5">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "bn" ? "ওয়ার্ডপ্রেস উ-কমার্স প্লাগইন" : "WooCommerce 1-Click Plugin"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "bn"
                    ? "ওয়েবসাইটের অর্ডার পেজে সরাসরি ফ্রড রিস্ক ব্যাজ দেখুন। আলাদা করে নাম্বার কপি করার ঝামেলা নেই। ওখান থেকেই সরাসরি কুরিয়ারে ১-ক্লিক বুকিং।"
                    : "View fraud risk badges right in your WooCommerce orders list. 1-click parcel booking directly into Steadfast or Pathao."}
                </p>
                <Link href="/plugin" className="inline-flex items-center gap-1 text-xs font-bold text-[#085DAE] hover:underline">
                  {lang === "bn" ? "প্লাগইন ডাউনলোড করুন" : "Download Plugin"} &rarr;
                </Link>
              </div>

              {/* Card 2: Bulk Excel Upload */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-[#085DAE]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "bn" ? "এক্সেল ও সিএসভি বাল্ক চেকার" : "Bulk Excel / CSV Screening"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "bn"
                    ? "ফেসবুক পেজ বা মেসেঞ্জারে আসা শত শত অর্ডারের এক্সেল শিট আপলোড করুন। কয়েক সেকেন্ডেই হাই-রিক্স কাস্টমার চিহ্নিত করে কালার-কোডেড এক্সেল এক্সপোর্ট করুন।"
                    : "Upload order spreadsheets from Messenger or Excel. Instantly flag high-risk customers with color coding and export clean data."}
                </p>
                <Link href="/bulk-upload" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline">
                  {lang === "bn" ? "বাল্ক চেকার ব্যবহার করুন" : "Use Bulk Checker"} &rarr;
                </Link>
              </div>

              {/* Card 3: Free BYOK Model */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-[#085DAE]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {lang === "bn" ? "নিজস্ব কুরিয়ার এপিআই ভল্ট" : "BYOK Courier Vault"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {lang === "bn"
                    ? "আপনার নিজস্ব Steadfast বা Pathao এপিআই কি নিরাপদে যুক্ত করুন (AES-256 ইনক্রিপ্টেড)। এতে কোনো তৃতীয় পক্ষের অতিরিক্ত চার্জ ছাড়াই আনলিমিটেড ব্যবহার করতে পারবেন।"
                    : "Bring your own courier keys stored securely in AES-256-GCM vault. Zero subscription locks or middleman fees."}
                </p>
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
                  {lang === "bn" ? "ড্যাশবোর্ডে কি যুক্ত করুন" : "Manage Vault"} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Developer REST API Callout */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
                  <Terminal className="w-4 h-4" />
                  Developer Friendly REST API
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                  যেকোনো কাস্টম ই-কমার্স বা POS-এ ইন্টিগ্রেশন করুন সহজে
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  আমাদের দ্রুতগতির JSON REST API দিয়ে আপনার নিজস্ব মোবাইল অ্যাপ, কাস্টম শপ বা ব্যাকঅফিস সিস্টেমে অর্ডার আসার সাথে সাথেই কাস্টমার ফ্রড চেক সম্পন্ন করুন।
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/docs"
                    className="px-5 py-2.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white text-xs font-bold transition-all"
                  >
                    এপিআই ডকুমেন্টেশন পড়ুন &rarr;
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all"
                  >
                    ফ্রি এপিআই কি পান
                  </Link>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs overflow-x-auto shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-500 text-[11px]">
                  <span>POST /api/v1/fraud-check</span>
                  <span className="text-emerald-400">200 OK</span>
                </div>
                <pre className="text-slate-300 leading-relaxed">
{`curl -X POST "https://fraudchecker-bd.vercel.app/api/v1/fraud-check" \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: fc_live_your_key_here" \\
  -d '{"phone": "01712345678"}'`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#085DAE]" />
              সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  এই সেবাটি ব্যবহার করতে কি কোনো খরচ লাগবে?
                </h3>
                <p className="text-slate-500">
                  না, FraudChecker BD সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়। মার্চেন্টরা তাদের নিজস্ব কুরিয়ার এপিআই কি ব্যবহার করে কোনো অতিরিক্ত ফি ছাড়াই আনলিমিটেড ব্যবহার করতে পারেন।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  আমার কুরিয়ার এপিআই কি কতটা নিরাপদ থাকবে?
                </h3>
                <p className="text-slate-500">
                  আপনার কুরিয়ার এপিআই কি এবং পাসওয়ার্ড আমাদের ডাটাবেসে মিলিটারি-গ্রেড AES-256-GCM ইনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। এটি সম্পূর্ণ সুরক্ষিত।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  ওয়ার্ডপ্রেস উ-কমার্সে কীভাবে সেটআপ করব?
                </h3>
                <p className="text-slate-500">
                  আমাদের প্লাগইন পেজ থেকে জিপ ফাইল ডাউনলোড করে আপনার ওয়ার্ডপ্রেস এডমিনের Plugins &gt; Add New &gt; Upload Plugin-এ গিয়ে আপলোড ও অ্যাক্টিভেট করুন। এরপর আপনার FraudChecker API Key বসিয়ে দিলেই কাজ শুরু হয়ে যাবে!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
