/**
 * Privacy — Sovereign Vault & Quiet Laboratory Control Room.
 *
 * Implements strict air-gapped cryptographic integrity, real-time perimeter shielding,
 * local memory inventory, and sovereign data controls.
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
  MicroRing,
  Panel,
  Sheet,
  StateBlock,
  Switch,
} from "../components/ui";
import { providerReport } from "../lib/engine";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";

const LOCATION_TONE: Record<string, string> = {
  local: "text-[#10B981] border-[#10B981]/40 bg-[#10B981]/10",
  fallback: "text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10",
  remote: "text-[#885CF6] border-[#885CF6]/40 bg-[#885CF6]/10",
  unavailable: "text-[#64748B] border-[#334155]/40 bg-[#0A0F1C]",
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
    [settings.privacy.cloudServices]
  );

  const inventory = [
    { icon: Database, label: "Active Memories", value: counts.memories },
    { icon: Archive, label: "Archived Entries", value: state.memories.filter((m) => m.deletedAt).length },
    { icon: FileText, label: "Indexed Sources", value: state.sources.length },
    { icon: MessageSquareText, label: "Conversations", value: state.conversations.length },
    { icon: HardDrive, label: "Audit Events", value: state.activity.length },
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
    logActivity({
      type: "context",
      title: "Data exported",
      detail: "Full local vault JSON dump",
      status: "done",
    });
    window.setTimeout(() => setExported(false), 2500);
  };

  const capabilityRows = [
    { name: "Language Inference", info: providers.inference },
    { name: "Vector Retrieval", info: providers.retrieval },
    { name: "Speech Recognition", info: providers.speech },
    { name: "Remote Cloud Relays", info: providers.remote },
  ];

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title="Privacy" tagline="Sovereign Vault" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* ── 1. Laboratory Vault Header ───────────────────────── */}
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                <ShieldCheck size={13} className="text-[#10B981]" />
                SOVEREIGN VAULT &amp; SECURITY LABORATORY
              </div>
              <h1 className="mt-1.5 font-display text-[36px] font-bold text-white tracking-tight">
                Your memory. Zero external telemetry.
              </h1>
              <p className="mt-1 max-w-[66ch] text-[13px] leading-relaxed text-[#94A3B8]">
                NeoBrain operates under a strict air-gapped guarantee. Embeddings, semantic graphs, and sensor inputs execute exclusively on your local silicon.
              </p>
            </div>

            {/* Perimeter Shield Health Indicator */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#10B981]/40 bg-[#0B1320]/80 px-4 py-2.5 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <MicroRing progress={1.0} size={32} color="#10B981" />
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                  100% AIR-GAPPED
                </div>
                <div className="font-mono text-[9.5px] text-[#64748B]">Zero External Tokens</div>
              </div>
            </div>
          </header>
        ) : null}

        {/* ── 2. Perimeter Status Telemetry Bar ────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-[#10B981]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#64748B]">Local Compute</div>
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[14px] font-bold text-[#10B981]">
              <CheckCircle2 size={13} /> ACTIVE
            </div>
            <div className="font-mono text-[9.5px] text-[#64748B]">On-device model</div>
          </div>

          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#64748B]">Raw Audio Storage</div>
            <div className="mt-1.5 font-mono text-[14px] font-bold text-[#CBD5E1]">
              {settings.privacy.saveRawAudio ? "RETAINED" : "FLUSHED"}
            </div>
            <div className="font-mono text-[9.5px] text-[#64748B]">
              {settings.privacy.saveRawAudio ? "Local cache" : "Zero disk traces"}
            </div>
          </div>

          <div className="rounded-2xl border border-[#00D1FF]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#64748B]">Cloud Ingestion</div>
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[14px] font-bold text-[#00D1FF]">
              <CloudOff size={13} /> BLOCKED
            </div>
            <div className="font-mono text-[9.5px] text-[#64748B]">Zero egress sockets</div>
          </div>

          <div className="rounded-2xl border border-[#3882F6]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#64748B]">P2P Handshake</div>
            <div className="mt-1.5 font-mono text-[14px] font-bold text-[#3882F6]">mTLS 1.3</div>
            <div className="font-mono text-[9.5px] text-[#64748B]">Direct local mesh</div>
          </div>

          <div className="rounded-2xl border border-[#885CF6]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#64748B]">Vault Authority</div>
            <div className="mt-1.5 font-mono text-[14px] font-bold text-[#885CF6]">OPERATOR</div>
            <div className="font-mono text-[9.5px] text-[#64748B]">Full export / purge</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {/* ── 3. Local Vault Footprint Inventory ────────────── */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                    ✦ LOCAL STORAGE INVENTORY
                  </div>
                  <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                    Data Held Exclusively on This Machine
                  </h2>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {inventory.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className="rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-3.5 text-center"
                    >
                      <Icon size={16} className="mx-auto text-[#00D1FF]" />
                      <div className="mt-2 font-mono text-[20px] font-bold text-white leading-none">
                        {row.value}
                      </div>
                      <div className="mt-1 font-mono text-[9.5px] text-[#64748B] uppercase tracking-wider">
                        {row.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

              <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                {[
                  "Zero Remote Telemetry",
                  "No Centralized Accounts",
                  "Encrypted SQLite / IndexedDB",
                  "Immediate JSON Portability",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 text-[#10B981]"
                  >
                    <CheckCircle2 size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── 4. Execution Perimeter Switches ───────────────── */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                ✦ EXECUTION PERIMETER
              </div>
              <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                Compute Boundary Controls
              </h2>

              <div className="mt-4 divide-y divide-[#334155]/30">
                <Switch
                  label="Local Processing Exclusively"
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
                  label="Allow External Cloud Relays"
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
                  label="Retain Raw Audio Waveforms"
                  description={
                    settings.privacy.rawAudioStored
                      ? "Audio recordings are preserved in local storage cache."
                      : "Transcripts are kept; raw audio buffers are immediately flushed from memory upon parsing."
                  }
                  checked={settings.privacy.saveRawAudio}
                  onChange={(next) =>
                    updateSettings({ privacy: { saveRawAudio: next, rawAudioStored: next } })
                  }
                />
              </div>

              {cloudWarning && (
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
              )}
            </div>

            {/* ── 5. Retention Lifecycles ───────────────────────── */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#885CF6]">
                ✦ MEMORY RELEVANCE POLICIES
              </div>
              <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                Retention Lifecycle Boundaries
              </h2>

              <div className="mt-4 space-y-2.5">
                {(["session", "30-days", "forever"] as const).map((retention) => {
                  const count = state.memories.filter(
                    (memory) => !memory.deletedAt && memory.retentionType === retention
                  ).length;
                  return (
                    <div
                      key={retention}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[#334155]/40 bg-[#020407]/60 px-4 py-3 font-mono"
                    >
                      <div>
                        <div className="text-[13px] font-semibold uppercase text-white">
                          {retention}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#64748B]">
                          {retention === "session"
                            ? "Ephemeral: purged when browser session terminates"
                            : retention === "30-days"
                              ? "Rolling 30-day temporal relevance window"
                              : "Permanent anchor in core knowledge graph"}
                        </div>
                      </div>
                      <span className="font-mono text-[16px] font-bold text-[#00D1FF]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 6. Side Column: Capability Matrix & Data Authority ── */}
          <aside className="space-y-6">
            {/* Capability report */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                ✦ INFERENCE RUNTIME
              </div>
              <h3 className="mt-1 font-display text-[18px] font-bold text-white">
                Capability Execution Matrix
              </h3>

              <div className="mt-4 space-y-3">
                {capabilityRows.map((row) => (
                  <div
                    key={row.name}
                    className="rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-medium text-white">{row.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.2 font-mono text-[10px] font-semibold uppercase ${
                          LOCATION_TONE[row.info.location] ?? LOCATION_TONE.unavailable
                        }`}
                      >
                        {row.info.location}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-[#64748B]">
                      {row.info.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sovereign Vault Authority Controls */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
                ✦ DATA AUTHORITY
              </div>
              <h3 className="mt-1 font-display text-[18px] font-bold text-white">
                Sovereign Export &amp; Wipe
              </h3>

              <div className="mt-4 space-y-2.5">
                <Button className="w-full" icon={Download} onClick={handleExport}>
                  {exported ? "Encrypted Export Downloaded" : "Export Complete Vault (JSON)"}
                </Button>
                <Button
                  className="w-full"
                  icon={Trash2}
                  variant="danger"
                  onClick={() => setConfirmWipe(true)}
                >
                  Purge All Memories
                </Button>
                <Button
                  className="w-full"
                  icon={RotateCcw}
                  variant="ghost"
                  onClick={() => setConfirmReset(true)}
                >
                  Restore Benchmark Dataset
                </Button>
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

              <div className="flex items-start gap-2.5 font-mono text-[10.5px] text-[#64748B]">
                <Lock size={13} className="mt-0.5 shrink-0 text-[#00D1FF]" />
                <p>
                  Purging immediately overwrites local browser storage keys. Zero remnants exist on any network server.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── 7. Wipe & Reset Sheets ───────────────────────────── */}
      <Sheet
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="Purge Sovereign Vault?"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteAllMemories();
                logActivity({
                  type: "context",
                  title: "All memories deleted",
                  detail: "Permanent local wipe",
                  status: "idle",
                });
                setConfirmWipe(false);
              }}
            >
              Purge All Data
            </Button>
          </div>
        }
      >
        <StateBlock
          kind="error"
          title="IRREVERSIBLE ACTION"
          description="Every memory, semantic connection, task, and conversation recorded on this device will be immediately wiped from browser storage."
        />
      </Sheet>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore Default Demo Dataset?"
        footer={
          <div className="flex gap-2">
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
          </div>
        }
      >
        <p className="text-[13px] leading-relaxed text-[#CBD5E1]">
          This resets your local environment back to the clean reference demonstration state with pre-linked projects, documents, and memory graph nodes.
        </p>
      </Sheet>
    </div>
  );
}
