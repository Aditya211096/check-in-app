"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ship, TrendingUp, Users, BedDouble, Star, DollarSign,
  BarChart3, Calendar, ChevronDown, Home, Settings,
  ArrowUpRight, ArrowDownRight, Minus, MessageSquare, Zap, CheckCheck,
  AlertTriangle, Sliders, Receipt, Utensils, Wrench, ShieldCheck, Tag
} from "lucide-react";
import { calculateExecutiveKPIs, getEffectiveRoomPrice, RoomRateHistoryEntry } from "@/lib/financial-utils";
import { formatLocalDate } from "@/lib/date-utils";

// ── HISTORICAL PRICE RECORDS ──────────────────────────────────────────────────
const INITIAL_PRICE_HISTORY: RoomRateHistoryEntry[] = [
  { roomTypeId: "rt1", pricePerNight: 4500, effectiveFrom: "2026-01-01" }, // Deluxe River View
  { roomTypeId: "rt2", pricePerNight: 900, effectiveFrom: "2026-01-01" },  // Sunrise Dormitory
  { roomTypeId: "rt3", pricePerNight: 2800, effectiveFrom: "2026-01-01" }, // Standard Heritage
];

const ROOM_TYPES = [
  { id: "rt1", name: "Deluxe River View", kind: "PRIVATE", currentPrice: 4500, totalUnits: 10 },
  { id: "rt2", name: "Sunrise Dormitory", kind: "DORM", currentPrice: 900, totalUnits: 24 },
  { id: "rt3", name: "Standard Heritage", kind: "PRIVATE", currentPrice: 2800, totalUnits: 8 },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<"7D" | "30D" | "90D">("7D");
  const [priceHistory, setPriceHistory] = useState<RoomRateHistoryEntry[]>(INITIAL_PRICE_HISTORY);

  // Computed Executive KPIs based on historical rate lookup and SLA logs
  const kpi = calculateExecutiveKPIs({
    occupiedBeds: 28,
    totalBeds: 42,
    totalRooms: 18,
    roomRevenue: period === "7D" ? 184500 : period === "30D" ? 642000 : 1850000,
    foodRevenue: period === "7D" ? 38500 : period === "30D" ? 142000 : 410000,
    pendingTabsAmount: 14200,
    totalComplaints: 24,
    resolvedComplaints: 22,
    resolutionTimesMin: [8, 12, 6, 14, 22, 5, 9, 11, 7], // 1 breach (>15 min)
  });

  return (
    <div className="flex h-screen bg-[#E5E7E6] font-sans text-[#1C2D37] overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className="w-60 bg-[#1C2D37] flex flex-col shrink-0 border-r border-white/5">
        <div className="px-5 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Sunrise Varanasi</p>
            <p className="text-white/30 text-[10px]">Super Admin Executive</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#E76F51]/15 text-[#E76F51]">
            <TrendingUp className="w-4 h-4" /> Executive Analytics
          </button>
          <button
            onClick={() => router.push("/dashboard/owner/pricing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <Tag className="w-4 h-4" /> Room Rate Management
          </button>
          <button
            onClick={() => router.push("/dashboard/manager")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <BedDouble className="w-4 h-4" /> Property Manager View
          </button>
          <button
            onClick={() => router.push("/super")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> Platform Console
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs">
            <Home className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Sunrise Varanasi Ghat</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#E5E7E6]/90 backdrop-blur-sm border-b border-[#1C2D37]/5 px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[#1C2D37] text-lg font-serif">Owner Executive Dashboard</h1>
            <p className="text-xs text-[#1C2D37]/45">Multi-Channel Intake, Room Tab Receivables & SLA Resolution Quality</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/owner/pricing")}
              className="bg-[#1C2D37] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#253945] transition-all shadow-md"
            >
              <Tag className="w-3.5 h-3.5 text-[#F4A261]" /> Manage Historical Pricing
            </button>

            <div className="flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-[#1C2D37]/8">
              {(["7D", "30D", "90D"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p ? "bg-[#1C2D37] text-white" : "text-[#1C2D37]/50 hover:text-[#1C2D37]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ── FINANCIAL KPI GRID ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">Gross Revenue</span>
              <p className="text-2xl font-bold text-[#E76F51]">₹{kpi.totalRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-[#1C2D37]/50">Rooms: ₹{kpi.roomRevenue.toLocaleString()} · F&B: ₹{kpi.foodRevenue.toLocaleString()}</span>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">ADR (Avg Daily Rate)</span>
              <p className="text-2xl font-bold text-[#1C2D37]">₹{kpi.adr.toLocaleString()}</p>
              <span className="text-[10px] text-[#2A9D8F] font-semibold">↑ +4.2% vs previous period</span>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">RevPAR</span>
              <p className="text-2xl font-bold text-blue-600">₹{kpi.revPAR.toLocaleString()}</p>
              <span className="text-[10px] text-[#1C2D37]/50">Per available room unit</span>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">Occupancy Rate</span>
              <p className="text-2xl font-bold text-[#2A9D8F]">{kpi.occupancyRate}%</p>
              <span className="text-[10px] text-[#1C2D37]/50">28/42 beds filled</span>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">Room Tab Receivables</span>
              <p className="text-2xl font-bold text-amber-600">₹{kpi.pendingRoomTabs.toLocaleString()}</p>
              <span className="text-[10px] text-amber-600 font-medium">Uncollected guest balances</span>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 flex flex-col gap-1.5 shadow-sm">
              <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">SLA Compliance Rate</span>
              <p className="text-2xl font-bold text-emerald-600">{kpi.complaintResolutionRate}%</p>
              <span className="text-[10px] text-[#1C2D37]/50">Avg resolution: {kpi.avgResolutionMinutes} min</span>
            </div>
          </div>

          {/* ── SECONDARY ROW: INTAKE & COMPLAINT RESOLUTION ANALYTICS ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Complaint Resolution Rate & Operational SLA Section */}
            <div className="bg-[#F7F5F0] rounded-[24px] border border-white/50 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#1C2D37] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2A9D8F]" /> Complaint Resolution & Staff Performance Metrics
                  </h3>
                  <p className="text-xs text-[#1C2D37]/50 mt-0.5">Track resolution rates for offline team discussions</p>
                </div>
                <span className="text-xs font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 px-3 py-1 rounded-full border border-[#2A9D8F]/20">
                  {kpi.complaintResolutionRate}% Resolved
                </span>
              </div>

              {/* Resolution Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/70 p-3.5 rounded-xl border border-[#1C2D37]/5">
                  <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">Avg Resolution Time</span>
                  <p className="text-lg font-bold text-[#1C2D37] mt-0.5">{kpi.avgResolutionMinutes} mins</p>
                  <span className="text-[9px] text-[#2A9D8F]">Target: &lt; 15 mins</span>
                </div>
                <div className="bg-white/70 p-3.5 rounded-xl border border-[#1C2D37]/5">
                  <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">SLA Breaches (&gt;15m)</span>
                  <p className="text-lg font-bold text-red-500 mt-0.5">{kpi.slaBreachCount} issues</p>
                  <span className="text-[9px] text-red-500 font-medium">Needs team review</span>
                </div>
                <div className="bg-white/70 p-3.5 rounded-xl border border-[#1C2D37]/5">
                  <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/40 font-bold">Pre-Checkin Conversion</span>
                  <p className="text-lg font-bold text-purple-600 mt-0.5">88.4%</p>
                  <span className="text-[9px] text-[#1C2D37]/50">Completed online</span>
                </div>
              </div>

              {/* Recurring Complaint Category Breakdown */}
              <div>
                <p className="text-xs uppercase tracking-wider text-[#1C2D37]/40 font-bold mb-3">Top Complaint Categories ({period})</p>
                <div className="space-y-2.5">
                  {[
                    { category: "Housekeeping & Bedding", count: 10, pct: 42, color: "bg-[#E76F51]" },
                    { category: "Plumbing & Hot Water", count: 7, pct: 29, color: "bg-[#F4A261]" },
                    { category: "WiFi & AC Controls", count: 5, pct: 21, color: "bg-[#2A9D8F]" },
                    { category: "Noise Complaints", count: 2, pct: 8, color: "bg-purple-500" },
                  ].map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#1C2D37]">
                        <span>{cat.category}</span>
                        <span>{cat.count} complaints ({cat.pct}%)</span>
                      </div>
                      <div className="w-full bg-[#1C2D37]/8 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-Channel Intake & Room Rate Performance */}
            <div className="bg-[#F7F5F0] rounded-[24px] border border-white/50 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#1C2D37] flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-[#E76F51]" /> Multi-Channel Intake & Room Type Revenue
                  </h3>
                  <p className="text-xs text-[#1C2D37]/50 mt-0.5">Evaluated against historical rate updates</p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/owner/pricing")}
                  className="text-xs font-semibold text-[#E76F51] hover:underline"
                >
                  Edit Rates →
                </button>
              </div>

              <div className="space-y-3">
                {ROOM_TYPES.map((rt) => {
                  const effectivePrice = getEffectiveRoomPrice(rt.id, new Date().toISOString().split("T")[0], priceHistory, rt.currentPrice);
                  return (
                    <div key={rt.id} className="bg-white/80 rounded-2xl p-4 border border-[#1C2D37]/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1C2D37]">{rt.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            rt.kind === "PRIVATE" ? "bg-[#1C2D37]/10 text-[#1C2D37]" : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                          }`}>
                            {rt.kind}
                          </span>
                        </div>
                        <p className="text-xs text-[#1C2D37]/45 mt-0.5">{rt.totalUnits} units · Rate: ₹{effectivePrice.toLocaleString()}/night</p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#1C2D37] text-base">₹{(effectivePrice * (rt.kind === "PRIVATE" ? 7 : 18)).toLocaleString()}</span>
                        <p className="text-[10px] text-[#1C2D37]/40">Estimated ({period})</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
