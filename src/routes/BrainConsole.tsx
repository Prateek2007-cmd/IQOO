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
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <TechLabel tone={listening ? "cyan" : "muted"}>
            {listening ? "Listening" : "Standby"}
          </TechLabel>
          <h2 className="mt-2 text-[16px] font-semibold text-txt-primary">
            {listening ? "Speech detection active" : "NeoBrain is idle"}
          </h2>
          <p className="mt-1.5 max-w-[46ch] text-[12px] leading-relaxed text-txt-secondary">
            {listening
              ? mic.mode === "live"
                ? "Microphone is open on this device. Audio is processed locally and never stored."
                : "Simulated input is running because browser speech recognition is unavailable."
              : "Nothing is being recorded. Start listening only when you want NeoBrain to capture context."}
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Chip as="span" active={listening}>
              <Waves size={11} />
              {mic.mode === "live" ? "Live mic" : "Simulated"}
            </Chip>
            <Chip as="span">{speech.label}</Chip>
            <Chip as="span">Raw audio: off</Chip>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void toggleListening()}
          aria-pressed={listening}
          className={[
            "relative grid h-14 w-14 shrink-0 place-items-center rounded-full border transition-all duration-400 ease-premium",
            listening
              ? "border-cyanx/60 bg-[radial-gradient(70%_70%_at_50%_20%,rgba(0,217,255,0.35),rgba(8,21,33,0.9))] shadow-[0_0_36px_-8px_rgba(0,217,255,0.9)]"
              : "border-line-soft bg-ink-800/80 hover:border-line-strong",
          ].join(" ")}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? <Mic size={20} className="text-cyanx" /> : <MicOff size={20} className="text-txt-secondary" />}
          {listening ? (
            <span className="absolute inset-0 animate-ping rounded-full border border-cyanx/40" />
          ) : null}
        </button>
      </div>

      <div className="mt-4 flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, index) => {
          const target = listening ? 0.25 + mic.level * Math.abs(Math.sin(index * 0.62)) : 0.12;
          return (
            <span
              key={index}
              className="flex-1 rounded-full bg-gradient-to-t from-bluex/40 via-cyanx to-magentax/70 transition-[height] duration-200 ease-out"
              style={{ height: `${6 + target * 30}px`, opacity: 0.3 + target * 0.7 }}
            />
          );
        })}
      </div>

      {mic.error ? (
        <div className="mt-4">
          <StateBlock
            kind="mic"
            title={mic.error}
            description="Enable microphone access in your browser settings, or use text capture below."
            compact
          />
        </div>
      ) : null}
    </Panel>
  );

  const captureCard = (
    <Panel className="p-5">
      <SectionHeading label="Memory engine" title="Capture something" />
      <p className="mt-2 text-[12px] leading-relaxed text-txt-secondary">
        Runs the local pipeline: context → importance → memory decision. You always see the reason
        before anything is stored.
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
          placeholder="e.g. “Decided to use XGBoost instead of the neural baseline for SmartLine.”"
          className="input h-auto resize-none py-3 leading-relaxed"
          aria-label="Capture text"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
            <Sparkles size={13} /> Classify
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => navigate("/app/voice")}>
            <Mic size={13} /> Use voice instead
          </Button>
          <span className="ml-auto text-[10.5px] text-txt-muted">{providers.inference.label}</span>
        </div>
      </form>

      {proposal ? (
        <div className="mt-4 rounded-lg border border-cyanx/25 bg-[linear-gradient(180deg,rgba(0,217,255,0.08)_0%,rgba(7,16,25,0.6)_100%)] p-4">
          <div className="flex items-center justify-between gap-3">
            <TechLabel tone="cyan">
              {proposal.proposal ? "Memory candidate" : "Discarded"}
            </TechLabel>
            <span className="numeral text-[11px] text-txt-muted">
              confidence {Math.round(proposal.confidence * 100)}%
            </span>
          </div>

          {proposal.proposal ? (
            <>
              <div className="mt-2.5 text-[13.5px] font-medium text-txt-primary">
                {proposal.proposal.title}
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-txt-secondary">
                {proposal.proposal.content}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip as="span" active>
                  {proposal.category}
                </Chip>
                <Chip as="span">{proposal.importance}</Chip>
                <Chip as="span">retention: {proposal.retentionType}</Chip>
                {proposal.projectId ? (
                  <Chip as="span">
                    {state.projects.find((project) => project.id === proposal.projectId)?.name}
                  </Chip>
                ) : null}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-txt-muted">
                Rule that fired: {proposal.reason}
              </p>
              <div className="mt-3.5 flex gap-2">
                <Button size="sm" variant="primary" onClick={commitProposal}>
                  <Check size={13} /> Store memory
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>
                  Discard
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2.5 text-[12.5px] text-txt-secondary">{proposal.reason}</p>
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
        <p className="mt-3 text-[11px] text-txt-muted">
          Last input: “{lastCapture.slice(0, 64)}{lastCapture.length > 64 ? "…" : ""}”
        </p>
      ) : null}
    </Panel>
  );

  const candidatesCard = (
    <Panel className="p-5">
      <SectionHeading
        label="Review"
        title={`Candidates · ${candidates.length}`}
        action={
          <Link to="/app/memory" className="text-[11.5px] text-cyanx">
            All memories
          </Link>
        }
      />
      <div className="mt-3.5 space-y-2.5">
        {candidates.length === 0 ? (
          <StateBlock
            kind="empty"
            title="No candidates waiting"
            description="Captures that need your decision appear here before they become long-term memories."
            compact
          />
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-md border border-amberx/25 bg-amberx/[0.06] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-txt-primary">{candidate.title}</div>
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-txt-secondary">
                    {candidate.content}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip as="span">{candidate.category}</Chip>
                    <Chip as="span">{candidate.importance}</Chip>
                    <span className="text-[10.5px] text-txt-muted">{relativeTime(candidate.createdAt, now)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 text-greenx"
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
                    className="icon-btn h-8 w-8 text-dangerx"
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
    <Panel className="p-5">
      <SectionHeading
        label="Live"
        title="What NeoBrain is doing"
        action={
          <Link to="/app/activity" className="flex items-center gap-1 text-[11.5px] text-cyanx">
            See all <Activity size={12} />
          </Link>
        }
      />
      <div className="mt-3">
        <ActivityTimeline events={state.activity} limit={7} now={now} />
      </div>
    </Panel>
  );

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Your Brain" tagline="Live console" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "space-y-4 px-5 pb-8 pt-5"}>
        {/* status strip */}
        <div className="flex items-center gap-4">
          <BrainCore state={listening ? "listening" : "idle"} size={isDesktop ? 150 : 110} intensity={mic.level} />
          <div className="min-w-0 flex-1">
            <TechLabel tone="cyan">Brain status</TechLabel>
            <h1 className={`mt-1.5 ${isDesktop ? "title-lg" : "title-md"}`}>
              {listening ? "Listening locally" : "Ready when you are"}
            </h1>
            <p className="mt-1.5 text-[12px] text-txt-secondary">
              {counts.memories} memories · {counts.filesIndexed} files indexed · {counts.candidates} awaiting review
            </p>
            {isDesktop ? (
              <div className="mt-3.5 max-w-[380px]">
                <Progress value={counts.filesIndexed / Math.max(1, counts.filesTotal)} showLabel />
              </div>
            ) : null}
          </div>
        </div>

        {isDesktop ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {listeningCard}
              {captureCard}
            </div>
            <div className="space-y-5">
              {activityCard}
              {candidatesCard}
              <Panel className="p-5">
                <SectionHeading label="Shortcuts" title="More ways to capture" />
                <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
                  {[
                    { icon: Mic, label: "Voice mode", to: "/app/voice" },
                    { icon: Pin, label: "Ask a question", to: "/app/ask" },
                    { icon: Sparkles, label: "Knowledge graph", to: "/app/knowledge" },
                    { icon: Waves, label: "Timeline", to: "/app/timeline" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="flex items-center gap-2.5 rounded-sm border border-line-subtle bg-ink-850/40 px-3 py-2.5 text-left text-[12.5px] text-txt-secondary transition-colors hover:border-line-soft hover:text-txt-primary"
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
            <Panel className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-cyanx" />
                <p className="text-[11.5px] leading-relaxed text-txt-secondary">
                  The classifier is rule-based and inspectable in this build, not a language model.
                  Every capture shows the rule that fired before it is stored.
                </p>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
