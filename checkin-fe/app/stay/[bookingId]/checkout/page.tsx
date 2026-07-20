"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Receipt, CheckCircle2, CreditCard, Clock, ArrowRight, ShieldCheck, Home } from "lucide-react";

export default function ExpressCheckoutSettlement() {
  const router = useRouter();
  const params = useParams();
  const bookingId = (params?.bookingId as string) || "bk-001";

  const [paymentMethod, setPaymentMethod] = useState<"UPI_ONLINE" | "CASH_OFFLINE">("UPI_ONLINE");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);

  const ledgerItems = [
    { label: "Room Stay (Sunrise Dormitory - Bed A1-Lower · 2 nights)", amount: 1800 },
    { label: "Room Tab Order #101 (Banarasi Thali + Fresh Lime Soda)", amount: 400 },
    { label: "Laundry Service", amount: 150 },
  ];

  const subtotal = ledgerItems.reduce((a, b) => a + b.amount, 0);
  const tax = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + tax;

  const handleProcessCheckout = () => {
    setIsSubmitted(true);
  };

  const handleSimulateManagerApproval = () => {
    setManagerApproved(true);
  };

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#F7F5F0] rounded-[28px] border border-white/50 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="border-b border-[#1C2D37]/5 pb-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-xl font-serif text-[#1C2D37]">Express Check-Out Ledger</h1>
            <p className="text-xs text-[#1C2D37]/45 mt-0.5">Booking ID: {bookingId} · Bed A1-Lower</p>
          </div>
          <span className="text-xs font-bold bg-[#E76F51]/10 text-[#E76F51] px-3 py-1 rounded-full">
            Master Tab Consolidated
          </span>
        </div>

        {/* Completed Checkout State */}
        {isSubmitted && (
          <div className="space-y-6 text-center py-4">
            {!managerApproved ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold font-serif">Pending Manager Payment Nod</h2>
                <p className="text-xs text-[#1C2D37]/60 leading-relaxed max-w-sm mx-auto">
                  Your offline payment of <strong>₹{grandTotal.toLocaleString()}</strong> has been submitted. The Manager must tap "Confirm Payment Received" to clear the tab.
                </p>

                <button
                  onClick={handleSimulateManagerApproval}
                  className="bg-[#1C2D37] text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg"
                >
                  [Demo Action: Manager Taps "Confirm Payment Received"]
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#2A9D8F]/20 text-[#2A9D8F] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-[#2A9D8F]">Check-Out Complete!</h2>
                <p className="text-xs text-[#1C2D37]/60 max-w-sm mx-auto">
                  Thank you for staying at Sunrise Varanasi Ghat! Bed A1-Lower inventory has been reset to <strong>Needs Cleaning</strong>.
                </p>

                <button
                  onClick={() => router.push("/explore")}
                  className="bg-[#2A9D8F] text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        )}

        {/* Master Ledger List */}
        {!isSubmitted && (
          <div className="space-y-5">
            <div className="bg-white/80 rounded-2xl p-4 border border-[#1C2D37]/5 divide-y divide-[#1C2D37]/5 space-y-2">
              {ledgerItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center pt-2 text-xs font-semibold text-[#1C2D37]">
                  <span>{item.label}</span>
                  <span>₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center text-xs text-[#1C2D37]/50">
                <span>GST (12%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="pt-3 flex justify-between items-center text-base font-bold text-[#E76F51]">
                <span>Grand Total Balance</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40">Select Settlement Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI_ONLINE")}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === "UPI_ONLINE"
                      ? "bg-[#1C2D37] text-white border-transparent shadow-md"
                      : "bg-white text-[#1C2D37]/60 border-[#1C2D37]/10"
                  }`}
                >
                  Pay Online (UPI / Card)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH_OFFLINE")}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === "CASH_OFFLINE"
                      ? "bg-[#1C2D37] text-white border-transparent shadow-md"
                      : "bg-white text-[#1C2D37]/60 border-[#1C2D37]/10"
                  }`}
                >
                  Pay Cash / UPI Offline
                </button>
              </div>
            </div>

            <button
              onClick={handleProcessCheckout}
              className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Complete Express Check-Out (₹{grandTotal.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
