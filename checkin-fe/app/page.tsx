"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Ship, ArrowRight, ShieldCheck, MapPin, Star, Compass } from "lucide-react";

export default function Splash() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1C2D37] via-[#223847] to-[#14222B] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Motifs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#E76F51]/5 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#2A9D8F]/5 blur-[60px]" />
      
      {/* Wave Decorative Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header/Branding */}
      <header className="px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E76F51]/20">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Traces</span>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#F4A261] font-bold">Kashi Stays</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/60">
          <MapPin className="w-3.5 h-3.5 text-[#E76F51]" />
          <span>Varanasi, IN</span>
        </div>
      </header>

      {/* Hero Content Section */}
      <section className="flex-1 flex flex-col justify-center px-6 md:px-16 max-w-2xl relative z-10 py-12">
        {/* Rating tag */}
        <div className="inline-flex items-center gap-2 bg-[#F4A261]/10 border border-[#F4A261]/20 text-[#F4A261] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 w-fit">
          <Star className="w-3.5 h-3.5 fill-[#F4A261]" />
          <span>Award Winning Heritage Living</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-[1.1] mb-6">
          Rest stops, <br />
          <span className="bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#F4A261] bg-clip-text text-transparent">made simple.</span>
        </h1>
        
        <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
          Experience seamless arrivals on the sacred banks of Ganga. Book beds or premium private rooms across trusted boutique hostels with a unified single profile and digital KYC checkout.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/auth/phone")}
            className="group bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-[#E76F51]/20 active:scale-95 text-sm"
          >
            Continue with Phone
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => router.push("/explore")}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
          >
            <Compass className="w-4 h-4 text-[#2A9D8F]" />
            Browse Availability
          </button>
        </div>
      </section>

      {/* Footer Info / Trust Badges */}
      <footer className="px-6 py-8 border-t border-white/5 bg-black/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">© 2026 Traces Inc. Designed for Kashi Heritage Properties.</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <ShieldCheck className="w-4 h-4 text-[#2A9D8F]" />
            <span>Encrypted Vault KYC</span>
          </div>
          <span className="text-white/10">|</span>
          <span className="text-xs text-white/40">v1.2.0</span>
        </div>
      </footer>
    </main>
  );
}
