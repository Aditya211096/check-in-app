"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ship, Phone, Key, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export default function PhoneAuth() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456" && otp.length !== 6) {
      setError("Invalid verification code. Enter '123456' to bypass.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate successful authentication
    setTimeout(() => {
      setLoading(false);
      // Forward guest to Profile creation onboarding page
      router.push("/onboarding/profile");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1C2D37] via-[#223847] to-[#14222B] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background motifs */}
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-[#E76F51]/5 blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-[#2A9D8F]/5 blur-[80px]" />

      <div className="w-full max-w-md bg-[#F7F5F0] text-[#1C2D37] rounded-[28px] border border-white/60 shadow-2xl p-8 relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E76F51]/20 mx-auto mb-3">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif font-bold text-2xl">Welcome to Traces</h1>
          <p className="text-xs text-[#1C2D37]/50 mt-1">One-time registration for all Kashi stays</p>
        </div>

        {error && (
          <div className="mb-5 flex gap-2.5 items-start bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#1C2D37]/35" />
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all font-semibold tracking-wide"
                />
              </div>
              <p className="text-[10px] text-[#1C2D37]/45 mt-1.5">We will send a 6-digit verification code</p>
            </div>

            <button
              type="submit"
              disabled={phone.length < 10 || loading}
              className="w-full bg-[#E76F51] hover:bg-[#d85c3e] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#E76F51]/15"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Get OTP <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1C2D37]/40">Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs text-[#E76F51] font-semibold hover:underline"
                >
                  Edit number
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-3.5 w-4 h-4 text-[#1C2D37]/35" />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-[#1C2D37]/10 rounded-xl text-sm focus:outline-none focus:border-[#E76F51]/50 focus:ring-1 focus:ring-[#E76F51]/20 transition-all font-mono font-bold tracking-[0.2em] text-center"
                />
              </div>
              <p className="text-[10px] text-[#2A9D8F] font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Demo mode: enter <strong>123456</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.length < 6 || loading}
              className="w-full bg-[#2A9D8F] hover:bg-[#248f82] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#2A9D8F]/15"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
