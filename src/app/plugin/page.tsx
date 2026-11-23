"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, CheckCircle2, ShieldCheck, Zap, Truck, Smartphone, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PluginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" />
              অফিসিয়াল উ-কমার্স প্লাগইন (v1.0.0)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              ওয়ার্ডপ্রেস উ-কমার্স ফ্রড চেকার ও ১-ক্লিক কুরিয়ার বুকিং প্লাগইন
            </h1>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              WooCommerce অর্ডার পেজে কাস্টমারদের অতীতের ডেলিভারি রেট স্বয়ংক্রিয়ভাবে দেখুন এবং সরাসরি ওখান থেকেই Steadfast বা Pathao-তে এক ক্লিকে পার্সেল বুক করুন।
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="/fraudchecker-bd.zip"
                download="fraudchecker-bd.zip"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white text-sm font-bold shadow-lg shadow-[#085DAE]/25 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                প্লাগইন ডাউনলোড করুন (.ZIP)
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-xs hover:bg-slate-100 transition-all"
              >
                ফ্রি এপিআই কি পান &rarr;
              </Link>
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">অর্ডার পেজে লাইভ ব্যাজ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                কোনো ফোন নম্বর কপি-পেস্ট করার দরকার নেই। WooCommerce-এর অর্ডার লিস্টে স্বয়ংক্রিয়ভাবে কাস্টমারের স্কোর (যেমন: ৯৬% Safe) দেখতে পাবেন।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#085DAE]/10 text-[#085DAE] flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">১-ক্লিক কুরিয়ার বুকিং</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                অর্ডারের অ্যাকশন কলামে "Dispatch" বাটনে ক্লিক করলেই Steadfast বা Pathao-তে কনসাইনমেন্ট তৈরি হবে এবং ট্র্যাকিং কোড অর্ডারে সেভ হবে।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">HPOS & ফাস্ট ক্যাশিং</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                WooCommerce 8+ High-Performance Order Storage (HPOS) কমপ্যাটিবল। অর্ডার মেটাতে ৪৮ ঘণ্টা ক্যাশ থাকে, তাই সাইটের স্পিড একবিন্দুও কমে না।
              </p>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              কীভাবে ৩ মিনিটে প্লাগইনটি সেটআপ করবেন
            </h2>
            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#085DAE] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  ১
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">জিপ ফাইলটি ডাউনলোড করুন</h4>
                  <p className="mt-1">
                    উপরের ডাউনলোড বাটন থেকে <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[#085DAE]">fraudchecker-bd.zip</code> ফাইলটি সেভ করুন।
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#085DAE] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  ২
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">ওয়ার্ডপ্রেসে আপলোড করুন</h4>
                  <p className="mt-1">
                    আপনার ওয়ার্ডপ্রেস অ্যাডমিন প্যানেলে যান &gt; <strong>Plugins &gt; Add New &gt; Upload Plugin</strong> &gt; ফাইলটি সিলেক্ট করে <strong>Install Now</strong> এবং <strong>Activate Plugin</strong> চাপুন।
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#085DAE] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  ৩
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">API Key দিয়ে সক্রিয় করুন</h4>
                  <p className="mt-1">
                    ওয়ার্ডপ্রেস সাইডবারে <strong>FraudChecker BD</strong> মেনু দেখতে পাবেন। সেখানে আপনার মার্চেন্ট ড্যাশবোর্ড থেকে পাওয়া <code>fc_live_...</code> কী বসিয়ে সেভ করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
