/**
 * Answer View — a structured, citable result.
 *
 * Shows what was retrieved and where it came from. It deliberately does not show
 * hidden reasoning: the retrieval trace and the source list are the explanation.
 */

import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  ExternalLink,
  FileText,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  Code2,
  Mic,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BrainCore } from "../components/BrainCore";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  ListRow,
  Panel,
  SectionHeading,
  Sheet,
  StateBlock,
  TechLabel,
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
    [answer, state.memories],
  );

  if (!answer) {
    return (
      <div className="px-5 py-8">
        {!isDesktop ? <MobileTopBar title="Answer" tagline="NeoBrain" /> : null}
        <div className="mt-6">
          <StateBlock
            kind="search-empty"
            title="That answer is no longer available"
            description="It may have been cleared when you deleted memories. Ask again and NeoBrain will rebuild it from your local index."
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
      reason: "Saved from an answer.",
    });
    setSaved(true);
    logActivity({ type: "candidate", title: "Answer saved to memory", detail: answer.question, status: "done" });
  };

  const copyAnswer = async () => {
    const text = `${answer.question}\n\n${answer.summary}\n${answer.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Answer" tagline="NeoBrain" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 hidden items-center gap-2 text-[12.5px] text-txt-muted transition-colors hover:text-txt-secondary lg:flex"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          {/* main */}
          <div className="space-y-4">
            <Panel className="p-5">
              <div className="flex items-start gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyanx/30 bg-cyanx/10 text-cyanx">
                  <Sparkles size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <TechLabel className="mb-1.5">You asked</TechLabel>
                  <h1 className="text-[17px] font-semibold leading-snug text-txt-primary">
                    {answer.question}
                  </h1>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {project ? <Chip as="span" active>{project.name}</Chip> : null}
                    <Chip as="span">{answer.computedBy}</Chip>
                    <span className="text-[10.5px] text-txt-muted">{relativeTime(answer.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <BrainCore state="responding" size={56} />
                <div>
                  <TechLabel tone="cyan">NeoBrain</TechLabel>
                  <div className="mt-1 text-[12px] text-txt-muted">
                    Built from {related.length} memories and {answer.sources.length} sources
                  </div>
                </div>
              </div>

              <p className="text-[13.5px] text-txt-secondary">{answer.summary}</p>

              <ol className="mt-4 space-y-3.5">
                {answer.points.map((point, index) => (
                  <li key={point} className="flex gap-3.5">
                    <span className="numeral mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyanx/30 bg-cyanx/10 text-[11px] text-cyanx">
                      {index + 1}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-txt-secondary">{point}</span>
                  </li>
                ))}
              </ol>

              <div className="divider my-5" />

              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" icon={saved ? Check : Bookmark} onClick={saveToMemory} disabled={saved}>
                  {saved ? "Saved" : "Save to memory"}
                </Button>
                <Button icon={FolderPlus} onClick={() => setProjectSheet(true)}>
                  Add to project
                </Button>
                <Button icon={Wand2} loading={busy} onClick={() => void handleFollowUp("Explain this in more detail with sources.")}>
                  Explain more
                </Button>
                <Button variant="ghost" icon={copied ? Check : Copy} onClick={() => void copyAnswer()}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <form
                className="mt-5 flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleFollowUp();
                }}
              >
                <input
                  className="input flex-1"
                  placeholder="Ask a follow-up…"
                  aria-label="Follow-up question"
                  value={followUp}
                  onChange={(event) => setFollowUp(event.target.value)}
                />
                <Button type="submit" loading={busy} aria-label="Send follow-up">
                  Ask
                </Button>
              </form>
            </Panel>
          </div>

          {/* side rail */}
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionHeading label="Retrieval" title={`Sources · ${answer.sources.length}`} />
              <div className="mt-3.5 space-y-2">
                {answer.sources.length === 0 ? (
                  <p className="text-[12px] text-txt-muted">
                    No files matched — this answer came from memories only.
                  </p>
                ) : (
                  answer.sources.map((sourceId) => {
                    const source = sourceMap[sourceId];
                    if (!source) return null;
                    const Icon = SOURCE_ICON[source.type] ?? FileText;
                    return (
                      <div
                        key={sourceId}
                        className="rounded-md border border-line-subtle bg-ink-850/45 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                            <Icon size={13} strokeWidth={1.7} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12.5px] font-medium text-txt-primary">
                              {source.name}
                            </div>
                            <div className="mt-0.5 truncate text-[10.5px] text-txt-muted">
                              {source.type.toUpperCase()} · {fileSize(source.sizeKb)} · indexed{" "}
                              {source.indexedAt ? relativeTime(source.indexedAt) : "—"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setOpenSource(source)}>
                            <ExternalLink size={12} /> Open source
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Related" title={`Memories · ${related.length}`} />
              <div className="mt-2.5 space-y-1">
                {related.length === 0 ? (
                  <p className="text-[12px] text-txt-muted">No related memories.</p>
                ) : (
                  related.map((memory) => (
                    <ListRow
                      key={memory.id}
                      icon={ShieldCheck}
                      title={memory.title}
                      subtitle={`${memory.category} · ${relativeTime(memory.createdAt)}`}
                      accent={memory.category === "decision" ? "violet" : "cyan"}
                      onClick={() => navigate(`/app/memory?focus=${memory.id}`)}
                    />
                  ))
                )}
              </div>
              <div className="divider my-3.5" />
              <Link to="/app/memory" className="text-[11.5px] text-cyanx">
                Open all memories
              </Link>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="How this was built" title="Retrieval trace" />
              <div className="mt-3.5 space-y-3">
                {[
                  { step: "Searching files", detail: `${state.sources.length} sources scanned` },
                  { step: "Checking memories", detail: `${state.memories.filter((m) => !m.deletedAt).length} memories scanned` },
                  { step: "Ranking", detail: "Hybrid keyword + vector fusion" },
                  { step: "Composing", detail: answer.computedBy },
                ].map((row, index) => (
                  <div key={row.step} className="flex gap-3">
                    <span className="numeral mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-greenx/40 bg-greenx/10 text-[10px] text-greenx">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] text-txt-primary">{row.step}</div>
                      <div className="mt-0.5 text-[10.5px] text-txt-muted">{row.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10.5px] leading-relaxed text-txt-muted">
                NeoBrain shows retrieval context, not hidden model reasoning.
              </p>
            </Panel>
          </div>
        </div>
      </div>

      {/* source detail */}
      <Sheet
        open={openSource !== null}
        onClose={() => setOpenSource(null)}
        title={openSource?.name ?? "Source"}
      >
        {openSource ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Type", value: openSource.type.toUpperCase() },
                { label: "Size", value: fileSize(openSource.sizeKb) },
                { label: "Modified", value: clockTime(openSource.modifiedAt) },
                { label: "Indexed", value: openSource.indexedAt ? relativeTime(openSource.indexedAt) : "not indexed" },
              ].map((row) => (
                <div key={row.label} className="rounded-md border border-line-subtle bg-ink-850/40 p-3">
                  <TechLabel>{row.label}</TechLabel>
                  <div className="mt-1 text-[13px] text-txt-primary">{row.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
              <TechLabel>Local path</TechLabel>
              <div className="mt-1.5 break-all font-mono text-[11.5px] text-txt-secondary">
                {openSource.pathOrReference}
              </div>
            </div>

            <div className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
              <TechLabel>Extracted metadata</TechLabel>
              <div className="mt-2 space-y-1.5">
                {Object.entries(openSource.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 text-[11.5px]">
                    <span className="text-txt-muted">{key}</span>
                    <span className="text-txt-secondary">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-txt-muted">
              Opening the original file requires the device agent that has access to{" "}
              <span className="text-txt-secondary">{openSource.pathOrReference}</span>. The browser
              prototype can only show the indexed metadata.
            </p>
          </div>
        ) : null}
      </Sheet>

      {/* project assignment */}
      <Sheet open={projectSheet} onClose={() => setProjectSheet(false)} title="Link to a project">
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
              className="flex w-full items-center gap-3 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3 text-left transition-colors hover:border-line-soft"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                <FolderPlus size={13} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-txt-primary">{item.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-txt-muted">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
