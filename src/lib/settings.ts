import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase/admin";

export interface PricingPlan {
  id: string;
  name: string;
  nameBn: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyChecks: number;
  featuresBn: string[];
  featuresEn: string[];
  isPopular?: boolean;
  buttonTextBn: string;
  buttonTextEn: string;
}

export interface FlashSaleConfig {
  isActive: boolean;
  titleBn: string;
  titleEn: string;
  discountPct: number;
  couponCode: string;
  endsAt: string; // ISO 8601 timestamp
}

export interface PlatformConfig {
  flashSale: FlashSaleConfig;
  plans: PricingPlan[];
}

const DEFAULT_CONFIG: PlatformConfig = {
  flashSale: {
    isActive: true,
    titleBn: "🔥 বিশেষ ই-কমার্স অফার: সব প্রো ও বিজনেস প্ল্যানে ৩০% ডিসকাউন্ট!",
    titleEn: "🔥 Special E-Commerce Flash Sale: 30% OFF on all Pro & Business plans!",
    discountPct: 30,
    couponCode: "SAVE30",
    endsAt: new Date(Date.now() + 86400000 * 3 + 3600000 * 8).toISOString(), // 3 days 8 hours from now
  },
  plans: [
    {
      id: "free",
      name: "Starter Merchant",
      nameBn: "স্টার্টার (ফ্রি)",
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyChecks: 100,
      featuresBn: [
        "মাসে ১০০টি লাইভ ফোন স্ক্রিনিং",
        "নিজস্ব কুরিয়ার এপিআই (BYOK) ফ্রি আনলিমিটেড",
        "Steadfast & Pathao এপিআই কানেক্ট",
        "১টি WooCommerce স্টোর কানেকশন",
        "সিঙ্গেল ও এক্সেল বাল্ক চেকার (ম্যাক্স ৫০)",
        "স্ট্যান্ডার্ড কমিউনিটি সাপোর্ট",
      ],
      featuresEn: [
        "100 Live phone checks per month",
        "Free unlimited BYOK Courier queries",
        "Steadfast & Pathao vault integration",
        "1 WooCommerce store integration",
        "Bulk CSV screening (up to 50 rows)",
        "Standard community support",
      ],
      isPopular: false,
      buttonTextBn: "ফ্রিতে শুরু করুন",
      buttonTextEn: "Get Started Free",
    },
    {
      id: "pro",
      name: "Pro Merchant",
      nameBn: "প্রো মার্চেন্ট (জনপ্রিয়)",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      monthlyChecks: 1500,
      featuresBn: [
        "মাসে ১,৫০০টি লাইভ কুরিয়ার স্ক্রিনিং",
        "আনলিমিটেড BYOK কুরিয়ার কানেকশন",
        "৫টি WooCommerce স্টোর কানেকশন",
        "WooCommerce থেকে ১-ক্লিক কুরিয়ার বুকিং",
        "এক্সেল বাল্ক চেকার (একসাথে ৩০০ সারি)",
        "ডেলিভারি স্কোর ও রিস্ক কালার এক্সেল এক্সপোর্ট",
        "হাই-স্পিড প্রায়োরিটি রেসপন্স (<০.৩ সে.)",
        "ডেডিকেটেড হোয়াটসঅ্যাপ ও ফোন সাপোর্ট",
      ],
      featuresEn: [
        "1,500 Live courier checks / month",
        "Unlimited BYOK Courier queries",
        "Up to 5 WooCommerce stores connected",
        "1-Click Courier Dispatch from WooCommerce",
        "Bulk Excel tool (up to 300 rows)",
        "Color-coded verified Excel export",
        "High-speed priority response (<0.3s)",
        "Dedicated WhatsApp & phone support",
      ],
      isPopular: true,
      buttonTextBn: "প্রো প্ল্যান নিন",
      buttonTextEn: "Upgrade to Pro",
    },
    {
      id: "business",
      name: "Business / Enterprise",
      nameBn: "বিজনেস / এজেন্সি",
      monthlyPrice: 1199,
      yearlyPrice: 11990,
      monthlyChecks: 5000,
      featuresBn: [
        "মাসে ৫,০০০টি লাইভ কুরিয়ার স্ক্রিনিং",
        "আনলিমিটেড উ-কমার্স ও শপিফাই স্টোর",
        "এন্টারপ্রাইজ REST API ফুল এক্সেস",
        "টিম মেম্বার এক্সেস (মাল্টি-ইউজার ড্যাশবোর্ড)",
        "অটোমেটেড এসএমএস এলার্ট গেটওয়ে ইন্টিগ্রেশন",
        "কাস্টম পিওএস (POS) ও ইআরপি সাপোর্ট",
        "৯৯.৯% আপটাইম এসএলএ (SLA)",
        "২৪/৭ ভিআইপি অ্যাকাউন্ট ম্যানেজার",
      ],
      featuresEn: [
        "5,000 Live courier checks / month",
        "Unlimited WooCommerce & Shopify stores",
        "Full Enterprise REST API access",
        "Multi-user team dashboard access",
        "Automated SMS Gateway integration",
        "Custom POS & ERP webhook support",
        "99.9% Uptime Guarantee (SLA)",
        "24/7 VIP Account Manager",
      ],
      isPopular: false,
      buttonTextBn: "বিজনেস প্ল্যান নিন",
      buttonTextEn: "Contact Enterprise",
    },
  ],
};

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "platform_settings.json");

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf8");
    }
  } catch (e) {
    console.error("Error creating data dir:", e);
  }
}

export function getPlatformConfig(): PlatformConfig {
  ensureDataFile();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading platform settings:", err);
  }
  return DEFAULT_CONFIG;
}

export function savePlatformConfig(newConfig: PlatformConfig): boolean {
  ensureDataFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newConfig, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving platform settings:", err);
    return false;
  }
}
