/**
 * Privacy dashboard.
 *
 * Everything the product stores, what is running, and the controls to remove it.
 * The capability table is generated from the engine itself, so it cannot drift
 * away from the truth of what is implemented.
 */

import {
  AlertTriangle,
  Archive,
  CloudOff,
  Database,
  Download,
  FileText,
  HardDrive,
  Lock,
  MessageSquareText,
  Mic,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCore } from "../components/BrainCore";
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
  remote: "text-violetx border-violetx/35 bg-violetx/10",
  unavailable: "text-txt-muted border-line-soft bg-ink-850/60",
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
    { icon: Database, label: "Memories", value: counts.memories },
    { icon: Archive, label: "Archived", value: state.memories.filter((memory) => memory.deletedAt).length },
    { icon: FileText, label: "Indexed sources", value: state.sources.length },
    { icon: MessageSquareText, label: "Conversations", value: state.conversations.length },
    { icon: HardDrive, label: "Activity entries", value: state.activity.length },
  ];

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `neobrain-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExported(true);
    logActivity({ type: "context", title: "Data exported", detail: "Local JSON export", status: "done" });
    window.setTimeout(() => setExported(false), 2500);
  };

  const capabilityRows = [
    { name: "Language inference", info: providers.inference },
    { name: "Retrieval", info: providers.retrieval },
    { name: "Speech recognition", info: providers.speech },
    { name: "Remote inference", info: providers.remote },
  ];

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Privacy" tagline="Your data. Your rules." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-6">
            <div>
              <TechLabel tone="green">Privacy</TechLabel>
              <h1 className="mt-2 title-xl">Your data. Your device. Your rules.</h1>
              <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-txt-secondary">
                This build stores everything in your browser. There is no account, no telemetry and no
                silent upload — and the capability table below is generated from the running code.
              </p>
            </div>
            <BrainCore state="connected" size={132} className="hidden shrink-0 lg:block" />
          </header>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {/* inventory */}
            <Panel className="p-5">
              <SectionHeading label="On this device" title="What NeoBrain is holding" />
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {inventory.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="rounded-md border border-line-subtle bg-ink-850/40 p-3">
                      <Icon size={14} className="text-cyanx" strokeWidth={1.7} />
                      <div className="numeral mt-2.5 text-[18px] text-txt-primary">{row.value}</div>
                      <div className="mt-1 text-[10.5px] leading-snug text-txt-muted">{row.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="divider my-4" />
              <div className="flex flex-wrap gap-2">
                {["No telemetry", "No account", "Local storage only", "Export anytime"].map((tag) => (
                  <Chip key={tag} as="span">
                    <ShieldCheck size={11} className="text-greenx" /> {tag}
                  </Chip>
                ))}
              </div>
            </Panel>

            {/* processing */}
            <Panel className="p-5">
              <SectionHeading label="Processing" title="Where work happens" />
              <div className="mt-2 divide-y divide-line-subtle">
                <Switch
                  label="Local processing only"
                  description="Retrieval, classification and speech stay on this device. Recommended."
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
                  label="Cloud services"
                  description={
                    settings.privacy.cloudServices
                      ? "Enabled: a remote provider would be allowed to process your memories."
                      : "Off by default. Nothing leaves your device."
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
                  label="Store raw audio"
                  description={
                    settings.privacy.rawAudioStored
                      ? "Raw audio would be kept on device. Transcripts only is safer."
                      : "Off: transcripts are kept, audio is discarded immediately."
                  }
                  checked={settings.privacy.saveRawAudio}
                  onChange={(next) => updateSettings({ privacy: { saveRawAudio: next, rawAudioStored: next } })}
                />
              </div>

              {cloudWarning ? (
                <div className="mt-4">
                  <StateBlock
                    kind="model"
                    title="Cloud services are not available in this build"
                    description="NeoBrain ships with remote inference disabled and no provider keys. Enabling it would need a provider and would send your memories off-device."
                    action={
                      <Button size="sm" variant="ghost" onClick={() => setCloudWarning(false)}>
                        Keep it local
                      </Button>
                    }
                    compact
                  />
                </div>
              ) : null}
            </Panel>

            {/* retention */}
            <Panel className="p-5">
              <SectionHeading label="Retention" title="How long things stay" />
              <div className="mt-3.5 space-y-2.5">
                {(["session", "30-days", "forever"] as const).map((retention) => {
                  const count = state.memories.filter(
                    (memory) => !memory.deletedAt && memory.retentionType === retention,
                  ).length;
                  return (
                    <div key={retention} className="flex items-center justify-between gap-4 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3">
                      <div>
                        <div className="text-[12.5px] text-txt-primary">{retention}</div>
                        <div className="mt-0.5 text-[10.5px] text-txt-muted">
                          {retention === "session"
                            ? "Cleared when the session ends"
                            : retention === "30-days"
                              ? "Expires after the retention window"
                              : "Kept until you delete it"}
                        </div>
                      </div>
                      <span className="numeral text-[15px] text-txt-secondary">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3.5 text-[10.5px] leading-relaxed text-txt-muted">
                Retention is a property of each memory, not a single global setting. Expiry is enforced
                by the device agent in the production build.
              </p>
            </Panel>
          </div>

          {/* side rail */}
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionHeading label="Running now" title="Capability report" />
              <div className="mt-3.5 space-y-2.5">
                {capabilityRows.map((row) => (
                  <div key={row.name} className="rounded-md border border-line-subtle bg-ink-850/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12.5px] text-txt-primary">{row.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          LOCATION_TONE[row.info.location] ?? LOCATION_TONE.unavailable
                        }`}
                      >
                        {row.info.location}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-txt-muted">{row.info.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Your controls" title="Data management" />
              <div className="mt-3.5 space-y-2.5">
                <Button className="w-full" icon={Download} onClick={handleExport}>
                  {exported ? "Exported" : "Export all data (JSON)"}
                </Button>
                <Button className="w-full" icon={Trash2} variant="danger" onClick={() => setConfirmWipe(true)}>
                  Delete all memories
                </Button>
                <Button className="w-full" icon={RotateCcw} variant="ghost" onClick={() => setConfirmReset(true)}>
                  Restore the demo dataset
                </Button>
              </div>
              <div className="divider my-4" />
              <div className="flex items-start gap-3">
                <Lock size={14} className="mt-0.5 shrink-0 text-txt-muted" />
                <p className="text-[11px] leading-relaxed text-txt-muted">
                  Deleting memories removes them from local storage immediately. Archived memories can
                  be restored from the Memory screen until you purge them.
                </p>
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Microphone" title="Capture indicators" />
              <div className="mt-3 space-y-3">
                {[
                  { icon: Mic, text: "The microphone opens only when you start listening." },
                  { icon: AlertTriangle, text: "A live indicator is shown whenever input is active." },
                  { icon: CloudOff, text: "Audio is never uploaded and raw audio is off by default." },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.text} className="flex gap-3">
                      <Icon size={14} className="mt-0.5 shrink-0 text-amberx" strokeWidth={1.7} />
                      <span className="text-[12px] leading-relaxed text-txt-secondary">{row.text}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        {!isDesktop ? (
          <div className="mt-4">
            <Button className="w-full" variant="ghost" onClick={() => navigate("/app/settings")}>
              Open settings
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="Delete all memories?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmWipe(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteAllMemories();
                logActivity({ type: "context", title: "All memories deleted", detail: "Local wipe", status: "idle" });
                setConfirmWipe(false);
              }}
            >
              Delete everything
            </Button>
          </>
        }
      >
        <StateBlock
          kind="error"
          title="This cannot be undone"
          description="Every memory, answer and conversation stored on this device will be permanently removed. Files on disk are not touched."
        />
      </Sheet>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore demo dataset?"
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
              Restore demo data
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-txt-secondary">
          This replaces everything currently stored with the original sample projects, memories and
          files. Export first if you want to keep your own data.
        </p>
      </Sheet>
    </div>
  );
}
