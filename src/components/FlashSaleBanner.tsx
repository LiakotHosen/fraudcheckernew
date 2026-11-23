"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, X, ArrowRight } from "lucide-react";
import { FlashSaleConfig } from "@/lib/settings";

export default function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState<FlashSaleConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.flashSale?.isActive) {
          setFlashSale(data.config.flashSale);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!flashSale || !flashSale.isActive || !flashSale.endsAt) return;

    const calculateTime = () => {
      const diff = new Date(flashSale.endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  if (!flashSale || !flashSale.isActive || !timeLeft || dismissed) {
    return null;
  }

  const format2Digits = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="relative z-50 bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 text-white text-xs py-2 px-4 shadow-md transition-all animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Banner Title */}
        <div className="flex items-center gap-2 font-bold text-center sm:text-left">
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce flex-shrink-0" />
          <span>{flashSale.titleBn}</span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-black/20 text-yellow-200 font-mono text-[11px] border border-white/20">
            কুপন: {flashSale.couponCode}
          </span>
        </div>

        {/* Live Countdown & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono font-bold text-[11px] bg-black/25 px-2.5 py-1 rounded-lg border border-white/10">
            <span>{format2Digits(timeLeft.days)}d</span>:
            <span>{format2Digits(timeLeft.hours)}h</span>:
            <span>{format2Digits(timeLeft.minutes)}m</span>:
            <span className="text-yellow-300">{format2Digits(timeLeft.seconds)}s</span>
          </div>

          <Link
            href="/pricing"
            className="px-3 py-1 rounded-lg bg-white text-slate-900 font-extrabold hover:bg-yellow-300 transition-colors flex items-center gap-1 shadow-xs"
          >
            অফার নিন <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
