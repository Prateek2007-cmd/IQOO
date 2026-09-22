/**
 * Voice Mode — the immersive interaction surface.
 *
 * States: idle → listening → processing → response.
 *
 * Honesty: the microphone is only opened when you tap, the stream is stopped the
 * instant you press Stop or close the screen, raw audio is never stored, and the
 * status bar says whether transcription is real (browser speech service) or the
 * simulated development fallback.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Check,
  FileText,
  FolderPlus,
  Gauge,
  Mic,
  Monitor,
  MoreVertical,
  Pause,
  Play,
  Sparkles,
  Square,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCore, BrainCoreStage } from "../components/BrainCore";
import { NeoBrainWordmark } from "../components/Logo";
import { BrainStatusPill } from "../components/Chrome";
import { Button, Chip, Panel, Progress, Sheet, StateBlock, TechLabel } from "../components/ui";
import { detectSpeechSupport, pickSampleQuestion, providerReport } from "../lib/engine";
import { useMicLevel } from "../lib/hooks";
import { useBrain } from "../lib/store";
import { useAsk } from "../lib/useAsk";
import { type Answer } from "../lib/types";

type VoiceState = "idle" | "listening" | "processing" | "response";

const TRACE_STEPS = [
  "Transcribing speech",
  "Understanding context",
  "Finding relevant knowledge",
  "Checking importance",
  "Almost there…",
];

/* --------------------------------------------------------------- dictation */

function useDictation(enabled: boolean) {
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [mode, setMode] = useState<"live" | "simulated">("simulated");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<{ stop: () => void; abort?: () => void } | null>(null);
  const timersRef = useRef<number[]>([]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    timersRef.current.forEach((timer) => window.clearInterval(timer));
    timersRef.current = [];
    setInterim("");
  }, []);

  const start = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterim("");

    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (Ctor && enabled) {
      try {
        const recognition = new Ctor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-US";
        recognition.onresult = (event) => {
          let finalText = "";
          let interimText = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) finalText += result[0].transcript;
            else interimText += result[0].transcript;
          }
          if (finalText) setTranscript((current) => `${current} ${finalText}`.trim());
          setInterim(interimText);
        };
        recognition.onerror = (event) => {
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setError("Microphone permission was denied.");
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
        setMode("live");
        return;
      } catch {
        setError("Browser speech recognition could not start.");
      }
    }

    /* Development fallback: a clearly labelled simulated transcript. */
    const sentence = pickSampleQuestion(0.35).split(" ");
    const phrase = [
      "Yesterday",
      "I",
      "trained",
      "the",
      "XGBoost",
      "model",
      "and",
      "updated",
      "the",
      "CAD",
      "enclosure",
      "to",
      "version",
      "three.",
    ];
    const words = sentence.length > phrase.length ? sentence : phrase;
    let index = 0;
    setMode("simulated");
    const timer = window.setInterval(() => {
      index += 1;
      setTranscript(words.slice(0, index).join(" "));
      if (index >= words.length) {
        window.clearInterval(timer);
        const follow = window.setTimeout(() => setInterim(""), 0);
        timersRef.current.push(follow);
      }
    }, 220);
    timersRef.current.push(timer);
  }, [enabled]);

  useEffect(() => stop, [stop]);

  return { transcript, interim, mode, error, start, stop, setTranscript };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: {
    resultIndex: number;
    results: {
      length: number;
      [index: number]: { isFinal: boolean; 0: { transcript: string } };
    };
  }) => void;
  onerror: (event: { error: string }) => void;
  start: () => void;
  stop: () => void;
}

/* -------------------------------------------------------------- waveform */

function VoiceWaveform({ getLevel, active }: { getLevel: () => number; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const bars = 64;
    const history = new Array<number>(bars).fill(0.12);
    let time = 0;
    let last = performance.now();

    const draw = (delta: number) => {
      time += delta;
      const level = activeRef.current ? getLevel() : 0.1;
      history.push(level);
      history.shift();

      ctx.clearRect(0, 0, width, height);
      const gap = width / bars;
      const barWidth = Math.max(1.6, gap * 0.42);

      for (let i = 0; i < bars; i += 1) {
        const center = (i - bars / 2) / (bars / 2);
        const envelope = Math.cos(center * Math.PI * 0.5);
        const value = history[i] * envelope;
        const wobble = 0.18 * Math.sin(time * 3.2 + i * 0.42) + 0.1 * Math.sin(time * 6.4 - i * 0.3);
        const h = Math.max(2, (value + Math.abs(wobble) * 0.35) * height * 0.86);
        const x = i * gap + (gap - barWidth) / 2;
        const y = height / 2 - h / 2;
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, "rgba(196,123,255,0.95)");
        gradient.addColorStop(0.5, "rgba(0,217,255,0.95)");
        gradient.addColorStop(1, "rgba(36,123,255,0.9)");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.35 + Math.min(0.65, value * 1.6);
        const radius = Math.min(barWidth / 2, 3);
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, radius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, h);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (!running) return;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(delta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [getLevel]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}

/* -------------------------------------------------------------------- page */

export default function VoiceMode() {
  const navigate = useNavigate();
  const { state, session, createMemory, logActivity, saveAnswer } = useBrain();
  const { ask } = useAsk();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [paused, setPaused] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [traceIndex, setTraceIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [planSheet, setPlanSheet] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followUp, setFollowUp] = useState("");

  const speech = useMemo(() => detectSpeechSupport(), []);
  const providers = useMemo(
    () => providerReport(state.settings.privacy.cloudServices),
    [state.settings.privacy.cloudServices],
  );

  const mic = useMicLevel(true);
  const dictation = useDictation(speech.kind === "webspeech");
  const levelRef = mic.levelRef;
  const getLevel = useCallback(() => levelRef.current, [levelRef]);

  /* Stop everything the moment we leave listening. */
  const stopCapture = useCallback(() => {
    mic.stop();
    dictation.stop();
    setPaused(false);
  }, [dictation, mic]);

  useEffect(() => () => stopCapture(), [stopCapture]);

  const startListening = async () => {
    setSaved(false);
    setVoiceState("listening");
    dictation.start();
    await mic.start();
    logActivity({
      type: "listening",
      title: "Listening",
      detail: mic.mode === "live" ? "Microphone active · local only" : "Simulated input · development fallback",
      status: "active",
    });
  };

  /* Hands-free: keep the conversation going after an answer. */
  useEffect(() => {
    if (!handsFree || voiceState !== "response") return;
    const timer = window.setTimeout(() => {
      void startListening();
    }, 3200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handsFree, voiceState]);

  const beginProcessing = async () => {
    stopCapture();
    const question =
      (dictation.transcript || dictation.interim).trim() || "What did I work on yesterday?";
    setVoiceState("processing");
    setTraceIndex(0);

    const traceTimers = TRACE_STEPS.map((_, index) =>
      window.setTimeout(() => setTraceIndex(index), index * 340),
    );

    const run = await ask(question);
    traceTimers.forEach((timer) => window.clearTimeout(timer));
    setTraceIndex(TRACE_STEPS.length - 1);

    if (run) {
      setAnswer(run.answer);
    }
    window.setTimeout(() => setVoiceState("response"), 380);
  };

  const explainMore = async () => {
    if (!answer) return;
    setVoiceState("processing");
    setTraceIndex(0);
    const run = await ask(`Explain in more detail and give the context behind: ${answer.question}`);
    if (run) setAnswer(run.answer);
    setVoiceState("response");
  };

  const saveToMemory = () => {
    if (!answer) return;
    createMemory({
      title: answer.question.slice(0, 72),
      content: `${answer.summary}\n\n${answer.points.map((point) => `• ${point}`).join("\n")}`,
      category: "knowledge",
      importance: "important",
      retentionType: "forever",
      sourceReferences: answer.sources,
      projectId: answer.projectId,
      reason: "Saved from a voice answer.",
    });
    setSaved(true);
    logActivity({ type: "candidate", title: "Answer saved to memory", detail: answer.question, status: "done" });
  };

  const addToProject = (projectId: string) => {
    if (!answer) return;
    const updated = { ...answer, projectId };
    setAnswer(updated);
    saveAnswer(updated);
    const project = state.projects.find((p) => p.id === projectId);
    createMemory({
      title: `${project?.name ?? "Project"} · ${answer.question.slice(0, 56)}`,
      content: answer.points.map((point) => `• ${point}`).join("\n"),
      category: "knowledge",
      importance: "important",
      retentionType: "forever",
      sourceReferences: answer.sources,
      projectId,
      reason: "Attached from a voice answer.",
    });
    setPlanSheet(false);
    logActivity({ type: "context", title: "Answer linked to project", detail: project?.name ?? "", status: "done", projectId });
  };

  const resolveSource = (id: string) => state.sources.find((source) => source.id === id);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* header */}
      <header className="safe-t relative z-20 flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => {
            stopCapture();
            navigate(-1);
          }}
          className="icon-btn"
          aria-label="Close voice mode"
        >
          <ArrowLeft size={17} />
        </button>
        <NeoBrainWordmark size={12} />
        <div className="flex items-center gap-2">
          <BrainStatusPill compact />
          <button type="button" className="icon-btn" aria-label="Voice options">
            <MoreVertical size={17} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-5 pb-8">
        <AnimatePresence mode="wait">
          {/* -------------------------------------------------- idle ------ */}
          {voiceState === "idle" ? (
            <motion.section
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col items-center justify-between"
            >
              <div className="pt-4 text-center">
                <h1 className="font-display text-[26px] font-semibold">Ask NeoBrain</h1>
                <p className="mt-2 text-[13px] text-txt-secondary">Speak naturally.</p>
              </div>

              <BrainCoreStage state="idle" size={300} className="my-2" />

              <div className="w-full max-w-[420px]">
                <Button
                  variant="primary"
                  className="h-12 w-full"
                  onClick={() => void startListening()}
                  icon={Mic}
                >
                  Tap to speak
                </Button>
                <p className="mt-3.5 text-center text-[11.5px] text-txt-muted">
                  {speech.kind === "webspeech"
                    ? "Your brain is listening locally."
                    : "Transcription uses a simulated fallback in this browser."}
                </p>
              </div>
            </motion.section>
          ) : null}

          {/* --------------------------------------------- listening ----- */}
          {voiceState === "listening" ? (
            <motion.section
              key="listening"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="pt-2 text-center">
                <h1 className="font-display text-[26px] font-semibold">
                  {paused ? "Paused" : "Listening…"}
                </h1>
                <p className="mt-2 text-[13px] text-txt-secondary">Speak naturally</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-cyanx" />
                    <span className="absolute inset-0 animate-ping rounded-full bg-cyanx opacity-70" />
                  </span>
                  <span className="text-[10.5px] uppercase tracking-label text-txt-muted">
                    {mic.mode === "live" ? "Microphone active" : "Simulated input"}
                  </span>
                </div>
              </div>

              <div className="relative flex flex-1 items-center justify-center">
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div
                    className="h-[300px] w-[300px] rounded-full blur-3xl transition-opacity duration-700"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(196,123,255,0.24) 0%, rgba(0,217,255,0.14) 45%, transparent 72%)",
                      opacity: 0.55 + mic.level * 0.45,
                    }}
                  />
                </div>
                <BrainCore state="listening" size={300} intensity={mic.level} />
              </div>

              <div className="mx-auto h-14 w-full max-w-[440px]">
                <VoiceWaveform getLevel={getLevel} active={!paused} />
              </div>

              {/* live transcript */}
              <div className="mx-auto mt-4 w-full max-w-[460px] min-h-[62px] rounded-xl border border-line-subtle bg-ink-850/50 px-4 py-3">
                <TechLabel tone="cyan" className="mb-1.5">
                  Live transcript
                </TechLabel>
                <p className="text-[13px] leading-relaxed text-txt-primary">
                  {dictation.transcript || (
                    <span className="text-txt-muted">Waiting for speech…</span>
                  )}
                  {dictation.interim ? <span className="text-txt-muted"> {dictation.interim}</span> : null}
                </p>
              </div>

              {mic.error || dictation.error ? (
                <div className="mx-auto mt-3 w-full max-w-[460px]">
                  <StateBlock
                    kind="mic"
                    title={mic.error ?? dictation.error ?? ""}
                    description="Enable microphone access in your browser's site settings, or keep using the simulated transcript."
                    compact
                  />
                </div>
              ) : null}

              <div className="mx-auto mt-5 flex w-full max-w-[460px] items-center justify-center gap-3">
                <Button
                  className="h-11 flex-1"
                  icon={paused ? Play : Pause}
                  onClick={() => {
                    if (paused) {
                      setPaused(false);
                      void mic.start();
                      dictation.start();
                    } else {
                      setPaused(true);
                      mic.stop();
                      dictation.stop();
                    }
                  }}
                >
                  {paused ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="danger"
                  className="h-11 flex-1"
                  icon={Square}
                  onClick={() => void beginProcessing()}
                >
                  Stop
                </Button>
                <Button
                  variant={handsFree ? "primary" : "default"}
                  className="h-11 flex-1"
                  icon={Gauge}
                  onClick={() => setHandsFree((current) => !current)}
                  aria-pressed={handsFree}
                >
                  Hands-free
                </Button>
              </div>

              <p className="mx-auto mt-2.5 max-w-[460px] text-center text-[10.5px] text-txt-muted">
                {handsFree
                  ? "Hands-free on — NeoBrain reopens the microphone after each answer."
                  : "Raw audio is never stored. Stopping ends capture immediately."}
              </p>
            </motion.section>
          ) : null}

          {/* -------------------------------------------- processing ----- */}
          {voiceState === "processing" ? (
            <motion.section
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col items-center justify-between"
            >
              <div className="pt-4 text-center">
                <h1 className="font-display text-[24px] font-semibold">NeoBrain</h1>
                <p className="mt-2 text-[13px] text-txt-secondary">Turning your words into insights…</p>
              </div>

              <BrainCoreStage state="processing" size={260} className="my-2" />

              <div className="w-full max-w-[420px] space-y-3">
                {TRACE_STEPS.map((step, index) => {
                  const done = index < traceIndex;
                  const active = index === traceIndex;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <span
                        className={[
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-400",
                          done
                            ? "border-greenx/50 bg-greenx/15 text-greenx"
                            : active
                              ? "border-cyanx/60 bg-cyanx/15 text-cyanx"
                              : "border-line-subtle text-txt-muted",
                        ].join(" ")}
                      >
                        {done ? <Check size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </span>
                      <span
                        className={`text-[13px] transition-colors duration-300 ${
                          active ? "text-txt-primary" : done ? "text-txt-secondary" : "text-txt-muted"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full max-w-[420px]">
                <Panel className="flex items-center gap-3 p-3.5" padded={false}>
                  <Sparkles size={15} className="ml-1 shrink-0 text-cyanx" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-txt-primary">
                      Processing locally on {state.devices.find((d) => d.processingRole === "pocket")?.name ?? "this device"}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-txt-muted">
                      Your data stays private · {providers.inference.label}
                    </div>
                  </div>
                </Panel>
                <div className="mt-4">
                  <Progress value={(traceIndex + 1) / TRACE_STEPS.length} showLabel />
                </div>
              </div>
            </motion.section>
          ) : null}

          {/* ---------------------------------------------- response ----- */}
          {voiceState === "response" && answer ? (
            <motion.section
              key="response"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col"
            >
              <div className="mx-auto w-full max-w-[560px]">
                <div className="flex items-center gap-3">
                  <BrainCore state="responding" size={64} className="shrink-0" />
                  <div className="min-w-0">
                    <TechLabel tone="cyan">Answer ready</TechLabel>
                    <div className="mt-1 text-[15px] font-semibold text-txt-primary">
                      {answer.points.length} findings from your memory
                    </div>
                    <div className="mt-0.5 text-[11px] text-txt-muted">{answer.computedBy}</div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-line-subtle bg-ink-850/50 p-4">
                  <TechLabel className="mb-2">You asked</TechLabel>
                  <p className="text-[13.5px] leading-relaxed text-txt-primary">{answer.question}</p>
                </div>

                <div className="mt-4 rounded-xl border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.42)_0%,rgba(7,16,25,0.7)_100%)] p-4">
                  <TechLabel tone="cyan" className="mb-2.5">
                    NeoBrain
                  </TechLabel>
                  <p className="text-[13px] text-txt-secondary">{answer.summary}</p>
                  <ol className="mt-3.5 space-y-3">
                    {answer.points.map((point, index) => (
                      <li key={point} className="flex gap-3">
                        <span className="numeral mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cyanx/30 bg-cyanx/10 text-[10px] text-cyanx">
                          {index + 1}
                        </span>
                        <span className="text-[13px] leading-relaxed text-txt-secondary">{point}</span>
                      </li>
                    ))}
                  </ol>

                  {answer.sources.length ? (
                    <>
                      <div className="divider my-4" />
                      <TechLabel className="mb-2.5">Sources · {answer.sources.length}</TechLabel>
                      <div className="space-y-2">
                        {answer.sources.map((id) => {
                          const source = resolveSource(id);
                          if (!source) return null;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => navigate("/app/knowledge")}
                              className="flex w-full items-center gap-3 rounded-md border border-line-subtle bg-ink-850/50 px-3 py-2.5 text-left transition-colors hover:border-line-soft"
                            >
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                                <FileText size={12} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12.5px] text-txt-primary">{source.name}</span>
                                <span className="mt-0.5 block truncate text-[10.5px] text-txt-muted">
                                  {source.pathOrReference}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    variant="primary"
                    icon={saved ? Check : Bookmark}
                    onClick={saveToMemory}
                    disabled={saved}
                  >
                    {saved ? "Saved to memory" : "Save to memory"}
                  </Button>
                  <Button icon={FolderPlus} onClick={() => setPlanSheet(true)}>
                    Add to project
                  </Button>
                  <Button icon={Wand2} onClick={() => void explainMore()}>
                    Explain more
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAnswer(null);
                      setVoiceState("idle");
                    }}
                  >
                    Ask something else
                  </Button>
                </div>

                <form
                  className="mt-4 flex items-center gap-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const value = followUp.trim();
                    if (!value) return;
                    setFollowUp("");
                    setVoiceState("processing");
                    setTraceIndex(0);
                    const run = await ask(value, answer.projectId);
                    if (run) setAnswer(run.answer);
                    setVoiceState("response");
                  }}
                >
                  <input
                    className="input flex-1"
                    placeholder="Ask a follow-up…"
                    aria-label="Follow-up question"
                    value={followUp}
                    onChange={(event) => setFollowUp(event.target.value)}
                  />
                  <button type="submit" className="icon-btn h-[46px] w-[46px]" aria-label="Send follow-up">
                    <Mic size={16} />
                  </button>
                </form>

                {answer.projectId ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Chip as="span" active>
                      {state.projects.find((p) => p.id === answer.projectId)?.name ?? "Project"}
                    </Chip>
                    <span className="text-[11px] text-txt-muted">linked to this answer</span>
                  </div>
                ) : null}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </main>

      {/* input mode bar — hidden while the answer is on screen */}
      {voiceState === "idle" || voiceState === "listening" ? (
        <div className="safe-b relative z-20 px-5 pb-5">
          <div className="glass mx-auto flex max-w-[420px] items-center justify-around rounded-xl px-3 py-2.5">
            {[
              { icon: Camera, label: "Camera", action: () => navigate("/app/ask") },
              { icon: FileText, label: "File", action: () => navigate("/app/ask") },
              { icon: Monitor, label: "Screen", action: () => navigate("/app/ask") },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex flex-1 flex-col items-center gap-1.5 rounded-md py-1.5 text-txt-secondary transition-colors hover:text-txt-primary"
                >
                  <Icon size={16} strokeWidth={1.7} />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <Sheet
        open={planSheet}
        onClose={() => setPlanSheet(false)}
        title="Add to project"
      >
        <div className="space-y-2">
          {state.projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => addToProject(project.id)}
              className="flex w-full items-center gap-3 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3 text-left transition-colors hover:border-line-soft"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                <FolderPlus size={13} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-txt-primary">{project.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-txt-muted">{project.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      {!session.name ? (
        <p className="sr-only">Voice mode · local profile</p>
      ) : null}
    </div>
  );
}
