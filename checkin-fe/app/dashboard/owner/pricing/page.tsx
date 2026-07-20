"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus, Calendar, ArrowLeft, CheckCircle2, History, Ship } from "lucide-react";
import { formatLocalDate, getTodayString } from "@/lib/date-utils";

interface PriceRecord {
  id: string;
  roomTypeName: string;
  kind: "PRIVATE" | "DORM";
  pricePerNight: number;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string;
  notes?: string;
}

const INITIAL_RECORDS: PriceRecord[] = [
  { id: "pr1", roomTypeName: "Deluxe River View", kind: "PRIVATE", pricePerNight: 4500, effectiveFrom: "2026-01-01", notes: "Standard seasonal rate" },
  { id: "pr2", roomTypeName: "Sunrise Dormitory", kind: "DORM", pricePerNight: 900, effectiveFrom: "2026-01-01", notes: "Per bunk bed rate" },
  { id: "pr3", roomTypeName: "Standard Heritage", kind: "PRIVATE", pricePerNight: 2800, effectiveFrom: "2026-01-01", notes: "Heritage courtyard rate" },
];

export default function OwnerPricingManagement() {
  const router = useRouter();
  const [records, setRecords] = useState<PriceRecord[]>(INITIAL_RECORDS);
  const [selectedRoomType, setSelectedRoomType] = useState("Deluxe River View");
  const [newPrice, setNewPrice] = useState<number>(5000);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(getTodayString());
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || !effectiveFrom) return;

    const matchedRecord = records.find((r) => r.roomTypeName === selectedRoomType);
    const kind = matchedRecord?.kind ?? "PRIVATE";

    const newRecord: PriceRecord = {
      id: "pr_" + Math.random().toString(36).substring(2, 9),
      roomTypeName: selectedRoomType,
      kind,
      pricePerNight: Number(newPrice),
      effectiveFrom,
      notes: notes || "Updated by Property Owner",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setNotes("");
    setToast(`Rate for '${selectedRoomType}' updated to ₹${newPrice}/night effective from ${effectiveFrom}!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A9D8F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Nav */}
      <nav className="bg-[#1C2D37] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight font-serif">Room & Bed Rate Management</h1>
            <p className="text-white/40 text-[10px]">Owner Historical Price & Financial Analysis Cost System</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/owner")}
          className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Owner Dashboard
        </button>
      </nav>

      {/* Main Content Split View */}
      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8 flex-1">
        {/* Left Form: Rate Update Form */}
        <div className="w-full md:w-96 bg-[#F7F5F0] rounded-[24px] border border-white/50 p-6 shadow-xl space-y-5 h-fit">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#1C2D37] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#E76F51]" /> Update Room / Bed Rate
            </h2>
            <p className="text-xs text-[#1C2D37]/50 mt-1">
              Rate updates apply to all financial KPI calculations from the effective date onwards.
            </p>
          </div>

          <form onSubmit={handleSaveRate} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Select Room / Dorm Type</label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm font-semibold text-[#1C2D37] focus:outline-none focus:border-[#E76F51]"
              >
                <option value="Deluxe River View">Deluxe River View (Private Room)</option>
                <option value="Sunrise Dormitory">Sunrise Dormitory (Dorm Bed)</option>
                <option value="Standard Heritage">Standard Heritage (Private Room)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">New Rate Per Night (₹)</label>
              <input
                type="number"
                required
                min={100}
                max={100000}
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm font-bold text-[#1C2D37] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Effective From Date</label>
              <input
                type="date"
                required
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm text-[#1C2D37] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Reason / Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Peak tourist season adjustment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm text-[#1C2D37] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-[#E76F51]/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save Rate Update
            </button>
          </form>
        </div>

        {/* Right Section: Historical Rate Timeline */}
        <div className="flex-1 bg-[#F7F5F0] rounded-[24px] border border-white/50 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1C2D37]/5 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1C2D37] flex items-center gap-2">
                <History className="w-5 h-5 text-[#2A9D8F]" /> Rate History Log
              </h2>
              <p className="text-xs text-[#1C2D37]/45 mt-0.5">Chronological record of owner rate updates</p>
            </div>
            <span className="text-xs text-[#1C2D37]/50 font-mono">{records.length} records</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {records.map((r) => (
              <div key={r.id} className="bg-white/80 rounded-2xl p-4 border border-[#1C2D37]/5 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C2D37]">{r.roomTypeName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      r.kind === "PRIVATE" ? "bg-[#1C2D37]/10 text-[#1C2D37]" : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                    }`}>
                      {r.kind}
                    </span>
                  </div>
                  <p className="text-xs text-[#1C2D37]/50 mt-1">
                    Effective From: <strong className="text-[#1C2D37]">{formatLocalDate(r.effectiveFrom)}</strong> {r.notes ? `· ${r.notes}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold text-[#E76F51]">₹{r.pricePerNight.toLocaleString()}</span>
                  <p className="text-[10px] text-[#1C2D37]/40">per night</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
