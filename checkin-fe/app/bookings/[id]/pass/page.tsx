"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Ship, QrCode, MapPin, CalendarDays, BedDouble, CheckCircle2, Clock, LogIn, Share2, Download } from "lucide-react";

// ── MOCK PASS DATA ─────────────────────────────────────────────────────────────
const MOCK_PASS = {
  bookingId: "bk-001",
  qrPayload: "A3F7C2D8E1B4F9A0",
  guestName: "Aditya Kumar",
  property: {
    name: "Sunrise Varanasi Ghat",
    city: "Varanasi, Uttar Pradesh",
    address: "12 Assi Ghat Road, Varanasi – 221005",
    checkInAt: "14:00",
    checkOutAt: "11:00",
  },
  checkIn: "2026-07-25T14:00:00.000Z",
  checkOut: "2026-07-28T11:00:00.000Z",
  status: "CONFIRMED",
  beds: [{ bedCode: "Double Bed", roomCode: "101", roomType: "Deluxe River View" }],
};

const STATUS_DISPLAY: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  CONFIRMED: { label: "Confirmed", color: "text-[#2A9D8F]", Icon: CheckCircle2 },
  CHECKED_IN: { label: "Checked In", color: "text-emerald-600", Icon: LogIn },
  PAYMENT_PENDING: { label: "Payment Pending", color: "text-[#F4A261]", Icon: Clock },
};

function QRPlaceholder({ value }: { value: string }) {
  const cells = 17;
  const hash = value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (
    <div className="relative inline-block">
      <svg width={170} height={170} viewBox={`0 0 ${cells} ${cells}`} className="rounded-xl">
        <rect width={cells} height={cells} fill="white" />
        {[[0,0],[0,10],[10,0]].map(([cx,cy],i) => (
          <g key={i}>
            <rect x={cx} y={cy} width={7} height={7} fill="#1C2D37" rx={0.5} />
            <rect x={cx+1} y={cy+1} width={5} height={5} fill="white" rx={0.3} />
            <rect x={cx+2} y={cy+2} width={3} height={3} fill="#1C2D37" rx={0.2} />
          </g>
        ))}
        {Array.from({ length: cells * cells }).map((_, idx) => {
          const col = idx % cells;
          const row = Math.floor(idx / cells);
          if ((col < 8 && row < 8) || (col < 8 && row > 8) || (col > 8 && row < 8)) return null;
          const isOn = ((hash * (idx + 1) * 2654435761) >>> 0) % 3 === 0;
          return isOn ? <rect key={idx} x={col} y={row} width={1} height={1} fill="#1C2D37" /> : null;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 border-2 border-[#E76F51] rounded-md opacity-40 animate-ping" style={{ animationDuration: "2s" }} />
      </div>
    </div>
  );
}

export default function DigitalPass() {
  const [copied, setCopied] = useState(false);

  const pass = MOCK_PASS;
  const statusCfg = STATUS_DISPLAY[pass.status] ?? STATUS_DISPLAY["CONFIRMED"];
  const StatusIcon = statusCfg.Icon;

  const nights = Math.ceil(
    (new Date(pass.checkOut).getTime() - new Date(pass.checkIn).getTime()) / 86400000
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(pass.qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#E5E7E6] font-sans text-[#1C2D37] flex flex-col">
      <nav className="bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">Traces · Digital Pass</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Share"}
          </button>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors">
            <Download className="w-3.5 h-3.5" /> Save PDF
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-[#F7F5F0] rounded-[32px] border border-white/60 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1C2D37] via-[#253945] to-[#1C2D37] px-8 pt-8 pb-12 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E76F51]/8" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#2A9D8F]/10" />
              <div className="w-12 h-12 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full shadow-lg shadow-[#E76F51]/30 mb-4 relative z-10" />

              <div className="relative z-10">
                <h1 className="text-white text-xl font-serif font-semibold leading-tight">{pass.property.name}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-[#E76F51]" />
                  <span className="text-white/50 text-xs">{pass.property.city}</span>
                </div>
              </div>

              <div className={`absolute top-6 right-6 flex items-center gap-1.5 bg-white/10 border border-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 ${statusCfg.color}`}>
                <StatusIcon className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{statusCfg.label}</span>
              </div>
            </div>

            <div className="flex items-center -mt-1">
              <div className="w-5 h-10 bg-[#E5E7E6] rounded-r-full shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-[#1C2D37]/10" />
              <div className="w-5 h-10 bg-[#E5E7E6] rounded-l-full shrink-0" />
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#1C2D37]/35 font-bold mb-1">Guest</p>
                <p className="text-xl font-semibold text-[#1C2D37]">{pass.guestName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2A9D8F]/8 rounded-2xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-[#2A9D8F]/70 font-bold mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Check-In
                  </p>
                  <p className="font-bold text-[#1C2D37] text-sm">
                    {new Date(pass.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[#1C2D37]/40 text-xs">{pass.property.checkInAt} onwards</p>
                </div>
                <div className="bg-[#E76F51]/8 rounded-2xl p-4">
                  <p className="text-[9px] uppercase tracking-wider text-[#E76F51]/70 font-bold mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Check-Out
                  </p>
                  <p className="font-bold text-[#1C2D37] text-sm">
                    {new Date(pass.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[#1C2D37]/40 text-xs">by {pass.property.checkOutAt}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#1C2D37]/35 font-bold">Accommodation</p>
                {pass.beds.map((bed, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/60 border border-[#1C2D37]/5 rounded-2xl px-4 py-3">
                    <div className="w-9 h-9 bg-[#1C2D37]/6 rounded-xl flex items-center justify-center shrink-0">
                      <BedDouble className="w-4 h-4 text-[#1C2D37]/50" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1C2D37]">Room {bed.roomCode} · {bed.bedCode}</p>
                      <p className="text-xs text-[#1C2D37]/40">{bed.roomType} · {nights} night{nights !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center pt-2">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#1C2D37]/35 font-bold mb-4">Scan at Reception</p>
                <div className="p-3 bg-white rounded-2xl shadow-inner border border-[#1C2D37]/5">
                  <QRPlaceholder value={pass.qrPayload} />
                </div>
                <p className="font-mono text-xs text-[#1C2D37]/30 tracking-[0.3em] mt-3">{pass.qrPayload}</p>
              </div>

              <div className="bg-[#1C2D37]/4 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-[#1C2D37]/45 leading-relaxed">{pass.property.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
