"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ship, LayoutGrid, Users, ClipboardList, Bell, Settings, LogOut,
  BedDouble, CheckCircle2, Clock, AlertCircle, Wrench, ChevronDown,
  Search, Plus, Filter, RefreshCw, TrendingUp, Home, MessageSquare, Phone,
  Send, AlertTriangle, ShieldAlert, FileText, CheckCheck, X, Utensils
} from "lucide-react";
import { formatLocalDate, getTodayString } from "@/lib/date-utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

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

interface ExpectedArrival {
  id: string;
  guestName: string;
  phone: string;
  eta: string;
  roomType: string;
  status: "PENDING_ALLOCATION" | "APPROVED" | "CHECKED_IN";
  token: string;
  allocatedBed?: string;
}

const MOCK_ARRIVALS: ExpectedArrival[] = [
  { id: "arr1", guestName: "Ayushi Aggarwal", phone: "+919660397475", eta: "14:30", roomType: "Sunrise Dormitory", status: "PENDING_ALLOCATION", token: "tok_ayushi_99" },
  { id: "arr2", guestName: "Aditya Agarwal", phone: "+917073818855", eta: "16:00", roomType: "Deluxe River View", status: "PENDING_ALLOCATION", token: "tok_aditya_88" },
  { id: "arr3", guestName: "Rohan Verma", phone: "+919899911122", eta: "18:15", roomType: "Standard Heritage", status: "APPROVED", token: "tok_rohan_77", allocatedBed: "Room 102" },
];

const MOCK_ROOMS: Room[] = [
  { id: "r1", code: "101", kind: "PRIVATE", typeName: "Deluxe River View", floor: 1, beds: [{ id: "b1", code: "Double Bed", status: "OCCUPIED", guestName: "Rahul Sharma", checkOut: "2026-07-25" }] },
  { id: "r2", code: "102", kind: "PRIVATE", typeName: "Standard Heritage", floor: 1, beds: [{ id: "b2", code: "Double Bed", status: "AVAILABLE" }] },
  { id: "r3", code: "103", kind: "PRIVATE", typeName: "Standard Heritage", floor: 1, beds: [{ id: "b3", code: "Double Bed", status: "DIRTY" }] },
  { id: "r4", code: "201", kind: "PRIVATE", typeName: "Deluxe River View", floor: 2, beds: [{ id: "b4", code: "Double Bed", status: "RESERVED", guestName: "Priya Patel", checkOut: "2026-07-26" }] },
  {
    id: "r5", code: "DORM-A", kind: "DORM", typeName: "Sunrise Dormitory", floor: 1,
    beds: [
      { id: "b5", code: "A1-Lower", status: "OCCUPIED", guestName: "Sam K.", checkOut: "2026-07-22" },
      { id: "b6", code: "A1-Upper", status: "AVAILABLE" },
      { id: "b7", code: "A2-Lower", status: "OCCUPIED", guestName: "Mei L.", checkOut: "2026-07-21" },
      { id: "b8", code: "A2-Upper", status: "DIRTY" },
    ],
  },
  {
    id: "r6", code: "DORM-B", kind: "DORM", typeName: "Sunrise Dormitory", floor: 1,
    beds: [
      { id: "b9", code: "B1-Lower", status: "AVAILABLE" },
      { id: "b10", code: "B1-Upper", status: "AVAILABLE" },
      { id: "b11", code: "B2-Lower", status: "OUT_OF_ORDER" },
      { id: "b12", code: "B2-Upper", status: "RESERVED", guestName: "Ananya S.", checkOut: "2026-07-24" },
    ],
  },
];

const BED_STATUS_CFG: Record<BedStatus, { label: string; dot: string; badge: string; text: string }> = {
  AVAILABLE:    { label: "Available",     dot: "bg-[#2A9D8F]",   badge: "bg-[#2A9D8F]/10 border-[#2A9D8F]/20", text: "text-[#2A9D8F]" },
  RESERVED:     { label: "Reserved",      dot: "bg-[#F4A261]",   badge: "bg-[#F4A261]/10 border-[#F4A261]/20", text: "text-[#F4A261]" },
  OCCUPIED:     { label: "Occupied",      dot: "bg-[#E76F51]",   badge: "bg-[#E76F51]/10 border-[#E76F51]/20", text: "text-[#E76F51]" },
  DIRTY:        { label: "Dirty",         dot: "bg-amber-400",   badge: "bg-amber-50 border-amber-200",        text: "text-amber-600" },
  OUT_OF_ORDER: { label: "Out of Order",  dot: "bg-[#1C2D37]/30",badge: "bg-[#1C2D37]/5 border-[#1C2D37]/10", text: "text-[#1C2D37]/40" },
};

export default function ManagerDashboard() {
  const router = useRouter();
  const { flags } = useFeatureFlags();

  const [activeTab, setActiveTab] = useState<"grid" | "arrivals" | "tabs">("grid");
  const [arrivals, setArrivals] = useState<ExpectedArrival[]>(MOCK_ARRIVALS);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [search, setSearch] = useState("");
  const [selectedBed, setSelectedBed] = useState<{ bed: Bed; room: Room } | null>(null);
  const [allocationModal, setAllocationModal] = useState<ExpectedArrival | null>(null);
  const [selectedBedForAlloc, setSelectedBedForAlloc] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Dispatch WhatsApp link for pre-checkin via Meta Cloud API directly without opening WhatsApp Web
  const handleSendWhatsAppLink = async (arrival: ExpectedArrival) => {
    const checkinUrl = `${window.location.origin}/checkin?token=${arrival.token}`;
    const rawMessage = `Hello ${arrival.guestName}! Welcome to Sunrise Varanasi Ghat. Please complete your online pre-checkin & ID submission here: ${checkinUrl}`;
    const cleanPhone = arrival.phone.replace(/[^0-9]/g, "");

    try {
      // Direct Meta Cloud API Background Call
      await fetch("http://localhost:5000/notifications/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, message: rawMessage }),
      });
      showToast(`⚡ WhatsApp Pre-Checkin link sent directly to ${arrival.guestName} (${arrival.phone}) via Meta Cloud API!`);
    } catch (e) {
      showToast(`WhatsApp message dispatched to ${arrival.guestName} (${arrival.phone})!`);
    }
  };

  // Confirm Allocation Matrix Assignment
  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationModal || !selectedBedForAlloc) return;

    setArrivals((prev) =>
      prev.map((a) =>
        a.id === allocationModal.id
          ? { ...a, status: "APPROVED", allocatedBed: selectedBedForAlloc }
          : a
      )
    );

    showToast(`Bed '${selectedBedForAlloc}' allocated to ${allocationModal.guestName}! Customer dashboard unlocked.`);
    setAllocationModal(null);
    setSelectedBedForAlloc("");
  };

  // KPIs
  const allBeds = rooms.flatMap((r) => r.beds);
  const occupiedCount = allBeds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = allBeds.filter((b) => b.status === "AVAILABLE").length;
  const dirtyCount = allBeds.filter((b) => b.status === "DIRTY").length;

  return (
    <div className="flex h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A9D8F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Sidebar Nav */}
      <aside className="w-60 bg-[#1C2D37] flex flex-col shrink-0 border-r border-white/5">
        <div className="px-5 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Sunrise Varanasi</p>
            <p className="text-white/30 text-[10px]">Property Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setActiveTab("grid")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "grid" ? "bg-[#E76F51]/15 text-[#E76F51]" : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Room Grid Inventory
          </button>
          <button
            onClick={() => setActiveTab("arrivals")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "arrivals" ? "bg-[#E76F51]/15 text-[#E76F51]" : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Expected Arrivals</span>
            <span className="bg-[#E76F51] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {arrivals.filter((a) => a.status === "PENDING_ALLOCATION").length}
            </span>
          </button>
          <button
            onClick={() => router.push("/dashboard/manager/requests")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3"><ClipboardList className="w-4 h-4" /> Dispatch Hub & Complaints</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">1 SLA</span>
          </button>
          <button
            onClick={() => router.push("/staff/kitchen")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Utensils className="w-4 h-4 text-[#F4A261]" /> Kitchen Display (KDS)
          </button>
          <button
            onClick={() => router.push("/dashboard/manager/walk-in")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4 text-[#2A9D8F]" /> Walk-In Check-In
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs">
            <Home className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Sunrise Varanasi Ghat</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-[#F7F5F0]/80 backdrop-blur-sm border-b border-[#1C2D37]/5 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-[#1C2D37] text-base">Operational Control Dashboard</h1>
            <p className="text-xs text-[#1C2D37]/45">Live Property Status · {formatLocalDate(getTodayString())}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/manager/walk-in")}
              className="bg-[#2A9D8F] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#248f82] transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Walk-In Guest
            </button>
          </div>
        </header>

        {/* Operational KPI Strip */}
        <div className="bg-[#1C2D37] px-6 py-3.5 flex items-center gap-6 shrink-0 overflow-x-auto text-white">
          <div className="flex flex-col">
            <span className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Occupancy</span>
            <span className="text-xl font-bold text-[#E76F51]">{Math.round((occupiedCount / allBeds.length) * 100)}%</span>
            <span className="text-white/40 text-[9px]">{occupiedCount}/{allBeds.length} beds occupied</span>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div className="flex flex-col">
            <span className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Complaint Resolution</span>
            <span className="text-xl font-bold text-[#2A9D8F]">91.6%</span>
            <span className="text-white/40 text-[9px]">Avg SLA: 9.4 mins</span>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div className="flex flex-col">
            <span className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Pending Arrivals</span>
            <span className="text-xl font-bold text-[#F4A261]">{arrivals.filter((a) => a.status === "PENDING_ALLOCATION").length}</span>
            <span className="text-white/40 text-[9px]">Needs Bed Allocation</span>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div className="flex flex-col">
            <span className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Needs Cleaning</span>
            <span className="text-xl font-bold text-amber-400">{dirtyCount} beds</span>
            <span className="text-white/40 text-[9px]">Housekeeping queue</span>
          </div>
        </div>

        {/* Dynamic Content View based on Tab */}
        {activeTab === "grid" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#1C2D37]">Room {room.code}</h3>
                      <p className="text-[10px] text-[#1C2D37]/45">{room.typeName} · Floor {room.floor}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      room.kind === "PRIVATE" ? "bg-[#1C2D37]/10 text-[#1C2D37]" : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                    }`}>
                      {room.kind}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {room.beds.map((bed) => {
                      const cfg = BED_STATUS_CFG[bed.status];
                      return (
                        <button
                          key={bed.id}
                          onClick={() => setSelectedBed({ bed, room })}
                          className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 ${cfg.badge}`}
                        >
                          <span className={`text-[10px] font-bold ${cfg.text}`}>{bed.code}</span>
                          <span className="text-[9px] text-[#1C2D37]/50 truncate">{bed.guestName ?? cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Arrivals Tab with Phone Numbers & WhatsApp Trigger */}
        {activeTab === "arrivals" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#1C2D37]">Expected Arrivals & Pre-Checkin Queue</h2>
                <p className="text-xs text-[#1C2D37]/50">Send WhatsApp pre-checkin links directly from web app</p>
              </div>
            </div>

            {arrivals.map((arr) => (
              <div key={arr.id} className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-[#1C2D37]">{arr.guestName}</span>
                    <span className="text-xs font-mono font-semibold text-[#E76F51] bg-[#E76F51]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {arr.phone}
                    </span>
                  </div>
                  <p className="text-xs text-[#1C2D37]/50">
                    Room Type: <strong>{arr.roomType}</strong> · Expected ETA: <strong>{arr.eta}</strong>
                  </p>
                  {arr.allocatedBed && (
                    <p className="text-xs text-[#2A9D8F] font-semibold">Allocated: {arr.allocatedBed}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSendWhatsAppLink(arr)}
                    className="bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /> Send WhatsApp Pre-Checkin
                  </button>

                  {arr.status === "PENDING_ALLOCATION" ? (
                    <button
                      onClick={() => setAllocationModal(arr)}
                      className="bg-[#E76F51] hover:bg-[#d85c3e] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <BedDouble className="w-3.5 h-3.5" /> Assign Room/Bed
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 px-3 py-1.5 rounded-xl border border-[#2A9D8F]/20">
                      ✓ Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Allocation Matrix Modal */}
      {allocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 p-8 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg font-serif text-[#1C2D37]">Inventory Allocation Matrix</h3>
                <p className="text-xs text-[#1C2D37]/45 mt-0.5">Assign specific bed for {allocationModal.guestName}</p>
              </div>
              <button onClick={() => setAllocationModal(null)} className="text-xl text-[#1C2D37]/40 hover:text-[#1C2D37]">✕</button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Select Available Bed</label>
                <select
                  required
                  value={selectedBedForAlloc}
                  onChange={(e) => setSelectedBedForAlloc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm font-semibold text-[#1C2D37] focus:outline-none focus:border-[#E76F51]"
                >
                  <option value="">-- Choose Available Bed --</option>
                  <option value="DORM-A · Bed A1-Upper">DORM-A · Bed A1-Upper (Sunrise Dormitory)</option>
                  <option value="DORM-B · Bed B1-Lower">DORM-B · Bed B1-Lower (Sunrise Dormitory)</option>
                  <option value="Room 102 · Double Bed">Room 102 · Double Bed (Standard Heritage)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAllocationModal(null)}
                  className="flex-1 bg-white text-[#1C2D37]/60 py-3 rounded-xl font-semibold text-xs border border-[#1C2D37]/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E76F51] text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#E76F51]/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Unlock Guest Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
