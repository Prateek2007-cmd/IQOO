import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCode2, FileText, FolderKanban, MessageSquare, Lightbulb, GitFork } from "lucide-react";

interface DataFragment {
  id: string;
  label: string;
  category: string;
  example: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  dx: number; // desktop x %
  dy: number; // desktop y %
  mx: number; // mobile x %
  my: number; // mobile y %
}

const FRAGMENTS: DataFragment[] = [
  { id: "files", label: "FILES", category: "Artifacts", example: "bearing_analysis.csv · CAD_rev4.step", icon: FileCode2, dx: 20, dy: 22, mx: 27, my: 18 },
  { id: "notes", label: "NOTES", category: "Scratchpad", example: "MSME sprint goals · Sensor calibration", icon: FileText, dx: 80, dy: 22, mx: 73, my: 18 },
  { id: "projects", label: "PROJECTS", category: "Initiatives", example: "SmartLine · NeoBrain Mobile", icon: FolderKanban, dx: 18, dy: 68, mx: 27, my: 74 },
  { id: "conversations", label: "CONVERSATIONS", category: "Audio/Chat", example: "Discord architecture thread · Standup audio", icon: MessageSquare, dx: 82, dy: 68, mx: 73, my: 74 },
  { id: "ideas", label: "IDEAS", category: "Syntheses", example: "Zero-latency vector indexing hypothesis", icon: Lightbulb, dx: 34, dy: 88, mx: 32, my: 90 },
  { id: "decisions", label: "DECISIONS", category: "Verifications", example: "Adopt SQLite VSS · Pinout revision verified", icon: GitFork, dx: 66, dy: 88, mx: 68, my: 90 },
];

export default function ProblemSpace() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6 scroll-mt-20">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            01 / CONVERGENCE
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          YOUR LIFE IS EVERYWHERE.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#94A3B8] to-[#E2E8F0]">
            YOUR MEMORY SHOULDN'T BE.
          </span>
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[52ch] mx-auto font-normal leading-relaxed">
          Knowledge is scattered across apps, browser tabs, and recordings. NeoBrain draws every
          stream into one unified, searchable memory layer.
        </p>
      </div>

      {/* LEVEL 1: OPEN SPACE CINEMATIC VISUALIZATION */}
      <div className="relative z-10 mx-auto max-w-[1100px] w-full h-[520px] sm:h-[580px] rounded-3xl border border-[#334155]/40 bg-[#0A0F1C]/40 backdrop-blur-xl overflow-hidden flex items-center justify-center">
        {/* Subtle coordinate markers */}
        <span className="absolute top-4 left-5 font-mono text-[9px] text-[#94A3B8]/40 tracking-widest hidden sm:inline">
          LOC // 44.02°N 121.5°W
        </span>
        <span className="absolute top-4 right-5 font-mono text-[9px] text-[#94A3B8]/40 tracking-widest hidden sm:inline">
          FIELD // CONVERGENT STREAM
        </span>
        <span className="absolute bottom-4 left-5 font-mono text-[9px] text-[#94A3B8]/40 tracking-widest hidden sm:inline">
          PROTOCOL // LOCAL-FIRST SYNC
        </span>

        {/* SVG Vector Connection Beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Concentric orbital rings around center */}
          <circle cx="50%" cy="50%" r="85" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
          <circle cx="50%" cy="50%" r="170" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 8" opacity="0.25" />
          <circle cx="50%" cy="50%" r="260" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="1 12" opacity="0.15" />

          {/* Beams connecting each fragment to center */}
          {FRAGMENTS.map((frag) => {
            const posX = isMobile ? frag.mx : frag.dx;
            const posY = isMobile ? frag.my : frag.dy;
            const isHovered = activeId === frag.id;

            return (
              <g key={`line-${frag.id}`}>
                <line
                  x1={`${posX}%`}
                  y1={`${posY}%`}
                  x2="50%"
                  y2="50%"
                  stroke={isHovered ? "#00D1FF" : "#334155"}
                  strokeWidth={isHovered ? 1.8 : 1}
                  strokeDasharray={isHovered ? "none" : "4 6"}
                  opacity={isHovered ? 0.9 : 0.4}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* CENTRAL POINT: NEOBRAIN MEMORY */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-[#00D1FF]/40 bg-[#0F1B2D]/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(0,209,255,0.22)]">
            <div className="absolute inset-2 rounded-full border border-[#00D1FF]/20 animate-pulse" />
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#3882F6] opacity-80 blur-sm animate-breathe" />
            <div className="relative z-10 text-center px-2">
              <span className="block text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-white">NEOBRAIN</span>
              <span className="block text-[7.5px] sm:text-[8px] font-mono tracking-[0.2em] text-[#00D1FF] uppercase">MEMORY</span>
            </div>
          </div>
        </div>

        {/* FLOATING SPATIAL FRAGMENTS */}
        {FRAGMENTS.map((frag) => {
          const Icon = frag.icon;
          const isHovered = activeId === frag.id;
          const posX = isMobile ? frag.mx : frag.dx;
          const posY = isMobile ? frag.my : frag.dy;

          return (
            <motion.div
              key={frag.id}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute z-20 cursor-pointer"
              onMouseEnter={() => setActiveId(frag.id)}
              onMouseLeave={() => setActiveId(null)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`relative flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border transition-all duration-300 ${
                  isHovered
                    ? "border-[#00D1FF]/70 bg-[#1E2A3F]/90 shadow-[0_0_24px_rgba(0,209,255,0.25)]"
                    : "border-[#334155]/60 bg-[#0F1B2D]/70 hover:border-[#3882F6]/50"
                } backdrop-blur-md`}
              >
                <span className={`p-0.5 sm:p-1 rounded-lg ${isHovered ? "text-[#00D1FF]" : "text-[#94A3B8]"}`}>
                  <Icon size={14} />
                </span>
                <div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[10px] sm:text-[11.5px] font-mono font-medium tracking-wider text-[#E2E8F0]">
                      {frag.label}
                    </span>
                    <span className="hidden sm:inline text-[9px] font-mono text-[#94A3B8]/60">·</span>
                    <span className="hidden sm:inline text-[9.5px] font-mono text-[#94A3B8]">{frag.category}</span>
                  </div>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-0.5 text-[9px] sm:text-[10px] text-[#00D1FF] font-mono truncate max-w-[150px] sm:max-w-[180px]"
                    >
                      {frag.example}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
