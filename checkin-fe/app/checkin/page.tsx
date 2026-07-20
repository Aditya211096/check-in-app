"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Ship, ShieldCheck, CheckCircle2, Upload, FileText, ArrowRight, Download, Lock } from "lucide-react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

function TokenPreCheckinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "tok_ayushi_99";
  const { flags } = useFeatureFlags();

  const [step, setStep] = useState<"otp" | "form" | "id" | "done">("otp");
  const [phone, setPhone] = useState("+91 9660397475");
  const [otp, setOtp] = useState("1234");
  const [guestName, setGuestName] = useState("Ayushi Aggarwal");
  const [eta, setEta] = useState("14:30");
  const [idType, setIdType] = useState("Aadhaar");
  const [fileName, setFileName] = useState("");
  const [isDigiLockerUsed, setIsDigiLockerUsed] = useState(false);

  const generateStandardizedFilename = () => {
    const cleanRoomOrBed = "Dorm2_BedB";
    const cleanName = guestName.replace(/\s+/g, "");
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "").substring(0, 14);
    const ext = isDigiLockerUsed ? "pdf" : "jpg";
    return `${cleanRoomOrBed}_${cleanName}_${idType}_${timestamp}.${ext}`;
  };

  const handleDownloadStandardizedID = () => {
    const name = generateStandardizedFilename();
    const blob = new Blob(["Simulated Encrypted ID Proof Data for Legal Compliance"], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div className="w-full max-w-lg bg-[#F7F5F0] rounded-[28px] border border-white/50 p-8 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-[#1C2D37]/5 pb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-xl flex items-center justify-center shadow-md">
          <Ship className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base font-serif text-[#1C2D37]">Pre-Check-In Onboarding</h1>
          <p className="text-xs text-[#1C2D37]/45">Token: <code className="font-mono text-[#E76F51]">{token}</code></p>
        </div>
      </div>

      {step === "otp" && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-[#1C2D37]">Authenticate Mobile Number</h2>
          <p className="text-xs text-[#1C2D37]/50">Enter the OTP sent to your WhatsApp number ({phone})</p>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-center text-lg font-mono tracking-widest text-[#1C2D37]"
          />

          <button
            onClick={() => setStep("form")}
            className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all"
          >
            Verify OTP & Continue
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-[#1C2D37]">Guest Details & Preferences</h2>
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Full Name (as on ID)</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37] font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40 mb-1">Expected Arrival Time (ETA)</label>
            <input
              type="time"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-xs text-[#1C2D37]"
            />
          </div>

          <button
            onClick={() => setStep("id")}
            className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all"
          >
            Proceed to ID Verification
          </button>
        </div>
      )}

      {step === "id" && (
        <div className="space-y-5">
          <h2 className="font-bold text-lg text-[#1C2D37]">Government ID Upload</h2>

          {flags.FEATURE_DIGILOCKER_VERIFICATION && (
            <div className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#2A9D8F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> DigiLocker Verified OAuth 2.0 Integration
              </span>
              <p className="text-[11px] text-[#1C2D37]/60 leading-relaxed">
                Fetch government-verified document directly via DigiLocker API Setu.
              </p>
              <button
                onClick={() => {
                  setIsDigiLockerUsed(true);
                  setFileName("DigiLocker_Verified_Aadhaar.pdf");
                  setStep("done");
                }}
                className="w-full bg-[#2A9D8F] hover:bg-[#248f82] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
              >
                Verify via DigiLocker API
              </button>
            </div>
          )}

          <div className="border-t border-[#1C2D37]/10 pt-3 space-y-3">
            <label className="block text-[10px] uppercase font-bold text-[#1C2D37]/40">OR Direct Compressed File Upload</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFileName(e.target.files[0].name);
                  setIsDigiLockerUsed(false);
                  setStep("done");
                }
              }}
              className="w-full text-xs text-[#1C2D37]"
            />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center space-y-5 py-3">
          <div className="w-16 h-16 bg-[#2A9D8F]/20 text-[#2A9D8F] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-serif text-[#1C2D37]">Pre-Check-In Submitted!</h2>
          <p className="text-xs text-[#1C2D37]/60 max-w-sm mx-auto">
            The Property Manager has been notified to allocate your room/bed.
          </p>

          <div className="bg-white/80 rounded-2xl p-4 border border-[#1C2D37]/10 text-left space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#1C2D37]/40">Automated Standardized File Renaming</span>
            <p className="text-xs font-mono font-bold text-[#E76F51] truncate">
              {generateStandardizedFilename()}
            </p>
            <button
              onClick={handleDownloadStandardizedID}
              className="w-full bg-[#1C2D37] text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Download Standardized ID File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TokenPreCheckinPage() {
  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-[#1C2D37] text-xs font-semibold">Loading Pre-Check-In Portal...</div>}>
        <TokenPreCheckinContent />
      </Suspense>
    </div>
  );
}
