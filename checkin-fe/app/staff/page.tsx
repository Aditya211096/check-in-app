"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench, Bell, Volume2, Play, CheckCircle2, AlertTriangle,
  User, BedDouble, Utensils, ShieldCheck, CheckCheck, RefreshCw
} from "lucide-react";
import { formatMinutesAgo } from "@/lib/date-utils";

type SubRole = "HOUSEKEEPING" | "MAINTENANCE" | "COOK" | "RECEPTION";

interface StaffTask {
  id: string;
  category: string;
  roomCode: string;
  guestName: string;
  priority: "HIGH" | "NORMAL";
  state: "NEW" | "IN_PROGRESS" | "RESOLVED";
  voiceNoteUri?: string;
  createdAt: string;
  notes?: string;
}

const MOCK_TASKS: StaffTask[] = [
  { id: "t1", category: "Hot Water Shower Plumbing", roomCode: "102", guestName: "Mei L.", priority: "HIGH", state: "NEW", voiceNoteUri: "demo-voice-note.mp3", createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: "t2", category: "Extra Pillows & Towels", roomCode: "DORM-A", guestName: "Priya Patel", priority: "NORMAL", state: "IN_PROGRESS", createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { id: "t3", category: "AC Remote Control Repair", roomCode: "201", guestName: "Ananya S.", priority: "HIGH", state: "NEW", createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
];

export default function GroundStaffDashboard() {
  const router = useRouter();
  const [subRole, setSubRole] = useState<SubRole>("MAINTENANCE");
  const [tasks, setTasks] = useState<StaffTask[]>(MOCK_TASKS);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [resolutionRemark, setResolutionRemark] = useState<{ [taskId: string]: string }>({});

  const handleAccept = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, state: "IN_PROGRESS" } : t))
    );
  };

  const handleResolve = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, state: "RESOLVED" } : t))
    );
  };

  const playVoiceNote = (taskId: string) => {
    setIsPlayingAudio(taskId);
    setTimeout(() => setIsPlayingAudio(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#141E24] text-white font-sans flex flex-col">
      {/* Top Mobile Bar */}
      <header className="bg-[#1C2D37] border-b border-white/10 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E76F51] rounded-xl flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">Ground Staff Portal</h1>
            <p className="text-white/40 text-[10px]">Action Queue & SLA Task Closure</p>
          </div>
        </div>

        {/* Sub-Role Selector */}
        <select
          value={subRole}
          onChange={(e) => {
            const role = e.target.value as SubRole;
            setSubRole(role);
            if (role === "COOK") router.push("/staff/kitchen");
          }}
          className="bg-white/10 text-xs font-bold text-[#F4A261] border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none"
        >
          <option value="MAINTENANCE" className="bg-[#1C2D37]">Maintenance / Plumbing</option>
          <option value="HOUSEKEEPING" className="bg-[#1C2D37]">Housekeeping</option>
          <option value="COOK" className="bg-[#1C2D37]">Kitchen / Cook (KDS)</option>
          <option value="RECEPTION" className="bg-[#1C2D37]">Front Desk / Reception</option>
        </select>
      </header>

      {/* Action Queue List */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-[#2A9D8F]" /> Active Tasks ({tasks.filter((t) => t.state !== "RESOLVED").length})
          </span>
          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
            Loud Alert Active
          </span>
        </div>

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xl ${
              task.state === "NEW"
                ? "bg-[#1C2D37] border-red-500/50 shadow-red-500/10 animate-pulse"
                : task.state === "IN_PROGRESS"
                ? "bg-[#1C2D37] border-[#2A9D8F]/40"
                : "bg-white/5 border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-white">{task.category}</span>
                  {task.priority === "HIGH" && (
                    <span className="text-[9px] font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">
                  Room <strong className="text-white">{task.roomCode}</strong> · Guest: {task.guestName} · {formatMinutesAgo(task.createdAt)}
                </p>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                task.state === "NEW"
                  ? "bg-red-500/20 text-red-400"
                  : task.state === "IN_PROGRESS"
                  ? "bg-[#2A9D8F]/20 text-[#2A9D8F]"
                  : "bg-white/10 text-white/40"
              }`}>
                {task.state}
              </span>
            </div>

            {/* Voice Note Player Card */}
            {task.voiceNoteUri && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#F4A261] font-semibold">
                  <Volume2 className="w-4 h-4" /> Manager Audio Instruction
                </div>
                <button
                  onClick={() => playVoiceNote(task.id)}
                  className="bg-[#E76F51] hover:bg-[#d85c3e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3" /> {isPlayingAudio === task.id ? "Playing Audio..." : "Listen Voice Note"}
                </button>
              </div>
            )}

            {/* Task Action Toggles */}
            {task.state === "NEW" && (
              <button
                onClick={() => handleAccept(task.id)}
                className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> ACCEPT COMPLAINT & START
              </button>
            )}

            {task.state === "IN_PROGRESS" && (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Enter resolution remarks (e.g. Replaced shower valve)..."
                  value={resolutionRemark[task.id] ?? ""}
                  onChange={(e) => setResolutionRemark({ ...resolutionRemark, [task.id]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#2A9D8F]"
                />
                <button
                  onClick={() => handleResolve(task.id)}
                  className="w-full bg-[#2A9D8F] hover:bg-[#248f82] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" /> MARK TASK RESOLVED (Log SLA)
                </button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
