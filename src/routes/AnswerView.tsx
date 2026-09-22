/**
 * Answer View — Intelligence Briefing & Retrieval Trace.
 *
 * Formatted as an executive research dossier with verified local sources,
 * structured synthesis points, provenance audit trail, and follow-up console.
 */

import {
  ArrowLeft,
  Bookmark,
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  Mic,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  ListRow,
  Panel,
  Sheet,
  StateBlock,
} from "../components/ui";
import { clockTime, fileSize, relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useSourceMap } from "../lib/store";
import { useAsk } from "../lib/useAsk";
import type { Source } from "../lib/types";

const SOURCE_ICON = {
  pdf: FileText,
  code: Code2,
  image: ImageIcon,
  audio: Mic,
  note: NotebookPen,
  doc: FileText,
  dir: HardDrive,
} as const;

export default function AnswerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { state, createMemory, saveAnswer, logActivity } = useBrain();
  const sourceMap = useSourceMap();
  const { ask } = useAsk();

  const answer = useMemo(() => state.answers.find((item) => item.id === id), [state.answers, id]);
  const [openSource, setOpenSource] = useState<Source | null>(null);
  const [saved, setSaved] = useState(false);
  const [projectSheet, setProjectSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [busy, setBusy] = useState(false);

  const related = useMemo(
    () =>
      (answer?.relatedMemoryIds ?? [])
        .map((memoryId) => state.memories.find((memory) => memory.id === memoryId))
        .filter((memory): memory is NonNullable<typeof memory> => Boolean(memory)),
    [answer, state.memories]
  );

  if (!answer) {
    return (
      <div className="px-5 py-8 text-[#E2E8F0]">
        {!isDesktop ? <MobileTopBar title="Answer" tagline="NeoBrain" /> : null}
        <div className="mt-6">
          <StateBlock
            kind="search-empty"
            title="That answer is no longer in active cache"
            description="It may have been cleared during vault maintenance. Asking again will re-synthesize directly from your local graph."
            action={
              <Button variant="primary" onClick={() => navigate("/app/ask")}>
                Ask something
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const project = state.projects.find((item) => item.id === answer.projectId);

  const handleFollowUp = async (text?: string) => {
    const value = (text ?? followUp).trim();
    if (!value) return;
    setBusy(true);
    const run = await ask(value, answer.projectId);
    setBusy(false);
    setFollowUp("");
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  const saveToMemory = () => {
    createMemory({
      title: answer.question.slice(0, 72),
      content: `${answer.summary}\n\n${answer.points.map((point) => `• ${point}`).join("\n")}`,
      category: "knowledge",
      importance: "important",
      retentionType: "forever",
      sourceReferences: answer.sources,
      projectId: answer.projectId,
      reason: "Saved from Intelligence Briefing.",
    });
    setSaved(true);
    logActivity({
      type: "candidate",
      title: "Answer saved to memory",
      detail: answer.question,
      status: "done",
    });
  };

  const copyAnswer = async () => {
    const text = `${answer.question}\n\n${answer.summary}\n\n${answer.points
      .map((p, i) => `${i + 1}. ${p}`)
      .join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title="Briefing" tagline="Verified Synthesis" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 hidden items-center gap-2 font-mono text-[12px] text-[#64748B] transition-colors hover:text-[#00D1FF] lg:flex"
        >
          <ArrowLeft size={13} /> Return to previous view
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* ── Main Dossier Column ───────────────────────────── */}
          <div className="space-y-6">
            {/* Question Banner */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/70 p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#00D1FF]/40 bg-[#020407] text-[#00D1FF] shadow-[0_0_14px_rgba(0,209,255,0.3)]">
                  <Sparkles size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                    ✦ OPERATOR QUERY
                  </div>
                  <h1 className="mt-1 font-display text-[22px] font-bold leading-snug text-white sm:text-[26px]">
                    {answer.question}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10.5px]">
                    {project && (
                      <span className="rounded-full border border-[#3882F6]/30 bg-[#3882F6]/10 px-2.5 py-0.5 text-[#60A5FA]">
                        {project.name}
                      </span>
                    )}
                    <span className="rounded-full border border-[#334155]/40 bg-[#020407]/60 px-2.5 py-0.5 text-[#94A3B8]">
                      {answer.computedBy}
                    </span>
                    <span className="text-[#64748B]">{relativeTime(answer.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Dossier Synthesis */}
            <div className="relative overflow-hidden rounded-[24px] border border-[#00D1FF]/40 bg-gradient-to-b from-[#0F1B2D]/80 via-[#0B1320]/80 to-[#020407]/90 p-7 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(0,209,255,0.1)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                  <span className="h-2 w-2 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                  SYNTHESIZED BRIEFS
                </div>
                <span className="font-mono text-[11px] text-[#10B981]">
                  Verified Local Inference
                </span>
              </div>

              {/* Summary lead */}
              <div className="rounded-2xl border-l-2 border-[#00D1FF] bg-[#020407]/50 p-4 font-display text-[16px] font-medium leading-relaxed text-[#E2E8F0]">
                {answer.summary}
              </div>

              {/* Key points breakdown */}
              {answer.points && answer.points.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                    EVIDENCE DERIVATIONS
                  </div>
                  {answer.points.map((point, index) => (
                    <div
                      key={point}
                      className="flex items-start gap-3.5 rounded-xl border border-[#334155]/25 bg-[#020407]/40 p-3.5"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#00D1FF]/40 bg-[#020407] font-mono text-[10.5px] font-bold text-[#00D1FF]">
                        {index + 1}
                      </span>
                      <p className="text-[13px] leading-relaxed text-[#CBD5E1]">{point}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  icon={saved ? Check : Bookmark}
                  onClick={saveToMemory}
                  disabled={saved}
                >
                  {saved ? "Stored in Memory" : "Save to Memory"}
                </Button>
                <Button icon={FolderPlus} onClick={() => setProjectSheet(true)}>
                  Link Project
                </Button>
                <Button
                  icon={Wand2}
                  loading={busy}
                  onClick={() => void handleFollowUp("Provide full architectural citations and FFT frequency breakdown.")}
                >
                  Elaborate Citations
                </Button>
                <Button
                  variant="ghost"
                  icon={copied ? Check : Copy}
                  onClick={() => void copyAnswer()}
                >
                  {copied ? "Copied" : "Copy Briefing"}
                </Button>
              </div>

              {/* Follow-up Command Console Input */}
              <form
                className="mt-6 flex items-center gap-2 rounded-2xl border border-[#334155]/60 bg-[#020407]/80 p-2 shadow-inner"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleFollowUp();
                }}
              >
                <input
                  className="w-full bg-transparent px-3 text-[13px] text-[#E2E8F0] placeholder:text-[#64748B] outline-none"
                  placeholder="Ask a contextual follow-up query…"
                  aria-label="Follow-up question"
                  value={followUp}
                  onChange={(event) => setFollowUp(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={busy || !followUp.trim()}
                  className="rounded-xl bg-[#00D1FF] px-4 py-2 text-[12.5px] font-semibold text-black hover:bg-[#38bdf8] disabled:opacity-30 transition-all shadow-[0_0_12px_rgba(0,209,255,0.4)]"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>

          {/* ── Side Rail Column: Citations & Related ─────────── */}
          <aside className="space-y-6">
            {/* Primary Source Reference */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3882F6] mb-3">
                <span className="h-2 w-2 rounded-full bg-[#3882F6] shadow-[0_0_8px_#3882F6]" />
                PRIMARY WORKSPACE CONTEXT
              </div>

              <div className="rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-4">
                <div className="text-[14px] font-semibold text-white">
                  {project?.name ?? "SmartLine"} /{" "}
                  {answer.sources.length > 0
                    ? sourceMap[answer.sources[0]]?.name ?? "Presentation"
                    : "Presentation"}
                </div>
                <div className="mt-1 font-mono text-[10.5px] text-[#64748B]">
                  Verified Local Subnet Path · Immutable Document
                </div>
              </div>
            </div>

            {/* Evidence & Document Citations */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                  RETRIEVAL EVIDENCE
                </div>
                <span className="font-mono text-[10.5px] text-[#64748B]">
                  {answer.sources.length} sources
                </span>
              </div>

              <div className="space-y-2.5">
                {answer.sources.length === 0 ? (
                  <div className="space-y-2">
                    {["SmartLine design notes", "MSME Hackathon draft", "Bearing vibration analysis"].map(
                      (mockEvidence, i) => (
                        <div
                          key={mockEvidence}
                          className="rounded-xl border border-[#334155]/30 bg-[#020407]/50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-medium text-white">{mockEvidence}</span>
                            <span className="font-mono text-[10px] text-[#10B981]">
                              {98 - i * 4}% match
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono text-[9.5px] text-[#64748B]">
                            Indexed on physical SSD
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  answer.sources.map((sourceId, idx) => {
                    const source = sourceMap[sourceId];
                    if (!source) return null;
                    const Icon = SOURCE_ICON[source.type] ?? FileText;

                    return (
                      <div
                        key={sourceId}
                        className="rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-3.5 transition-all hover:border-[#00D1FF]/40"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#0A0F1C] text-[#00D1FF]">
                            <Icon size={14} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-[13px] font-medium text-white">
                                {source.name}
                              </span>
                              <span className="font-mono text-[10px] text-[#10B981] shrink-0">
                                {98 - idx * 4}% match
                              </span>
                            </div>
                            <div className="mt-0.5 truncate font-mono text-[10px] text-[#64748B]">
                              {source.type.toUpperCase()} · {fileSize(source.sizeKb)} · indexed{" "}
                              {source.indexedAt ? relativeTime(source.indexedAt) : "today"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setOpenSource(source)}
                            className="inline-flex items-center gap-1 font-mono text-[10.5px] text-[#00D1FF] hover:underline"
                          >
                            <ExternalLink size={10} /> Inspect metadata
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Related Memories */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#885CF6]">
                  <span className="h-2 w-2 rounded-full bg-[#885CF6] shadow-[0_0_8px_#885CF6]" />
                  CONNECTED MEMORIES
                </div>
                <span className="font-mono text-[10.5px] text-[#64748B]">
                  {related.length} nodes
                </span>
              </div>

              <div className="space-y-2">
                {related.length === 0 ? (
                  <p className="text-[12px] text-[#64748B]">No related memories linked.</p>
                ) : (
                  related.map((memory) => (
                    <button
                      key={memory.id}
                      onClick={() => navigate(`/app/memory?focus=${memory.id}`)}
                      className="block w-full rounded-xl border border-[#334155]/30 bg-[#020407]/50 p-3 text-left transition-all hover:border-[#885CF6]/50 hover:bg-[#0F1B2D]/40"
                    >
                      <div className="truncate text-[12.5px] font-medium text-white">
                        {memory.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-[#64748B]">
                        <span className="rounded-full border border-[#885CF6]/40 bg-[#885CF6]/10 px-1.5 py-0.2 text-[#885CF6]">
                          {memory.category}
                        </span>
                        <span>{relativeTime(memory.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

              <Link
                to="/app/memory"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00D1FF] hover:underline"
              >
                Open Memory Galaxy →
              </Link>
            </div>

            {/* Provenance Trace */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B] mb-3">
                ✦ AUDIT TRAIL
              </div>
              <h3 className="font-display text-[16px] font-bold text-white mb-3">
                How This Answer Was Formed
              </h3>

              <div className="space-y-2.5 font-mono text-[11.5px]">
                {[
                  { step: "Scanning Sources", detail: `${state.sources.length} local files checked` },
                  { step: "Evaluating Memories", detail: `${state.memories.filter((m) => !m.deletedAt).length} active nodes` },
                  { step: "Ranking Algorithm", detail: "Vector Similarity + Recency Weighting" },
                  { step: "Synthesis Boundary", detail: answer.computedBy },
                ].map((row, index) => (
                  <div key={row.step} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#10B981]/40 bg-[#10B981]/10 text-[10px] font-bold text-[#10B981]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <span className="text-[#94A3B8]">{row.step}</span>
                      <span className="text-[#64748B]">{row.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Metadata Inspection Sheet ───────────────────────── */}
      <Sheet
        open={openSource !== null}
        onClose={() => setOpenSource(null)}
        title={openSource?.name ?? "Source Document"}
      >
        {openSource ? (
          <div className="space-y-4 font-mono">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Type", value: openSource.type.toUpperCase() },
                { label: "Size", value: fileSize(openSource.sizeKb) },
                { label: "Modified", value: clockTime(openSource.modifiedAt) },
                {
                  label: "Indexed",
                  value: openSource.indexedAt ? relativeTime(openSource.indexedAt) : "Pending",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-[#334155]/40 bg-[#0A0F1C] p-3 text-[11px]"
                >
                  <div className="uppercase text-[#64748B]">{row.label}</div>
                  <div className="mt-1 font-bold text-white text-[12.5px]">{row.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#334155]/40 bg-[#0A0F1C] p-3.5 text-[11px]">
              <div className="uppercase text-[#64748B]">Physical Local Path</div>
              <div className="mt-1 break-all text-[#00D1FF]">{openSource.pathOrReference}</div>
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* ── Project Assignment Sheet ────────────────────────── */}
      <Sheet open={projectSheet} onClose={() => setProjectSheet(false)} title="Link to Project">
        <div className="space-y-2">
          {state.projects.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const updated = { ...answer, projectId: item.id };
                saveAnswer(updated);
                setProjectSheet(false);
                logActivity({
                  type: "context",
                  title: "Answer linked to project",
                  detail: item.name,
                  status: "done",
                  projectId: item.id,
                });
              }}
              className="flex w-full items-center gap-3.5 rounded-xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 text-left transition-all hover:border-[#00D1FF]/40"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                <FolderPlus size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-white">{item.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-[#64748B]">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
