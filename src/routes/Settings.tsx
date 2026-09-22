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
  LogOut,
  MonitorSmartphone,
  Palette,
  ScanLine,
  Settings2,
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

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6">
            <TechLabel tone="cyan">Settings</TechLabel>
            <h1 className="mt-2 title-xl">Control how NeoBrain works.</h1>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-txt-secondary">
              Awareness, memory rules, processing and appearance. Changes apply immediately and are
              stored on this device.
            </p>
          </header>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* awareness */}
          <Panel className="p-5">
            <SectionHeading label="Awareness" title="When NeoBrain pays attention" />
            <div className="mt-2 divide-y divide-line-subtle">
              <Switch
                label="Always available"
                description="Keeps the local pipeline warm so capture starts instantly."
                checked={awareness.alwaysAvailable}
                onChange={(next) => updateSettings({ awareness: { alwaysAvailable: next } })}
              />
              <Switch
                label="Speech detection"
                description="Allows voice mode to open the microphone when you ask it to."
                checked={awareness.speechDetection}
                onChange={(next) => updateSettings({ awareness: { speechDetection: next } })}
              />
              <Switch
                label="Periodic context scanning"
                description="Re-checks indexed files for changes on a schedule."
                checked={awareness.periodicScanning}
                onChange={(next) => updateSettings({ awareness: { periodicScanning: next } })}
              />
              <div className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="text-[13.5px] font-medium text-txt-primary">Scan interval</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    How often permitted folders are re-checked
                  </div>
                </div>
                <select
                  className="input h-10 w-[130px]"
                  value={awareness.scanIntervalMinutes}
                  onChange={(event) =>
                    updateSettings({ awareness: { scanIntervalMinutes: Number(event.target.value) } })
                  }
                  aria-label="Scan interval"
                >
                  {[5, 10, 30, 60].map((minutes) => (
                    <option key={minutes} value={minutes} className="bg-ink-800">
                      {minutes} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!awareness.speechDetection ? (
              <div className="mt-3">
                <StateBlock
                  kind="mic"
                  title="Voice capture is off"
                  description="Voice mode will explain that speech detection is disabled instead of opening the microphone."
                  compact
                />
              </div>
            ) : null}
          </Panel>

          {/* memory */}
          <Panel className="p-5">
            <SectionHeading label="Memory" title="What gets remembered" />
            <div className="mt-2 divide-y divide-line-subtle">
              <Switch
                label="Automatic memory"
                description="Stores clearly useful captures without asking first."
                checked={memory.automaticMemory}
                onChange={(next) => updateSettings({ memory: { automaticMemory: next } })}
              />
              <Switch
                label="Decision detection"
                description="Flags decisions as structured, long-term memories."
                checked={memory.decisionDetection}
                onChange={(next) => updateSettings({ memory: { decisionDetection: next } })}
              />
              <Switch
                label="Temporary retention"
                description="Keeps short-lived context for the session only."
                checked={memory.temporaryRetention}
                onChange={(next) => updateSettings({ memory: { temporaryRetention: next } })}
              />
              <div className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="text-[13.5px] font-medium text-txt-primary">Memory retention</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    Default lifetime for new memories
                  </div>
                </div>
                <select
                  className="input h-10 w-[130px]"
                  value={memory.retentionDays}
                  onChange={(event) => updateSettings({ memory: { retentionDays: Number(event.target.value) } })}
                  aria-label="Memory retention"
                >
                  {[7, 30, 90, 365].map((days) => (
                    <option key={days} value={days} className="bg-ink-800">
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="divider my-4" />
            <div className="flex flex-wrap items-center gap-2">
              <Chip as="span">{counts.memories} stored</Chip>
              <Chip as="span">{counts.candidates} awaiting review</Chip>
              <Link to="/app/memory" className="text-[11.5px] text-cyanx">
                Review memories
              </Link>
            </div>
          </Panel>

          {/* audio + privacy */}
          <Panel className="p-5">
            <SectionHeading label="Audio & privacy" title="Processing location" />
            <div className="mt-2 divide-y divide-line-subtle">
              <Switch
                label="Local processing only"
                description="Disables any remote provider for retrieval and inference."
                checked={settings.privacy.localProcessingOnly}
                onChange={(next) =>
                  updateSettings({
                    privacy: { localProcessingOnly: next, cloudServices: next ? false : settings.privacy.cloudServices },
                  })
                }
              />
              <Switch
                label="Save raw audio"
                description="Off by default: transcripts are stored, audio is not."
                checked={settings.privacy.saveRawAudio}
                onChange={(next) => updateSettings({ privacy: { saveRawAudio: next, rawAudioStored: next } })}
              />
            </div>
            <div className="divider my-4" />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <Cpu size={13} /> {providers.inference.label}
                </span>
                <span className="text-txt-muted">{providers.inference.location}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <Waves size={13} /> {providers.speech.label}
                </span>
                <span className="text-txt-muted">{providers.speech.location}</span>
              </div>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="ghost" onClick={() => navigate("/app/privacy")}>
                <Sparkles size={13} /> Open privacy dashboard
              </Button>
            </div>
          </Panel>

          {/* appearance */}
          <Panel className="p-5">
            <SectionHeading label="Appearance" title="Motion and density" />
            <div className="mt-2 divide-y divide-line-subtle">
              <div className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="text-[13.5px] font-medium text-txt-primary">Reduced motion</div>
                  <div className="mt-0.5 text-[11.5px] text-txt-muted">
                    Follows your system setting unless you override it
                  </div>
                </div>
                <select
                  className="input h-10 w-[150px]"
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
                  <option value="system" className="bg-ink-800">
                    System setting
                  </option>
                  <option value="on" className="bg-ink-800">
                    Always reduce
                  </option>
                  <option value="off" className="bg-ink-800">
                    Never reduce
                  </option>
                </select>
              </div>
              <Switch
                label="Compact density"
                description="Tightens spacing in lists and panels."
                checked={appearance.compactDensity}
                onChange={(next) => updateSettings({ appearance: { compactDensity: next } })}
              />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Palette size={14} className="mt-0.5 shrink-0 text-cyanx" />
              <p className="text-[11px] leading-relaxed text-txt-muted">
                The core animation honours your motion preference and renders a single static frame
                when motion is reduced.
              </p>
            </div>
          </Panel>

          {/* profile */}
          <Panel className="p-5">
            <SectionHeading label="Profile" title="This device" />
            <div className="mt-4">
              <label htmlFor="settings-name" className="label mb-2 block">
                Display name
              </label>
              <div className="flex gap-2">
                <input
                  id="settings-name"
                  className="input flex-1"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Button
                  onClick={() => {
                    updateSettings({ profile: { name: name.trim() || "You" } });
                    logActivity({ type: "context", title: "Profile updated", detail: name, status: "done" });
                  }}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <User size={13} /> Local profile
                </span>
                <span className="text-txt-primary">{session.name || "Unnamed"}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <ScanLine size={13} /> Session started
                </span>
                <span className="text-txt-primary">
                  {new Date(session.startedAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <ListChecks size={13} /> Wake word
                </span>
                <span className="text-txt-muted">Requires device build</span>
              </div>
            </div>

            <div className="divider my-4" />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  updateSettings({ profile: { wakeWordEnabled: !settings.profile.wakeWordEnabled } })
                }
              >
                <Bell size={13} />
                {settings.profile.wakeWordEnabled ? "Disable wake word" : "Enable wake word"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  signOut();
                  navigate("/auth?returnTo=%2Fapp", { replace: true });
                }}
              >
                <LogOut size={13} /> Sign out of this device
              </Button>
            </div>
            {settings.profile.wakeWordEnabled ? (
              <div className="mt-3">
                <StateBlock
                  kind="permission"
                  title="Wake word needs the Android build"
                  description="Always-on keyword detection requires the native audio pipeline and a battery-aware foreground service."
                  compact
                />
              </div>
            ) : null}
          </Panel>

          {/* devices + about */}
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionHeading
                label="Devices"
                title="Connected hardware"
                action={
                  <Link to="/app/devices" className="text-[11.5px] text-cyanx">
                    Manage
                  </Link>
                }
              />
              <div className="mt-3.5 space-y-2.5">
                {state.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between gap-4 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] text-txt-primary">{device.name}</div>
                      <div className="mt-0.5 text-[10.5px] text-txt-muted">
                        {device.processingRole === "deep" ? "Deep Brain" : "Pocket Brain"} · {device.model}
                      </div>
                    </div>
                    <span className="text-[11.5px] text-txt-secondary">
                      {device.connectionStatus === "connected"
                        ? "Connected"
                        : device.connectionStatus === "syncing"
                          ? "Syncing"
                          : device.connectionStatus === "connecting"
                            ? "Connecting"
                            : "Not connected"}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="About" title="Build information" />
              <div className="mt-3.5 space-y-2.5">
                {[
                  { label: "Product", value: "NeoBrain · prototype" },
                  { label: "Storage", value: "Local browser storage" },
                  { label: "Backend", value: "None — fully local" },
                  { label: "Inference", value: providers.inference.label },
                  { label: "Retrieval", value: providers.retrieval.label },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-[12px]">
                    <span className="text-txt-muted">{row.label}</span>
                    <span className="text-right text-txt-secondary">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="divider my-4" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate("/app/boot")}>
                  <Gauge size={13} /> Replay boot sequence
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                  <MonitorSmartphone size={13} /> View public site
                </Button>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Info size={14} className="mt-0.5 shrink-0 text-txt-muted" />
                <p className="text-[11px] leading-relaxed text-txt-muted">
                  NeoBrain is honest about scope: memories, classification, retrieval and answers are
                  real and local. Device transport and on-device model inference are design
                  foundations, not shipping features.
                </p>
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Danger zone" title="Local data" />
              <p className="mt-2.5 text-[12px] leading-relaxed text-txt-secondary">
                Export or remove everything stored on this device from the privacy dashboard.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate("/app/privacy")}>
                  <Copy size={13} /> Privacy controls
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate("/app/settings")}>
                  <Settings2 size={13} /> You are here
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
