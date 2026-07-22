"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface WaveProgressProps {
  progressValue: number; // Percentage scale 0 - 100
}

export const WaveProgress: React.FC<WaveProgressProps> = ({ progressValue }) => {
  return (
    <div className="relative w-full h-24 overflow-hidden rounded-xl border border-[#0D9488]/20 bg-white/40 backdrop-blur-md shadow-inner">
      {/* Sunrise Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F2FE] via-[#FEF08A]/30 to-[#FDBA74]/15" />

      {/* Ganges River wave animations */}
      <svg className="absolute bottom-0 w-full h-12 fill-[#0D9488]/20 animate-pulse" viewBox="0 0 1440 74" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z" />
      </svg>
      <svg className="absolute bottom-0 w-full h-10 fill-[#0D9488]/40" viewBox="0 0 1440 74" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,16L120,21.3C240,27,480,37,720,37.3C960,37,1200,27,1320,21.3L1440,16L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z" />
      </svg>

      {/* Minimalist Wooden Boat Indicator */}
      <motion.div
        className="absolute bottom-6 left-0 z-10 w-10 h-6"
        animate={{
          left: `${Math.min(progressValue, 92)}%`,
          y: [0, -4, 0],
          rotate: [-1, 2, -1]
        }}
        transition={{
          left: { type: "tween", ease: "easeInOut", duration: 0.8 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <path d="M10 30 C 30 30, 40 45, 90 25 L 80 45 C 50 50, 30 50, 20 45 Z" fill="#78350F" />
          <line x1="50" y1="10" x2="50" y2="35" stroke="#451A03" strokeWidth="3" />
          <polygon points="50,10 75,18 50,26" fill="#F97316" />
        </svg>
      </motion.div>

      {/* Progress Information Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-sans z-20">
        <span className="text-xs font-semibold text-slate-700 tracking-wider">PRE-CHECKIN PROGRESS</span>
        <span className="text-xl font-bold text-[#0D9488]">{Math.round(progressValue)}%</span>
      </div>
    </div>
  );
};
