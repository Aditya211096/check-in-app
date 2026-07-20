"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, BedDouble, ChevronRight, Ship, Clock, CheckCircle2, XCircle, LogIn, LogOut, AlertCircle } from "lucide-react";
import { formatLocalDate, calculateNights, parseLocalDate } from "@/lib/date-utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  PAYMENT_PENDING: { label: "Payment Pending", color: "text-[#F4A261]", bg: "bg-[#F4A261]/10", Icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]/10", Icon: CheckCircle2 },
  CHECKED_IN: { label: "Checked In", color: "text-emerald-600", bg: "bg-emerald-50", Icon: LogIn },
  CHECKED_OUT: { label: "Checked Out", color: "text-[#1C2D37]/50", bg: "bg-[#1C2D37]/5", Icon: LogOut },
  CANCELLED_BY_GUEST: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", Icon: XCircle },
  CLOSED: { label: "Completed", color: "text-[#1C2D37]/40", bg: "bg-[#1C2D37]/5", Icon: CheckCircle2 },
};

const MOCK_BOOKINGS = [
  {
    id: "bk-001",
    property: { name: "Sunrise Varanasi Ghat", city: "Varanasi", slug: "sunrise-varanasi" },
    status: "CONFIRMED",
    checkIn: "2026-07-25",
    checkOut: "2026-07-28",
    totalAmount: 13500,
    beds: [{ bed: { code: "Deluxe River View" } }],
  },
  {
    id: "bk-002",
    property: { name: "Sunrise Varanasi Ghat", city: "Varanasi", slug: "sunrise-varanasi" },
    status: "CHECKED_IN",
    checkIn: "2026-07-18",
    checkOut: "2026-07-20",
    totalAmount: 1800,
    beds: [{ bed: { code: "Bunk A - Upper" } }, { bed: { code: "Bunk B - Lower" } }],
  },
  {
    id: "bk-003",
    property: { name: "Sunrise Varanasi Ghat", city: "Varanasi", slug: "sunrise-varanasi" },
    status: "CLOSED",
    checkIn: "2026-06-10",
    checkOut: "2026-06-14",
    totalAmount: 11200,
    beds: [{ bed: { code: "Standard Heritage" } }],
  },
];

function BookingCard({ booking, onClick }: { booking: (typeof MOCK_BOOKINGS)[0]; onClick: () => void }) {
  const cfg = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: "text-[#1C2D37]", bg: "bg-[#E5E7E6]", Icon: Clock };
  const StatusIcon = cfg.Icon;
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const dIn = parseLocalDate(booking.checkIn);

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#F7F5F0] rounded-[20px] border border-white/40 shadow-md p-5 flex flex-col md:flex-row md:items-center gap-4 text-left hover:shadow-xl transition-all group"
    >
      <div className="bg-[#1C2D37] text-white rounded-[14px] px-5 py-4 shrink-0 flex flex-col items-center justify-center min-w-[80px]">
        <span className="text-2xl font-bold">
          {String(dIn.getDate()).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          {new Intl.DateTimeFormat("en-IN", { month: "short" }).format(dIn)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#E76F51] shrink-0" />
          <span className="font-semibold text-sm text-[#1C2D37] truncate">{booking.property.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#1C2D37]/55 mt-1">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatLocalDate(booking.checkIn)} → {formatLocalDate(booking.checkOut)} · {nights} night{nights !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {booking.beds.map((b) => b.bed.code).join(", ")}
          </span>
        </div>
      </div>

      <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
        <div className="text-right">
          <div className="font-bold text-[#1C2D37] text-base">₹{booking.totalAmount.toLocaleString()}</div>
          <div className="text-[10px] text-[#1C2D37]/40">Total paid</div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#1C2D37]/25 group-hover:text-[#E76F51] transition-colors hidden md:block" />
      </div>
    </button>
  );
}

export default function MyBookings() {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = MOCK_BOOKINGS.filter(
    (b) => ["CONFIRMED", "PAYMENT_PENDING", "CHECKED_IN"].includes(b.status)
  );
  const past = MOCK_BOOKINGS.filter(
    (b) => !["CONFIRMED", "PAYMENT_PENDING", "CHECKED_IN"].includes(b.status)
  );

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans">
      <nav className="sticky top-0 z-50 bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">Traces</span>
        </div>
        <button
          onClick={() => router.push("/explore")}
          className="text-white/60 hover:text-white text-xs transition-colors flex items-center gap-1.5"
        >
          + New Booking
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-semibold text-[#1C2D37]">My Bookings</h1>
          <p className="text-sm text-[#1C2D37]/50 mt-1">View and manage your stays</p>
        </div>

        <div className="flex gap-1 bg-[#1C2D37]/8 p-1 rounded-xl mb-6 w-fit">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? "bg-white text-[#1C2D37] shadow-sm" : "text-[#1C2D37]/50 hover:text-[#1C2D37]"
              }`}
            >
              {t} ({t === "upcoming" ? upcoming.length : past.length})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {displayed.map((b) => (
            <BookingCard key={b.id} booking={b} onClick={() => router.push(`/stay/${b.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
