"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Ship, Lock, Wifi, Calendar, MapPin, CheckCircle2, Clock,
  Utensils, AlertTriangle, ShieldCheck, ArrowRight, Plus, LogOut, Phone
} from "lucide-react";
import { formatLocalDate } from "@/lib/date-utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

interface ComplaintItem {
  id: string;
  category: string;
  stage: "RECEIVED" | "EN_ROUTE" | "IN_PROGRESS" | "RESOLVED";
  staffName?: string;
  createdAt: string;
}

const MOCK_MENU = [
  { id: "m1", name: "Banarasi Special Thali", category: "Mains", price: 280, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80" },
  { id: "m2", name: "Paneer Butter Masala", category: "Mains", price: 320, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80" },
  { id: "m3", name: "Fresh Lime Soda", category: "Beverages", price: 120, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80" },
];

export default function GuestStayPortal() {
  const router = useRouter();
  const params = useParams();
  const bookingId = (params?.bookingId as string) || "bk-001";
  const { flags } = useFeatureFlags();

  // Pre-Checkin Approval Locked Guard Simulation
  const [isApproved, setIsApproved] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "complaints" | "dining" | "guide">("home");

  // Room Tab Balance
  const [tabBalance, setTabBalance] = useState(400);

  // Complaints state
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    { id: "c1", category: "Plumbing & Hot Water", stage: "IN_PROGRESS", staffName: "Ramesh (Maintenance)", createdAt: "10:30 AM" },
  ]);

  const [newComplaintCategory, setNewComplaintCategory] = useState("Housekeeping & Towels");
  const [newComplaintNote, setNewComplaintNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Food Ordering Cart
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [customInstructions, setCustomInstructions] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ComplaintItem = {
      id: "c_" + Math.random().toString(36).substring(2, 7),
      category: newComplaintCategory,
      stage: "RECEIVED",
      createdAt: "Just now",
    };
    setComplaints((prev) => [created, ...prev]);
    setNewComplaintNote("");
    showToast("Complaint submitted! Manager notified via unavoidable chime overlay.");
  };

  const handlePlaceOrder = () => {
    let orderSum = 0;
    Object.entries(cart).forEach(([mId, qty]) => {
      const item = MOCK_MENU.find((m) => m.id === mId);
      if (item) orderSum += item.price * qty;
    });

    if (orderSum === 0) return;
    setTabBalance((prev) => prev + orderSum);
    setCart({});
    setCustomInstructions("");
    showToast(`Food order placed (₹${orderSum})! Added to your Room Tab Ledger.`);
  };

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#141E24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#E76F51]/20 rounded-full flex items-center justify-center mb-4 border border-[#E76F51]/40">
          <Lock className="w-8 h-8 text-[#E76F51]" />
        </div>
        <h1 className="text-2xl font-bold font-serif mb-2">Guest Portal Locked</h1>
        <p className="text-white/50 text-xs max-w-sm mb-6 leading-relaxed">
          Your pre-checkin details have been submitted. The Property Manager is reviewing your ID and assigning your room/bed. The portal will unlock automatically once approved.
        </p>
        <button
          onClick={() => setIsApproved(true)}
          className="bg-[#2A9D8F] text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg"
        >
          [Demo Action: Simulate Manager Approval]
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A9D8F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <nav className="bg-[#1C2D37] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Sunrise Varanasi Ghat</h1>
            <p className="text-white/40 text-[10px]">In-Stay Guest Experience Portal</p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/stay/${bookingId}/checkout`)}
          className="bg-[#E76F51] hover:bg-[#d85c3e] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
        >
          <LogOut className="w-3.5 h-3.5" /> Express Check-Out (Tab: ₹{tabBalance})
        </button>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white/80 border-b border-[#1C2D37]/5 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
        {[
          { id: "home", label: "Stay Overview" },
          { id: "complaints", label: `Emergency Complaints (${complaints.length})` },
          { id: "dining", label: "In-Stay Dining Menu" },
          { id: "guide", label: "Local Destination Guide" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === t.id ? "bg-[#1C2D37] text-white shadow-sm" : "text-[#1C2D37]/50 hover:bg-[#1C2D37]/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
        {/* STAY OVERVIEW TAB */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Stay Card */}
            <div className="bg-gradient-to-br from-[#1C2D37] to-[#253945] rounded-[28px] p-8 text-white shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[#E76F51] text-xs uppercase tracking-wider font-bold">Assigned Space</span>
                  <h2 className="text-3xl font-bold font-serif text-white mt-1">DORM-A · Bed A1-Lower</h2>
                  <p className="text-white/50 text-xs mt-1">Sunrise Dormitory · Ground Floor</p>
                </div>
                <span className="bg-[#2A9D8F] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ✓ Checked-In
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div>
                  <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Property Wi-Fi Code</span>
                  <p className="text-sm font-mono font-bold text-[#F4A261] mt-0.5 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" /> SunriseGhat#2026
                  </p>
                </div>

                <div>
                  <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Check-Out Date</span>
                  <p className="text-sm font-semibold text-white mt-0.5">25 Jul 2026 (11:00 AM)</p>
                </div>

                <div>
                  <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Room Tab Balance</span>
                  <p className="text-sm font-bold text-[#E76F51] mt-0.5">₹{tabBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="space-y-6">
            {/* Submit Complaint Card */}
            <div className="bg-[#F7F5F0] rounded-[24px] border border-white/50 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#1C2D37] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#E76F51]" /> Raise Emergency In-Stay Complaint
              </h3>

              <form onSubmit={handleRaiseComplaint} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Search Complaint Category</label>
                  <select
                    value={newComplaintCategory}
                    onChange={(e) => setNewComplaintCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-xs font-semibold text-[#1C2D37]"
                  >
                    <option value="Housekeeping & Towels">Housekeeping & Extra Towels</option>
                    <option value="Plumbing & Hot Water">Plumbing & Hot Water Shower Issue</option>
                    <option value="AC & WiFi Controls">AC Remote & WiFi Connection Issue</option>
                    <option value="Noise Complaint">Noise Disturbance in Corridor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe your issue..."
                    value={newComplaintNote}
                    onChange={(e) => setNewComplaintNote(e.target.value)}
                    className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#E76F51] text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg hover:bg-[#d85c3e] transition-all"
                >
                  Submit Complaint to Manager
                </button>
              </form>
            </div>

            {/* Complaints Tracker List */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-[#1C2D37]/40 font-bold">Live Complaint Status Tracker</h4>
              {complaints.map((c) => (
                <div key={c.id} className="bg-[#F7F5F0] rounded-2xl p-5 border border-white/50 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-[#1C2D37]">{c.category}</span>
                      <p className="text-xs text-[#1C2D37]/45 mt-0.5">Raised at {c.createdAt} {c.staffName ? `· Assigned: ${c.staffName}` : ""}</p>
                    </div>
                  </div>

                  {/* Stage-by-Stage Progress Visual Tracker */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { key: "RECEIVED", label: "1. Received" },
                      { key: "EN_ROUTE", label: "2. Staff En Route" },
                      { key: "IN_PROGRESS", label: "3. In Progress" },
                      { key: "RESOLVED", label: "4. Resolved" },
                    ].map((stg, i) => {
                      const stages = ["RECEIVED", "EN_ROUTE", "IN_PROGRESS", "RESOLVED"];
                      const currentIdx = stages.indexOf(c.stage);
                      const isPastOrCurrent = i <= currentIdx;
                      return (
                        <div key={stg.key} className="space-y-1">
                          <div className={`h-2 rounded-full transition-all ${
                            isPastOrCurrent ? "bg-[#2A9D8F]" : "bg-[#1C2D37]/10"
                          }`} />
                          <span className={`text-[9px] font-bold ${
                            isPastOrCurrent ? "text-[#2A9D8F]" : "text-[#1C2D37]/30"
                          }`}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DINING TAB */}
        {activeTab === "dining" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#1C2D37]">In-Stay Dining Menu</h3>
                <p className="text-xs text-[#1C2D37]/45 mt-0.5">Orders automatically post to your central Room Tab Ledger</p>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="bg-[#2A9D8F] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg"
              >
                Place Order & Add to Room Tab
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_MENU.map((item) => (
                <div key={item.id} className="bg-[#F7F5F0] rounded-2xl border border-white/50 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-xl" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2D37]">{item.name}</h4>
                    <p className="text-xs font-bold text-[#E76F51] mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1C2D37]/5 pt-2">
                    <span className="text-xs text-[#1C2D37]/50">Qty: {cart[item.id] ?? 0}</span>
                    <button
                      onClick={() => setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))}
                      className="bg-[#1C2D37] text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
