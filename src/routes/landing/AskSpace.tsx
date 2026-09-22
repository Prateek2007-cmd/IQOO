import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, CheckCircle2, ChevronRight, Layers, Sparkles } from "lucide-react";

export default function AskSpace() {
  const [activeEvidence, setActiveEvidence] = useState(0);

  const evidenceItems = [
    {
      title: "SmartLine design notes",
      snippet: "Slide 4: High-speed vibration telemetry & optical edge architecture.",
      type: "Markdown / Keynote",
      date: "Dec 14",
    },
    {
      title: "MSME Hackathon draft",
      snippet: "Pitch deck submission draft · Appendix C: Sensor placement diagram.",
      type: "Presentation PDF",
      date: "Nov 28",
    },
    {
      title: "Bearing vibration analysis",
      snippet: "FFT frequency spectrum chart embedded in final prototype summary.",
      type: "Dataset & Report",
      date: "Nov 15",
    },
  ];

  const relatedMemories = [
    { title: "ESP32 SPI pinout revision", tag: "Hardware", time: "2 weeks ago" },
    { title: "Bearing resonance testing log", tag: "Analysis", time: "3 weeks ago" },
    { title: "Pitch dry-run with mentor", tag: "Audio Transcript", time: "1 month ago" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            04 / COGNITIVE RETRIEVAL
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          ANSWERS WITH THEIR RECEIPTS.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[50ch] mx-auto font-normal leading-relaxed">
          Not vague hallucinations. NeoBrain cites the exact local files, notes, and discussions
          that contributed to the answer.
        </p>
      </div>

      {/* LEVEL 2: LAYERED FLOATING INTELLIGENCE HUD (NOT a generic chatbot) */}
      <div className="relative z-10 mx-auto max-w-[1100px] w-full">
        <div className="rounded-3xl border border-[#334155]/60 bg-[#0F1B2D]/60 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Subtle cyan ambient corner glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#00D1FF]/10 blur-3xl" />

          {/* QUERY PROMPT BAR */}
          <div className="flex items-center gap-4 pb-8 border-b border-[#334155]/40">
            <span className="w-10 h-10 rounded-2xl border border-[#00D1FF]/40 bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF] shrink-0">
              <Search size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase block mb-1">
                RETRIEVAL QUERY
              </span>
              <p className="font-display text-[20px] sm:text-[26px] md:text-[30px] font-medium text-white tracking-tight">
                "Where did I see that presentation?"
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/50 bg-black/30 text-[11px] font-mono text-[#94A3B8]">
              <span>LOCAL INDEX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
            </div>
          </div>

          {/* ANSWER BANNER */}
          <div className="py-7 flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-[#00D1FF]/20 border border-[#00D1FF]/50 flex items-center justify-center text-[#00D1FF] shrink-0 mt-1">
              <Sparkles size={12} />
            </span>
            <div>
              <span className="font-mono text-[10px] text-[#00D1FF] tracking-wider uppercase block mb-1">
                SYNTHESIZED INSIGHT
              </span>
              <p className="font-display text-[18px] sm:text-[22px] font-semibold text-[#E2E8F0] tracking-wide">
                I found it in your SmartLine project.
              </p>
              <p className="mt-1.5 text-[13px] text-[#94A3B8] leading-relaxed max-w-[65ch]">
                Referenced in the pitch deck drafts and bearing vibration telemetry deck prepared for
                the MSME submission.
              </p>
            </div>
          </div>

          {/* THREE METADATA BLOCKS: SOURCE / EVIDENCE / RELATED */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-[#334155]/40">
            {/* 1. SOURCE BLOCK */}
            <div className="p-5 rounded-2xl border border-[#334155]/40 bg-[#0A0F1C]/50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-wider text-[#94A3B8] uppercase">
                  PRIMARY SOURCE
                </span>
                <span className="text-[10px] font-mono text-[#00D1FF]">CONFIRMED</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#00D1FF]/30 bg-[#00D1FF]/5">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#00D1FF]" />
                  <span className="text-[13.5px] font-semibold text-white">
                    SmartLine / Presentation
                  </span>
                </div>
                <p className="mt-2 text-[11.5px] text-[#94A3B8] leading-relaxed">
                  Keynote master deck stored in local project vault. Last modified 3 days ago.
                </p>
              </div>
            </div>

            {/* 2. EVIDENCE CITATIONS */}
            <div className="p-5 rounded-2xl border border-[#334155]/40 bg-[#0A0F1C]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-wider text-[#94A3B8] uppercase">
                  EVIDENCE CITATIONS ({evidenceItems.length})
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]/60">INSPECT</span>
              </div>
              <div className="space-y-2">
                {evidenceItems.map((item, idx) => (
                  <div
                    key={item.title}
                    onClick={() => setActiveEvidence(idx)}
                    className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      activeEvidence === idx
                        ? "border-[#00D1FF]/50 bg-[#0F1B2D] text-white"
                        : "border-[#334155]/30 bg-black/20 text-[#94A3B8] hover:border-[#334155]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium truncate">{item.title}</span>
                      <span className="text-[9.5px] font-mono text-[#94A3B8]/70 shrink-0">{item.date}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#94A3B8] truncate">{item.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. RELATED MEMORIES */}
            <div className="p-5 rounded-2xl border border-[#334155]/40 bg-[#0A0F1C]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-wider text-[#94A3B8] uppercase">
                  LINKED MEMORIES
                </span>
                <Layers size={13} className="text-[#94A3B8]" />
              </div>
              <div className="space-y-2">
                {relatedMemories.map((mem) => (
                  <div
                    key={mem.title}
                    className="p-2.5 rounded-xl border border-[#334155]/30 bg-black/20 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="text-[12px] text-[#E2E8F0] block truncate">{mem.title}</span>
                      <span className="text-[9.5px] font-mono text-[#94A3B8]/70">{mem.tag}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#94A3B8]/50 shrink-0">{mem.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
