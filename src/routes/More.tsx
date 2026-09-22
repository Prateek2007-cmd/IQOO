/**
 * More — The sovereign mobile system terminal and launcher.
 */

import {
  Activity,
  BookOpen,
  ChevronRight,
  Clock,
  Cpu,
  Gauge,
  Lock,
  LogOut,
  MonitorSmartphone,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  Waves,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import { NeoBrainMark } from "../components/Logo";
import { Button, StatusDot } from "../components/ui";
import { providerReport } from "../lib/engine";
import { relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";

const GROUPS = [
  {
    tag: "EXPLORE",
    title: "Intelligence & Time",
    items: [
      {
        icon: Activity,
        label: "Live activity",
        hint: "Real-time perception audit stream",
        to: "/app/activity",
        accent: "#00D1FF",
      },
      {
        icon: Clock,
        label: "Timeline",
        hint: "Chronological memory traversal",
        to: "/app/timeline",
        accent: "#3882F6",
      },
      {
        icon: Sparkles,
        label: "Knowledge graph",
        hint: "Multidimensional semantic topology",
        to: "/app/knowledge",
        accent: "#885CF6",
      },
      {
        icon: Waves,
        label: "Voice mode",
        hint: "Ambient low-latency voice interface",
        to: "/app/voice",
        accent: "#10B981",
      },
    ],
  },
  {
    tag: "SYSTEM",
    title: "Hardware & Integrity",
    items: [
      {
        icon: MonitorSmartphone,
        label: "Devices",
        hint: "Pocket & Deep Brain constellation",
        to: "/app/devices",
        accent: "#00D1FF",
      },
      {
        icon: Lock,
        label: "Privacy",
        hint: "Sovereign vault & telemetry limits",
        to: "/app/privacy",
        accent: "#F59E0B",
      },
      {
        icon: SettingsIcon,
        label: "Settings",
        hint: "Heuristics, memory rules, rendering",
        to: "/app/settings",
        accent: "#94A3B8",
      },
      {
        icon: Gauge,
        label: "Boot sequence",
        hint: "Replay hardware pairing diagnostics",
        to: "/app/boot",
        accent: "#3882F6",
      },
    ],
  },
];

export default function MorePage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, session, signOut } = useBrain();
  const counts = useCounts();
  const providers = providerReport(state.settings.privacy.cloudServices);
  const laptop = state.devices.find((device) => device.processingRole === "deep");

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title="System" tagline="Control Hub" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[960px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* ── 1. Operator Identity Terminal Card ──────────────── */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#334155]/60 bg-gradient-to-b from-[#0F1B2D]/80 via-[#0B1320]/80 to-[#020407]/90 p-5 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#00D1FF]/10 blur-[50px]" />

          <div className="flex items-center gap-4">
            <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-[#00D1FF]/40 bg-[#020407] p-2 shadow-[0_0_16px_rgba(0,209,255,0.25)]">
              <NeoBrainMark size={36} state="active" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#00D1FF]">
                LOCAL OPERATOR
              </div>
              <div className="truncate font-display text-[18px] font-bold text-white">
                {session.name || "Operator"}
              </div>
              <div className="mt-0.5 font-mono text-[10.5px] text-[#64748B]">
                Private Node · Zero External Telemetry
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                signOut();
                navigate("/auth?returnTo=%2Fapp", { replace: true });
              }}
              className="shrink-0 border-[#334155]/50 hover:border-[#EF4444]/50 hover:text-[#EF4444]"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Lock</span>
            </Button>
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-2.5">
              <div className="font-mono text-[16px] font-bold text-white">{counts.memories}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">Memories</div>
            </div>
            <div className="rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-2.5">
              <div className="font-mono text-[16px] font-bold text-[#3882F6]">{counts.filesIndexed}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">Indexed Files</div>
            </div>
            <div className="rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-2.5">
              <div className="font-mono text-[16px] font-bold text-[#885CF6]">{counts.tasksPending}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">Pending Tasks</div>
            </div>
            <div className="rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[14px] font-bold text-[#10B981]">
                <StatusDot tone={laptop?.connectionStatus === "connected" ? "green" : "amber"} />
                {laptop?.connectionStatus === "connected" ? "Deep Brain" : "Pocket"}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">Compute Mesh</div>
            </div>
          </div>
        </div>

        {/* ── 2. Functional Modules ───────────────────────────── */}
        {GROUPS.map((group) => (
          <section key={group.tag} className="mt-6">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                  ✦ {group.tag}
                </span>
                <span className="text-[12px] font-medium text-[#64748B]">· {group.title}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="group relative flex items-center gap-3.5 rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 text-left backdrop-blur-xl transition-all duration-200 hover:border-[#00D1FF]/40 hover:bg-[#0F1B2D]/70 active:scale-[0.985]"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#334155]/50 bg-[#020407] transition-all group-hover:border-[#00D1FF]/50"
                      style={{ color: item.accent }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13.5px] font-semibold text-white group-hover:text-[#00D1FF]">
                          {item.label}
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-[#64748B] transition-transform group-hover:translate-x-0.5 group-hover:text-[#00D1FF]"
                        />
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[10.5px] text-[#64748B]">
                        {item.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* ── 3. Sovereign Inference Stack Status ─────────────── */}
        <section className="mt-6">
          <div className="mb-2.5 px-1 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
            ✦ SOVEREIGN ENGINE TOPOLOGY
          </div>
          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/50 p-4 backdrop-blur-xl">
            <div className="space-y-3 font-mono text-[11.5px]">
              {[providers.inference, providers.retrieval, providers.speech].map((info) => (
                <div
                  key={info.id}
                  className="flex items-center justify-between border-b border-[#334155]/25 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <Cpu size={12} className="text-[#00D1FF]" />
                    <span>{info.label}</span>
                  </div>
                  <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.2 text-[9.5px] uppercase font-semibold text-[#10B981]">
                    {info.location}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Ambient Second Brain Principle ──────────────── */}
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-r from-[#0F1B2D]/40 to-[#020407]/60 p-4.5 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <BookOpen size={15} className="mt-0.5 shrink-0 text-[#00D1FF]" />
              <p className="text-[12px] leading-relaxed text-[#94A3B8]">
                NeoBrain holds one unified personal memory layer across your entire computing ecosystem.
                Data captured on pocket devices syncs securely with your Deep Brain workstation without cloud transmission.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button size="sm" variant="primary" onClick={() => navigate("/app/ask")}>
                <NotebookPen size={12} /> Ask Your Brain
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                Cinematic Portal
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
