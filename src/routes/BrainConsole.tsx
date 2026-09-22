/**
 * Brain — the live console.
 *
 * This is where the memory pipeline is visible and inspectable: a capture runs
 * through the deterministic classifier, and the proposal shows its category,
 * importance, retention and the rule that fired. Nothing is stored silently.
 */

import {
  Activity,
  Check,
  Cpu,
  Mic,
  MicOff,
  Pin,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivityTimeline } from "../components/ActivityFeed";
import { BrainCore } from "../components/BrainCore";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  Panel,
  Progress,
  SectionHeading,
  StateBlock,
  TechLabel,
} from "../components/ui";
import { classify, detectSpeechSupport, providerReport } from "../lib/engine";
import { relativeTime } from "../lib/format";
import { useIsDesktop, useMicLevel, useNow } from "../lib/hooks";
import { useBrain, useCandidates, useCounts } from "../lib/store";
import type { Classification } from "../lib/engine";

export default function BrainConsole() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const {
    state,
    createMemory,
    logActivity,
    acceptCandidate,
    rejectCandidate,
  } = useBrain();
  const candidates = useCandidates();
  const counts = useCounts();
  const now = useNow(20_000);

  const speech = useMemo(() => detectSpeechSupport(), []);
  const providers = useMemo(
    () => providerReport(state.settings.privacy.cloudServices),
    [state.settings.privacy.cloudServices],
  );

  const mic = useMicLevel(true);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [proposal, setProposal] = useState<Classification | null>(null);
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  const toggleListening = async () => {
    if (listening) {
      mic.stop();
      setListening(false);
      logActivity({ type: "listening", title: "Listening stopped", detail: "Capture ended by user", status: "idle" });
      return;
    }
    setListening(true);
    await mic.start();
    logActivity({
      type: "listening",
      title: "Listening",
      detail: mic.mode === "live" ? "Microphone active · local only" : "Simulated input · development fallback",
      status: "active",
    });
  };

  const runPipeline = () => {
    const text = draft.trim();
    if (!text) return;
    const result = classify(text, state.projects, undefined);
    setProposal(result);
    setLastCapture(text);
    logActivity({
      type: result.importance === "noise" ? "context" : "candidate",
      title: result.proposal ? "Memory candidate" : "Input discarded as noise",
      detail: result.reason,
      status: result.importance === "noise" ? "idle" : "active",
      projectId: result.projectId,
    });
  };

  const commitProposal = () => {
    if (!proposal?.proposal) return;
    createMemory({
      title: proposal.proposal.title,
      content: proposal.proposal.content,
      category: proposal.category,
      importance: proposal.importance,
      retentionType: proposal.retentionType,
      projectId: proposal.projectId,
      reason: proposal.reason,
      status: "active",
    });
    logActivity({
      type: "candidate",
      title: "Memory stored",
      detail: `${proposal.category} · ${proposal.retentionType}`,
      status: "done",
      projectId: proposal.projectId,
    });
    setProposal(null);
    setDraft("");
  };

  const listeningCard = (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <TechLabel tone={listening ? "cyan" : "muted"}>
            {listening ? "Perception Active" : "Perception Standby"}
          </TechLabel>
          <h2 className="mt-2 text-[17px] font-semibold text-txt-primary">
            {listening ? "Local Speech Detection Engaged" : "NeoBrain Core Idle"}
          </h2>
          <p className="mt-1.5 max-w-[50ch] text-[12.5px] leading-relaxed text-txt-secondary">
            {listening
              ? mic.mode === "live"
                ? "Microphone is open on this device. Audio is converted into embeddings locally and never recorded."
                : "Simulated audio buffer is running because browser speech recognition is in development fallback mode."
              : "No sensors active. Engage perception only when you wish to stream context into your second brain."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="micro-module text-cyanx border-cyanx/30">
              <Waves size={10} className="inline mr-1 -mt-0.5" />
              {mic.mode === "live" ? "Live Mic Buffer" : "Simulated Buffer"}
            </span>
            <span className="micro-module">{speech.label}</span>
            <span className="micro-module text-greenx border-greenx/30">Raw Audio: Off</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void toggleListening()}
          aria-pressed={listening}
          className={[
            "relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border transition-all duration-300 ease-premium",
            listening
              ? "border-cyanx bg-[radial-gradient(70%_70%_at_50%_20%,rgba(0,209,255,0.4),rgba(15,27,45,0.9))] shadow-[0_0_30px_rgba(0,209,255,0.5)]"
              : "border-border bg-panel hover:border-line-soft",
          ].join(" ")}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? <Mic size={22} className="text-cyanx" /> : <MicOff size={22} className="text-txt-secondary" />}
          {listening ? (
            <span className="absolute inset-0 animate-ping rounded-2xl border border-cyanx/40" />
          ) : null}
        </button>
      </div>

      <div className="mt-5 flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 44 }).map((_, index) => {
          const target = listening ? 0.25 + mic.level * Math.abs(Math.sin(index * 0.62)) : 0.1;
          return (
            <span
              key={index}
              className="flex-1 rounded-full bg-gradient-to-t from-bluex/40 via-cyanx to-purplex/70 transition-[height] duration-200 ease-out"
              style={{ height: `${6 + target * 32}px`, opacity: 0.3 + target * 0.7 }}
            />
          );
        })}
      </div>

      {mic.error ? (
        <div className="mt-4">
          <StateBlock
            kind="mic"
            title={mic.error}
            description="Enable microphone access in your browser settings, or use manual text classification below."
            compact
          />
        </div>
      ) : null}
    </Panel>
  );

  const captureCard = (
    <Panel className="p-6">
      <SectionHeading label="Neural Pipeline" title="Deterministic Semantic Classifier" />
      <p className="mt-2 text-[12.5px] leading-relaxed text-txt-secondary">
        Executes local pipeline: context stream → temporal relevance → memory classification. Every rule execution is
        transparently rendered before committing to graph memory.
      </p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          runPipeline();
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="e.g. “Decided to adopt local IndexedDB vector storage for zero-latency retrieval in SmartLine.”"
          className="input h-auto resize-none py-3 leading-relaxed bg-surface border-border"
          aria-label="Capture text"
        />
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
            <Sparkles size={13} /> Classify Input
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => navigate("/app/voice")}>
            <Mic size={13} /> Voice Mode
          </Button>
          <span className="ml-auto font-mono text-[11px] text-txt-muted">{providers.inference.label}</span>
        </div>
      </form>

      {proposal ? (
        <div className="mt-5 rounded-2xl border border-cyanx/35 bg-gradient-to-b from-[#0F1B2D] to-space p-5 shadow-[0_0_24px_rgba(0,209,255,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <TechLabel tone="cyan">
              {proposal.proposal ? "Candidate Memory Identified" : "Signal Discarded"}
            </TechLabel>
            <span className="font-mono text-[11px] text-cyanx font-semibold">
              Confidence {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {proposal.proposal ? (
            <>
              <div className="mt-3 text-[14px] font-semibold text-txt-primary">
                {proposal.proposal.title}
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-txt-secondary">
                {proposal.proposal.content}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <span className="micro-module text-cyanx border-cyanx/40 capitalize">{proposal.category}</span>
                <span className="micro-module uppercase">{proposal.importance}</span>
                <span className="micro-module font-mono">Retention: {proposal.retentionType}</span>
                {proposal.projectId ? (
                  <span className="micro-module text-bluex">
                    {state.projects.find((project) => project.id === proposal.projectId)?.name}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-txt-muted">
                Heuristic Rule: {proposal.reason}
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="primary" onClick={commitProposal}>
                  <Check size={13} /> Commit to Graph
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>
                  Discard
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-[12.5px] text-txt-secondary">{proposal.reason}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>
                  Dismiss
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {lastCapture && !proposal ? (
        <p className="mt-3 font-mono text-[11px] text-txt-muted">
          Last input stream: “{lastCapture.slice(0, 64)}{lastCapture.length > 64 ? "…" : ""}”
        </p>
      ) : null}
    </Panel>
  );

  const candidatesCard = (
    <Panel className="p-6">
      <SectionHeading
        label="Review Queue"
        title={`Pending Candidates · ${candidates.length}`}
        action={
          <Link to="/app/memory" className="font-mono text-[11px] text-cyanx hover:underline">
            All Memories →
          </Link>
        }
      />
      <div className="mt-4 space-y-2.5">
        {candidates.length === 0 ? (
          <StateBlock
            kind="empty"
            title="Review Queue Clear"
            description="High-uncertainty captures that require operator affirmation gather here."
            compact
          />
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-amberx/30 bg-amberx/[0.05] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold text-txt-primary">{candidate.title}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-txt-secondary">
                    {candidate.content}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="micro-module text-amberx capitalize">{candidate.category}</span>
                    <span className="micro-module uppercase">{candidate.importance}</span>
                    <span className="font-mono text-[10.5px] text-txt-muted">{relativeTime(candidate.createdAt, now)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 text-greenx border-border hover:border-greenx"
                    aria-label="Accept candidate"
                    onClick={() => {
                      acceptCandidate(candidate.id);
                      logActivity({
                        type: "candidate",
                        title: "Memory accepted",
                        detail: candidate.title,
                        status: "done",
                      });
                    }}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 text-dangerx border-border hover:border-dangerx"
                    aria-label="Reject candidate"
                    onClick={() => {
                      rejectCandidate(candidate.id);
                      logActivity({
                        type: "candidate",
                        title: "Candidate rejected",
                        detail: candidate.title,
                        status: "idle",
                      });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );

  const activityCard = (
    <Panel className="p-6">
      <SectionHeading
        label="Event Stream"
        title="Live Execution Audit"
        action={
          <Link to="/app/activity" className="flex items-center gap-1 font-mono text-[11px] text-cyanx hover:underline">
            Full Audit <Activity size={12} />
          </Link>
        }
      />
      <div className="mt-4">
        <ActivityTimeline events={state.activity} limit={7} now={now} />
      </div>
    </Panel>
  );

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Your Brain" tagline="Live console" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "space-y-4 px-5 pb-8 pt-5"}>
        {/* Status Hero Banner */}
        <div className="flex items-center gap-5 rounded-2xl border border-cyanx/30 bg-gradient-to-r from-surface/90 via-panel/60 to-space/90 p-5 shadow-[0_0_24px_rgba(0,209,255,0.06)]">
          <BrainCore state={listening ? "listening" : "idle"} size={isDesktop ? 130 : 90} intensity={mic.level} />
          <div className="min-w-0 flex-1">
            <TechLabel tone="cyan">Neural Console</TechLabel>
            <h1 className={`mt-1.5 ${isDesktop ? "title-lg" : "title-md"}`}>
              {listening ? "Perception Active · Local Processing" : "Autonomous Standby"}
            </h1>
            <p className="mt-1 text-[13px] text-txt-secondary">
              {counts.memories} memories in graph · {counts.filesIndexed} indexed documents · {counts.candidates} awaiting confirmation
            </p>
            {isDesktop ? (
              <div className="mt-3 max-w-[400px]">
                <Progress value={counts.filesIndexed / Math.max(1, counts.filesTotal)} showLabel />
              </div>
            ) : null}
          </div>
        </div>

        {isDesktop ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {listeningCard}
              {captureCard}
            </div>
            <div className="space-y-6">
              {activityCard}
              {candidatesCard}
              <Panel className="p-6">
                <SectionHeading label="Direct Routes" title="Console Shortcuts" />
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {[
                    { icon: Mic, label: "Voice Perception Mode", to: "/app/voice" },
                    { icon: Pin, label: "Ask Deep Brain", to: "/app/ask" },
                    { icon: Sparkles, label: "3D Knowledge Graph", to: "/app/knowledge" },
                    { icon: Waves, label: "Temporal Timeline", to: "/app/timeline" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-panel/50 px-3.5 py-3 text-left font-mono text-[12px] text-txt-secondary transition-colors hover:border-cyanx/40 hover:text-txt-primary"
                      >
                        <Icon size={14} className="text-cyanx" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </div>
          </div>
        ) : (
          <>
            {listeningCard}
            {captureCard}
            {candidatesCard}
            {activityCard}
          </>
        )}
      </div>
    </div>
  );
}
