import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FraudChecker BD — Courier Fraud & Delivery Rate Checker Bangladesh",
  description: "100% Free Courier Fraud Checker for online merchants in Bangladesh. Verify customer delivery success rate and cancel history across Steadfast, Pathao & RedX.",
  keywords: ["fraud checker bangladesh", "steadfast fraud check", "pathao fraud check", "cod return prevention bd", "ecommerce fraud checker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="light">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-[#085DAE]/20 selection:text-[#085DAE]">
        {children}
      </body>
    </html>
  );
}
