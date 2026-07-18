"use client";

import React, { useState, useEffect } from "react";
import {
  Ship, Bell, CheckCircle2, Clock, Wrench, AlertTriangle,
  Zap, User, BedDouble, ChevronRight, Filter, RefreshCw,
  Megaphone, CheckCheck, ArrowRight, X
} from "lucide-react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type ReqState = "NEW" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "AUTO_ESCALATED";
type ReqType = "REQUEST" | "COMPLAINT";

interface ServiceItem {
  id: string;
  type: ReqType;
  category: string;
  priority: string;
  state: ReqState;
  guestName: string;
  roomCode: string;
  createdAt: string;
  etaMinutes?: number;
  assignedTo?: string;
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_ITEMS: ServiceItem[] = [
  { id: "r1", type: "COMPLAINT", category: "Noise Complaint", priority: "HIGH", state: "AUTO_ESCALATED", guestName: "Rahul Sharma", roomCode: "101", createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
  { id: "r2", type: "REQUEST", category: "Extra Pillows", priority: "NORMAL", state: "NEW", guestName: "Priya Patel", roomCode: "DORM-A", createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
  { id: "r3", type: "REQUEST", category: "Room Cleaning", priority: "NORMAL", state: "ASSIGNED", guestName: "Sam K.", roomCode: "DORM-A", createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), etaMinutes: 15, assignedTo: "Housekeeping Staff" },
  { id: "r4", type: "REQUEST", category: "Hot Water Issue", priority: "HIGH", state: "IN_PROGRESS", guestName: "Mei L.", roomCode: "102", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), etaMinutes: 5, assignedTo: "Maintenance Team" },
  { id: "r5", type: "COMPLAINT", category: "AC Not Working", priority: "HIGH", state: "NEW", guestName: "Ananya S.", roomCode: "201", createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
  { id: "r6", type: "REQUEST", category: "F&B Order", priority: "NORMAL", state: "RESOLVED", guestName: "Vikram N.", roomCode: "103", createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
];

// ── STATE CONFIG ──────────────────────────────────────────────────────────────
const STATE_CFG: Record<ReqState, { label: string; color: string; bg: string; border: string; dot: string; Icon: React.ElementType }> = {
  NEW:            { label: "New",           color: "text-[#E76F51]",   bg: "bg-[#E76F51]/8",  border: "border-[#E76F51]/20",  dot: "bg-[#E76F51]",   Icon: Bell },
  ACKNOWLEDGED:   { label: "Acknowledged",  color: "text-[#F4A261]",   bg: "bg-[#F4A261]/8",  border: "border-[#F4A261]/20",  dot: "bg-[#F4A261]",   Icon: CheckCircle2 },
  ASSIGNED:       { label: "Assigned",      color: "text-blue-500",    bg: "bg-blue-50",      border: "border-blue-200",      dot: "bg-blue-400",    Icon: User },
  IN_PROGRESS:    { label: "In Progress",   color: "text-[#2A9D8F]",   bg: "bg-[#2A9D8F]/8",  border: "border-[#2A9D8F]/20",  dot: "bg-[#2A9D8F]",   Icon: Wrench },
  RESOLVED:       { label: "Resolved",      color: "text-[#1C2D37]/40",bg: "bg-[#1C2D37]/4",  border: "border-[#1C2D37]/10",  dot: "bg-[#1C2D37]/25",Icon: CheckCheck },
  AUTO_ESCALATED: { label: "SLA Breached!", color: "text-red-600",     bg: "bg-red-50",       border: "border-red-200",       dot: "bg-red-500",     Icon: Zap },
};

function minutesAgo(isoString: string) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

// ── FULLSCREEN ESCALATION OVERLAY ──────────────────────────────────────────────
function EscalationOverlay({ item, onDismiss }: { item: ServiceItem; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-red-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-pulse">
      <div className="w-24 h-24 rounded-full bg-red-500/30 flex items-center justify-center mb-6 animate-ping absolute" />
      <Zap className="w-16 h-16 text-red-300 mb-6 relative" />
      <h1 className="text-4xl font-bold mb-2 relative">SLA BREACH ALERT</h1>
      <p className="text-red-200 text-lg mb-2 relative">Unacknowledged for over 10 minutes</p>
      <div className="bg-white/10 rounded-2xl px-8 py-5 mb-8 text-center relative">
        <p className="text-2xl font-semibold">{item.category}</p>
        <p className="text-red-200 mt-1">{item.guestName} · Room {item.roomCode}</p>
      </div>
      <button
        onClick={onDismiss}
        className="bg-white text-red-700 font-bold px-8 py-3 rounded-xl text-lg hover:bg-red-50 transition-all relative"
      >
        Acknowledge Now
      </button>
    </div>
  );
}

// ── REQUEST CARD ──────────────────────────────────────────────────────────────
function RequestCard({ item, onAction }: { item: ServiceItem; onAction: (item: ServiceItem, action: string) => void }) {
  const cfg = STATE_CFG[item.state];
  const StateIcon = cfg.Icon;
  const isEscalated = item.state === "AUTO_ESCALATED";
  const isNew = item.state === "NEW";
  const isComplaint = item.type === "COMPLAINT";

  return (
    <div className={`bg-[#F7F5F0] rounded-[20px] border shadow-sm hover:shadow-lg transition-all p-5 ${
      isEscalated ? "border-red-300 shadow-red-100 shadow-md" : "border-white/50"
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Type icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isEscalated ? "bg-red-100" : isComplaint ? "bg-[#E76F51]/10" : "bg-[#1C2D37]/6"
          }`}>
            {isEscalated ? (
              <Zap className="w-5 h-5 text-red-500" />
            ) : isComplaint ? (
              <Megaphone className="w-5 h-5 text-[#E76F51]" />
            ) : (
              <Bell className="w-5 h-5 text-[#1C2D37]/40" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-[#1C2D37]">{item.category}</span>
              {item.priority === "HIGH" && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E76F51]/10 text-[#E76F51] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> High Priority
                </span>
              )}
              {isComplaint && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E76F51]/15 text-[#E76F51] px-2 py-0.5 rounded-full">
                  Complaint
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#1C2D37]/45 flex-wrap">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.guestName}</span>
              <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />Room {item.roomCode}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{minutesAgo(item.createdAt)}</span>
            </div>
            {item.assignedTo && (
              <p className="text-xs text-[#1C2D37]/40 mt-1">→ {item.assignedTo}{item.etaMinutes ? ` · ETA ${item.etaMinutes} min` : ""}</p>
            )}
          </div>
        </div>

        {/* State badge */}
        <span className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          <StateIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      {/* Action buttons */}
      {(isNew || isEscalated) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#1C2D37]/5">
          <button
            onClick={() => onAction(item, "acknowledge")}
            className="flex-1 bg-[#1C2D37] text-white text-xs font-semibold py-2 rounded-xl hover:bg-[#253945] transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
          </button>
          <button
            onClick={() => onAction(item, "assign")}
            className="flex-1 bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs font-semibold py-2 rounded-xl border border-[#2A9D8F]/20 hover:bg-[#2A9D8F]/15 transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Assign Staff
          </button>
        </div>
      )}
      {item.state === "ASSIGNED" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#1C2D37]/5">
          <button
            onClick={() => onAction(item, "in-progress")}
            className="flex-1 bg-[#2A9D8F] text-white text-xs font-semibold py-2 rounded-xl hover:bg-[#248f82] transition-all flex items-center justify-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" /> Mark In Progress
          </button>
        </div>
      )}
      {item.state === "IN_PROGRESS" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#1C2D37]/5">
          <button
            onClick={() => onAction(item, "resolve")}
            className="flex-1 bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
          </button>
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function RequestsDashboard() {
  const [items, setItems] = useState<ServiceItem[]>(MOCK_ITEMS);
  const [filter, setFilter] = useState<"ALL" | ReqType>("ALL");
  const [stateFilter, setStateFilter] = useState<"ACTIVE" | "ALL">("ACTIVE");
  const [escalationAlert, setEscalationAlert] = useState<ServiceItem | null>(null);

  // Show escalation overlay for the first SLA-breached item on load
  useEffect(() => {
    const breached = items.find((i) => i.state === "AUTO_ESCALATED");
    if (breached) setEscalationAlert(breached);
  }, []);

  const handleAction = (item: ServiceItem, action: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;
        if (action === "acknowledge") return { ...i, state: "ACKNOWLEDGED" };
        if (action === "assign") return { ...i, state: "ASSIGNED", assignedTo: "Housekeeping Staff", etaMinutes: 10 };
        if (action === "in-progress") return { ...i, state: "IN_PROGRESS" };
        if (action === "resolve") return { ...i, state: "RESOLVED" };
        return i;
      })
    );
    if (action === "acknowledge" && escalationAlert?.id === item.id) {
      setEscalationAlert(null);
    }
  };

  const displayed = items.filter((i) => {
    const matchType = filter === "ALL" || i.type === filter;
    const matchState = stateFilter === "ALL" || !["RESOLVED"].includes(i.state);
    return matchType && matchState;
  });

  const newCount = items.filter((i) => ["NEW", "AUTO_ESCALATED"].includes(i.state)).length;
  const inProgressCount = items.filter((i) => ["ASSIGNED", "IN_PROGRESS"].includes(i.state)).length;

  return (
    <div className="min-h-screen bg-[#E5E7E6] font-sans text-[#1C2D37]">
      {escalationAlert && (
        <EscalationOverlay item={escalationAlert} onDismiss={() => {
          handleAction(escalationAlert, "acknowledge");
        }} />
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md shrink-0">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">Requests & Complaints</span>
            <p className="text-white/30 text-[10px]">Sunrise Varanasi Ghat · Live Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {newCount > 0 && (
            <div className="flex items-center gap-1.5 bg-[#E76F51]/20 border border-[#E76F51]/30 text-[#E76F51] text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              {newCount} need attention
            </div>
          )}
          <button className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New / Escalated", value: newCount, color: "text-[#E76F51]", bg: "bg-[#E76F51]/8 border-[#E76F51]/15" },
            { label: "In Progress", value: inProgressCount, color: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]/8 border-[#2A9D8F]/15" },
            { label: "Resolved Today", value: items.filter((i) => i.state === "RESOLVED").length, color: "text-[#1C2D37]/50", bg: "bg-[#1C2D37]/4 border-[#1C2D37]/8" },
            { label: "Total Requests", value: items.length, color: "text-[#1C2D37]", bg: "bg-white/60 border-[#1C2D37]/8" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#1C2D37]/40 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-1 bg-[#1C2D37]/6 p-1 rounded-xl">
            {(["ALL", "REQUEST", "COMPLAINT"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f ? "bg-white text-[#1C2D37] shadow-sm" : "text-[#1C2D37]/40 hover:text-[#1C2D37]"
                }`}
              >
                {f === "ALL" ? "All" : f === "REQUEST" ? "Requests" : "Complaints"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStateFilter(stateFilter === "ACTIVE" ? "ALL" : "ACTIVE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              stateFilter === "ACTIVE" ? "bg-[#1C2D37] text-white border-transparent" : "bg-white/60 text-[#1C2D37]/50 border-[#1C2D37]/8"
            }`}
          >
            <Filter className="w-3 h-3" />
            {stateFilter === "ACTIVE" ? "Active Only" : "Show All"}
          </button>
          <p className="ml-auto text-xs text-[#1C2D37]/40">{displayed.length} item{displayed.length !== 1 ? "s" : ""}</p>
        </div>

        {/* List */}
        <div className="space-y-4">
          {displayed.length === 0 ? (
            <div className="text-center py-20 text-[#1C2D37]/30">
              <CheckCheck className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="text-sm">All clear — no active requests</p>
            </div>
          ) : (
            displayed.map((item) => (
              <RequestCard key={item.id} item={item} onAction={handleAction} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
