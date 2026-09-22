import React from "react";
import { ShieldCheck, MicOff, CloudOff, Trash2, KeyRound } from "lucide-react";

interface PrivacyMetric {
  id: string;
  title: string;
  status: string;
  statusTone: "cyan" | "green" | "muted";
  metric: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PRIVACY_METRICS: PrivacyMetric[] = [
  {
    id: "local-processing",
    title: "LOCAL PROCESSING",
    status: "ACTIVE",
    statusTone: "cyan",
    metric: "ON-DEVICE RETRIEVAL",
    description: "Hybrid keyword and vector search execute directly on your CPU without third-party API dependencies.",
    icon: ShieldCheck,
  },
  {
    id: "raw-audio",
    title: "RAW AUDIO OFF",
    status: "ENFORCED BY DEFAULT",
    statusTone: "green",
    metric: "ZERO AUDIO STORAGE",
    description: "Microphone captures are processed into text tokens and immediately wiped from memory buffers.",
    icon: MicOff,
  },
  {
    id: "cloud-upload",
    title: "CLOUD UPLOAD OFF",
    status: "AIR-GAPPED STORAGE",
    statusTone: "green",
    metric: "0 B EXPORTED",
    description: "Your files, notes, and index stay within your local machine's application directory.",
    icon: CloudOff,
  },
  {
    id: "memory-control",
    title: "MEMORY CONTROL",
    status: "GRANULAR",
    statusTone: "cyan",
    metric: "INSTANT PURGE & JSON EXPORT",
    description: "Inspect candidate memories before they commit. Edit, archive, or permanently delete anytime.",
    icon: Trash2,
  },
  {
    id: "device-control",
    title: "DEVICE CONTROL",
    status: "VERIFIED",
    statusTone: "cyan",
    metric: "LOCAL P2P HANDSHAKE",
    description: "Phone and laptop pair exclusively through mutual local-network verification.",
    icon: KeyRound,
  },
];

export default function PrivacySpace() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6 bg-[#020407]/60">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            07 / SECURITY & SOVEREIGNTY
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          YOUR MEMORY. YOUR CONTROL.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[50ch] mx-auto font-normal leading-relaxed">
          Quiet, deterministic security. No silent telemetry, no hidden cloud accounts, and no data
          leaves your hardware without your explicit consent.
        </p>
      </div>

      {/* LEVEL 3: ELEGANT TECHNICAL INDICATORS (No generic cards) */}
      <div className="relative z-10 mx-auto max-w-[960px] w-full divide-y divide-[#334155]/40 border-y border-[#334155]/40">
        {PRIVACY_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="py-6 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 group hover:bg-[#0A0F1C]/40 px-4 -mx-4 rounded-xl transition-colors duration-200"
            >
              {/* Left: Icon & Title */}
              <div className="flex items-center gap-4 sm:w-[260px] shrink-0">
                <span className="w-9 h-9 rounded-xl border border-[#334155]/60 bg-black/40 flex items-center justify-center text-[#94A3B8] group-hover:text-[#00D1FF] group-hover:border-[#00D1FF]/40 transition-colors">
                  <Icon size={16} />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-[#E2E8F0] tracking-wide">
                    {metric.title}
                  </h3>
                  <span className="font-mono text-[9px] tracking-wider text-[#94A3B8]/60 uppercase">
                    {metric.metric}
                  </span>
                </div>
              </div>

              {/* Center: Detailed Narrative */}
              <p className="text-[12.5px] leading-relaxed text-[#94A3B8] max-w-[48ch] flex-1">
                {metric.description}
              </p>

              {/* Right: Technical State Badge */}
              <div className="flex items-center gap-2 sm:justify-end shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    metric.statusTone === "green"
                      ? "bg-[#23D7A0] shadow-[0_0_8px_#23D7A0]"
                      : "bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]"
                  }`}
                />
                <span className="font-mono text-[10px] text-[#E2E8F0] tracking-wider uppercase">
                  {metric.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
