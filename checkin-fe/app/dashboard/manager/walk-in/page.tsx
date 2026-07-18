"use client";

import React, { useState } from "react";
import {
  Ship, Search, User, Phone, BedDouble, CalendarDays,
  CheckCircle2, ArrowRight, ClipboardList, AlertCircle, X
} from "lucide-react";

// ── MOCK available beds ───────────────────────────────────────────────────────
const AVAILABLE_BEDS = [
  { bedId: "b2", bedCode: "Double Bed", roomCode: "102", roomType: "Standard Heritage", kind: "PRIVATE", price: 2800 },
  { bedId: "b6", bedCode: "A1-Upper", roomCode: "DORM-A", roomType: "Sunrise Dormitory", kind: "DORM", price: 900 },
  { bedId: "b9", bedCode: "B1-Lower", roomCode: "DORM-B", roomType: "Sunrise Dormitory", kind: "DORM", price: 900 },
  { bedId: "b10", bedCode: "B1-Upper", roomCode: "DORM-B", roomType: "Sunrise Dormitory", kind: "DORM", price: 900 },
];

type Step = "guest" | "bed" | "confirm" | "done";

interface FormData {
  fullName: string;
  phone: string;
  checkOut: string;
  notes: string;
  bedId: string;
}

export default function WalkInCheckIn() {
  const [step, setStep] = useState<Step>("guest");
  const [form, setForm] = useState<FormData>({ fullName: "", phone: "", checkOut: "", notes: "", bedId: "" });
  const [loading, setLoading] = useState(false);
  const [searchBed, setSearchBed] = useState("");
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const selectedBed = AVAILABLE_BEDS.find((b) => b.bedId === form.bedId);
  const nights = form.checkOut
    ? Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - Date.now()) / 86400000))
    : 0;
  const totalAmount = selectedBed ? selectedBed.price * nights : 0;

  const handleConfirm = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompletedBooking({
        id: "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        guestName: form.fullName,
        bed: selectedBed,
        checkIn: new Date().toLocaleString("en-IN"),
        checkOut: new Date(form.checkOut).toLocaleDateString("en-IN"),
        totalAmount,
      });
      setStep("done");
    }, 1500);
  };

  const reset = () => {
    setStep("guest");
    setForm({ fullName: "", phone: "", checkOut: "", notes: "", bedId: "" });
    setCompletedBooking(null);
  };

  // ── Step indicator ──────────────────────────────────────────────────────────
  const STEPS = [
    { key: "guest", label: "Guest Details" },
    { key: "bed", label: "Assign Bed" },
    { key: "confirm", label: "Review & Confirm" },
  ];

  return (
    <div className="min-h-screen bg-[#E5E7E6] font-sans text-[#1C2D37] flex flex-col">
      {/* Nav */}
      <nav className="bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
          <Ship className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Walk-In Check-In</p>
          <p className="text-white/30 text-[10px]">Sunrise Varanasi Ghat · Manager Portal</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="ml-auto text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          ← Back to Room Grid
        </button>
      </nav>

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* ── DONE STATE ── */}
          {step === "done" && completedBooking && (
            <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-2xl overflow-hidden">
              {/* Success header */}
              <div className="bg-gradient-to-r from-[#2A9D8F] to-[#248f82] p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-white text-2xl font-semibold font-serif">Check-In Successful!</h2>
                <p className="text-white/70 text-sm mt-2">Guest has been checked in and bed is now marked as occupied.</p>
              </div>

              {/* Receipt */}
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-[#1C2D37]/5 pb-3">
                  <span className="text-[#1C2D37]/50">Booking ID</span>
                  <span className="font-bold text-[#E76F51] font-mono">{completedBooking.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[#1C2D37]/5 pb-3">
                  <span className="text-[#1C2D37]/50">Guest Name</span>
                  <span className="font-semibold">{completedBooking.guestName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[#1C2D37]/5 pb-3">
                  <span className="text-[#1C2D37]/50">Room / Bed</span>
                  <span className="font-semibold">Room {completedBooking.bed.roomCode} · {completedBooking.bed.bedCode}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[#1C2D37]/5 pb-3">
                  <span className="text-[#1C2D37]/50">Checked In</span>
                  <span className="font-semibold">{completedBooking.checkIn}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[#1C2D37]/5 pb-3">
                  <span className="text-[#1C2D37]/50">Checking Out</span>
                  <span className="font-semibold">{completedBooking.checkOut}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#1C2D37]/50">Total Amount</span>
                  <span className="font-bold text-lg text-[#1C2D37]">₹{completedBooking.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="px-8 pb-8 flex gap-3">
                <button onClick={reset} className="flex-1 bg-[#1C2D37] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#253945] transition-all">
                  New Walk-In Check-In
                </button>
                <button
                  onClick={() => window.location.href = "/dashboard/manager"}
                  className="flex-1 bg-white text-[#1C2D37]/70 py-3 rounded-xl font-semibold text-sm border border-[#1C2D37]/10 hover:bg-[#F7F5F0] transition-all"
                >
                  Back to Room Grid
                </button>
              </div>
            </div>
          )}

          {step !== "done" && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-0 mb-8">
                {STEPS.map((s, i) => {
                  const stepKeys: Step[] = ["guest", "bed", "confirm"];
                  const currentIdx = stepKeys.indexOf(step);
                  const sIdx = stepKeys.indexOf(s.key as Step);
                  const isDone = sIdx < currentIdx;
                  const isActive = sIdx === currentIdx;
                  return (
                    <React.Fragment key={s.key}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone ? "bg-[#2A9D8F] text-white" : isActive ? "bg-[#E76F51] text-white" : "bg-[#1C2D37]/10 text-[#1C2D37]/30"
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-[#E76F51]" : isDone ? "text-[#2A9D8F]" : "text-[#1C2D37]/30"}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-[2px] w-16 mb-5 mx-1 rounded-full transition-all ${sIdx < currentIdx ? "bg-[#2A9D8F]" : "bg-[#1C2D37]/10"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* ── STEP 1: Guest Details ── */}
              {step === "guest" && (
                <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-xl p-8 space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold font-serif text-[#1C2D37]">Guest Details</h2>
                    <p className="text-sm text-[#1C2D37]/45 mt-1">Enter walk-in guest information to begin check-in</p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-2">Full Name (as on ID)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-[#1C2D37]/30" />
                      <input
                        type="text"
                        placeholder="Rahul Sharma"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-2">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#1C2D37]/30" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-2">Expected Check-Out Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-3.5 w-4 h-4 text-[#1C2D37]/30" />
                      <input
                        type="date"
                        value={form.checkOut}
                        onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-2">Special Requests / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Vegetarian meals, ground floor room, early arrival..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    disabled={!form.fullName || !form.phone || !form.checkOut}
                    onClick={() => setStep("bed")}
                    className="w-full bg-[#E76F51] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#d85c3e] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#E76F51]/15"
                  >
                    Continue to Bed Assignment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── STEP 2: Assign Bed ── */}
              {step === "bed" && (
                <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-xl p-8 space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold font-serif text-[#1C2D37]">Assign Bed</h2>
                    <p className="text-sm text-[#1C2D37]/45 mt-1">Select an available bed for {form.fullName}</p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-[#1C2D37]/30" />
                    <input
                      type="text"
                      placeholder="Search room or bed..."
                      value={searchBed}
                      onChange={(e) => setSearchBed(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 transition-all"
                    />
                  </div>

                  {/* Bed List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {AVAILABLE_BEDS.filter((b) =>
                      searchBed === "" ||
                      b.bedCode.toLowerCase().includes(searchBed.toLowerCase()) ||
                      b.roomCode.toLowerCase().includes(searchBed.toLowerCase()) ||
                      b.roomType.toLowerCase().includes(searchBed.toLowerCase())
                    ).map((bed) => (
                      <button
                        key={bed.bedId}
                        onClick={() => setForm({ ...form, bedId: bed.bedId })}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          form.bedId === bed.bedId
                            ? "bg-[#2A9D8F]/10 border-[#2A9D8F]/30"
                            : "bg-white/60 border-[#1C2D37]/8 hover:bg-white"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          form.bedId === bed.bedId ? "bg-[#2A9D8F] text-white" : "bg-[#1C2D37]/5 text-[#1C2D37]/40"
                        }`}>
                          <BedDouble className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#1C2D37]">Room {bed.roomCode} · {bed.bedCode}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              bed.kind === "PRIVATE" ? "bg-[#1C2D37]/10 text-[#1C2D37]/50" : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                            }`}>
                              {bed.kind === "PRIVATE" ? "Private" : "Dorm"}
                            </span>
                          </div>
                          <p className="text-xs text-[#1C2D37]/40 mt-0.5">{bed.roomType}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#1C2D37] text-sm">₹{bed.price.toLocaleString()}</p>
                          <p className="text-[10px] text-[#1C2D37]/35">/ night</p>
                        </div>
                        {form.bedId === bed.bedId && (
                          <CheckCircle2 className="w-5 h-5 text-[#2A9D8F] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedBed && (
                    <div className="bg-[#1C2D37]/4 rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-[#1C2D37]/50">Estimated total for {nights} night{nights !== 1 ? "s" : ""}</span>
                      <span className="font-bold text-[#1C2D37] text-base">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep("guest")} className="flex-1 bg-white/80 text-[#1C2D37]/60 py-3 rounded-xl font-semibold text-sm border border-[#1C2D37]/8 hover:bg-white transition-all">
                      ← Back
                    </button>
                    <button
                      disabled={!form.bedId}
                      onClick={() => setStep("confirm")}
                      className="flex-1 bg-[#E76F51] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#d85c3e] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#E76F51]/15"
                    >
                      Review & Confirm <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review & Confirm ── */}
              {step === "confirm" && selectedBed && (
                <div className="bg-[#F7F5F0] rounded-[28px] border border-white/50 shadow-xl p-8 space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold font-serif text-[#1C2D37]">Review & Confirm</h2>
                    <p className="text-sm text-[#1C2D37]/45 mt-1">Verify details before completing check-in</p>
                  </div>

                  {/* Summary card */}
                  <div className="bg-white/70 rounded-2xl border border-[#1C2D37]/5 divide-y divide-[#1C2D37]/5 overflow-hidden">
                    {[
                      { label: "Guest Name", value: form.fullName },
                      { label: "Mobile", value: form.phone },
                      { label: "Room / Bed", value: `Room ${selectedBed.roomCode} · ${selectedBed.bedCode}` },
                      { label: "Room Type", value: selectedBed.roomType },
                      { label: "Check-In", value: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                      { label: "Check-Out", value: new Date(form.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                      { label: "Duration", value: `${nights} night${nights !== 1 ? "s" : ""}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center px-5 py-3">
                        <span className="text-xs text-[#1C2D37]/45">{label}</span>
                        <span className="text-xs font-semibold text-[#1C2D37]">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-5 py-4 bg-[#1C2D37]/2">
                      <span className="text-sm font-semibold text-[#1C2D37]">Total Amount</span>
                      <span className="text-xl font-bold text-[#1C2D37]">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {form.notes && (
                    <div className="flex gap-3 bg-[#F4A261]/10 border border-[#F4A261]/20 rounded-xl p-4">
                      <ClipboardList className="w-4 h-4 text-[#F4A261] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#F4A261] mb-1">Special Requests</p>
                        <p className="text-xs text-[#1C2D37]/70">{form.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#2A9D8F]/8 border border-[#2A9D8F]/15 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#1C2D37]/65">
                      Confirming this will mark the bed as <strong>Occupied</strong> and create a booking record. Physical ID verification is required before handing over room key.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("bed")} className="flex-1 bg-white/80 text-[#1C2D37]/60 py-3 rounded-xl font-semibold text-sm border border-[#1C2D37]/8 hover:bg-white transition-all">
                      ← Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex-1 bg-[#2A9D8F] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#248f82] transition-all disabled:opacity-50 shadow-lg shadow-[#2A9D8F]/20"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Complete Check-In</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
