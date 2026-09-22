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

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-8">
            <TechLabel tone="cyan">System Configuration</TechLabel>
            <h1 className="mt-2 title-xl">Control how NeoBrain works.</h1>
            <p className="mt-2 max-w-[66ch] text-[13.5px] leading-relaxed text-txt-secondary">
              Configure awareness heuristics, memory retention thresholds, sovereign processing limits, and hardware density.
              All parameters take effect instantly on this device.
            </p>
          </header>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Awareness heuristics */}
          <Panel className="p-6">
            <SectionHeading label="Awareness" title="Perception & Background Scanning" />
            <div className="mt-3 divide-y divide-border">
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
                  <div className="text-[13.5px] font-semibold text-txt-primary">Scan Interval</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    Frequency of automated folder re-indexing
                  </div>
                </div>
                <select
                  className="input h-10 w-[140px] bg-panel border-border font-mono text-[12px]"
                  value={awareness.scanIntervalMinutes}
                  onChange={(event) =>
                    updateSettings({ awareness: { scanIntervalMinutes: Number(event.target.value) } })
                  }
                  aria-label="Scan interval"
                >
                  {[5, 10, 30, 60].map((minutes) => (
                    <option key={minutes} value={minutes} className="bg-panel">
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
          </Panel>

          {/* Memory classification */}
          <Panel className="p-6">
            <SectionHeading label="Memory" title="Retention & Semantic Filtering" />
            <div className="mt-3 divide-y divide-border">
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
                  <div className="text-[13.5px] font-semibold text-txt-primary">Default Retention Lifetime</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    Lifespan before candidate memories transition to archive
                  </div>
                </div>
                <select
                  className="input h-10 w-[140px] bg-panel border-border font-mono text-[12px]"
                  value={memory.retentionDays}
                  onChange={(event) => updateSettings({ memory: { retentionDays: Number(event.target.value) } })}
                  aria-label="Memory retention"
                >
                  {[7, 30, 90, 365].map((days) => (
                    <option key={days} value={days} className="bg-panel">
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="divider my-4" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="micro-module text-cyanx">{counts.memories} memories stored</span>
              <span className="micro-module text-amberx">{counts.candidates} awaiting review</span>
              <Link to="/app/memory" className="font-mono text-[11px] text-cyanx hover:underline ml-auto">
                Review memory graph →
              </Link>
            </div>
          </Panel>

          {/* Audio & privacy */}
          <Panel className="p-6">
            <SectionHeading label="Audio & Privacy" title="Sovereign Processing Limits" />
            <div className="mt-3 divide-y divide-border">
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
            <div className="divider my-4" />
            <div className="space-y-3 font-mono text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <Cpu size={13} className="text-cyanx" /> {providers.inference.label}
                </span>
                <span className="text-greenx uppercase font-semibold">{providers.inference.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <Waves size={13} className="text-bluex" /> {providers.speech.label}
                </span>
                <span className="text-greenx uppercase font-semibold">{providers.speech.location}</span>
              </div>
            </div>
            <div className="mt-5">
              <Button size="sm" variant="secondary" onClick={() => navigate("/app/privacy")}>
                <Lock size={13} /> Open Laboratory Privacy Dashboard
              </Button>
            </div>
          </Panel>

          {/* Appearance & Rendering */}
          <Panel className="p-6">
            <SectionHeading label="Appearance" title="Rendering & Spatial Density" />
            <div className="mt-3 divide-y divide-border">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-[13.5px] font-semibold text-txt-primary">Reduced Motion</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    Honors system accessibility preference by default
                  </div>
                </div>
                <select
                  className="input h-10 w-[150px] bg-panel border-border font-mono text-[12px]"
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
                  <option value="system" className="bg-panel">
                    System Default
                  </option>
                  <option value="on" className="bg-panel">
                    Always Reduce
                  </option>
                  <option value="off" className="bg-panel">
                    Never Reduce
                  </option>
                </select>
              </div>
              <Switch
                label="High-Density Layout"
                description="Tightens panel padding and list row margins for workstation displays."
                checked={appearance.compactDensity}
                onChange={(next) => updateSettings({ appearance: { compactDensity: next } })}
              />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Palette size={14} className="mt-0.5 shrink-0 text-cyanx" />
              <p className="text-[11.5px] leading-relaxed text-txt-muted">
                The 3D NeoBrain Core automatically throttles shader loops and particle emitters when reduced motion is
                engaged.
              </p>
            </div>
          </Panel>

          {/* Profile card */}
          <Panel className="p-6">
            <SectionHeading label="Identity" title="Local Operator Profile" />
            <div className="mt-4">
              <label htmlFor="settings-name" className="label mb-2 block font-mono text-[11px] uppercase tracking-wider">
                Operator Display Name
              </label>
              <div className="flex gap-2">
                <input
                  id="settings-name"
                  className="input flex-1 bg-surface border-border font-medium"
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

            <div className="mt-5 space-y-3 font-mono text-[12px]">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <User size={13} className="text-cyanx" /> Active Session
                </span>
                <span className="text-txt-primary font-semibold">{session.name || "Prateek"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <ScanLine size={13} className="text-bluex" /> Initialized At
                </span>
                <span className="text-txt-muted">
                  {new Date(session.startedAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <ListChecks size={13} className="text-purplex" /> Voice Wake Engine
                </span>
                <span className="text-txt-muted">Offline Standby</span>
              </div>
            </div>

            <div className="divider my-5" />

            <div className="flex flex-wrap gap-2">
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
          </Panel>

          {/* Hardware & Diagnostics */}
          <div className="space-y-6">
            <Panel className="p-6">
              <SectionHeading
                label="Hardware Nodes"
                title="Ecosystem Pairing"
                action={
                  <Link to="/app/devices" className="font-mono text-[11px] text-cyanx hover:underline">
                    Manage →
                  </Link>
                }
              />
              <div className="mt-4 space-y-2.5 font-mono">
                {state.devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-panel/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-txt-primary">{device.name}</div>
                      <div className="mt-0.5 text-[11px] text-txt-muted">
                        {device.processingRole === "deep" ? "Deep Brain Node" : "Pocket Brain Node"} · {device.model}
                      </div>
                    </div>
                    <span className="micro-module text-greenx border-greenx/30">
                      {device.connectionStatus === "connected" ? "SYNCED" : device.connectionStatus.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHeading label="System" title="Build & Engine Manifest" />
              <div className="mt-4 space-y-2.5 font-mono text-[12px]">
                {[
                  { label: "Product Core", value: "NeoBrain Sovereign AI v2.4" },
                  { label: "Storage Engine", value: "IndexedDB / LocalStorage Encrypted" },
                  { label: "Graph Engine", value: "In-Memory Semantic Vector Graph" },
                  { label: "Inference Boundary", value: providers.inference.label },
                  { label: "Retrieval Topology", value: providers.retrieval.label },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 border-b border-border/40 pb-2">
                    <span className="text-txt-muted">{row.label}</span>
                    <span className="text-txt-primary font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="divider my-4" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate("/app/boot")}>
                  <Gauge size={13} /> Replay Boot Diagnostics
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                  <MonitorSmartphone size={13} /> View Public Cinematic Portal
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
