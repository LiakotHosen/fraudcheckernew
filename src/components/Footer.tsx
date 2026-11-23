import Link from "next/link";
import { ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function Footer() {
  const couriers = [
    { name: "Steadfast", badge: "Live Tracking" },
    { name: "Pathao", badge: "Rating Active" },
    { name: "RedX", badge: "Connected" },
    { name: "CarryBee", badge: "Connected" },
    { name: "Paperfly", badge: "Active" },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#085DAE] flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">FraudChecker BD</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              বাংলাদেশের ই-কমার্স মার্চেন্টদের জন্য ১ নম্বর কুরিয়ার ফ্রড ও কাস্টমার ডেলিভারি রেট স্ক্রিনিং প্ল্যাটফর্ম। ভুয়া অর্ডার ও পার্সেল রিটার্ন রোধে সহায়ক।
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              টুলস ও ফিচার
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/#checker" className="hover:text-[#085DAE]">ইনস্ট্যান্ট ফ্রড চেকার</Link></li>
              <li><Link href="/bulk-upload" className="hover:text-[#085DAE]">এক্সেল বাল্ক অর্ডার চেকার</Link></li>
              <li><Link href="/plugin" className="hover:text-[#085DAE]">উ-কমার্স প্লাগইন ডাউনলোড</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#085DAE]">মার্চেন্ট ড্যাশবোর্ড</Link></li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              ডেভেলপার রিসোর্স
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/docs" className="hover:text-[#085DAE]">REST API v1 Documentation</Link></li>
              <li><Link href="/docs#curl" className="hover:text-[#085DAE]">cURL & PHP SDK</Link></li>
              <li><Link href="/docs#quota" className="hover:text-[#085DAE]">Rate Limits & Quota</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#085DAE]">Get Free API Key</Link></li>
            </ul>
          </div>

          {/* Supported Couriers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              সংযুক্ত কুরিয়ার নেটওয়ার্ক
            </h4>
            <div className="flex flex-wrap gap-2">
              {couriers.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {c.name}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              মার্চেন্টরা তাদের নিজস্ব কুরিয়ার এপিআই কি দিয়ে বিনামূল্যে আনলিমিটেড ব্যবহার করতে পারেন।
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FraudChecker BD. Clean-room Open Architecture.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Hosted on Vercel & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
