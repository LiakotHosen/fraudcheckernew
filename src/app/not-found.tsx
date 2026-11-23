import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold font-mono mb-2">404</h1>
      <h2 className="text-xl font-bold mb-3">পেজটি খুঁজে পাওয়া যায়নি</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        আপনি যে লিংকটিতে প্রবেশ করতে চেয়েছেন সেটি পরিবর্তিত হয়েছে অথবা পেজটি মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#085DAE] text-white text-xs font-bold shadow-md hover:bg-[#074c82] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}
