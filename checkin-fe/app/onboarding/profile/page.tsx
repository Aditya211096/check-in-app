"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar, MapPin, Phone, ArrowRight, Ship } from "lucide-react";

export default function ProfileOnboarding() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [emergency, setEmergency] = useState("");
  const [consentShare, setConsentShare] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    setLoading(true);
    // Simulate backend registration save
    setTimeout(() => {
      setLoading(false);
      router.push("/onboarding/kyc");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#E76F51] selection:text-white">
      {/* Decorative Traditional Kashi Sunrise Elements */}
      <div className="absolute top-12 flex flex-col items-center select-none pointer-events-none opacity-90">
        <div className="w-16 h-16 bg-gradient-to-t from-[#E76F51] to-[#F4A261] rounded-full shadow-lg shadow-[#E76F51]/20 animate-pulse" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#1C2D37]/60 mt-3">Traces Kashi Portal</span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-20 relative z-10">
        {/* Left Side: Editorial Introduction Card */}
        <div className="md:col-span-5 flex flex-col justify-center text-center md:text-left pr-4">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <Ship className="text-[#2A9D8F] w-8 h-8 animate-bounce" />
            <span className="h-[2px] w-12 bg-[#2A9D8F]/30" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-serif text-[#1C2D37] mb-4">
            Welcome to <span className="text-[#E76F51]">Varanasi</span>
          </h1>
          <p className="text-sm md:text-base text-[#1C2D37]/70 leading-relaxed mb-6">
            Begin your seamless multi-tenant check-in process. Create your global guest profile to securely vault your identity proofs and speed up room allocations across all Sunrise properties.
          </p>
          <div className="hidden md:flex flex-col gap-3 border-t border-[#1C2D37]/10 pt-6">
            <div className="flex items-center gap-3 text-xs text-[#1C2D37]/60">
              <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" />
              Postgres RLS Multi-Tenant Security Enforced
            </div>
            <div className="flex items-center gap-3 text-xs text-[#1C2D37]/60">
              <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
              Document AI Automated KYC OCR Scanning
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="md:col-span-7 bg-[#F7F5F0] border border-white/40 shadow-xl rounded-[28px] p-8 glassmorphism relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Subtle Water Wave Vector Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#2A9D8F]/20 via-[#F4A261]/10 to-[#E76F51]/20 wave-bg opacity-30" />

          <h2 className="text-xl font-medium tracking-tight mb-6">Create Guest Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#1C2D37]/75">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-[#1C2D37]/40" />
                <input
                  type="text"
                  required
                  placeholder="Enter your name matching your ID"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-[#1C2D37]/10 rounded-xl focus:outline-none focus:border-[#E76F51] focus:ring-1 focus:ring-[#E76F51] transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#1C2D37]/75">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-[#1C2D37]/40" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/60 border border-[#1C2D37]/10 rounded-xl focus:outline-none focus:border-[#E76F51] focus:ring-1 focus:ring-[#E76F51] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#1C2D37]/75">Emergency Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#1C2D37]/40" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/60 border border-[#1C2D37]/10 rounded-xl focus:outline-none focus:border-[#E76F51] focus:ring-1 focus:ring-[#E76F51] transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#1C2D37]/75">Permanent Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[#1C2D37]/40" />
                <input
                  type="text"
                  placeholder="Address city, state, postal code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-[#1C2D37]/10 rounded-xl focus:outline-none focus:border-[#E76F51] focus:ring-1 focus:ring-[#E76F51] transition-all text-sm"
                />
              </div>
            </div>

            {/* Privacy Sharing Consent */}
            <div className="flex items-center gap-3 bg-[#E5E7E6]/40 p-4 rounded-xl border border-[#1C2D37]/5 mt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consentShare}
                onChange={(e) => setConsentShare(e.target.checked)}
                className="w-4 h-4 rounded text-[#E76F51] border-[#1C2D37]/20 focus:ring-[#E76F51]"
              />
              <label htmlFor="consent" className="text-xs text-[#1C2D37]/70 leading-relaxed cursor-pointer select-none">
                I consent to securely share my verified ID proofs with partner Sunrise properties during active check-in dispatches.
              </label>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E76F51] text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#d85c3e] transition-all active:scale-[0.98] shadow-lg shadow-[#E76F51]/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continue to KYC Verification
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
