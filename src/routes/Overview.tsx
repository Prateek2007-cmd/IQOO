/**
 * Overview — NeoBrain Home Dashboard.
 *
 * Implements the full premium aerospace / personal computing interface
 * exactly matching the second-pass premium refinement specification:
 * - NeoBrain Core as the dominant centerpiece (280–380px diameter)
 * - Miniature cinematic observatory environment with platform, orbital traces, and floor reflections
 * - Floating technical instrumentation for connected devices
 * - Compact command-console Quick Actions
 * - System telemetry stream for Recent Activity
 * - Dedicated handheld mobile hierarchy
 */

import {
  Activity,
  ArrowRight,
  Brain,
  CheckSquare,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Laptop,
  Mic,
  Plus,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NeoBrainCore from "../components/NeoBrainCore";
import { MobileTopBar, useDeviceStatus } from "../components/Chrome";
import {
  MetricTile,
  MicroHistogram,
  MicroRing,
  MicroSpline,
  Panel,
  StatusDot,
  TechLabel,
} from "../components/ui";
import { dayLabel, greeting, relativeTime } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";
import { useAsk } from "../lib/useAsk";
import observatoryImg from "../neobrain-observatory.png";

export default function Overview() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopOverview /> : <MobileHome />;
}

/* ==========================================================================
   Desktop Overview (Primary Centerpiece Core & Spatial Depth)
   ========================================================================== */

function DesktopOverview() {
  const navigate = useNavigate();
  const { state, session, createMemory } = useBrain();
  const counts = useCounts();
  const { connected, laptop } = useDeviceStatus();
  const { ask } = useAsk();
  const now = useNow(30_000);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemTitle, setNewMemTitle] = useState("");
  const [newMemContent, setNewMemContent] = useState("");

  const digest = async () => {
    const run = await ask("Summarize everything I worked on today.");
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim()) return;
    createMemory({
      title: newMemTitle.trim(),
      content: newMemContent.trim() || newMemTitle.trim(),
      category: "note",
      importance: "useful",
    });
    setNewMemTitle("");
    setNewMemContent("");
    setShowAddModal(false);
  };

  const activityEvents = [
    {
      id: "1",
      title: "Deep Brain connected",
      detail: "Laptop paired · local sync complete",
      time: "04:09 PM · just now",
      icon: Brain,
      color: "text-[#00D1FF]",
      border: "border-[#00D1FF]/50",
      bg: "bg-[#00D1FF]/10",
      shadow: "shadow-[0_0_8px_rgba(0,209,255,0.4)]",
    },
    {
      id: "2",
      title: "Project updated",
      detail: "SmartLine / Bearing analysis",
      time: "03:16 PM · 53 min ago",
      icon: FolderKanban,
      color: "text-[#885CF6]",
      border: "border-[#885CF6]/50",
      bg: "bg-[#885CF6]/10",
      shadow: "shadow-[0_0_8px_rgba(136,92,246,0.3)]",
    },
    {
      id: "3",
      title: "Memory captured",
      detail: "Voice · 12 min · Transcribed",
      time: "01:24 PM · 2 hours ago",
      icon: Mic,
      color: "text-[#F59E0B]",
      border: "border-[#F59E0B]/50",
      bg: "bg-[#F59E0B]/10",
      shadow: "shadow-[0_0_8px_rgba(245,158,11,0.3)]",
    },
    {
      id: "4",
      title: "File indexed",
      detail: "vibration_report.pdf",
      time: "11:03 AM · 5 hours ago",
      icon: FileText,
      color: "text-[#00D1FF]",
      border: "border-[#00D1FF]/50",
      bg: "bg-[#00D1FF]/10",
      shadow: "shadow-[0_0_8px_rgba(0,209,255,0.3)]",
    },
    {
      id: "5",
      title: "Important decision",
      detail: '"Use FFT for anomaly detection"',
      time: "09:42 AM · 6 hours ago",
      icon: Sparkles,
      color: "text-[#885CF6]",
      border: "border-[#885CF6]/50",
      bg: "bg-[#885CF6]/10",
      shadow: "shadow-[0_0_8px_rgba(136,92,246,0.3)]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-8 py-6 space-y-6">
      {/* 1. TOP HEADER */}
      <header className="flex flex-wrap items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="font-display text-[32px] sm:text-[36px] font-bold tracking-tight text-[#E2E8F0]">
            {greeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#3882F6] drop-shadow-[0_0_20px_rgba(0,209,255,0.5)]">
              {session.name || "Prateek"}.
            </span>
          </h1>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Ideas, files and conversations. All connected.
          </p>
        </div>

        {/* Right Motto & Telemetry Indicator */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="rounded-full border border-[#334155]/60 bg-[#0B1320]/50 px-3.5 py-1 backdrop-blur-md">
            <span className="text-[9.5px] font-mono tracking-[0.2em] text-[#94A3B8] uppercase">
              "A MORE CAPABLE YOU. THROUGH A BRIGHTER MEMORY."
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[8.5px] font-mono tracking-[0.22em] text-[#64748B] uppercase">
            {["CAPTURE", "UNDERSTAND", "REMEMBER", "CONNECT", "EVOLVE"].map((step, idx) => (
              <span
                key={step}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer transition-colors ${
                  activeStep === idx ? "text-[#00D1FF] font-semibold drop-shadow-[0_0_6px_#00D1FF]" : "hover:text-[#94A3B8]"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 2. TERTIARY COMPACT TELEMETRY INSTRUMENTATION (LOW-PROFILE) */}
      <section className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <MetricTile
          icon={Brain}
          value={counts.memories || 13}
          label="Memories"
          accent="cyan"
          trend="+3 today"
          bars={[0.3, 0.5, 0.7, 0.4, 0.9]}
          onClick={() => navigate("/app/memory")}
        />
        <MetricTile
          icon={FileText}
          value={counts.filesIndexed || 8}
          label="Files indexed"
          accent="cyan"
          trend="+2 today"
          bars={[0.4, 0.6, 0.5, 0.8, 1.0]}
          onClick={() => navigate("/app/knowledge")}
        />
        <MetricTile
          icon={FolderKanban}
          value={counts.projects || 4}
          label="Active projects"
          accent="blue"
          trend="No change"
          onClick={() => navigate("/app/projects")}
        />
        <MetricTile
          icon={CheckSquare}
          value={counts.tasksPending || 4}
          label="Open tasks"
          accent="amber"
          trend="-2 today"
          bars={[0.8, 0.6, 0.4, 0.5, 0.3]}
          onClick={() => navigate("/app/timeline")}
        />
      </section>

      {/* 3. MAIN SPATIAL SECTION (Primary Command Center 62% + Secondary Console 38%) */}
      <div className="grid gap-6 xl:grid-cols-[1.62fr_1fr] items-start">
        {/* LEFT COLUMN: DOMINANT BRAIN STATUS CENTERPIECE & TODAY'S INSIGHTS */}
        <div className="space-y-6">
          {/* YOUR BRAIN STATUS CONSOLE — MINIATURE NEOBRAIN ENVIRONMENT */}
          <div className="relative overflow-hidden rounded-[22px] border border-[#334155]/60 bg-gradient-to-b from-[#0C1726]/90 via-[#070E1A]/95 to-[#020407]/98 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl min-h-[480px] flex flex-col justify-between">
            {/* Deep Space Atmosphere Behind Core */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_52%,rgba(0,209,255,0.12)_0%,rgba(56,130,246,0.04)_45%,transparent_75%)]" />

            {/* Faint Vertical Light Column */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-10 bottom-6 w-44 bg-gradient-to-b from-transparent via-[#00D1FF]/6 to-[#00D1FF]/14 blur-xl" />

            {/* Extremely Sparse Floating Particles (Ambient Micro Sparks) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute left-[24%] top-[30%] h-1 w-1 rounded-full bg-[#00D1FF] opacity-60 shadow-[0_0_6px_#00D1FF] animate-pulse" style={{ animationDuration: "3.2s" }} />
              <span className="absolute right-[28%] top-[25%] h-1 w-1 rounded-full bg-[#885CF6] opacity-50 shadow-[0_0_6px_#885CF6] animate-pulse" style={{ animationDuration: "4.5s" }} />
              <span className="absolute left-[38%] bottom-[28%] h-0.5 w-0.5 rounded-full bg-white opacity-40 animate-ping" style={{ animationDuration: "5s" }} />
              <span className="absolute right-[35%] bottom-[32%] h-1 w-1 rounded-full bg-[#00D1FF] opacity-50 shadow-[0_0_4px_#00D1FF] animate-pulse" style={{ animationDuration: "3.8s" }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00D1FF] mb-1">
                  YOUR BRAIN STATUS
                </div>
                <h2 className="font-display text-[26px] font-bold text-white tracking-tight leading-none">
                  All systems ready.
                </h2>
                <p className="mt-1 text-[13px] text-[#94A3B8]">
                  Capturing. Understanding. Remembering.
                </p>
              </div>
            </div>

            {/* Center Visual Environment with Large NeoBrain Core */}
            <div className="relative z-10 my-2 grid grid-cols-1 items-center gap-6 lg:grid-cols-[120px_1fr_190px]">
              {/* Left: Status Telemetry Stack */}
              <div className="space-y-3.5 font-mono text-[10px] tracking-[0.25em] text-[#64748B]">
                {[
                  { label: "CAPTURE", active: true },
                  { label: "UNDERSTAND", active: false },
                  { label: "REMEMBER", active: false },
                  { label: "CONNECT", active: false },
                  { label: "EVOLVE", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 transition-colors ${
                      item.active ? "text-[#00D1FF] font-bold" : ""
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.active
                          ? "bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]"
                          : "bg-[#334155]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Center: Large Dominant 3D NeoBrainCore (290–350px visual diameter) */}
              <div className="relative flex h-[350px] xl:h-[380px] items-center justify-center">
                {/* Orbital Traces SVG — Positioned directly beneath Core */}
                <svg
                  viewBox="0 0 400 160"
                  className="pointer-events-none absolute inset-x-0 bottom-6 xl:bottom-8 w-full h-[120px] opacity-80"
                  aria-hidden="true"
                >
                  <ellipse cx="200" cy="110" rx="180" ry="32" fill="none" stroke="rgba(0,209,255,0.18)" strokeWidth="0.8" strokeDasharray="4 6" />
                  <ellipse cx="200" cy="110" rx="135" ry="24" fill="none" stroke="rgba(0,209,255,0.35)" strokeWidth="1" />
                  <ellipse cx="200" cy="110" rx="90" ry="16" fill="rgba(0,209,255,0.06)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                  <ellipse cx="200" cy="110" rx="45" ry="8" fill="rgba(0,209,255,0.25)" stroke="#00D1FF" strokeWidth="1.2" />
                </svg>

                {/* Subtle Floor Reflection Glow */}
                <div className="pointer-events-none absolute bottom-8 xl:bottom-10 h-16 w-56 rounded-full bg-[#00D1FF]/22 blur-2xl" />

                {/* 3D NeoBrainCore — Dominant Centerpiece (Desktop 300-350px) */}
                <div className="relative z-10 h-[300px] w-[300px] xl:h-[350px] xl:w-[350px] translate-y-2">
                  <NeoBrainCore
                    state="idle"
                    quality="high"
                    style={{
                      background: "transparent",
                      borderRadius: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Right: Floating Compact Device Modules */}
              <div className="space-y-3">
                {/* MacBook Pro Module */}
                <div
                  onClick={() => navigate("/app/devices")}
                  className="group cursor-pointer rounded-[14px] border border-[#334155]/60 bg-[#0A0F1C]/75 p-3 backdrop-blur-xl transition-all hover:border-[#00D1FF]/50 hover:bg-[#0F1B2D]/90 shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#334155]/50 bg-[#020407] text-[#00D1FF]">
                        <Laptop size={14} />
                      </span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#E2E8F0] leading-tight">
                          MacBook Pro
                        </div>
                        <div className="text-[9px] font-mono tracking-wider text-[#64748B]">
                          DEEP BRAIN
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#94A3B8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                      Online
                    </div>
                  </div>
                </div>

                {/* iQOO 15 Module */}
                <div
                  onClick={() => navigate("/app/devices")}
                  className="group cursor-pointer rounded-[14px] border border-[#334155]/60 bg-[#0A0F1C]/75 p-3 backdrop-blur-xl transition-all hover:border-[#00D1FF]/50 hover:bg-[#0F1B2D]/90 shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#334155]/50 bg-[#020407] text-[#00D1FF]">
                        <Smartphone size={14} />
                      </span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#E2E8F0] leading-tight">
                          iQOO 15
                        </div>
                        <div className="text-[9px] font-mono tracking-wider text-[#64748B]">
                          POCKET BRAIN
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#94A3B8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                      Connected
                    </div>
                  </div>
                </div>

                {/* Compact Link Trigger */}
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => navigate("/app/devices")}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#64748B] hover:text-[#00D1FF] transition-colors"
                  >
                    <span>Manage devices</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Horizon Hairline */}
            <div className="relative z-10 pt-2 border-t border-[#334155]/40 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span>NEURAL MESH · ENCRYPTED LOCAL BUS</span>
              <span>P2P TUNNEL ACTIVE</span>
            </div>
          </div>

          {/* TODAY'S INSIGHTS (LEVEL 2 FLOATING PANEL) */}
          <Panel className="p-6">
            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#64748B] mb-1">
                TODAY'S INSIGHTS
              </div>
              <h2 className="font-display text-[20px] font-bold text-white tracking-tight leading-none">
                Patterns emerging.
              </h2>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">
                Here's what's happening across your mind.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Micro Module 1 */}
              <div className="micro-module p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-mono text-[#64748B] uppercase tracking-wider">
                    Recurring topic
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#E2E8F0]">
                    Vibration analysis
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <MicroHistogram values={[0.3, 0.6, 0.4, 0.8, 0.5, 0.9, 0.7]} accent="cyan" height={16} />
                  <span className="text-[9.5px] font-mono text-[#94A3B8]">5 mentions</span>
                </div>
              </div>

              {/* Micro Module 2 */}
              <div className="micro-module p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-mono text-[#64748B] uppercase tracking-wider">
                    Key project
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#E2E8F0]">
                    SmartLine
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <MicroSpline color="#3882F6" width={75} height={16} />
                  <span className="text-[9.5px] font-mono text-[#94A3B8]">Active</span>
                </div>
              </div>

              {/* Micro Module 3 */}
              <div className="micro-module p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-mono text-[#64748B] uppercase tracking-wider">
                    Focus time
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#E2E8F0]">
                    3h 24m
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <MicroRing progress={0.72} size={28} strokeWidth={2.5} color="#00D1FF" />
                  <span className="text-[9.5px] font-mono text-[#00D1FF]">+12%</span>
                </div>
              </div>

              {/* Micro Module 4 */}
              <div className="micro-module p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-mono text-[#64748B] uppercase tracking-wider">
                    Top source
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#E2E8F0]">
                    Conversations
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <MicroHistogram values={[0.5, 0.4, 0.9, 0.7, 1.0, 0.6]} accent="blue" height={16} />
                  <span className="text-[9.5px] font-mono text-[#94A3B8]">42%</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: COMPACT COMMAND CONSOLE & SYSTEM TELEMETRY STREAM */}
        <div className="space-y-6">
          {/* QUICK ACTIONS — COMPACT COMMAND CONSOLE */}
          <div className="rounded-[20px] border border-[#334155]/60 bg-[#0C1523]/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#64748B] mb-3">
              COMMAND CONSOLE
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Action 1 */}
              <button
                type="button"
                onClick={() => navigate("/app/ask")}
                className="group flex items-center justify-between rounded-[12px] border border-[#334155]/50 bg-[#0B1320]/60 p-3 text-left transition-all hover:border-[#00D1FF]/50 hover:bg-[#0F1B2D]/80 hover:shadow-[0_0_15px_rgba(0,209,255,0.06)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                    <Sparkles size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#E2E8F0] group-hover:text-[#00D1FF] transition-colors truncate">
                      Ask your brain
                    </div>
                    <div className="text-[10.5px] text-[#94A3B8] truncate">
                      Recall across memories & connected files
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#64748B] group-hover:text-[#00D1FF] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Action 2 */}
              <button
                type="button"
                onClick={digest}
                className="group flex items-center justify-between rounded-[12px] border border-[#334155]/50 bg-[#0B1320]/60 p-3 text-left transition-all hover:border-[#3882F6]/50 hover:bg-[#0F1B2D]/80 hover:shadow-[0_0_15px_rgba(56,130,246,0.06)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#3882F6]">
                    <Zap size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#E2E8F0] group-hover:text-[#3882F6] transition-colors truncate">
                      Summarize today
                    </div>
                    <div className="text-[10.5px] text-[#94A3B8] truncate">
                      Synthesize activity into actionable insight
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#64748B] group-hover:text-[#3882F6] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Action 3 */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="group flex items-center justify-between rounded-[12px] border border-[#334155]/50 bg-[#0B1320]/60 p-3 text-left transition-all hover:border-[#F59E0B]/50 hover:bg-[#0F1B2D]/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.06)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#F59E0B]">
                    <Plus size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#E2E8F0] group-hover:text-[#F59E0B] transition-colors truncate">
                      Add memory
                    </div>
                    <div className="text-[10.5px] text-[#94A3B8] truncate">
                      Capture manual insight or notes
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#64748B] group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Action 4 */}
              <button
                type="button"
                onClick={() => navigate("/app/timeline")}
                className="group flex items-center justify-between rounded-[12px] border border-[#334155]/50 bg-[#0B1320]/60 p-3 text-left transition-all hover:border-[#00D1FF]/50 hover:bg-[#0F1B2D]/80 hover:shadow-[0_0_15px_rgba(0,209,255,0.06)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                    <Clock size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#E2E8F0] group-hover:text-[#00D1FF] transition-colors truncate">
                      Open timeline
                    </div>
                    <div className="text-[10.5px] text-[#94A3B8] truncate">
                      Browse your continuous journey
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#64748B] group-hover:text-[#00D1FF] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* RECENT ACTIVITY — CONTINUOUS SYSTEM TELEMETRY STREAM */}
          <div className="rounded-[20px] border border-[#334155]/60 bg-[#0C1523]/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#64748B]">
                SYSTEM TELEMETRY STREAM
              </div>
              <Link
                to="/app/activity"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00D1FF] hover:underline"
              >
                <span>Audit</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            {/* Continuous Vertical Signal Rail */}
            <div className="relative pl-5 space-y-4">
              {/* Thin Vertical Signal Line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#00D1FF]/60 via-[#334155]/50 to-transparent" />

              {activityEvents.map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="relative flex items-start gap-3 group">
                    {/* Small Glowing Signal Node */}
                    <div className="absolute -left-[18px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#020407] border border-[#334155] group-hover:border-[#00D1FF]">
                      <span className={`h-1.5 w-1.5 rounded-full ${event.color === "text-[#00D1FF]" ? "bg-[#00D1FF] shadow-[0_0_6px_#00D1FF]" : event.color === "text-[#F59E0B]" ? "bg-[#F59E0B]" : "bg-[#885CF6]"}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12.5px] font-semibold text-[#E2E8F0] truncate group-hover:text-white transition-colors">
                          {event.title}
                        </div>
                        <div className="text-[9.5px] font-mono text-[#64748B] shrink-0">
                          {event.time}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] truncate mt-0.5">
                        {event.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AMBIENT OBSERVATORY CARD */}
          <div className="relative overflow-hidden rounded-[20px] border border-[#334155]/60 bg-[#0A0F1C] p-4 shadow-xl">
            <div className="relative h-28 w-full overflow-hidden rounded-[14px]">
              <img
                src={observatoryImg}
                alt="Observatory View"
                className="h-full w-full object-cover object-center opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020407] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-[#00D1FF] tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D1FF] animate-ping" />
                OBSERVATORY LAYER · ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-[20px] border border-[#334155] bg-[#0F1B2D] p-6 shadow-2xl">
            <h3 className="font-display text-[18px] font-bold text-white mb-1">
              Add Memory
            </h3>
            <p className="text-[12px] text-[#94A3B8] mb-4">
              Capture a thought, note or decision directly into your second brain.
            </p>

            <form onSubmit={handleCreateMemory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={newMemTitle}
                  onChange={(e) => setNewMemTitle(e.target.value)}
                  placeholder="e.g. MSME Hackathon presentation notes"
                  className="w-full rounded-[10px] border border-[#334155]/80 bg-[#0A0F1C] px-3.5 py-2 text-[13px] text-[#E2E8F0] focus:border-[#00D1FF] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Content
                </label>
                <textarea
                  value={newMemContent}
                  onChange={(e) => setNewMemContent(e.target.value)}
                  placeholder="Describe the context, key takeaways or decisions..."
                  rows={4}
                  className="w-full rounded-[10px] border border-[#334155]/80 bg-[#0A0F1C] px-3.5 py-2 text-[13px] text-[#E2E8F0] focus:border-[#00D1FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-[#334155] px-4 py-1.5 text-[12px] text-[#94A3B8] hover:bg-[#1E2A3F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#00D1FF] px-5 py-1.5 text-[12px] font-semibold text-black hover:bg-[#38bdf8] shadow-[0_0_15px_rgba(0,209,255,0.4)]"
                >
                  Save to Brain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Mobile Home (Exact Required Hierarchy: Greeting → Core → Ask/Voice → Telemetry → Activity)
   ========================================================================== */

function MobileHome() {
  const navigate = useNavigate();
  const { state, session } = useBrain();
  const counts = useCounts();
  const { connected } = useDeviceStatus();
  const { ask } = useAsk();
  const [digesting, setDigesting] = useState(false);

  const summarizeToday = async () => {
    setDigesting(true);
    const run = await ask("What did I work on today across my projects?");
    setDigesting(false);
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  const activityEvents = [
    {
      id: "1",
      title: "Deep Brain connected",
      detail: "Laptop paired · sync complete",
      time: "Just now",
      color: "text-[#00D1FF]",
    },
    {
      id: "2",
      title: "Project updated",
      detail: "SmartLine / Bearing analysis",
      time: "53 min ago",
      color: "text-[#885CF6]",
    },
    {
      id: "3",
      title: "Memory captured",
      detail: "Voice · 12 min",
      time: "2h ago",
      color: "text-[#F59E0B]",
    },
  ];

  return (
    <div className="relative pb-24">
      <MobileTopBar />

      <div className="space-y-5 px-5 pt-5">
        {/* 1. Greeting */}
        <section>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#64748B] uppercase mb-1">
            {dayLabel(new Date().toISOString())}
          </div>
          <h1 className="font-display text-[28px] font-bold leading-tight text-white">
            {greeting()},{" "}
            <span className="text-[#00D1FF]">{session.name || "Prateek"}.</span>
          </h1>
          <p className="mt-1 text-[12.5px] text-[#94A3B8]">
            {connected ? "Your brain is online & active." : "Operating locally on this device."}
          </p>
        </section>

        {/* 2. Dominant 3D Core Environment (240–280px) */}
        <section className="relative overflow-hidden rounded-[22px] border border-[#334155]/60 bg-gradient-to-b from-[#0C1726]/90 to-[#020407]/98 p-5 text-center shadow-xl">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00D1FF] mb-1">
            YOUR BRAIN STATUS
          </div>
          <div className="text-[16px] font-semibold text-white">All systems ready.</div>

          {/* Large 3D Core with Pedestal */}
          <div className="relative my-2 flex h-[260px] items-center justify-center">
            {/* Circular Platform Glow */}
            <div className="pointer-events-none absolute bottom-5 inset-x-0 flex items-center justify-center">
              <div className="h-[34px] w-[220px] rounded-[100%] border border-[#00D1FF]/40 bg-[radial-gradient(ellipse_at_center,rgba(0,209,255,0.25)_0%,transparent_75%)] shadow-[0_0_24px_rgba(0,209,255,0.35)]" />
              <div className="absolute h-[22px] w-[140px] rounded-[100%] border border-white/40" />
            </div>

            <div className="relative z-10 h-[240px] w-[240px] translate-y-1.5">
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
          </div>

          {/* 3. Ask / Voice Controls Directly Below Core */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate("/app/voice")}
              className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#00D1FF]/50 bg-[#00D1FF]/15 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_16px_rgba(0,209,255,0.25)] active:scale-[0.98]"
            >
              <Mic size={15} className="text-[#00D1FF]" />
              <span>Voice</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/ask")}
              className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#334155] bg-[#0F1B2D]/90 py-2.5 text-[13px] font-medium text-[#E2E8F0] active:scale-[0.98]"
            >
              <Sparkles size={15} className="text-[#00D1FF]" />
              <span>Ask</span>
            </button>
            <button
              type="button"
              onClick={summarizeToday}
              disabled={digesting}
              className="flex items-center justify-center rounded-full border border-[#334155] bg-[#0F1B2D]/90 px-4 py-2.5 text-[13px] font-medium text-[#E2E8F0] active:scale-[0.98]"
            >
              <Zap size={15} className="text-[#F59E0B]" />
            </button>
          </div>
        </section>

        {/* 4. Important Telemetry (Compact Technical Instrumentation) */}
        <section className="grid grid-cols-2 gap-3">
          <MetricTile
            icon={Brain}
            value={counts.memories || 13}
            label="Memories"
            accent="cyan"
            trend="+3 today"
            bars={[0.3, 0.5, 0.7, 0.4, 0.9]}
            onClick={() => navigate("/app/memory")}
          />
          <MetricTile
            icon={FileText}
            value={counts.filesIndexed || 8}
            label="Files indexed"
            accent="cyan"
            trend="+2 today"
            bars={[0.4, 0.6, 0.5, 0.8, 1.0]}
            onClick={() => navigate("/app/knowledge")}
          />
          <MetricTile
            icon={FolderKanban}
            value={counts.projects || 4}
            label="Projects"
            accent="blue"
            trend="No change"
            onClick={() => navigate("/app/projects")}
          />
          <MetricTile
            icon={CheckSquare}
            value={counts.tasksPending || 4}
            label="Open tasks"
            accent="amber"
            trend="-2 today"
            bars={[0.8, 0.6, 0.4, 0.5, 0.3]}
            onClick={() => navigate("/app/timeline")}
          />
        </section>

        {/* 5. Recent Activity Telemetry Stream */}
        <section className="rounded-[20px] border border-[#334155]/60 bg-[#0C1523]/80 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748B]">
              SYSTEM TELEMETRY
            </div>
            <Link to="/app/activity" className="font-mono text-[11px] text-[#00D1FF]">
              All →
            </Link>
          </div>

          <div className="relative pl-4 space-y-3.5">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-[#00D1FF]/50 to-transparent" />
            {activityEvents.map((ev) => (
              <div key={ev.id} className="relative flex items-start gap-2.5">
                <div className="absolute -left-[15px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#020407] border border-[#334155]">
                  <span className={`h-1 w-1 rounded-full ${ev.color === "text-[#00D1FF]" ? "bg-[#00D1FF]" : ev.color === "text-[#F59E0B]" ? "bg-[#F59E0B]" : "bg-[#885CF6]"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#E2E8F0] truncate">{ev.title}</span>
                    <span className="text-[9px] font-mono text-[#64748B]">{ev.time}</span>
                  </div>
                  <div className="text-[10.5px] font-mono text-[#94A3B8] truncate">{ev.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
