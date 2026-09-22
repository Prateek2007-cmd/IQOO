import React, { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Clock, Bookmark, ShieldCheck, Network } from "lucide-react";

interface PipelineTier {
  id: string;
  step: string;
  name: string;
  badge: string;
  badgeTone: "muted" | "blue" | "cyan" | "warm";
  desc: string;
  example: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TIERS: PipelineTier[] = [
  {
    id: "noise",
    step: "01",
    name: "NOISE",
    badge: "DISCARDED IMMEDIATELY",
    badgeTone: "muted",
    desc: "Acoustic room echoes, casual pauses, filler phrases, and irrelevant chatter.",
    example: '"Could you pass the adapter?" · Background fan noise · [Filtered]',
    icon: Filter,
  },
  {
    id: "temporary",
    step: "02",
    name: "TEMPORARY",
    badge: "24-HOUR LOCAL CACHE",
    badgeTone: "blue",
    desc: "Short-term operational scratchpad, temporary clipboard captures, and quick math.",
    example: "Temporary command snippets · Today's standup rundown",
    icon: Clock,
  },
  {
    id: "useful",
    step: "03",
    name: "USEFUL",
    badge: "CONTEXTUAL INDEX",
    badgeTone: "blue",
    desc: "Referenced documentation, active Figma links, and code dependencies.",
    example: "Sensor datasheet URLs · Pull request #41 review context",
    icon: Bookmark,
  },
  {
    id: "important",
    step: "04",
    name: "IMPORTANT",
    badge: "VERIFIED MILESTONE",
    badgeTone: "cyan",
    desc: "Architectural agreements, client commitments, and hardware pinout revisions.",
    example: "ESP32 SPI pinout locked · SQLite vector table schema decided",
    icon: ShieldCheck,
  },
  {
    id: "longterm",
    step: "05",
    name: "LONG-TERM MEMORY",
    badge: "CRYSTALLISED NEURAL NODE",
    badgeTone: "cyan",
    desc: "Permanent indexed node woven into your personal knowledge graph across devices.",
    example: "Project SmartLine Knowledge Cluster · Accessible in zero latency",
    icon: Network,
  },
];

export default function RememberSpace() {
  const [selectedTier, setSelectedTier] = useState<string>("important");

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            03 / DISTILLATION PIPELINE
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          NOT EVERYTHING DESERVES TO BE REMEMBERED.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[50ch] mx-auto font-normal leading-relaxed">
          A continuous cognitive filter. Daily chatter is discarded; only durable insights,
          decisions, and references condense into permanent memory nodes.
        </p>
      </div>

      {/* LEVEL 1 & LEVEL 2: VERTICAL PIPELINE VISUALIZATION */}
      <div className="relative z-10 mx-auto max-w-[960px] w-full">
        <div className="relative">
          {/* Vertical central energy conduit */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-[#334155]/20 via-[#00D1FF]/40 to-[#00D1FF] pointer-events-none" />

          {/* Flowing animated light bead down the conduit */}
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none overflow-hidden">
            <motion.div
              className="w-1 h-14 rounded-full bg-gradient-to-b from-transparent via-[#00D1FF] to-transparent -translate-x-1/2"
              animate={{ y: ["0%", "850%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="space-y-8 sm:space-y-12">
            {TIERS.map((tier, idx) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? "sm:flex-row-reverse" : ""
                  } gap-6 sm:gap-12 cursor-pointer group`}
                >
                  {/* Central Node Badge */}
                  <div className="absolute left-6 sm:left-1/2 top-4 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div
                      className={`w-9 h-9 rounded-full border transition-all duration-500 flex items-center justify-center ${
                        isSelected
                          ? "border-[#00D1FF] bg-[#0F1B2D] shadow-[0_0_20px_rgba(0,209,255,0.4)] text-[#00D1FF]"
                          : "border-[#334155] bg-[#0A0F1C] text-[#94A3B8] group-hover:border-[#3882F6]"
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                  </div>

                  {/* Content Container (Alternating Sides) */}
                  <div
                    className={`ml-14 sm:ml-0 w-full sm:w-[calc(50%-36px)] transition-all duration-300 ${
                      isEven ? "sm:text-left" : "sm:text-right"
                    }`}
                  >
                    <div
                      className={`p-5 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? "border-[#00D1FF]/50 bg-[#0F1B2D]/70 shadow-[0_12px_40px_-15px_rgba(0,209,255,0.18)]"
                          : "border-[#334155]/30 bg-[#0A0F1C]/40 hover:border-[#334155]/70"
                      } backdrop-blur-md`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2 ${
                          isEven ? "justify-start" : "justify-start sm:justify-end"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-[#94A3B8]/60 tracking-wider">
                          TIER {tier.step}
                        </span>
                        <span className="text-[10px] font-mono text-[#334155]">/</span>
                        <span
                          className={`font-mono text-[9.5px] px-2 py-0.5 rounded-full border ${
                            tier.badgeTone === "cyan"
                              ? "border-[#00D1FF]/40 bg-[#00D1FF]/10 text-[#00D1FF]"
                              : tier.badgeTone === "blue"
                              ? "border-[#3882F6]/30 bg-[#3882F6]/10 text-[#3882F6]"
                              : "border-[#334155]/50 bg-black/30 text-[#94A3B8]"
                          }`}
                        >
                          {tier.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-[17px] font-semibold text-[#E2E8F0] tracking-wide">
                        {tier.name}
                      </h3>

                      <p className="mt-2 text-[13px] text-[#94A3B8] leading-relaxed">
                        {tier.desc}
                      </p>

                      <div className="mt-3.5 pt-3 border-t border-[#334155]/30 font-mono text-[11px] text-[#00D1FF]/80 truncate">
                        {tier.example}
                      </div>
                    </div>
                  </div>

                  {/* Empty placeholder for grid balance */}
                  <div className="hidden sm:block sm:w-[calc(50%-36px)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
