import React from "react";
import { motion } from "framer-motion";
import { Laptop, Smartphone, Wifi, CheckCircle2 } from "lucide-react";

export default function ConnectSpace() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6 scroll-mt-20">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            05 / DEVICE CONTINUUM
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          ONE BRAIN. EVERY DEVICE.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[50ch] mx-auto font-normal leading-relaxed">
          The phone captures in real time; the laptop indexes and reasons. Two specialized pieces of
          hardware unified by one local memory layer.
        </p>
      </div>

      {/* LEVEL 1: LARGE SPATIAL COMPOSITION */}
      <div className="relative z-10 mx-auto max-w-[1100px] w-full min-h-[540px] h-auto md:h-[580px] rounded-3xl border border-[#334155]/40 bg-[#0A0F1C]/40 backdrop-blur-xl p-6 sm:p-10 flex items-center justify-center overflow-hidden">
        {/* SVG Streaming Vectors (Desktop / Tablet) */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Path from Laptop to Center */}
          <path
            d="M 320 180 C 480 180, 540 300, 680 300"
            fill="none"
            stroke="#334155"
            strokeWidth="1.4"
            strokeDasharray="4 6"
          />
          {/* Path from Phone to Center */}
          <path
            d="M 320 420 C 480 420, 540 300, 680 300"
            fill="none"
            stroke="#334155"
            strokeWidth="1.4"
            strokeDasharray="4 6"
          />

          {/* Animated data pulses */}
          <circle r="3" fill="#00D1FF">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 320 180 C 480 180, 540 300, 680 300"
            />
          </circle>
          <circle r="3" fill="#00D1FF">
            <animateMotion
              dur="2.6s"
              repeatCount="indefinite"
              path="M 320 420 C 480 420, 540 300, 680 300"
            />
          </circle>
        </svg>

        <div className="relative w-full h-full max-w-[960px] flex flex-col md:flex-row items-center justify-between gap-8 py-4">
          {/* LEFT COLUMN: DEVICES (LAPTOP & PHONE) */}
          <div className="flex flex-col gap-6 sm:gap-10 w-full md:w-[350px] z-10">
            {/* 1. LAPTOP (DEEP BRAIN) */}
            <div className="p-5 rounded-2xl border border-[#334155]/60 bg-[#0F1B2D]/70 backdrop-blur-md relative group hover:border-[#00D1FF]/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] text-[#00D1FF] tracking-wider uppercase">
                  PRIMARY COMPUTE
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#94A3B8]">
                  <Wifi size={11} className="text-[#00D1FF]" />
                  LOCAL P2P
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-black/40 border border-[#334155]/60 flex items-center justify-center text-white">
                  <Laptop size={18} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-semibold text-white tracking-wide">
                    DEEP BRAIN
                  </h3>
                  <p className="text-[10px] font-mono text-[#94A3B8]">LAPTOP STATION</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-[#94A3B8] leading-relaxed">
                Local SQLite indexing, full repository parsing, and heavy contextual reasoning.
              </p>
            </div>

            {/* 2. PHONE (POCKET BRAIN) */}
            <div className="p-5 rounded-2xl border border-[#334155]/60 bg-[#0F1B2D]/70 backdrop-blur-md relative group hover:border-[#00D1FF]/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] text-[#3882F6] tracking-wider uppercase">
                  ACTIVE SENSING
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                  SYNCHRONIZED
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-black/40 border border-[#334155]/60 flex items-center justify-center text-white">
                  <Smartphone size={18} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-semibold text-white tracking-wide">
                    POCKET BRAIN
                  </h3>
                  <p className="text-[10px] font-mono text-[#94A3B8]">MOBILE TERMINAL</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-[#94A3B8] leading-relaxed">
                Zero-latency acoustic capture, mobile camera snapshots, and instant speech recognition.
              </p>
            </div>
          </div>

          {/* RIGHT / CENTER COLUMN: NEOBRAIN ONE MEMORY LAYER */}
          <div className="w-full md:w-[400px] z-10">
            <div className="p-6 sm:p-8 rounded-3xl border border-[#00D1FF]/40 bg-[#0F1B2D]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,209,255,0.15)] relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                <span className="font-mono text-[10px] text-[#00D1FF] tracking-[0.2em] uppercase">
                  UNIFIED MEMORY PROTOCOL
                </span>
              </div>

              <h3 className="font-display text-[22px] font-semibold text-white tracking-tight">
                ONE MEMORY LAYER
              </h3>

              <p className="mt-3 text-[13px] text-[#94A3B8] leading-relaxed">
                Data captured on your phone is instantly indexed by your laptop when both are on the
                same local network. No external server relay. No third-party data broker.
              </p>

              <div className="mt-6 pt-5 border-t border-[#334155]/50 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">TRANSPORT</span>
                  <span className="text-white">LOCAL WI-FI / BLE</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">CLOUD UPLOAD</span>
                  <span className="text-[#00D1FF]">OFF (0 KB TRANSMITTED)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">PAIRING STATE</span>
                  <span className="text-[#E2E8F0]">CRYPTOGRAPHICALLY VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
