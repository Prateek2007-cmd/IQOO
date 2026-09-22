/**
 * Settings — how NeoBrain behaves for you.
 *
 * Every switch here writes to the local store and takes effect immediately:
 * awareness and memory rules change the capture pipeline, and appearance options
 * change how the app renders.
 */

import {
  Bell,
  Copy,
  Cpu,
  Gauge,
  Info,
  ListChecks,
  Lock,
  LogOut,
  MonitorSmartphone,
  Palette,
  ScanLine,
  Settings2,
  Sliders,
  Sparkles,
  User,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  Panel,
  SectionHeading,
  StateBlock,
  Switch,
  TechLabel,
} from "../components/ui";
import { providerReport } from "../lib/engine";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";

export default function SettingsPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, session, updateSettings, signOut, logActivity } = useBrain();
  const counts = useCounts();
  const [name, setName] = useState(session.name);

  const settings = state.settings;
  const providers = providerReport(settings.privacy.cloudServices);

  const awareness = settings.awareness;
  const memory = settings.memory;
  const appearance = settings.appearance;

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Settings" tagline="Control how NeoBrain works." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1320px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-8">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
              ◆ SYSTEM CONFIGURATION
            </div>
            <h1 className="mt-2 font-display text-[38px] font-semibold leading-[1.05] text-[#E2E8F0]">
              Control how NeoBrain works.
            </h1>
            <p className="mt-3 max-w-[66ch] text-[13px] leading-relaxed text-[#94A3B8]">
              Configure awareness heuristics, memory retention thresholds, sovereign processing limits, and hardware density.
              All parameters take effect instantly on this device.
            </p>
          </header>
        ) : null}

        {/* Profile hero strip */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#334155]/40 bg-[#0B1320]/50 p-5 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#3882F6] to-[#00D1FF] shadow-[0_0_20px_rgba(0,209,255,0.5)]">
            <span className="text-[22px] font-bold text-black">
              {session.name ? session.name[0].toUpperCase() : "P"}
            </span>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#020407] bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[16px] font-semibold text-[#E2E8F0]">{session.name || "Prateek"}</div>
            <div className="mt-0.5 flex items-center gap-3 font-mono text-[10px] text-[#64748B]">
              <span>Session active</span>
              <span className="h-px w-3 bg-[#334155]/50" />
              <span>
                Since{" "}
                {new Date(session.startedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="h-px w-3 bg-[#334155]/50" />
              <span>{counts.memories} memories</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                signOut();
                navigate("/auth?returnTo=%2Fapp", { replace: true });
              }}
            >
              <LogOut size={13} /> Lock Session
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* ── Awareness ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
              ✦ AWARENESS HEURISTICS
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
              Perception & Background Scanning
            </h2>
            <div className="mt-4 divide-y divide-[#334155]/30">
              <Switch
                label="Always Available"
                description="Keeps the local vector and tokenizer pipeline warm in memory for instantaneous recall."
                checked={awareness.alwaysAvailable}
                onChange={(next) => updateSettings({ awareness: { alwaysAvailable: next } })}
              />
              <Switch
                label="Speech Detection"
                description="Permits voice mode to open the local audio stream when invoked."
                checked={awareness.speechDetection}
                onChange={(next) => updateSettings({ awareness: { speechDetection: next } })}
              />
              <Switch
                label="Periodic Context Scanning"
                description="Continuously scans permitted directories for document changes in the background."
                checked={awareness.periodicScanning}
                onChange={(next) => updateSettings({ awareness: { periodicScanning: next } })}
              />
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-[13px] font-medium text-[#E2E8F0]">Scan Interval</div>
                  <div className="mt-0.5 text-[11px] text-[#64748B]">
                    Frequency of automated folder re-indexing
                  </div>
                </div>
                <select
                  className="h-9 w-[130px] rounded-lg border border-[#334155]/40 bg-[#020407]/60 px-3 font-mono text-[12px] text-[#E2E8F0] outline-none transition-all focus:border-[#00D1FF]/40"
                  value={awareness.scanIntervalMinutes}
                  onChange={(event) =>
                    updateSettings({ awareness: { scanIntervalMinutes: Number(event.target.value) } })
                  }
                  aria-label="Scan interval"
                >
                  {[5, 10, 30, 60].map((minutes) => (
                    <option key={minutes} value={minutes} className="bg-[#0A0F1C]">
                      {minutes} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!awareness.speechDetection ? (
              <div className="mt-4">
                <StateBlock
                  kind="mic"
                  title="Voice capture is suspended"
                  description="Voice mode will indicate that microphone access is disabled."
                  compact
                />
              </div>
            ) : null}
          </div>

          {/* ── Memory ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#885CF6]">
              ✦ MEMORY CLASSIFICATION
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
              Retention & Semantic Filtering
            </h2>
            <div className="mt-4 divide-y divide-[#334155]/30">
              <Switch
                label="Autonomous Memory Capture"
                description="Automatically files high-signal captures into your second brain without manual confirmation prompts."
                checked={memory.automaticMemory}
                onChange={(next) => updateSettings({ memory: { automaticMemory: next } })}
              />
              <Switch
                label="Decision Detection"
                description="Automatically flags key decisions as permanent structured beacons in your knowledge graph."
                checked={memory.decisionDetection}
                onChange={(next) => updateSettings({ memory: { decisionDetection: next } })}
              />
              <Switch
                label="Ephemeral Session Buffering"
                description="Retains short-term conversational context only for the duration of the current session."
                checked={memory.temporaryRetention}
                onChange={(next) => updateSettings({ memory: { temporaryRetention: next } })}
              />
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-[13px] font-medium text-[#E2E8F0]">Default Retention Lifetime</div>
                  <div className="mt-0.5 text-[11px] text-[#64748B]">
                    Lifespan before candidate memories transition to archive
                  </div>
                </div>
                <select
                  className="h-9 w-[130px] rounded-lg border border-[#334155]/40 bg-[#020407]/60 px-3 font-mono text-[12px] text-[#E2E8F0] outline-none transition-all focus:border-[#00D1FF]/40"
                  value={memory.retentionDays}
                  onChange={(event) => updateSettings({ memory: { retentionDays: Number(event.target.value) } })}
                  aria-label="Memory retention"
                >
                  {[7, 30, 90, 365].map((days) => (
                    <option key={days} value={days} className="bg-[#0A0F1C]">
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-[#00D1FF]">{counts.memories} stored</span>
              <span className="h-px w-3 bg-[#334155]/50" />
              <span className="text-[#F59E0B]">{counts.candidates} awaiting</span>
              <Link to="/app/memory" className="ml-auto text-[#00D1FF] hover:underline">
                Review memory graph →
              </Link>
            </div>
          </div>

          {/* ── Privacy & Processing ──────────────────────────── */}
          <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#10B981]">
              ✦ SOVEREIGN PROCESSING
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
              Audio & Privacy Limits
            </h2>
            <div className="mt-4 divide-y divide-[#334155]/30">
              <Switch
                label="Local Processing Exclusively"
                description="Enforces strict local compute boundaries: remote inference endpoints are blocked."
                checked={settings.privacy.localProcessingOnly}
                onChange={(next) =>
                  updateSettings({
                    privacy: { localProcessingOnly: next, cloudServices: next ? false : settings.privacy.cloudServices },
                  })
                }
              />
              <Switch
                label="Store Raw Audio Streams"
                description="Off by default: phonetic transcripts are stored; raw audio buffers are immediately flushed."
                checked={settings.privacy.saveRawAudio}
                onChange={(next) => updateSettings({ privacy: { saveRawAudio: next, rawAudioStored: next } })}
              />
            </div>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />
            <div className="space-y-2.5 font-mono text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#94A3B8]">
                  <Cpu size={12} className="text-[#00D1FF]" /> {providers.inference.label}
                </span>
                <span className="text-[10px] font-semibold uppercase text-[#10B981]">{providers.inference.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#94A3B8]">
                  <Waves size={12} className="text-[#3882F6]" /> {providers.speech.label}
                </span>
                <span className="text-[10px] font-semibold uppercase text-[#10B981]">{providers.speech.location}</span>
              </div>
            </div>
            <div className="mt-5">
              <Button size="sm" variant="ghost" onClick={() => navigate("/app/privacy")}>
                <Lock size={13} /> Open Privacy Dashboard
              </Button>
            </div>
          </div>

          {/* ── Appearance ────────────────────────────────────── */}
          <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">
              ✦ RENDERING ENGINE
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
              Appearance & Spatial Density
            </h2>
            <div className="mt-4 divide-y divide-[#334155]/30">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-[13px] font-medium text-[#E2E8F0]">Reduced Motion</div>
                  <div className="mt-0.5 text-[11px] text-[#64748B]">
                    Honors system accessibility preference by default
                  </div>
                </div>
                <select
                  className="h-9 w-[150px] rounded-lg border border-[#334155]/40 bg-[#020407]/60 px-3 font-mono text-[12px] text-[#E2E8F0] outline-none transition-all focus:border-[#00D1FF]/40"
                  value={appearance.reducedMotion === null ? "system" : appearance.reducedMotion ? "on" : "off"}
                  onChange={(event) =>
                    updateSettings({
                      appearance: {
                        reducedMotion:
                          event.target.value === "system" ? null : event.target.value === "on",
                      },
                    })
                  }
                  aria-label="Reduced motion"
                >
                  <option value="system" className="bg-[#0A0F1C]">System Default</option>
                  <option value="on" className="bg-[#0A0F1C]">Always Reduce</option>
                  <option value="off" className="bg-[#0A0F1C]">Never Reduce</option>
                </select>
              </div>
              <Switch
                label="High-Density Layout"
                description="Tightens panel padding and list row margins for workstation displays."
                checked={appearance.compactDensity}
                onChange={(next) => updateSettings({ appearance: { compactDensity: next } })}
              />
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#334155]/20 bg-[#020407]/40 p-3.5">
              <Palette size={13} className="mt-0.5 shrink-0 text-[#00D1FF]" />
              <p className="text-[11px] leading-relaxed text-[#64748B]">
                The 3D NeoBrain Core automatically throttles shader loops and particle emitters when reduced motion is
                engaged.
              </p>
            </div>
          </div>

          {/* ── Identity ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              ✦ LOCAL IDENTITY
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
              Operator Profile
            </h2>
            <div className="mt-4">
              <label htmlFor="settings-name" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">
                Operator Display Name
              </label>
              <div className="flex gap-2">
                <input
                  id="settings-name"
                  className="flex-1 rounded-lg border border-[#334155]/40 bg-[#020407]/60 px-3.5 py-2.5 text-[14px] font-medium text-[#E2E8F0] outline-none transition-all focus:border-[#00D1FF]/40 focus:shadow-[0_0_12px_-4px_rgba(0,209,255,0.3)]"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Button
                  onClick={() => {
                    updateSettings({ profile: { name: name.trim() || "Prateek" } });
                    logActivity({ type: "context", title: "Profile updated", detail: name, status: "done" });
                  }}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 font-mono text-[12px]">
              {[
                { icon: User, label: "Active Session", value: session.name || "Prateek", color: "text-[#00D1FF]" },
                {
                  icon: ScanLine,
                  label: "Initialized At",
                  value: new Date(session.startedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                  color: "text-[#3882F6]",
                },
                { icon: ListChecks, label: "Voice Wake Engine", value: "Offline Standby", color: "text-[#885CF6]" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between border-b border-[#334155]/25 pb-2.5">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <Icon size={12} className={row.color} /> {row.label}
                    </span>
                    <span className="text-[#E2E8F0] font-medium">{row.value}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  updateSettings({ profile: { wakeWordEnabled: !settings.profile.wakeWordEnabled } })
                }
              >
                <Bell size={13} />
                {settings.profile.wakeWordEnabled ? "Disable Keyword Detector" : "Enable Keyword Detector"}
              </Button>
            </div>
          </div>

          {/* ── Hardware & Build ───────────────────────────────── */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                    ✦ HARDWARE NODES
                  </div>
                  <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
                    Ecosystem Pairing
                  </h2>
                </div>
                <Link to="/app/devices" className="font-mono text-[11px] text-[#00D1FF] hover:underline">
                  Manage →
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {state.devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#334155]/25 bg-[#020407]/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-[#E2E8F0]">{device.name}</div>
                      <div className="mt-0.5 text-[10px] text-[#64748B]">
                        {device.processingRole === "deep" ? "Deep Brain Node" : "Pocket Brain Node"} · {device.model}
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                        device.connectionStatus === "connected"
                          ? "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]"
                          : "border-[#334155]/40 text-[#94A3B8]"
                      }`}
                    >
                      {device.connectionStatus === "connected" ? "SYNCED" : device.connectionStatus.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                ✦ ENGINE MANIFEST
              </div>
              <h2 className="mt-1.5 font-display text-[18px] font-semibold text-[#E2E8F0]">
                Build & System Info
              </h2>
              <div className="mt-4 space-y-2 font-mono text-[12px]">
                {[
                  { label: "Product Core", value: "NeoBrain Sovereign AI v2.4" },
                  { label: "Storage Engine", value: "IndexedDB / LocalStorage Encrypted" },
                  { label: "Graph Engine", value: "In-Memory Semantic Vector Graph" },
                  { label: "Inference Boundary", value: providers.inference.label },
                  { label: "Retrieval Topology", value: providers.retrieval.label },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#334155]/25 pb-2">
                    <span className="text-[#64748B]">{row.label}</span>
                    <span className="text-[#E2E8F0] font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate("/app/boot")}>
                  <Gauge size={13} /> Replay Boot Diagnostics
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                  <MonitorSmartphone size={13} /> View Public Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
