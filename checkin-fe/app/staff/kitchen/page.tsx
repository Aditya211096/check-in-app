"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Utensils, CheckCircle2, XCircle, Clock, AlertCircle, ChefHat, ArrowLeft } from "lucide-react";
import { formatMinutesAgo } from "@/lib/date-utils";

interface KdsOrder {
  id: string;
  roomCode: string;
  guestName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  totalAmount: number;
  customInstructions?: string;
  paymentMethod: "ROOM_TAB" | "COD" | "PAY_NOW";
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "DELIVERED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
}

const MOCK_KITCHEN_ORDERS: KdsOrder[] = [
  {
    id: "ord_101",
    roomCode: "DORM-A (Bed A1-Lower)",
    guestName: "Sam K.",
    items: [
      { name: "Banarasi Special Thali", qty: 1, price: 280 },
      { name: "Fresh Lime Soda", qty: 2, price: 120 },
    ],
    totalAmount: 400,
    customInstructions: "Extra spicy mint chutney on the side, no onions in curd.",
    paymentMethod: "ROOM_TAB",
    status: "PENDING",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_102",
    roomCode: "Room 101",
    guestName: "Rahul Sharma",
    items: [
      { name: "Paneer Butter Masala", qty: 1, price: 320 },
      { name: "Butter Naan", qty: 3, price: 150 },
    ],
    totalAmount: 470,
    paymentMethod: "ROOM_TAB",
    status: "PREPARING",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export default function KitchenDisplaySystem() {
  const router = useRouter();
  const [orders, setOrders] = useState<KdsOrder[]>(MOCK_KITCHEN_ORDERS);
  const [rejectionModal, setRejectionModal] = useState<KdsOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "PREPARING" } : o))
    );
  };

  const handleMarkDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "DELIVERED" } : o))
    );
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModal || !rejectionReason) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === rejectionModal.id
          ? { ...o, status: "REJECTED", rejectionReason }
          : o
      )
    );

    setRejectionModal(null);
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-[#141E24] text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-[#1C2D37] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white">Kitchen Display System (KDS)</h1>
            <p className="text-white/40 text-xs">Cook Sub-Role Order Workflow & Instruction Approval</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/staff")}
          className="text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Staff Portal
        </button>
      </header>

      {/* Orders Grid */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#F4A261]" /> Active Kitchen Queue ({orders.filter((o) => o.status !== "DELIVERED").length})
          </span>
          <span className="text-xs text-emerald-400 font-mono">Real-Time Kitchen Feed: ONLINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
                order.status === "PENDING"
                  ? "bg-[#1C2D37] border-[#E76F51]/60 shadow-[#E76F51]/10"
                  : order.status === "PREPARING"
                  ? "bg-[#1C2D37] border-[#F4A261]/60"
                  : "bg-white/5 border-white/5 opacity-50"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-base text-white">{order.roomCode}</span>
                    <p className="text-xs text-white/50">{order.guestName} · {formatMinutesAgo(order.createdAt)}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full uppercase">
                    {order.paymentMethod}
                  </span>
                </div>

                {/* Items List */}
                <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-white">
                      <span>{item.qty}x {item.name}</span>
                      <span className="text-white/60">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-bold text-[#F4A261]">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Custom Instructions Alert */}
                {order.customInstructions && (
                  <div className="bg-[#F4A261]/10 border border-[#F4A261]/30 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#F4A261] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Custom Cooking Request
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed font-mono">"{order.customInstructions}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                {order.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRejectionModal(order)}
                      className="flex-1 bg-white/10 text-white/70 hover:bg-white/20 font-semibold text-xs py-3 rounded-xl transition-all"
                    >
                      Reject Custom Request
                    </button>
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> ACCEPT ORDER
                    </button>
                  </div>
                )}

                {order.status === "PREPARING" && (
                  <button
                    onClick={() => handleMarkDelivered(order.id)}
                    className="w-full bg-[#2A9D8F] hover:bg-[#248f82] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> MARK READY / DELIVERED
                  </button>
                )}

                {order.status === "DELIVERED" && (
                  <span className="block text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 py-2 rounded-xl">
                    ✓ Delivered to Room
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Rejection Reason Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1C2D37] border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-white font-serif">Reject Custom Cooking Instructions</h3>
                <p className="text-white/40 text-xs mt-0.5">Guest: {rejectionModal.guestName}</p>
              </div>
              <button onClick={() => setRejectionModal(null)} className="text-white/40 text-xl">✕</button>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Mint chutney out of stock / cannot fulfill custom spice request"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#E76F51]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectionModal(null)}
                  className="flex-1 bg-white/10 text-white/60 py-3 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
