"use client";

import React, { useState } from "react";
import {
  Ship, TrendingUp, Users, BedDouble, Star, DollarSign,
  BarChart3, Calendar, ChevronDown, Home, Settings,
  ArrowUpRight, ArrowDownRight, Minus, MessageSquare, Zap, CheckCheck
} from "lucide-react";

// ── MOCK KPI DATA ─────────────────────────────────────────────────────────────
const KPI_DATA = {
  occupancyRate: 73,
  occupancyTrend: +5.2,
  totalRevenue: 284500,
  revenueTrend: +12.8,
  revPAR: 2077,
  revPARTrend: +8.1,
  ADR: 2845,
  ADRTrend: +3.4,
  avgRating: 4.7,
  ratingTrend: +0.2,
  totalBookings: 142,
  bookingsTrend: +18,
  avgResolutionMin: 8.4,
  slaBreaches: 3,
  activeGuests: 18,
};

const DAILY_REVENUE = [
  { day: "Mon", revenue: 32000, occupancy: 68 },
  { day: "Tue", revenue: 28500, occupancy: 61 },
  { day: "Wed", revenue: 41200, occupancy: 82 },
  { day: "Thu", revenue: 38700, occupancy: 78 },
  { day: "Fri", revenue: 52100, occupancy: 94 },
  { day: "Sat", revenue: 58400, occupancy: 100 },
  { day: "Sun", revenue: 33600, occupancy: 72 },
];

const ROOM_PERFORMANCE = [
  { name: "Deluxe River View", occupancy: 91, revenue: 94500, avgRating: 4.9, nights: 21 },
  { name: "Standard Heritage", occupancy: 74, revenue: 78400, avgRating: 4.5, nights: 31 },
  { name: "Sunrise Dormitory", occupancy: 58, revenue: 43200, avgRating: 4.4, nights: 87 },
];

const REVIEWS = [
  { name: "Rahul S.", rating: 5, comment: "Stunning sunrise views from the balcony. Service was impeccable.", days: 2 },
  { name: "Anonymous", rating: 4, comment: "Great location, dormitory was clean and well-maintained. Check-in process was smooth.", days: 5 },
  { name: "Priya P.", rating: 5, comment: "The Aarti experience was magical. Staff went above and beyond.", days: 8 },
  { name: "Anonymous", rating: 4, comment: "Good value for price. AC could be colder in summer. Would recommend.", days: 12 },
];

const NAV_ITEMS = [
  { icon: TrendingUp, label: "Analytics", active: true },
  { icon: BedDouble, label: "Room Grid", active: false },
  { icon: Users, label: "Guests", active: false },
  { icon: MessageSquare, label: "Reviews", active: false },
  { icon: Settings, label: "Settings", active: false },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Trend({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-emerald-500 text-xs font-semibold">
      <ArrowUpRight className="w-3.5 h-3.5" />+{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-red-500 text-xs font-semibold">
      <ArrowDownRight className="w-3.5 h-3.5" />{value}%
    </span>
  );
  return <span className="flex items-center gap-0.5 text-[#1C2D37]/30 text-xs"><Minus className="w-3 h-3" />0%</span>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= rating ? "fill-[#F4A261] text-[#F4A261]" : "text-[#1C2D37]/10"}`} />
      ))}
    </div>
  );
}

// ── MINI BAR CHART ────────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: typeof DAILY_REVENUE }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative flex flex-col justify-end" style={{ height: "80px" }}>
            <div
              className="w-full bg-gradient-to-t from-[#E76F51] to-[#F4A261] rounded-t-md transition-all hover:from-[#d85c3e] hover:to-[#e8923a] cursor-pointer"
              style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
              title={`₹${d.revenue.toLocaleString()} · ${d.occupancy}% occ`}
            />
          </div>
          <span className="text-[9px] text-[#1C2D37]/35 font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ── OCCUPANCY DONUT ───────────────────────────────────────────────────────────
function OccupancyDonut({ rate }: { rate: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const filled = (rate / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1C2D37" strokeWidth={8} opacity={0.06} />
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke="url(#donutGrad)" strokeWidth={8}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E76F51" />
            <stop offset="100%" stopColor="#F4A261" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold text-[#1C2D37]">{rate}%</p>
        <p className="text-[8px] text-[#1C2D37]/35 uppercase tracking-wider">Occupancy</p>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D">("7D");

  return (
    <div className="flex h-screen bg-[#E5E7E6] font-sans text-[#1C2D37] overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-[#1C2D37] flex flex-col shrink-0 border-r border-white/5">
        <div className="px-5 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Sunrise Varanasi</p>
            <p className="text-white/30 text-[10px]">Owner Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active ? "bg-[#E76F51]/15 text-[#E76F51] font-semibold" : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs">
            <Home className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Sunrise Varanasi Ghat</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#E5E7E6]/90 backdrop-blur-sm border-b border-[#1C2D37]/5 px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-[#1C2D37] text-base">Analytics Overview</h1>
            <p className="text-xs text-[#1C2D37]/40">Sunrise Varanasi Ghat · Updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7D", "30D", "90D"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? "bg-[#1C2D37] text-white" : "bg-white/60 text-[#1C2D37]/50 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ── KPI GRID ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: "Revenue", value: `₹${(KPI_DATA.totalRevenue / 1000).toFixed(0)}K`, trend: KPI_DATA.revenueTrend, Icon: DollarSign, color: "text-[#E76F51]", bg: "bg-[#E76F51]/8 border-[#E76F51]/12" },
              { label: "Occupancy", value: `${KPI_DATA.occupancyRate}%`, trend: KPI_DATA.occupancyTrend, Icon: BedDouble, color: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]/8 border-[#2A9D8F]/12" },
              { label: "RevPAR", value: `₹${KPI_DATA.revPAR.toLocaleString()}`, trend: KPI_DATA.revPARTrend, Icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
              { label: "ADR", value: `₹${KPI_DATA.ADR.toLocaleString()}`, trend: KPI_DATA.ADRTrend, Icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50 border-purple-100" },
              { label: "Avg Rating", value: `${KPI_DATA.avgRating}★`, trend: KPI_DATA.ratingTrend, Icon: Star, color: "text-[#F4A261]", bg: "bg-[#F4A261]/8 border-[#F4A261]/12" },
              { label: "Bookings", value: KPI_DATA.totalBookings, trend: KPI_DATA.bookingsTrend, Icon: Calendar, color: "text-[#1C2D37]", bg: "bg-white border-[#1C2D37]/8" },
            ].map(({ label, value, trend, Icon, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 flex flex-col gap-2 ${bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-[#1C2D37]/35 font-bold">{label}</span>
                  <Icon className={`w-3.5 h-3.5 ${color} opacity-60`} />
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <Trend value={trend} />
              </div>
            ))}
          </div>

          {/* ── REVENUE CHART + OCCUPANCY DONUT ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-[#F7F5F0] rounded-[22px] border border-white/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-sm text-[#1C2D37]">Daily Revenue</h3>
                  <p className="text-xs text-[#1C2D37]/40 mt-0.5">Last 7 days · All room types</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#1C2D37]">₹{KPI_DATA.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-[#1C2D37]/35">This period</p>
                </div>
              </div>
              <MiniBarChart data={DAILY_REVENUE} />
              <div className="flex justify-between mt-2">
                <span className="text-[9px] text-[#1C2D37]/30">Revenue bar · hover for occupancy</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2 rounded bg-gradient-to-r from-[#E76F51] to-[#F4A261] inline-block" />
                  <span className="text-[9px] text-[#1C2D37]/30">Revenue</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F5F0] rounded-[22px] border border-white/50 shadow-sm p-6 flex flex-col items-center justify-center gap-4">
              <h3 className="font-semibold text-sm text-[#1C2D37] w-full">Live Occupancy</h3>
              <OccupancyDonut rate={KPI_DATA.occupancyRate} />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C2D37]/50">Active Guests</span>
                  <span className="font-semibold">{KPI_DATA.activeGuests}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C2D37]/50">Avg Stay (nights)</span>
                  <span className="font-semibold">2.4</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C2D37]/50">SLA Breaches (7d)</span>
                  <span className={`font-semibold ${KPI_DATA.slaBreaches > 0 ? "text-red-500" : "text-[#2A9D8F]"}`}>
                    {KPI_DATA.slaBreaches}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROOM PERFORMANCE TABLE ── */}
          <div className="bg-[#F7F5F0] rounded-[22px] border border-white/50 shadow-sm p-6">
            <h3 className="font-semibold text-sm text-[#1C2D37] mb-5">Room Type Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1C2D37]/5">
                    {["Room Type", "Occupancy", "Revenue", "Avg Rating", "Nights Sold"].map((h) => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-[#1C2D37]/35 font-bold pb-3 pr-8">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2D37]/4">
                  {ROOM_PERFORMANCE.map((room) => (
                    <tr key={room.name} className="hover:bg-[#1C2D37]/2 transition-colors">
                      <td className="py-3.5 pr-8">
                        <span className="font-semibold text-sm text-[#1C2D37]">{room.name}</span>
                      </td>
                      <td className="py-3.5 pr-8">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-[#1C2D37]/8 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E76F51] to-[#F4A261] rounded-full"
                              style={{ width: `${room.occupancy}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-[#1C2D37]">{room.occupancy}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-8">
                        <span className="text-sm font-bold text-[#1C2D37]">₹{room.revenue.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 pr-8">
                        <div className="flex items-center gap-2">
                          <StarRating rating={Math.round(room.avgRating)} />
                          <span className="text-xs text-[#1C2D37]/60">{room.avgRating}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-sm text-[#1C2D37]/70">{room.nights}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── GUEST REVIEWS + SLA STATS ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Reviews */}
            <div className="bg-[#F7F5F0] rounded-[22px] border border-white/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-sm text-[#1C2D37]">Guest Reviews</h3>
                <div className="flex items-center gap-2 bg-[#F4A261]/10 px-3 py-1.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-[#F4A261] text-[#F4A261]" />
                  <span className="text-sm font-bold text-[#F4A261]">{KPI_DATA.avgRating}</span>
                  <span className="text-[10px] text-[#1C2D37]/35">avg</span>
                </div>
              </div>
              <div className="space-y-4">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E76F51]/30 to-[#F4A261]/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#E76F51]">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#1C2D37]">{r.name}</span>
                        <StarRating rating={r.rating} />
                        <span className="text-[9px] text-[#1C2D37]/30 ml-auto">{r.days}d ago</span>
                      </div>
                      <p className="text-xs text-[#1C2D37]/55 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA & Service Stats */}
            <div className="bg-[#F7F5F0] rounded-[22px] border border-white/50 shadow-sm p-6">
              <h3 className="font-semibold text-sm text-[#1C2D37] mb-5">Service Performance</h3>
              <div className="space-y-4">
                {[
                  { label: "Avg Resolution Time", value: `${KPI_DATA.avgResolutionMin} min`, sub: "Target: < 10 min", Icon: CheckCheck, good: KPI_DATA.avgResolutionMin < 10 },
                  { label: "SLA Breaches (7 days)", value: KPI_DATA.slaBreaches, sub: "Requests over 10 min unacked", Icon: Zap, good: KPI_DATA.slaBreaches === 0 },
                  { label: "Requests Resolved", value: "94%", sub: "Of total raised this week", Icon: CheckCheck, good: true },
                  { label: "Guest Satisfaction", value: "96%", sub: "Based on post-checkout survey", Icon: Star, good: true },
                ].map(({ label, value, sub, Icon, good }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-[#1C2D37]/5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${good ? "bg-[#2A9D8F]/10" : "bg-red-50"}`}>
                      <Icon className={`w-5 h-5 ${good ? "text-[#2A9D8F]" : "text-red-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#1C2D37]/40">{label}</p>
                      <p className="font-bold text-[#1C2D37] text-base">{value}</p>
                      <p className="text-[10px] text-[#1C2D37]/30">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
