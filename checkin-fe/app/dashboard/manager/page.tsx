"use client";

import React, { useState } from "react";
import {
  Ship, LayoutGrid, Users, ClipboardList, Bell, Settings, LogOut,
  BedDouble, CheckCircle2, Clock, AlertCircle, Wrench, ChevronDown,
  Search, Plus, Filter, RefreshCw, TrendingUp, Home
} from "lucide-react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type BedStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DIRTY" | "OUT_OF_ORDER";
type RoomKind = "PRIVATE" | "DORM";

interface Bed {
  id: string;
  code: string;
  status: BedStatus;
  guestName?: string;
  checkOut?: string;
}

interface Room {
  id: string;
  code: string;
  kind: RoomKind;
  typeName: string;
  floor: number;
  beds: Bed[];
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_ROOMS: Room[] = [
  {
    id: "r1", code: "101", kind: "PRIVATE", typeName: "Deluxe River View", floor: 1,
    beds: [{ id: "b1", code: "Double Bed", status: "OCCUPIED", guestName: "Rahul Sharma", checkOut: "2026-07-20" }],
  },
  {
    id: "r2", code: "102", kind: "PRIVATE", typeName: "Standard Heritage", floor: 1,
    beds: [{ id: "b2", code: "Double Bed", status: "AVAILABLE" }],
  },
  {
    id: "r3", code: "103", kind: "PRIVATE", typeName: "Standard Heritage", floor: 1,
    beds: [{ id: "b3", code: "Double Bed", status: "DIRTY" }],
  },
  {
    id: "r4", code: "201", kind: "PRIVATE", typeName: "Deluxe River View", floor: 2,
    beds: [{ id: "b4", code: "Double Bed", status: "RESERVED", guestName: "Priya Patel", checkOut: "2026-07-25" }],
  },
  {
    id: "r5", code: "DORM-A", kind: "DORM", typeName: "Sunrise Dormitory", floor: 1,
    beds: [
      { id: "b5", code: "A1-Lower", status: "OCCUPIED", guestName: "Sam K.", checkOut: "2026-07-21" },
      { id: "b6", code: "A1-Upper", status: "AVAILABLE" },
      { id: "b7", code: "A2-Lower", status: "OCCUPIED", guestName: "Mei L.", checkOut: "2026-07-19" },
      { id: "b8", code: "A2-Upper", status: "DIRTY" },
    ],
  },
  {
    id: "r6", code: "DORM-B", kind: "DORM", typeName: "Sunrise Dormitory", floor: 1,
    beds: [
      { id: "b9", code: "B1-Lower", status: "AVAILABLE" },
      { id: "b10", code: "B1-Upper", status: "AVAILABLE" },
      { id: "b11", code: "B2-Lower", status: "OUT_OF_ORDER" },
      { id: "b12", code: "B2-Upper", status: "RESERVED", guestName: "Ananya S.", checkOut: "2026-07-22" },
    ],
  },
];

const BED_STATUS_CFG: Record<BedStatus, { label: string; dot: string; badge: string; text: string; Icon: React.ElementType }> = {
  AVAILABLE:    { label: "Available",     dot: "bg-[#2A9D8F]",   badge: "bg-[#2A9D8F]/10 border-[#2A9D8F]/20", text: "text-[#2A9D8F]",  Icon: CheckCircle2 },
  RESERVED:     { label: "Reserved",      dot: "bg-[#F4A261]",   badge: "bg-[#F4A261]/10 border-[#F4A261]/20", text: "text-[#F4A261]",  Icon: Clock },
  OCCUPIED:     { label: "Occupied",      dot: "bg-[#E76F51]",   badge: "bg-[#E76F51]/10 border-[#E76F51]/20", text: "text-[#E76F51]",  Icon: Users },
  DIRTY:        { label: "Dirty",         dot: "bg-amber-400",   badge: "bg-amber-50 border-amber-200",        text: "text-amber-600",  Icon: AlertCircle },
  OUT_OF_ORDER: { label: "Out of Order",  dot: "bg-[#1C2D37]/30",badge: "bg-[#1C2D37]/5 border-[#1C2D37]/10", text: "text-[#1C2D37]/40", Icon: Wrench },
};

// ── SIDEBAR NAV ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Room Grid", path: "/dashboard/manager", active: true },
  { icon: Users, label: "Guests", path: "/dashboard/manager/guests", active: false },
  { icon: ClipboardList, label: "Requests", path: "/dashboard/manager/requests", active: false },
  { icon: Bell, label: "Notifications", path: "/dashboard/manager/notifications", active: false },
  { icon: TrendingUp, label: "Reports", path: "/dashboard/manager/reports", active: false },
  { icon: Settings, label: "Settings", path: "/dashboard/manager/settings", active: false },
];

// ── BED CHIP ──────────────────────────────────────────────────────────────────
function BedChip({ bed, onClick }: { bed: Bed; onClick: (bed: Bed) => void }) {
  const cfg = BED_STATUS_CFG[bed.status];
  return (
    <button
      onClick={() => onClick(bed)}
      title={`${bed.code}${bed.guestName ? ` · ${bed.guestName}` : ""}`}
      className={`relative flex flex-col items-start gap-0.5 p-2 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 text-left ${cfg.badge}`}
    >
      <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.text} flex items-center gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
        {bed.code}
      </span>
      {bed.guestName && (
        <span className="text-[8px] text-[#1C2D37]/55 truncate max-w-full">{bed.guestName}</span>
      )}
      {bed.checkOut && (
        <span className="text-[8px] text-[#1C2D37]/40">out {new Date(bed.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
      )}
    </button>
  );
}

// ── ROOM CARD ─────────────────────────────────────────────────────────────────
function RoomCard({ room, onBedClick }: { room: Room; onBedClick: (bed: Bed, room: Room) => void }) {
  const occupiedCount = room.beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = room.beds.filter((b) => b.status === "AVAILABLE").length;
  const totalBeds = room.beds.length;

  return (
    <div className="bg-[#F7F5F0] rounded-[18px] border border-white/50 shadow-sm hover:shadow-lg transition-all p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#1C2D37]">Room {room.code}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              room.kind === "PRIVATE" ? "bg-[#1C2D37]/10 text-[#1C2D37]/60" : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
            }`}>
              {room.kind === "PRIVATE" ? "Private" : "Dorm"}
            </span>
          </div>
          <p className="text-[10px] text-[#1C2D37]/45 mt-0.5">{room.typeName} · Floor {room.floor}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-[#E76F51]">{occupiedCount}/{totalBeds}</span>
          <p className="text-[8px] text-[#1C2D37]/40">occupied</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="w-full bg-[#1C2D37]/6 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E76F51] to-[#F4A261] rounded-full transition-all"
          style={{ width: `${totalBeds > 0 ? (occupiedCount / totalBeds) * 100 : 0}%` }}
        />
      </div>

      {/* Beds Grid */}
      <div className={`grid gap-1.5 ${room.kind === "DORM" ? "grid-cols-2" : "grid-cols-1"}`}>
        {room.beds.map((bed) => (
          <BedChip key={bed.id} bed={bed} onClick={(b) => onBedClick(b, room)} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-[#1C2D37]/40 border-t border-[#1C2D37]/5 pt-2 mt-auto">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />{availableCount} available
        </span>
        <button className="hover:text-[#E76F51] transition-colors font-medium">Manage →</button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"ALL" | "PRIVATE" | "DORM">("ALL");
  const [selectedBed, setSelectedBed] = useState<{ bed: Bed; room: Room } | null>(null);

  const filteredRooms = MOCK_ROOMS.filter((room) => {
    const matchesSearch =
      search === "" ||
      room.code.toLowerCase().includes(search.toLowerCase()) ||
      room.typeName.toLowerCase().includes(search.toLowerCase()) ||
      room.beds.some((b) => b.guestName?.toLowerCase().includes(search.toLowerCase()));
    const matchesKind = kindFilter === "ALL" || room.kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  // KPIs
  const allBeds = MOCK_ROOMS.flatMap((r) => r.beds);
  const occupied = allBeds.filter((b) => b.status === "OCCUPIED").length;
  const available = allBeds.filter((b) => b.status === "AVAILABLE").length;
  const dirty = allBeds.filter((b) => b.status === "DIRTY").length;
  const reserved = allBeds.filter((b) => b.status === "RESERVED").length;
  const occupancyRate = allBeds.length > 0 ? Math.round((occupied / allBeds.length) * 100) : 0;

  return (
    <div className="flex h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-[#1C2D37] flex flex-col shrink-0 border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">Sunrise Varanasi</p>
            <p className="text-white/30 text-[10px] truncate">Manager Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, path, active }) => (
            <button
              key={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-[#E76F51]/15 text-[#E76F51] font-semibold"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Property Selector */}
        <div className="px-3 py-4 border-t border-white/5">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 text-white/60 text-xs transition-all">
            <Home className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Sunrise Varanasi Ghat</span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/50 text-xs transition-all mt-1">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#F7F5F0]/80 backdrop-blur-sm border-b border-[#1C2D37]/5 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-semibold text-[#1C2D37] text-base">Room Grid</h1>
            <p className="text-xs text-[#1C2D37]/45">Live inventory · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-[#1C2D37]/50 hover:text-[#1C2D37] transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button className="bg-[#E76F51] hover:bg-[#d85c3e] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#E76F51]/15">
              <Plus className="w-3.5 h-3.5" /> Add Room
            </button>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="bg-[#1C2D37] px-6 py-3 flex items-center gap-6 shrink-0 overflow-x-auto">
          {[
            { label: "Occupancy", value: `${occupancyRate}%`, sub: `${occupied} occupied`, color: "text-[#E76F51]" },
            { label: "Available", value: available, sub: "beds free", color: "text-[#2A9D8F]" },
            { label: "Reserved", value: reserved, sub: "upcoming", color: "text-[#F4A261]" },
            { label: "Needs Cleaning", value: dirty, sub: "beds dirty", color: "text-amber-400" },
            { label: "Total Beds", value: allBeds.length, sub: `${MOCK_ROOMS.length} rooms`, color: "text-white/70" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="flex flex-col shrink-0">
              <span className="text-white/30 text-[9px] uppercase tracking-wider">{label}</span>
              <span className={`text-xl font-bold leading-tight ${color}`}>{value}</span>
              <span className="text-white/30 text-[9px]">{sub}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="px-6 py-3 flex items-center gap-3 border-b border-[#1C2D37]/5 bg-[#F7F5F0]/60 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#1C2D37]/30" />
            <input
              type="text"
              placeholder="Search room, guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/70 border border-[#1C2D37]/8 rounded-xl text-xs text-[#1C2D37] focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {(["ALL", "PRIVATE", "DORM"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  kindFilter === k ? "bg-[#1C2D37] text-white" : "bg-white/60 text-[#1C2D37]/50 hover:bg-white"
                }`}
              >
                {k === "ALL" ? (
                  <><Filter className="w-3 h-3" /> All</>
                ) : k === "PRIVATE" ? (
                  <><BedDouble className="w-3 h-3" /> Private</>
                ) : (
                  <><Users className="w-3 h-3" /> Dorm</>
                )}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-3">
            {Object.entries(BED_STATUS_CFG).slice(0, 4).map(([status, cfg]) => (
              <span key={status} className="flex items-center gap-1 text-[9px] text-[#1C2D37]/50">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* Room Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBedClick={(bed, r) => setSelectedBed({ bed, room: r })}
              />
            ))}
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center py-20 text-[#1C2D37]/30">
              <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No rooms match your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* ── BED DETAIL PANEL (right slide-in) ── */}
      {selectedBed && (
        <aside className="w-72 bg-[#F7F5F0] border-l border-[#1C2D37]/8 flex flex-col shrink-0 shadow-2xl">
          <div className="p-5 border-b border-[#1C2D37]/5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#1C2D37]">Bed Details</h3>
              <p className="text-xs text-[#1C2D37]/45">Room {selectedBed.room.code} · {selectedBed.bed.code}</p>
            </div>
            <button onClick={() => setSelectedBed(null)} className="text-[#1C2D37]/30 hover:text-[#E76F51] text-lg leading-none transition-colors">×</button>
          </div>

          <div className="p-5 flex-1 space-y-5">
            {/* Status */}
            {(() => {
              const cfg = BED_STATUS_CFG[selectedBed.bed.status];
              const StatusIcon = cfg.Icon;
              return (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${cfg.badge}`}>
                  <StatusIcon className={`w-4 h-4 ${cfg.text}`} />
                  <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                </div>
              );
            })()}

            {/* Guest info */}
            {selectedBed.bed.guestName && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[#1C2D37]/35 font-bold">Current Guest</p>
                <div className="bg-white/70 rounded-xl p-3 border border-[#1C2D37]/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1C2D37]/50">Name</span>
                    <span className="font-semibold text-[#1C2D37]">{selectedBed.bed.guestName}</span>
                  </div>
                  {selectedBed.bed.checkOut && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#1C2D37]/50">Check-Out</span>
                      <span className="font-semibold text-[#1C2D37]">
                        {new Date(selectedBed.bed.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-[#1C2D37]/35 font-bold">Actions</p>
              {selectedBed.bed.status === "RESERVED" && (
                <button className="w-full bg-[#2A9D8F] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#248f82] transition-all">
                  ✓ Perform Check-In
                </button>
              )}
              {selectedBed.bed.status === "OCCUPIED" && (
                <button className="w-full bg-[#E76F51] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#d85c3e] transition-all">
                  → Initiate Check-Out
                </button>
              )}
              {selectedBed.bed.status === "DIRTY" && (
                <button className="w-full bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-all">
                  🧹 Mark as Cleaned
                </button>
              )}
              {selectedBed.bed.status === "AVAILABLE" && (
                <button className="w-full bg-[#1C2D37] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#253945] transition-all">
                  + Assign Walk-in Guest
                </button>
              )}
              <button className="w-full bg-white/80 text-[#1C2D37]/60 text-xs font-medium py-2.5 rounded-xl border border-[#1C2D37]/8 hover:bg-white transition-all">
                Mark Out of Order
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
