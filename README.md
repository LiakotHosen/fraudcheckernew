# 🛡️ FraudChecker BD (Next.js 15 + Supabase + WooCommerce)
**Multi-Courier Delivery Success Rate & Fraud Screening Platform for Bangladesh E-Commerce**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🚀 Key Features

1. **Instant Phone Screening:**
   * Validates Bangladeshi mobile operator prefixes (`013` - `019`).
   * Multi-courier parallel query engine (Steadfast, Pathao, RedX, CarryBee, Paperfly).
   * Calculates weighted Delivery Score % and categorizes:
     * 🟢 **Safe Customer (COD Approved)**
     * 🟡 **Moderate Risk (Confirmation Call Recommended)**
     * 🔴 **High Risk (Collect Advance Delivery Fee via bKash/Nagad)**
     * 🔵 **New Customer (No Courier History)**
2. **Bring Your Own Key (BYOK) Courier Vault:**
   * Merchants connect their own Steadfast / Pathao API credentials.
   * Stored with **AES-256-GCM authenticated encryption** in the database.
   * **Zero central API cost** for the platform owner!
3. **Bulk Excel / CSV Screener (`/bulk-upload`):**
   * Upload order sheets from Facebook Messenger or manual entries (up to 300 orders).
   * Scans all phone numbers, flags high-risk orders with color badges.
   * Exports an enriched, verified `.xlsx` sheet in 1 click.
4. **Official WooCommerce WordPress Plugin (`/plugin`):**
   * Live colored badge right in WooCommerce Orders list.
   * **1-Click Dispatch Button:** Books parcel directly into Steadfast/Pathao with tracking code automatically saved into WooCommerce order notes.
   * Packaged ready to download at `/fraudchecker-bd.zip`.
5. **Developer REST API v1 (`/api/v1/fraud-check`, `/api/v1/quota`, `/api/v1/courier/book`):**
   * Secured by `X-API-KEY` header.
   * Comprehensive interactive documentation at `/docs` with cURL, PHP, Node.js, and Python code snippets.
6. **Crowdsourced Intelligence Engine:**
   * Built-in PostgreSQL cache in Supabase stores millions of phone records organically as merchants query orders.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Next.js 15.1 (App Router), React 19, Tailwind CSS, Lucide Icons, Hind Siliguri Font.
* **Backend:** Next.js Serverless Edge Routes, Node.js Crypto (AES-256-GCM).
* **Database & Auth:** Supabase (PostgreSQL 15+ with Row Level Security).
* **Hosting:** Vercel (Frontend & Serverless Functions) + Supabase (Database).
* **CMS Plugin:** Native PHP WordPress / WooCommerce Plugin (compatible with HPOS & legacy).

---

## 📦 How to Deploy on Vercel & Supabase ($0 Cost)

### Step 1: Create Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Dashboard, open **SQL Editor**.
3. Copy and run the entire SQL schema from `supabase/schema.sql`.

### Step 2: Deploy to Vercel
1. Push this repository to your GitHub.
2. Import the repository into [vercel.com](https://vercel.com).
3. Set the following Environment Variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ENCRYPTION_SECRET=32_character_secret_key_vault_!!
   ```
4. Click **Deploy**! Your site is live in under 60 seconds.
