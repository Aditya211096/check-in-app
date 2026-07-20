"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ship, LayoutGrid, Users, ClipboardList, Bell, Settings, LogOut,
  BedDouble, CheckCircle2, Clock, AlertCircle, Wrench, ChevronDown,
  Search, Plus, Filter, RefreshCw, TrendingUp, Home, MessageSquare, Phone,
  Send, AlertTriangle, ShieldAlert, FileText, CheckCheck, X, Utensils, UserPlus, Lock
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
  status: "PRE_CHECKIN_PENDING" | "PRE_CHECKIN_SUBMITTED" | "APPROVED" | "CHECKED_IN";
  token: string;
  allocatedBed?: string;
}

const MOCK_ARRIVALS: ExpectedArrival[] = [
  { id: "arr1", guestName: "Ayushi Aggarwal", phone: "+919660397475", eta: "14:30", roomType: "Sunrise Dormitory", status: "PRE_CHECKIN_SUBMITTED", token: "tok_ayushi_99" },
  { id: "arr2", guestName: "Sudhir Agarwal", phone: "+919810495179", eta: "15:45", roomType: "Deluxe River View", status: "PRE_CHECKIN_PENDING", token: "tok_sudhir_88" },
  { id: "arr3", guestName: "Aditya Agarwal", phone: "+917073818855", eta: "16:00", roomType: "Deluxe River View", status: "PRE_CHECKIN_PENDING", token: "tok_aditya_77" },
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

export default function ManagerDashboard() {
  const router = useRouter();
  const { flags } = useFeatureFlags();

  const [activeTab, setActiveTab] = useState<"grid" | "arrivals" | "tabs">("grid");
  const [arrivals, setArrivals] = useState<ExpectedArrival[]>(MOCK_ARRIVALS);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [allocationModal, setAllocationModal] = useState<ExpectedArrival | null>(null);
  const [selectedBedForAlloc, setSelectedBedForAlloc] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  // Add Guest Booking Modal State
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestRoomType, setNewGuestRoomType] = useState("Sunrise Dormitory");
  const [newGuestEta, setNewGuestEta] = useState("14:00");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Dispatch WhatsApp link for pre-checkin via Meta Cloud API directly
  const handleSendWhatsAppLink = async (arrival: ExpectedArrival) => {
    // Generate public GitHub Pages / Vercel link when deployed, or window.location.origin
    const origin = typeof window !== "undefined" ? window.location.origin : "https://Aditya211096.github.io/check-in-app";
    const checkinUrl = `${origin}/checkin?token=${arrival.token}`;
    const rawMessage = `Hello ${arrival.guestName}! Welcome to Sunrise Varanasi Ghat. Please complete your online pre-checkin & ID submission here: ${checkinUrl}`;
    const cleanPhone = arrival.phone.replace(/[^0-9]/g, "");

    try {
      await fetch("http://localhost:5000/notifications/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, message: rawMessage }),
      });
      showToast(`⚡ WhatsApp Pre-Checkin link sent directly to ${arrival.guestName} (${arrival.phone}) via Meta Cloud API!`);
    } catch (e) {
      showToast(`WhatsApp link generated for ${arrival.guestName} (${arrival.phone})!`);
    }
  };

  // Create New Guest Arrival & Generate Token
  const handleCreateGuestBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newGuestPhone) {
      showToast("Please enter guest name and valid mobile phone number.");
      return;
    }
    const token = `tok_${newGuestName.toLowerCase().replace(/\s+/g, "_")}_${Date.now().toString().slice(-4)}`;
    const created: ExpectedArrival = {
      id: `arr_${Date.now()}`,
      guestName: newGuestName,
      phone: newGuestPhone.startsWith("+") ? newGuestPhone : `+91${newGuestPhone}`,
      eta: newGuestEta,
      roomType: newGuestRoomType,
      status: "PRE_CHECKIN_PENDING",
      token,
    };

    setArrivals([created, ...arrivals]);
    setIsAddGuestOpen(false);
    setNewGuestName("");
    setNewGuestPhone("");
    showToast(`Created booking for ${created.guestName}! Sending WhatsApp pre-checkin link now...`);

    handleSendWhatsAppLink(created);
  };

  // Confirm Optional Allocation Assignment
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

    showToast(`Bed '${selectedBedForAlloc}' allocated to ${allocationModal.guestName}!`);
    setAllocationModal(null);
    setSelectedBedForAlloc("");
  };

  // KPIs
  const allBeds = rooms.flatMap((r) => r.beds);
  const occupiedCount = allBeds.filter((b) => b.status === "OCCUPIED").length;
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
            <p className="text-white/30 text-[10px]">Dual Role: Yash Sharma</p>
          </div>
        </div>

        {/* Dual Role Switcher Toggle */}
        <div className="px-3 py-3 bg-white/5 border-b border-white/5 flex gap-1">
          <button
            onClick={() => router.push("/dashboard/manager")}
            className="flex-1 bg-[#E76F51] text-white text-[10px] font-bold py-2 rounded-lg text-center shadow-sm"
          >
            👔 Manager View
          </button>
          <button
            onClick={() => router.push("/dashboard/owner")}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 text-[10px] font-bold py-2 rounded-lg text-center transition-colors"
          >
            🏨 Owner View
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setActiveTab("grid")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "grid" ? "bg-[#E76F51] text-white shadow-lg shadow-[#E76F51]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Room Grid Inventory
          </button>

          <button
            onClick={() => setActiveTab("arrivals")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "arrivals" ? "bg-[#E76F51] text-white shadow-lg shadow-[#E76F51]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <Users className="w-4 h-4" /> Expected Arrivals
            </span>
            <span className="w-5 h-5 bg-[#F4A261] text-[#1C2D37] text-[10px] font-bold rounded-full flex items-center justify-center">
              {arrivals.filter((a) => a.status !== "APPROVED").length}
            </span>
          </button>

          <button
            onClick={() => router.push("/dashboard/manager/requests")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4" /> Dispatch Hub & Complaints
            </span>
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              1 SLA
            </span>
          </button>

          <button
            onClick={() => router.push("/staff/kitchen")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <Utensils className="w-4 h-4 text-[#F4A261]" /> Kitchen Display (KDS)
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-[#1C2D37]/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-serif font-bold text-xl text-[#1C2D37]">Operational Control Dashboard</h1>
            <p className="text-xs text-[#1C2D37]/45">Live Property Status · {formatLocalDate(getTodayString())}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddGuestOpen(true)}
              className="bg-[#2A9D8F] hover:bg-[#248f82] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" /> + Add Guest Booking
            </button>
            <button
              onClick={() => router.push("/dashboard/manager/walk-in")}
              className="bg-[#2A9D8F] hover:bg-[#248f82] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Walk-In Guest
            </button>
          </div>
        </header>

        {/* Top KPI Bar */}
        <div className="bg-[#1C2D37] text-white px-8 py-4 grid grid-cols-4 gap-6 shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Occupancy</span>
            <div className="text-xl font-bold mt-0.5 text-[#F4A261]">
              {Math.round((occupiedCount / allBeds.length) * 100)}%
            </div>
            <span className="text-[10px] text-white/40">{occupiedCount}/{allBeds.length} beds occupied</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Complaint Resolution</span>
            <div className="text-xl font-bold mt-0.5 text-[#2A9D8F]">91.6%</div>
            <span className="text-[10px] text-white/40">Avg SLA: 8.4 mins</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Pending Arrivals</span>
            <div className="text-xl font-bold mt-0.5 text-[#E76F51]">
              {arrivals.filter((a) => a.status !== "APPROVED").length}
            </div>
            <span className="text-[10px] text-white/40">Pre-Checkin Queue</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Needs Cleaning</span>
            <div className="text-xl font-bold mt-0.5 text-white">{dirtyCount} beds</div>
            <span className="text-[10px] text-white/40">Housekeeping queue</span>
          </div>
        </div>

        {/* Views Content */}
        <div className="p-8">
          {activeTab === "grid" && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-lg text-[#1C2D37]">Live Room & Dorm Bed Grid</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 border border-[#1C2D37]/10 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#E76F51]">{r.code}</span>
                        <h3 className="font-serif font-bold text-sm text-[#1C2D37]">{r.typeName}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1C2D37]/5 rounded-full text-[#1C2D37]/60 uppercase">
                        Floor {r.floor}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2D37]/5">
                      {r.beds.map((b) => (
                        <div key={b.id} className="bg-[#F7F5F0] p-3 rounded-xl border border-[#1C2D37]/5 space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>{b.code}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                b.status === "AVAILABLE" ? "bg-emerald-500" : b.status === "OCCUPIED" ? "bg-blue-500" : "bg-amber-500"
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-[#1C2D37]/50 block">{b.status}</span>
                          {b.guestName && <p className="text-[11px] font-semibold text-[#1C2D37] truncate">{b.guestName}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "arrivals" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1C2D37]">Expected Arrivals & Pre-Checkin Queue</h2>
                <p className="text-xs text-[#1C2D37]/50">
                  Room/Bed assignment unlocks only AFTER guest completes online pre-checkin. Assignment is optional prior to check-in date.
                </p>
              </div>

              <div className="space-y-3">
                {arrivals.map((arr) => (
                  <div key={arr.id} className="bg-white rounded-2xl p-5 border border-[#1C2D37]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#1C2D37]">{arr.guestName}</h3>
                        <span className="text-xs font-mono font-bold text-[#E76F51] bg-[#E76F51]/10 px-2 py-0.5 rounded-md">
                          {arr.phone}
                        </span>
                        {arr.status === "PRE_CHECKIN_PENDING" && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                            Pre-Checkin Pending
                          </span>
                        )}
                        {arr.status === "PRE_CHECKIN_SUBMITTED" && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pre-Checkin Submitted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1C2D37]/50 mt-1">
                        Room Type: <strong className="text-[#1C2D37]">{arr.roomType}</strong> · Expected ETA: <strong>{arr.eta}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSendWhatsAppLink(arr)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Send WhatsApp Pre-Checkin Link
                      </button>

                      {arr.status === "PRE_CHECKIN_PENDING" && (
                        <button
                          disabled
                          className="bg-gray-100 text-gray-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-200 cursor-not-allowed flex items-center gap-1.5"
                          title="Room allocation unlocks after customer submits online pre-checkin"
                        >
                          <Lock className="w-3.5 h-3.5 text-gray-400" /> Awaiting Guest Pre-Checkin
                        </button>
                      )}

                      {arr.status === "PRE_CHECKIN_SUBMITTED" && (
                        <button
                          onClick={() => setAllocationModal(arr)}
                          className="bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <BedDouble className="w-3.5 h-3.5" /> Assign Room/Bed (Optional)
                        </button>
                      )}

                      {arr.status === "APPROVED" && (
                        <span className="bg-[#2A9D8F]/10 text-[#2A9D8F] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Allocated: {arr.allocatedBed}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add New Guest Booking Modal */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C2D37]/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#1C2D37]/10 pb-3">
              <h3 className="font-bold text-lg font-serif text-[#1C2D37]">Add New Expected Guest</h3>
              <button onClick={() => setIsAddGuestOpen(false)} className="text-[#1C2D37]/40 hover:text-[#1C2D37]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuestBooking} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sudhir Agarwal"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Mobile Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9810495179"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37] font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Room / Dorm Category</label>
                <select
                  value={newGuestRoomType}
                  onChange={(e) => setNewGuestRoomType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37]"
                >
                  <option value="Sunrise Dormitory">Sunrise Dormitory (Bunk Bed)</option>
                  <option value="Deluxe River View">Deluxe River View (Private)</option>
                  <option value="Standard Heritage">Standard Heritage (Private)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Expected Arrival Time (ETA)</label>
                <input
                  type="time"
                  value={newGuestEta}
                  onChange={(e) => setNewGuestEta(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2A9D8F] hover:bg-[#248f82] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all"
              >
                Create Booking & Auto-Send WhatsApp Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Allocation Matrix Modal */}
      {allocationModal && (
        <div className="fixed inset-0 z-50 bg-[#1C2D37]/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#1C2D37]/10 pb-3">
              <div>
                <h3 className="font-bold text-lg font-serif text-[#1C2D37]">Inventory Allocation Matrix (Optional)</h3>
                <p className="text-xs text-[#1C2D37]/50">Assign space for {allocationModal.guestName} (Can also assign on arrival)</p>
              </div>
              <button onClick={() => setAllocationModal(null)} className="text-[#1C2D37]/40 hover:text-[#1C2D37]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-4">
              <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40">Select Available Bed / Room</label>
              <select
                value={selectedBedForAlloc}
                onChange={(e) => setSelectedBedForAlloc(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-xl text-xs font-semibold text-[#1C2D37]"
              >
                <option value="">-- Choose Bed / Room --</option>
                <option value="DORM-A · Bed A1-Upper">DORM-A · Bed A1-Upper (Available)</option>
                <option value="DORM-B · Bed B1-Lower">DORM-B · Bed B1-Lower (Available)</option>
                <option value="Room 102 · Double Bed">Room 102 · Double Bed (Available)</option>
              </select>

              <button
                type="submit"
                disabled={!selectedBedForAlloc}
                className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-40"
              >
                Confirm Optional Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
