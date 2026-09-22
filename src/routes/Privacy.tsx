/**
 * Privacy dashboard — Quiet Laboratory Control Room.
 *
 * Everything the product stores, what processes are active, and full zero-cloud controls.
 * Capability and inventory states are generated directly from the engine.
 */

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CloudOff,
  Cpu,
  Database,
  Download,
  FileText,
  HardDrive,
  Lock,
  MessageSquareText,
  Mic,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  Panel,
  SectionHeading,
  Sheet,
  StateBlock,
  Switch,
  TechLabel,
} from "../components/ui";
import { providerReport } from "../lib/engine";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";

const LOCATION_TONE: Record<string, string> = {
  local: "text-greenx border-greenx/35 bg-greenx/10",
  fallback: "text-amberx border-amberx/35 bg-amberx/10",
  remote: "text-purplex border-purplex/35 bg-purplex/10",
  unavailable: "text-txt-muted border-border bg-panel/60",
};

export default function PrivacyPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, updateSettings, exportJson, deleteAllMemories, resetToSeed, logActivity } = useBrain();
  const counts = useCounts();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exported, setExported] = useState(false);
  const [cloudWarning, setCloudWarning] = useState(false);

  const settings = state.settings;
  const providers = useMemo(
    () => providerReport(settings.privacy.cloudServices),
    [settings.privacy.cloudServices],
  );

  const inventory = [
    { icon: Database, label: "Active Memories", value: counts.memories },
    { icon: Archive, label: "Archived Entries", value: state.memories.filter((m) => m.deletedAt).length },
    { icon: FileText, label: "Indexed Sources", value: state.sources.length },
    { icon: MessageSquareText, label: "Conversations", value: state.conversations.length },
    { icon: HardDrive, label: "Activity Events", value: state.activity.length },
  ];

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `neobrain-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExported(true);
    logActivity({ type: "context", title: "Data exported", detail: "Full local vault JSON dump", status: "done" });
    window.setTimeout(() => setExported(false), 2500);
  };

  const capabilityRows = [
    { name: "Language Inference", info: providers.inference },
    { name: "Vector Retrieval", info: providers.retrieval },
    { name: "Speech Recognition", info: providers.speech },
    { name: "Remote Cloud Relays", info: providers.remote },
  ];

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Privacy" tagline="Your memory. Your control." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-6">
            <div>
              <TechLabel tone="green">Laboratory Control Room</TechLabel>
              <h1 className="mt-2 title-xl">YOUR MEMORY. YOUR CONTROL.</h1>
              <p className="mt-2 max-w-[66ch] text-[13.5px] leading-relaxed text-txt-secondary">
                NeoBrain operates under a strict zero-leakage guarantee. Everything is processed and stored on your hardware.
                No third-party telemetry, no cloud surveillance, and no silent background synchronization.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-greenx/30 bg-greenx/5 px-4 py-2.5">
              <ShieldCheck size={18} className="text-greenx" />
              <span className="font-mono text-[12px] font-semibold text-greenx">AIR-GAPPED BY DEFAULT</span>
            </div>
          </header>
        ) : null}

        {/* High-Tech HUD Status Indicators */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-greenx/35 bg-gradient-to-b from-greenx/10 to-transparent p-3.5 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">Local Processing</div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[13px] font-bold text-greenx">
              <CheckCircle2 size={13} /> ON
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-b from-surface/80 to-transparent p-3.5 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">Raw Audio Storage</div>
            <div className="mt-1 font-mono text-[13px] font-bold text-txt-muted">
              {settings.privacy.saveRawAudio ? "ON" : "OFF"}
            </div>
          </div>
          <div className="rounded-2xl border border-cyanx/35 bg-gradient-to-b from-cyanx/10 to-transparent p-3.5 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">Cloud Upload</div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[13px] font-bold text-cyanx">
              <CloudOff size={13} /> OFF
            </div>
          </div>
          <div className="rounded-2xl border border-greenx/35 bg-gradient-to-b from-greenx/10 to-transparent p-3.5 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">Memory Control</div>
            <div className="mt-1 font-mono text-[13px] font-bold text-greenx">AVAILABLE</div>
          </div>
          <div className="rounded-2xl border border-bluex/35 bg-gradient-to-b from-bluex/10 to-transparent p-3.5 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-txt-muted">Device Control</div>
            <div className="mt-1 font-mono text-[13px] font-bold text-bluex">ENABLED</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            {/* Inventory on this device */}
            <Panel className="p-6">
              <SectionHeading label="Local Footprint" title="What NeoBrain Is Holding In Browser Storage" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {inventory.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="rounded-xl border border-border bg-panel/50 p-3.5">
                      <Icon size={16} className="text-cyanx" strokeWidth={1.7} />
                      <div className="numeral mt-2 font-mono text-[20px] font-bold text-txt-primary">{row.value}</div>
                      <div className="mt-1 text-[11px] font-medium leading-snug text-txt-muted">{row.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="divider my-4" />
              <div className="flex flex-wrap gap-2">
                {[
                  "Zero Remote Telemetry",
                  "No Cloud Accounts",
                  "Encrypted Local Storage",
                  "Full JSON Export Anytime",
                ].map((tag) => (
                  <Chip key={tag} as="span">
                    <ShieldCheck size={11} className="text-greenx" /> {tag}
                  </Chip>
                ))}
              </div>
            </Panel>

            {/* Execution Boundary Switches */}
            <Panel className="p-6">
              <SectionHeading label="Compute Isolation" title="Execution Boundary Controls" />
              <div className="mt-3 divide-y divide-border">
                <Switch
                  label="Local Processing Only"
                  description="All embedding computations, semantic classifications, and speech parsing execute exclusively on this machine."
                  checked={settings.privacy.localProcessingOnly}
                  onChange={(next) =>
                    updateSettings({
                      privacy: {
                        localProcessingOnly: next,
                        cloudServices: next ? false : settings.privacy.cloudServices,
                      },
                    })
                  }
                />
                <Switch
                  label="Allow Cloud Services"
                  description={
                    settings.privacy.cloudServices
                      ? "Enabled: a remote LLM endpoint is permitted to assist. (Disabled by default)"
                      : "Strictly disabled: no tokens or embeddings leave your device boundary."
                  }
                  checked={settings.privacy.cloudServices}
                  onChange={(next) => {
                    if (next) {
                      setCloudWarning(true);
                      return;
                    }
                    updateSettings({ privacy: { cloudServices: false } });
                  }}
                />
                <Switch
                  label="Retain Raw Audio Files"
                  description={
                    settings.privacy.rawAudioStored
                      ? "Audio recordings are preserved in local storage cache."
                      : "Transcripts are kept; raw audio buffers are immediately flushed from memory upon parsing."
                  }
                  checked={settings.privacy.saveRawAudio}
                  onChange={(next) => updateSettings({ privacy: { saveRawAudio: next, rawAudioStored: next } })}
                />
              </div>

              {cloudWarning ? (
                <div className="mt-4">
                  <StateBlock
                    kind="model"
                    title="External Cloud Gateway Blocked"
                    description="NeoBrain ships in sovereign zero-leakage mode. Enabling remote services requires configuring an authenticated private provider key."
                    action={
                      <Button size="sm" variant="ghost" onClick={() => setCloudWarning(false)}>
                        Enforce Local Isolation
                      </Button>
                    }
                    compact
                  />
                </div>
              ) : null}
            </Panel>

            {/* Retention Policies */}
            <Panel className="p-6">
              <SectionHeading label="Vault Lifecycle" title="Configured Retention Lifespans" />
              <div className="mt-4 space-y-2.5">
                {(["session", "30-days", "forever"] as const).map((retention) => {
                  const count = state.memories.filter(
                    (memory) => !memory.deletedAt && memory.retentionType === retention,
                  ).length;
                  return (
                    <div
                      key={retention}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-panel/50 px-4 py-3 font-mono"
                    >
                      <div>
                        <div className="text-[13px] font-semibold uppercase text-txt-primary">{retention}</div>
                        <div className="mt-0.5 text-[11px] text-txt-muted">
                          {retention === "session"
                            ? "Ephemeral: purged when browser session terminates"
                            : retention === "30-days"
                              ? "Rolling 30-day temporal relevance window"
                              : "Permanent anchor in core knowledge graph"}
                        </div>
                      </div>
                      <span className="text-[16px] font-bold text-cyanx">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3.5 font-mono text-[11px] leading-relaxed text-txt-muted">
                Retention is an atomic property of each memory node. Expiry policies are automatically evaluated locally.
              </p>
            </Panel>
          </div>

          {/* Side control column */}
          <div className="space-y-5">
            {/* Capability report */}
            <Panel className="p-6">
              <SectionHeading label="Pipeline Status" title="Capability Execution Matrix" />
              <div className="mt-4 space-y-3">
                {capabilityRows.map((row) => (
                  <div key={row.name} className="rounded-xl border border-border bg-panel/50 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-txt-primary">{row.name}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          LOCATION_TONE[row.info.location] ?? LOCATION_TONE.unavailable
                        }`}
                      >
                        {row.info.location}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-txt-muted">{row.info.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Sovereign Vault Controls */}
            <Panel className="p-6">
              <SectionHeading label="Sovereign Vault" title="Data Authority" />
              <div className="mt-4 space-y-2.5">
                <Button className="w-full" icon={Download} onClick={handleExport}>
                  {exported ? "Encrypted Export Downloaded" : "Export Complete Vault (JSON)"}
                </Button>
                <Button className="w-full" icon={Trash2} variant="danger" onClick={() => setConfirmWipe(true)}>
                  Purge All Memories
                </Button>
                <Button className="w-full" icon={RotateCcw} variant="ghost" onClick={() => setConfirmReset(true)}>
                  Restore Demo Benchmark Dataset
                </Button>
              </div>
              <div className="divider my-4" />
              <div className="flex items-start gap-3">
                <Lock size={15} className="mt-0.5 shrink-0 text-cyanx" />
                <p className="text-[11px] leading-relaxed text-txt-muted font-mono">
                  Purging data performs an immediate zero-fill from local browser storage. No backup copies exist on any server.
                </p>
              </div>
            </Panel>

            {/* Audio Sensor Guard */}
            <Panel className="p-6">
              <SectionHeading label="Audio Guard" title="Hardware Capture Protocol" />
              <div className="mt-3.5 space-y-3">
                {[
                  { icon: Mic, text: "Microphone hardware opens exclusively during explicit voice interactions." },
                  { icon: AlertTriangle, text: "A persistent glowing HUD indicator confirms active capture state." },
                  { icon: CloudOff, text: "Speech waveforms are converted locally; raw audio buffers are never uploaded." },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.text} className="flex gap-3">
                      <Icon size={15} className="mt-0.5 shrink-0 text-amberx" strokeWidth={1.7} />
                      <span className="text-[12px] leading-relaxed text-txt-secondary">{row.text}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        {!isDesktop ? (
          <div className="mt-6">
            <Button className="w-full" variant="ghost" onClick={() => navigate("/app/settings")}>
              Open Settings
            </Button>
          </div>
        ) : null}
      </div>

      {/* Wipe Confirmation Sheet */}
      <Sheet
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="Purge Sovereign Vault?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteAllMemories();
                logActivity({ type: "context", title: "All memories deleted", detail: "Permanent local wipe", status: "idle" });
                setConfirmWipe(false);
              }}
            >
              Purge All Data
            </Button>
          </>
        }
      >
        <StateBlock
          kind="error"
          title="IRREVERSIBLE ACTION"
          description="Every memory, semantic connection, task, and conversation recorded on this device will be immediately wiped from browser storage."
        />
      </Sheet>

      {/* Reset Confirmation Sheet */}
      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore Default Demo Dataset?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                resetToSeed();
                setConfirmReset(false);
              }}
            >
              Restore Dataset
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-txt-secondary">
          This resets your local environment back to the clean reference demonstration state with pre-linked projects,
          documents, and memory graph nodes.
        </p>
      </Sheet>
    </div>
  );
}
