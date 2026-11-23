"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; safe: number; moderate: number; high: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
      setResults([]);
      setStats(null);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (rawRows.length === 0) {
        throw new Error("Excel sheet is empty");
      }

      // Auto-detect phone column
      const sample = rawRows[0];
      const phoneColKey = Object.keys(sample).find((k) =>
        /phone|mobile|contact|cell|number|গ্রাহক|ফোন/i.test(k)
      ) || Object.keys(sample)[0];

      const phoneList: string[] = rawRows.map((r) => String(r[phoneColKey] || "").trim()).filter(Boolean);

      if (phoneList.length === 0) {
        throw new Error(`Could not find phone numbers in column "${phoneColKey}".`);
      }

      // Call bulk-check API
      const res = await fetch("/api/v1/bulk-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones: phoneList.slice(0, 300) }),
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Failed to process bulk list");
      }

      const resList: any[] = data.results || [];
      setResults(resList);

      let safe = 0, moderate = 0, high = 0;
      for (const item of resList) {
        if (item.status === "Safe") safe++;
        else if (item.status === "Moderate Risk") moderate++;
        else if (item.status === "High Risk") high++;
      }
      setStats({ total: resList.length, safe, moderate, high });
    } catch (err: any) {
      setError(err.message || "Error reading Excel file");
    } finally {
      setLoading(false);
    }
  };

  const downloadVerifiedExcel = () => {
    if (results.length === 0) return;

    const exportRows = results.map((r) => ({
      "Original Phone": r.originalPhone,
      "Clean Phone": r.cleanPhone,
      "Delivery Score (%)": `${r.score}%`,
      "Risk Status": r.status,
      "Total Parcels": r.totalParcel,
      "Delivered": r.successParcel,
      "Cancelled / Returned": r.cancelParcel,
      "Recommendation": r.recommendation,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fraud_Check_Results");
    XLSX.writeFile(workbook, `FraudChecked_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      { "Customer Name": "Rahim Khan", "Phone": "01712345678", "Address": "Dhanmondi, Dhaka", "Amount": 1250 },
      { "Customer Name": "Karim Uddin", "Phone": "01819876543", "Address": "Chittagong", "Amount": 850 },
      { "Customer Name": "Sakib Hasan", "Phone": "01614322788", "Address": "Mirpur, Dhaka", "Amount": 2100 },
      { "Customer Name": "Tanvir Ahmed", "Phone": "01912000000", "Address": "Sylhet", "Amount": 1400 },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "Sample_Orders_Template.xlsx");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mb-2">
                <FileSpreadsheet className="w-4 h-4" />
                F-Commerce & Bulk Order Screener
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                এক্সেল ও সিএসভি বাল্ক ফ্রড চেকার
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                একসাথে ৩০০টি পর্যন্ত কাস্টমার নম্বরের পার্সেল ডেলিভারি হিস্ট্রি চেক করে ঝুঁকিপূর্ণ কাস্টমারদের লাল রঙে চিহ্নিত করুন।
              </p>
            </div>

            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              ডেমো এক্সেল টেমপ্লেট
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center shadow-sm hover:border-[#085DAE] transition-colors">
            <input
              type="file"
              id="excel-file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="excel-file" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#085DAE]/10 text-[#085DAE] flex items-center justify-center mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : "আপনার এক্সেল বা সিএসভি ফাইল এখানে ড্রপ করুন অথবা ব্রাউজ করুন"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                সাপোর্টেড ফরম্যাট: .xlsx, .xls, .csv (সর্বোচ্চ ৩০০ সারি)
              </span>
            </label>

            {file && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={processFile}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#085DAE] hover:bg-[#074c82] disabled:opacity-70 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      স্ক্যানিং হচ্ছে...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      ফাইল স্ক্যান শুরু করুন
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Bar */}
          {stats && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="block text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-[11px] font-semibold text-slate-500">মোট পরীক্ষিত</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center">
                <span className="block text-2xl font-bold font-mono text-emerald-600">{stats.safe}</span>
                <span className="text-[11px] font-semibold text-emerald-600">নিরাপদ (Safe)</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-center">
                <span className="block text-2xl font-bold font-mono text-amber-600">{stats.moderate}</span>
                <span className="text-[11px] font-semibold text-amber-600">মাঝারি ঝুঁকি</span>
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-center">
                <span className="block text-2xl font-bold font-mono text-red-600">{stats.high}</span>
                <span className="text-[11px] font-semibold text-red-600">উচ্চ ঝুঁকি (High Risk)</span>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  স্ক্যান ফলাফল ({results.length}টি অর্ডার)
                </h3>
                <button
                  onClick={downloadVerifiedExcel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  ভেরিফাইড এক্সেল ডাউনলোড
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ফোন নম্বর</th>
                      <th className="py-3 px-3">স্কোর</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3">মোট পার্সেল</th>
                      <th className="py-3 px-3">সফল / রিটার্ন</th>
                      <th className="py-3 px-4">পরামর্শ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {r.cleanPhone || r.originalPhone}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {r.score}%
                        </td>
                        <td className="py-3 px-3">
                          {r.status === "Safe" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Safe
                            </span>
                          )}
                          {r.status === "Moderate Risk" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Moderate
                            </span>
                          )}
                          {r.status === "High Risk" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                              High Risk
                            </span>
                          )}
                          {r.status === "New Customer" && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-[#085DAE] border border-blue-500/20">
                              New
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">{r.totalParcel}</td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-600 font-bold">{r.successParcel}</span> /{" "}
                          <span className="text-red-500 font-bold">{r.cancelParcel}</span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                          {r.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
