"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Terminal, Copy, Check, BookOpen, Key, Zap, CheckCircle2 } from "lucide-react";

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "php" | "node" | "python">("curl");
  const [copied, setCopied] = useState(false);

  const snippets = {
    curl: `curl -X POST "https://fraudchecker-bd.vercel.app/api/v1/fraud-check" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: your_merchant_api_key_here" \\
  -d '{"phone": "01712345678"}'`,

    php: `<?php
// WordPress / WooCommerce / Custom PHP
$response = wp_remote_post("https://fraudchecker-bd.vercel.app/api/v1/fraud-check", [
    'headers' => [
        'Content-Type' => 'application/json',
        'X-API-KEY'    => 'your_merchant_api_key_here',
    ],
    'body' => json_encode(['phone' => '01712345678']),
]);

if (!is_wp_error($response)) {
    $data = json_decode(wp_remote_retrieve_body($response), true);
    $riskLevel = $data['riskLevel']; // "Safe", "Moderate Risk", "High Risk"
    $score     = $data['score'];     // Delivery score % (0-100)
}`,

    node: `// Node.js 18+ (Fetch API)
const response = await fetch("https://fraudchecker-bd.vercel.app/api/v1/fraud-check", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.FRAUDCHECKER_API_KEY
  },
  body: JSON.stringify({ phone: "01712345678" })
});

const data = await response.json();
console.log(\`Score: \${data.score}% | Risk Level: \${data.riskLevel}\`);`,

    python: `import requests

url = "https://fraudchecker-bd.vercel.app/api/v1/fraud-check"
headers = {
    "X-API-KEY": "your_merchant_api_key_here",
    "Content-Type": "application/json"
}

response = requests.post(url, json={"phone": "01712345678"}, headers=headers)
data = response.json()
print("Customer Risk Level:", data.get("riskLevel"))`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#085DAE] flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4" />
              REST API Reference v1.0
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Developer Documentation & Integration Guide
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Connect FraudChecker BD to your WooCommerce store, Laravel app, custom POS, or automated WhatsApp bots.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Authentication */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Key className="w-5 h-5 text-[#085DAE]" />
                  Authentication
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  All API requests must include your merchant API Key in the HTTP headers:
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  X-API-KEY: fc_live_your_secret_key_here
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  You can generate your free API Key from your <Link href="/dashboard" className="text-[#085DAE] underline">Merchant Dashboard</Link>.
                </p>
              </div>

              {/* Endpoint 1: POST /fraud-check */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    POST
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    /api/v1/fraud-check
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Screen a customer phone number against Steadfast, Pathao, RedX, and community crowdsourced complaint logs.
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Request Body (JSON)
                </h4>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 mb-4">
                  {`{\n  "phone": "01712345678" // Accepts 01XXXXXXXXX or +8801XXXXXXXXX\n}`}
                </div>

                {/* Code Examples Tabs */}
                <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60">
                    <div className="flex gap-2">
                      {(["curl", "php", "node", "python"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                            activeTab === tab ? "bg-[#085DAE] text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={copyCode}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {snippets[activeTab]}
                  </pre>
                </div>
              </div>

              {/* Endpoint 2: 1-Click Booking */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    POST
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    /api/v1/courier/book
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  1-Click parcel booking directly into the merchant's configured courier account (Steadfast or Pathao).
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
{`{
  "courierCode": "steadfast", // "steadfast" or "pathao"
  "invoiceId": "INV-10024",
  "recipientName": "Rahim Ahmed",
  "recipientPhone": "01712345678",
  "recipientAddress": "House 12, Road 4, Dhanmondi, Dhaka",
  "codAmount": 1250,
  "note": "Fragile items inside"
}`}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Sample Response */}
            <div>
              <div className="sticky top-24 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Sample JSON Response
                </h3>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`{
  "status": "success",
  "phone": "01712345678",
  "operator": "Grameenphone",
  "score": 96.5,
  "riskLevel": "Safe",
  "totalParcel": 42,
  "successParcel": 40,
  "cancelParcel": 2,
  "unresolvedReports": 0,
  "recommendation": {
    "bn": "নিরাপদ কাস্টমার। সন্তোষজনক ট্র্যাক রেকর্ড।",
    "en": "Safe Customer. COD Approved."
  },
  "response": {
    "steadfast": {
      "status": true,
      "data": { "total": 24, "success": 23, "cancel": 1 }
    },
    "pathao": {
      "status": true,
      "data": { "total": 18, "success": 17, "cancel": 1 }
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
