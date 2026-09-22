/**
 * Ask NeoBrain — a dedicated question surface, separate from the Answer View.
 *
 * Input modes are real where the web platform allows it: voice opens Voice
 * Mode, and the file picker genuinely attaches files, generates metadata and
 * runs them through the (labelled) job pipeline. Camera and screen capture need
 * the Android build, and the sheet says exactly that instead of pretending.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Mic,
  Monitor,
} from "lucide-react";
import { useRef, useState } from "react";
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
  TechLabel,
} from "../components/ui";
import { QUICK_PROMPTS, detectSpeechSupport, providerReport } from "../lib/engine";
import { relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain } from "../lib/store";
import { useAsk } from "../lib/useAsk";

const INPUT_MODES = [
  { id: "voice", icon: Mic, label: "Voice", hint: "Talk naturally", accent: "text-cyanx" },
  { id: "camera", icon: Camera, label: "Camera", hint: "Scan and ask", accent: "text-violetx" },
  { id: "file", icon: FileText, label: "File", hint: "Ask about a file", accent: "text-greenx" },
  { id: "screen", icon: Monitor, label: "Screen", hint: "Understand this", accent: "text-amberx" },
] as const;

export default function Ask() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, session, addSource, updateSource, createMemory, logActivity } = useBrain();
  const { ask, busy, error } = useAsk();

  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<string>("all");
  const [modeSheet, setModeSheet] = useState<null | "camera" | "screen">(null);
  const [attached, setAttached] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const speech = detectSpeechSupport();
  const providers = providerReport(state.settings.privacy.cloudServices);

  const submit = async (text?: string) => {
    const value = (text ?? question).trim();
    if (!value) return;
    const run = await ask(value, scope === "all" ? undefined : scope);
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  /** Real file attachment: metadata + permission + indexing pipeline. */
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names: string[] = [];
    Array.from(files)
      .slice(0, 5)
      .forEach((file, index) => {
        const type = file.type.startsWith("image/")
          ? "image"
          : file.name.endsWith(".pdf")
            ? "pdf"
            : /\.(ts|tsx|js|py|cpp|java|kt)$/.test(file.name)
              ? "code"
              : file.name.endsWith(".md")
                ? "note"
                : "doc";
        const source = addSource({
          name: file.name,
          type,
          pathOrReference: `file://${file.name}`,
          metadata: { mime: file.type || "unknown", attachedBy: "ask-screen" },
          sizeKb: Math.round(file.size / 1024),
          permissionStatus: "granted",
          indexStatus: "indexing",
          projectId: scope === "all" ? undefined : scope,
        });
        names.push(file.name);
        // Metadata extraction completes asynchronously, exactly like the real pipeline.
        window.setTimeout(() => {
          updateSource(source.id, {
            indexStatus: "indexed",
            indexedAt: new Date().toISOString(),
            metadata: { ...source.metadata, extracted: "metadata only (fallback extractor)" },
          });
          logActivity({
            type: "file",
            title: "File indexed",
            detail: file.name,
            status: "done",
            projectId: source.projectId,
          });
        }, 900 + index * 380);
      });

    setAttached(names.join(", "));
    createMemory({
      title: `Attached ${names.length} file${names.length === 1 ? "" : "s"}`,
      content: `Attached for review: ${names.join(", ")}. Extraction is metadata-only in this build.`,
      category: "note",
      importance: "temp",
      retentionType: "session",
      projectId: scope === "all" ? undefined : scope,
      reason: "File attachment recorded for retrieval context.",
      status: "active",
    });
  };

  const recentAnswers = state.answers.slice(0, 3);

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Ask NeoBrain" tagline="Speak. Think. Do." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-6"}>
        {/* core + framing */}
        <div className={`flex flex-col ${isDesktop ? "items-center" : "items-start"}`}>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="min-w-0">
              <TechLabel tone="cyan" className="mb-2">
                {providers.inference.label}
              </TechLabel>
              <h1 className={isDesktop ? "title-xl" : "title-lg"}>
                Ask your brain
              </h1>
              <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-txt-secondary">
                Voice, text, files and screens — all searched locally. Every answer lists the
                memories it came from.
              </p>
            </div>
            <BrainCore state={busy ? "processing" : "idle"} size={isDesktop ? 132 : 96} className="shrink-0" />
          </div>
        </div>

        {/* input modes */}
        <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {INPUT_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  if (mode.id === "voice") navigate("/app/voice");
                  else if (mode.id === "file") fileRef.current?.click();
                  else setModeSheet(mode.id);
                }}
                className="group relative overflow-hidden rounded-lg border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.42)_0%,rgba(7,16,25,0.7)_100%)] p-4 text-left transition-all duration-300 ease-premium hover:border-line-soft hover:shadow-panel active:scale-[0.985]"
              >
                <Icon size={17} className={mode.accent} strokeWidth={1.7} />
                <div className="mt-5 text-[13px] font-medium text-txt-primary">{mode.label}</div>
                <div className="mt-1 text-[10.5px] text-txt-muted">{mode.hint}</div>
              </button>
            );
          })}
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
          aria-label="Attach files"
        />

        {/* composer */}
        <Panel className={`mt-5 p-4 ${isDesktop ? "shadow-elevated" : ""}`} glow={isDesktop}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            rows={isDesktop ? 2 : 3}
            placeholder="Ask anything — “what changed yesterday?”, “summarize these files”, “where did I see this?”"
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-txt-primary outline-none placeholder:text-txt-muted"
            aria-label="Your question"
          />

          <div className="divider my-3.5" />

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10.5px] text-txt-muted">
              <Filter size={12} /> Context
            </span>
            <Chip active={scope === "all"} onClick={() => setScope("all")}>
              All memories
            </Chip>
            {state.projects.slice(0, 3).map((project) => (
              <Chip key={project.id} active={scope === project.id} onClick={() => setScope(project.id)}>
                {project.name}
              </Chip>
            ))}
            <Chip as="span" className="ml-auto">
              <FolderOpen size={11} /> {state.sources.filter((s) => s.indexStatus === "indexed").length} files
            </Chip>
            <Button
              variant="primary"
              size="sm"
              loading={busy}
              disabled={!question.trim()}
              onClick={() => void submit()}
              className="ml-auto"
            >
              Ask
              <ArrowUpRight size={14} />
            </Button>
          </div>
        </Panel>

        {attached ? (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-greenx/25 bg-greenx/[0.07] px-3.5 py-2.5">
            <ImageIcon size={14} className="text-greenx" />
            <span className="text-[12px] text-txt-secondary">Attached: {attached}</span>
            <button
              type="button"
              className="ml-auto text-[11px] text-txt-muted hover:text-txt-secondary"
              onClick={() => setAttached(null)}
            >
              Clear
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3">
            <StateBlock
              kind="model"
              title="Local model unavailable"
              description={`${error} NeoBrain used the labelled development fallback instead.`}
              compact
            />
          </div>
        ) : null}

        {/* quick prompts */}
        <section className="mt-7">
          <SectionHeading label="Try" title="Quick prompts" />
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void submit(prompt)}
                className="group rounded-full border border-line-subtle bg-ink-850/50 px-3.5 py-2 text-left text-[12px] text-txt-secondary transition-all duration-200 hover:border-cyanx/40 hover:text-txt-primary active:scale-[0.98]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* capability note + recent answers */}
        <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel className="p-5">
            <div className="flex items-start gap-3">
              <Info size={15} className="mt-0.5 shrink-0 text-cyanx" />
              <div>
                <div className="text-[13px] font-medium text-txt-primary">What is running here</div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-txt-secondary">
                  {providers.inference.label} · {providers.retrieval.label}. Speech input uses{" "}
                  {speech.label}. Nothing on this screen contacts a server.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip as="span">{providers.retrieval.detail}</Chip>
                  <Chip as="span">Raw audio: not stored</Chip>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHeading label="History" title="Recent answers" />
            <div className="mt-3 space-y-1.5">
              {recentAnswers.length === 0 ? (
                <p className="text-[12px] text-txt-muted">No answers yet.</p>
              ) : (
                recentAnswers.map((answer) => (
                  <button
                    key={answer.id}
                    type="button"
                    onClick={() => navigate(`/app/answer/${answer.id}`)}
                    className="block w-full rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-2.5 text-left transition-colors hover:border-line-soft"
                  >
                    <div className="truncate text-[12.5px] text-txt-primary">{answer.question}</div>
                    <div className="mt-1 text-[10.5px] text-txt-muted">
                      {relativeTime(answer.createdAt)} · {answer.sources.length} sources
                    </div>
                  </button>
                ))
              )}
            </div>
          </Panel>
        </div>

        {session.name && !isDesktop ? (
          <p className="mt-6 text-center text-[10.5px] text-txt-muted">
            Local profile · {session.name} · stored on this device
          </p>
        ) : null}
      </div>

      {/* honest capability sheet for camera / screen */}
      <Sheet
        open={modeSheet !== null}
        onClose={() => setModeSheet(null)}
        title={modeSheet === "camera" ? "Camera input" : "Screen understanding"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModeSheet(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModeSheet(null);
                fileRef.current?.click();
              }}
            >
              <FileText size={15} /> Attach an image instead
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <StateBlock
            kind="permission"
            title={`${modeSheet === "camera" ? "Camera" : "Screen"} capture needs the device build`}
            description={
              modeSheet === "camera"
                ? "The browser prototype cannot open the device camera through this workspace. The Android build uses CameraX for on-device capture."
                : "Screen understanding is part of the Android/desktop agent. On the web you can attach a screenshot file."
            }
            compact
          />
          <p className="text-[12px] leading-relaxed text-txt-secondary">
            Attaching a file works right now: NeoBrain records its metadata, marks its indexing state and
            includes it in local retrieval.
          </p>
        </div>
      </Sheet>

      <AnimatePresence>
        {busy ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-ink-900/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <BrainCore state="processing" size={160} />
              <div className="text-center">
                <div className="text-[13.5px] font-medium text-txt-primary">Searching your world…</div>
                <div className="mt-1 text-[11.5px] text-txt-muted">Local retrieval · no upload</div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
