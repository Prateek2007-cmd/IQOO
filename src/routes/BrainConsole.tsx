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

  /* ── Perception Module ─────────────────────────────── */
  const listeningModule = (
    <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className={`font-mono text-[9px] font-semibold uppercase tracking-[0.18em] ${listening ? "text-[#00D1FF]" : "text-[#64748B]"}`}>
            {listening ? "✦ PERCEPTION ACTIVE" : "✦ PERCEPTION STANDBY"}
          </div>
          <h2 className="mt-2 font-display text-[17px] font-semibold text-[#E2E8F0]">
            {listening ? "Local Speech Detection Engaged" : "NeoBrain Core Idle"}
          </h2>
          <p className="mt-1.5 max-w-[50ch] text-[12px] leading-relaxed text-[#94A3B8]">
            {listening
              ? mic.mode === "live"
                ? "Microphone is open on this device. Audio is converted into embeddings locally and never recorded."
                : "Simulated audio buffer is running because browser speech recognition is in development fallback mode."
              : "No sensors active. Engage perception only when you wish to stream context into your second brain."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className="rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2 py-0.5 text-[#00D1FF]">
              <Waves size={9} className="mr-1 inline -mt-0.5" />
              {mic.mode === "live" ? "Live Mic" : "Simulated"}
            </span>
            <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 text-[#94A3B8]">
              {speech.label}
            </span>
            <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.5 text-[#10B981]">
              Raw Audio: Off
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void toggleListening()}
          aria-pressed={listening}
          className={[
            "relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border transition-all duration-300",
            listening
              ? "border-[#00D1FF]/50 bg-[radial-gradient(70%_70%_at_50%_20%,rgba(0,209,255,0.35),rgba(10,15,28,0.9))] shadow-[0_0_30px_rgba(0,209,255,0.4)]"
              : "border-[#334155]/40 bg-[#0A0F1C]/60 hover:border-[#334155]/70",
          ].join(" ")}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? <Mic size={22} className="text-[#00D1FF]" /> : <MicOff size={22} className="text-[#94A3B8]" />}
          {listening ? (
            <span className="absolute inset-0 animate-ping rounded-2xl border border-[#00D1FF]/30" />
          ) : null}
        </button>
      </div>

      {/* Audio waveform visualizer */}
      <div className="mt-5 flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 44 }).map((_, index) => {
          const target = listening ? 0.25 + mic.level * Math.abs(Math.sin(index * 0.62)) : 0.1;
          return (
            <span
              key={index}
              className="flex-1 rounded-full bg-gradient-to-t from-[#3882F6]/40 via-[#00D1FF] to-[#885CF6]/70 transition-[height] duration-200 ease-out"
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
    </div>
  );

  /* ── Pipeline Module ───────────────────────────────── */
  const captureModule = (
    <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#885CF6]">
        ✦ NEURAL PIPELINE
      </div>
      <h2 className="mt-1.5 font-display text-[17px] font-semibold text-[#E2E8F0]">
        Deterministic Semantic Classifier
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-[#94A3B8]">
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
          placeholder='e.g. "Decided to adopt local IndexedDB vector storage for zero-latency retrieval in SmartLine."'
          className="w-full resize-none rounded-xl border border-[#334155]/30 bg-[#020407]/50 px-4 py-3 text-[13px] leading-relaxed text-[#E2E8F0] placeholder-[#64748B] outline-none transition-all focus:border-[#00D1FF]/40 focus:shadow-[0_0_16px_-4px_rgba(0,209,255,0.2)]"
          aria-label="Capture text"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
            <Sparkles size={13} /> Classify Input
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => navigate("/app/voice")}>
            <Mic size={13} /> Voice Mode
          </Button>
          <span className="ml-auto font-mono text-[10px] text-[#64748B]">{providers.inference.label}</span>
        </div>
      </form>

      {proposal ? (
        <div className="mt-5 rounded-xl border border-[#00D1FF]/25 bg-gradient-to-b from-[#0F1B2D]/80 to-[#020407]/80 p-5 shadow-[0_0_20px_rgba(0,209,255,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
              {proposal.proposal ? "✦ CANDIDATE IDENTIFIED" : "✦ SIGNAL DISCARDED"}
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#00D1FF]">
              {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {proposal.proposal ? (
            <>
              <div className="mt-3 text-[14px] font-semibold text-[#E2E8F0]">
                {proposal.proposal.title}
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#94A3B8]">
                {proposal.proposal.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2 py-0.5 capitalize text-[#00D1FF]">
                  {proposal.category}
                </span>
                <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 uppercase text-[#94A3B8]">
                  {proposal.importance}
                </span>
                <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 text-[#94A3B8]">
                  Retention: {proposal.retentionType}
                </span>
                {proposal.projectId && (
                  <span className="rounded-full border border-[#3882F6]/30 bg-[#3882F6]/10 px-2 py-0.5 text-[#3882F6]">
                    {state.projects.find((project) => project.id === proposal.projectId)?.name}
                  </span>
                )}
              </div>
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-[#64748B]">
                Heuristic: {proposal.reason}
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
              <p className="mt-3 text-[12px] text-[#94A3B8]">{proposal.reason}</p>
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
        <p className="mt-3 font-mono text-[10px] text-[#64748B]">
          Last input: "{lastCapture.slice(0, 64)}{lastCapture.length > 64 ? "…" : ""}"
        </p>
      ) : null}
    </div>
  );

  /* ── Review Queue ──────────────────────────────────── */
  const candidatesModule = (
    <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">
            ✦ REVIEW QUEUE
          </div>
          <h2 className="mt-1.5 font-display text-[17px] font-semibold text-[#E2E8F0]">
            Pending Candidates · {candidates.length}
          </h2>
        </div>
        <Link to="/app/memory" className="font-mono text-[11px] text-[#00D1FF] hover:underline">
          All Memories →
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {candidates.length === 0 ? (
          <StateBlock
            kind="empty"
            title="Review Queue Clear"
            description="High-uncertainty captures that require operator affirmation gather here."
            compact
          />
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.03] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-[#E2E8F0]">{candidate.title}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#94A3B8]">
                    {candidate.content}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-[10px]">
                    <span className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 capitalize text-[#F59E0B]">
                      {candidate.category}
                    </span>
                    <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 uppercase text-[#94A3B8]">
                      {candidate.importance}
                    </span>
                    <span className="text-[#64748B]">{relativeTime(candidate.createdAt, now)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407]/60 text-[#10B981] transition-all hover:border-[#10B981]/40 hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]"
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
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407]/60 text-[#EF4444] transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_8px_rgba(239,68,68,0.3)]"
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
    </div>
  );

  /* ── Activity Feed ─────────────────────────────────── */
  const activityModule = (
    <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#3882F6]">
            ✦ EVENT STREAM
          </div>
          <h2 className="mt-1.5 font-display text-[17px] font-semibold text-[#E2E8F0]">
            Live Execution Audit
          </h2>
        </div>
        <Link to="/app/activity" className="flex items-center gap-1 font-mono text-[11px] text-[#00D1FF] hover:underline">
          Full Audit <Activity size={12} />
        </Link>
      </div>
      <div className="mt-4">
        <ActivityTimeline events={state.activity} limit={7} now={now} />
      </div>
    </div>
  );

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Your Brain" tagline="Live console" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1320px] px-8 py-8" : "space-y-4 px-5 pb-8 pt-5"}>
        {/* Status Hero Banner */}
        <div className="flex items-center gap-5 rounded-2xl border border-[#00D1FF]/20 bg-gradient-to-r from-[#0F1B2D]/80 via-[#0B1320]/60 to-[#020407]/80 p-5 shadow-[0_0_30px_rgba(0,209,255,0.05)] backdrop-blur-xl">
          <BrainCore state={listening ? "listening" : "idle"} size={isDesktop ? 130 : 90} intensity={mic.level} />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
              ◆ NEURAL CONSOLE
            </div>
            <h1 className={`mt-1.5 font-display font-semibold text-[#E2E8F0] ${isDesktop ? "text-[26px]" : "text-[20px]"}`}>
              {listening ? "Perception Active · Local Processing" : "Autonomous Standby"}
            </h1>
            <div className="mt-2 flex items-center gap-4 font-mono text-[11px] text-[#94A3B8]">
              <span>{counts.memories} memories</span>
              <span className="h-px w-3 bg-[#334155]/50" />
              <span>{counts.filesIndexed} indexed</span>
              <span className="h-px w-3 bg-[#334155]/50" />
              <span className="text-[#F59E0B]">{counts.candidates} awaiting</span>
            </div>
            {isDesktop ? (
              <div className="mt-3 max-w-[400px]">
                <Progress value={counts.filesIndexed / Math.max(1, counts.filesTotal)} showLabel />
              </div>
            ) : null}
          </div>
        </div>

        {isDesktop ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {listeningModule}
              {captureModule}
            </div>
            <div className="space-y-5">
              {activityModule}
              {candidatesModule}
              {/* Console shortcuts */}
              <div className="rounded-2xl border border-[#334155]/30 bg-[#0B1320]/40 p-6 backdrop-blur-sm">
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  ✦ DIRECT ROUTES
                </div>
                <h2 className="mt-1.5 font-display text-[17px] font-semibold text-[#E2E8F0]">
                  Console Shortcuts
                </h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
                        className="flex items-center gap-2.5 rounded-xl border border-[#334155]/25 bg-[#020407]/40 px-3.5 py-3 text-left font-mono text-[11px] text-[#94A3B8] transition-all duration-300 hover:border-[#00D1FF]/30 hover:text-[#E2E8F0]"
                      >
                        <Icon size={13} className="text-[#00D1FF]" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {listeningModule}
            {captureModule}
            {candidatesModule}
            {activityModule}
          </>
        )}
      </div>
    </div>
  );
}
