import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Mic, Brain, Sparkles } from "lucide-react";

interface Stage {
  id: string;
  step: string;
  title: string;
  description: string;
  telemetry: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const STAGES: Stage[] = [
  {
    id: "ambient",
    step: "01",
    title: "AMBIENT CONTEXT",
    description: "Low-power listening environment with passive acoustic calibration.",
    telemetry: "SPECTRUM // 16kHz VAD IDLE",
    icon: Activity,
  },
  {
    id: "speech",
    step: "02",
    title: "SPEECH DETECTED",
    description: "Instant voice-activity wake with active microphone indicator.",
    telemetry: "LATENCY // 14ms ON-DEVICE",
    icon: Mic,
  },
  {
    id: "understood",
    step: "03",
    title: "UNDERSTOOD",
    description: "Real-time semantic parsing and contextual entity extraction.",
    telemetry: "PARSER // ENTITY GRAPH RESOLVED",
    icon: Brain,
  },
  {
    id: "meaningful",
    step: "04",
    title: "MEANINGFUL MOMENT",
    description: "Decision or key insight isolated from conversational noise.",
    telemetry: "STORE // CANDIDATE COMMITTED",
    icon: Sparkles,
  },
];

export default function PerceiveSpace() {
  const [activeStage, setActiveStage] = useState(2); // default highlighting 'UNDERSTOOD'
  const [phase, setPhase] = useState(0);

  // Subtle wave animation
  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 0.04) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Generate SVG path for the neural waveform
  const generateWavePath = (yOffset: number, amplitude: number, freq: number, phaseShift: number) => {
    let path = `M 0 ${yOffset}`;
    const width = 1200;
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      // create modulation peak around active stage
      const stageCenterX = (activeStage / 3) * width;
      const distFromCenter = Math.abs(x - stageCenterX);
      const focusMultiplier = Math.max(0.4, 1.6 - distFromCenter / 350);

      const y =
        yOffset +
        Math.sin((x * freq) / 100 + phase + phaseShift) * amplitude * focusMultiplier +
        Math.cos((x * freq * 0.5) / 100 + phase) * (amplitude * 0.4);
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            02 / PERCEPTION STREAM
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          IT KNOWS WHEN SOMETHING MATTERS.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[50ch] mx-auto font-normal leading-relaxed">
          Not a recorder that hoards hours of silence. A neural listener that isolates inflection
          points and discards background noise in real time.
        </p>
      </div>

      {/* LEVEL 1: OPEN SPACE HORIZONTAL NEURAL WAVEFORM */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full py-10">
        {/* WAVEFORM CANVAS / SVG */}
        <div className="relative w-full h-[180px] sm:h-[220px] overflow-hidden">
          <svg
            viewBox="0 0 1200 200"
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#00D1FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3882F6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="waveGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3882F6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#3882F6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00D1FF" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Background harmonic waves */}
            <path
              d={generateWavePath(100, 18, 1.4, 1.2)}
              fill="none"
              stroke="url(#waveGradBlue)"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <path
              d={generateWavePath(100, 12, 2.2, 2.4)}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity="0.4"
            />

            {/* Primary glowing neural wave */}
            <path
              d={generateWavePath(100, 26, 1.8, 0)}
              fill="none"
              stroke="url(#waveGradCyan)"
              strokeWidth="2.4"
              className="filter drop-shadow-[0_0_12px_rgba(0,209,255,0.6)]"
            />
          </svg>

          {/* Central subtle scanning laser line */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-[#00D1FF]/40 to-transparent pointer-events-none" />
        </div>

        {/* 4 SEQUENTIAL STAGES (Inline storytelling, no bulky cards) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 relative">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = activeStage === idx;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative ${
                  isCurrent
                    ? "border-[#00D1FF]/50 bg-[#0F1B2D]/60 shadow-[0_10px_30px_-10px_rgba(0,209,255,0.15)]"
                    : "border-[#334155]/40 bg-[#0A0F1C]/30 hover:border-[#334155]"
                }`}
              >
                {/* Checkpoint marker */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "bg-[#00D1FF] shadow-[0_0_10px_#00D1FF]"
                          : "bg-[#334155] group-hover:bg-[#94A3B8]"
                      }`}
                    />
                    <span className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase">
                      STAGE {stage.step}
                    </span>
                  </div>

                  <span className={`p-1 rounded-md ${isCurrent ? "text-[#00D1FF]" : "text-[#94A3B8]/60"}`}>
                    <Icon size={14} />
                  </span>
                </div>

                <h3 className="font-display text-[15px] font-semibold text-[#E2E8F0] tracking-wide">
                  {stage.title}
                </h3>

                <p className="mt-2 text-[12.5px] leading-relaxed text-[#94A3B8] font-normal">
                  {stage.description}
                </p>

                {/* Level 3 Technical telemetry */}
                <div className="mt-4 pt-3 border-t border-[#334155]/30">
                  <span className="font-mono text-[9px] tracking-wider text-[#94A3B8]/70 block">
                    {stage.telemetry}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
