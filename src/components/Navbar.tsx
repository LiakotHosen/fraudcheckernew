"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  BookOpen,
  Layers,
  ArrowRight,
  Menu,
  X,
  Globe,
  Tag,
  User,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import FlashSaleBanner from "./FlashSaleBanner";

interface NavbarProps {
  lang?: "bn" | "en";
  onToggleLang?: () => void;
}

export default function Navbar({ lang = "bn", onToggleLang }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <FlashSaleBanner />

      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#085DAE] to-cyan-500 flex items-center justify-center text-white shadow-md shadow-[#085DAE]/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  FraudChecker{" "}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    BD
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium">Smart Courier Fraud Prevention</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/#checker"
                className="text-sm font-semibold text-slate-600 hover:text-[#085DAE] dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                {lang === "bn" ? "ফ্রড চেকার" : "Fraud Checker"}
              </Link>
              <Link
                href="/bulk-upload"
                className="text-sm font-semibold text-slate-600 hover:text-[#085DAE] dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                {lang === "bn" ? "এক্সেল বাল্ক চেকার" : "Bulk Excel"}
              </Link>
              <Link
                href="/plugin"
                className="text-sm font-semibold text-slate-600 hover:text-[#085DAE] dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <Smartphone className="w-4 h-4 text-[#085DAE]" />
                {lang === "bn" ? "প্লাগইন" : "Plugin"}
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-slate-600 hover:text-[#085DAE] dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <Tag className="w-4 h-4 text-amber-500" />
                {lang === "bn" ? "প্রাইসিং" : "Pricing"}
              </Link>
              <Link
                href="/docs"
                className="text-sm font-semibold text-slate-600 hover:text-[#085DAE] dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                {lang === "bn" ? "এপিআই ডক্স" : "API Docs"}
              </Link>
            </div>

            {/* CTA & Language Toggle & Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {onToggleLang && (
                <button
                  onClick={onToggleLang}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "bn" ? "English" : "বাংলা"}
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === "super_admin" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-700 transition-all"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Super Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white text-xs font-bold shadow-md shadow-[#085DAE]/20 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    {user.companyName || "ড্যাশবোর্ড"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="লগআউট"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#085DAE] hover:bg-[#074c82] text-white text-xs font-bold shadow-md shadow-[#085DAE]/20 transition-all"
                  >
                    সাইন আপ <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
            <Link
              href="/#checker"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
            >
              ফ্রড চেকার
            </Link>
            <Link
              href="/bulk-upload"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
            >
              এক্সেল বাল্ক চেকার
            </Link>
            <Link
              href="/plugin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
            >
              ওয়ার্ডপ্রেস প্লাগইন
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
            >
              প্রাইসিং প্ল্যান
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-1"
            >
              এপিআই ডক্স
            </Link>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {user ? (
                <>
                  {user.role === "super_admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                    >
                      🛡️ Super Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 rounded-xl bg-[#085DAE] text-white text-xs font-bold"
                  >
                    ড্যাশবোর্ড ({user.companyName})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-center px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold"
                  >
                    লগআউট
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-3 py-2 rounded-xl bg-[#085DAE] text-white text-xs font-bold"
                  >
                    সাইন আপ
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
