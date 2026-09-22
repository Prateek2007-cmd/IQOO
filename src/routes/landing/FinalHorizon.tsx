import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NeoBrainCore from "../../components/NeoBrainCore";

export default function FinalHorizon() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { margin: "300px" });

  return (
    <section
      ref={containerRef}
      id="final-cta"
      className="relative min-h-[920px] h-screen w-full flex flex-col justify-start items-center pt-16 sm:pt-20 px-6 overflow-hidden bg-[#020407]"
    >
      {/* 1. CELESTIAL HORIZON ARC & RADIANT FLARE (Matching Panel 06 of Design System) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end overflow-hidden h-[420px] z-0">
        {/* Central radiant flare */}
        <div className="w-[320px] sm:w-[540px] h-[140px] rounded-full bg-[#00D1FF]/22 blur-[65px] translate-y-16" />
        <div className="w-[140px] h-[70px] rounded-full bg-white/35 blur-[28px] translate-y-10" />

        {/* Curved planetary horizon arc */}
        <div
          className="w-[150vw] sm:w-[130vw] h-[640px] rounded-[100%] border-t border-[#00D1FF]/60 -translate-y-[-240px] shadow-[0_-12px_60px_rgba(0,209,255,0.4)]"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(0, 209, 255, 0.12) 0%, rgba(56, 130, 246, 0.04) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* 2. TYPOGRAPHY & CALL TO ACTION (Positioned ABOVE the Core, mirroring Hero) */}
      <div className="relative z-20 mx-auto max-w-[1240px] w-full text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            08 / SYSTEM INITIALIZED
          </span>
        </div>

        <h2 className="font-display text-[36px] sm:text-[52px] md:text-[64px] font-bold tracking-tight text-white leading-none">
          YOUR SECOND BRAIN
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#38bdf8] to-cyan-300 drop-shadow-[0_0_36px_rgba(0,209,255,0.5)]">
            IS READY.
          </span>
        </h2>

        <p className="mt-3 text-[13px] sm:text-[14.5px] text-[#94A3B8] max-w-[46ch] mx-auto font-normal leading-relaxed">
          Private. Local. Contextual. An intelligent memory layer that turns your everyday work into
          durable knowledge.
        </p>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
            className="group relative inline-flex items-center gap-2 rounded-full border border-[#00D1FF] bg-[#00D1FF] px-6 sm:px-7 py-2.5 sm:py-3 text-[13px] sm:text-[13.5px] font-semibold tracking-wide text-[#020407] shadow-[0_0_30px_rgba(0,209,255,0.4)] transition-all duration-300 hover:bg-[#38bdf8] hover:shadow-[0_0_45px_rgba(0,209,255,0.6)] active:scale-95"
          >
            <span>ENTER NEOBRAIN</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>

          <button
            onClick={() => navigate("/auth?returnTo=%2Fapp%2Fvoice")}
            className="group inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0A0F1C]/70 px-5 sm:px-6 py-2.5 sm:py-3 text-[12.5px] sm:text-[13px] font-medium tracking-wide text-[#E2E8F0] backdrop-blur-md transition-all duration-300 hover:border-[#00D1FF]/50 hover:bg-[#0F1B2D] active:scale-95"
          >
            <span>TRY VOICE PROTOTYPE</span>
          </button>
        </div>
      </div>

      {/* 3. RETURN OF THE NEOBRAIN CORE (Floating suspended above the radiant horizon) */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center mt-2 pointer-events-none">
        <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center pointer-events-none">
          {/* Subtle cyan backlight behind Core */}
          <div className="absolute inset-8 rounded-full bg-[#00D1FF]/12 blur-[55px] animate-pulse" />

          {isInView && (
            <div className="w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing">
              <NeoBrainCore
                state="idle"
                quality="balanced"
                style={{
                  background: "transparent",
                  borderRadius: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
