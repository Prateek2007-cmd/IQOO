/**
 * Project Detail — Intelligent Workspace Command Center.
 *
 * Provides full operational visibility into an individual project workspace:
 * vector index coverage, architectural decisions, connected source files,
 * task state machine, and semantic knowledge cluster inspection.
 */

import {
  ArrowLeft,
  Brain,
  Check,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  HardDrive,
  Layers,
  MessageSquareText,
  NotebookPen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActivityTimeline } from "../components/ActivityFeed";
import { BrainCore } from "../components/BrainCore";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  ListRow,
  MicroRing,
  Panel,
  Progress,
  StateBlock,
} from "../components/ui";
import { fileSize, relativeTime, shortDate } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain } from "../lib/store";

type TabId = "overview" | "files" | "memories" | "tasks" | "timeline";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, updateSource, updateTask, logActivity } = useBrain();
  const now = useNow(20_000);
  const [tab, setTab] = useState<TabId>("overview");

  const project = state.projects.find((item) => item.id === id);

  const files = useMemo(
    () => state.sources.filter((source) => source.projectId === id),
    [state.sources, id]
  );
  const memories = useMemo(
    () => state.memories.filter((memory) => !memory.deletedAt && memory.projectId === id),
    [state.memories, id]
  );
  const tasks = useMemo(
    () => state.tasks.filter((task) => task.projectId === id),
    [state.tasks, id]
  );
  const conversations = useMemo(
    () => state.conversations.filter((conversation) => conversation.projectId === id),
    [state.conversations, id]
  );
  const activity = useMemo(
    () => state.activity.filter((event) => event.projectId === id),
    [state.activity, id]
  );

  if (!project) {
    return (
      <div className="px-5 py-8 text-[#E2E8F0]">
        {!isDesktop ? <MobileTopBar title="Project" tagline="NeoBrain" /> : null}
        <div className="mt-6">
          <StateBlock
            kind="search-empty"
            title="Workspace Not Found"
            description="It may have been deleted or archived. Your sovereign data remains untouched."
            action={
              <Button variant="primary" onClick={() => navigate("/app/projects")}>
                Back to Workspaces
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const decisions = memories.filter((memory) => memory.category === "decision");
  const indexed = files.filter((file) => file.indexStatus === "indexed").length;
  const coverage = files.length ? indexed / files.length : 0.85;

  const currentState = [
    { label: "Files Indexed", value: `${indexed} / ${files.length}`, done: indexed === files.length && files.length > 0 },
    { label: "Open Action Items", value: `${tasks.filter((task) => task.status !== "done").length}`, done: false },
    { label: "Decisions Locked", value: `${decisions.length}`, done: decisions.length > 0 },
    { label: "Last Neural Sync", value: relativeTime(project.updatedAt, now), done: true },
  ];

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title={project.name} tagline="Mission Workspace" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {isDesktop ? (
          <Link
            to="/app/projects"
            className="mb-5 inline-flex items-center gap-2 font-mono text-[12px] text-[#64748B] transition-colors hover:text-[#00D1FF]"
          >
            <ArrowLeft size={13} /> Back to Workspaces
          </Link>
        ) : null}

        {/* ── 1. Cinematic Hero Banner Panel ──────────────────── */}
        <div className="relative mb-6 overflow-hidden rounded-[24px] border border-[#00D1FF]/30 bg-gradient-to-r from-[#0F1B2D]/90 via-[#0B1320]/90 to-[#020407]/95 p-6 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(0,209,255,0.12)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#00D1FF]/10 blur-[80px]" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0 max-w-[70ch]">
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                <FolderKanban size={12} />
                {project.tags.join(" · ") || "INTELLIGENT WORKSPACE"}
              </div>
              <h1 className="mt-1.5 font-display text-[32px] font-bold text-white sm:text-[40px]">
                {project.name}
              </h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#94A3B8]">
                {project.description}
              </p>

              {/* Data Badges */}
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2.5 py-0.5 text-[#00D1FF]">
                  <FileText size={11} /> {files.length} indexed files
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-[#885CF6]/30 bg-[#885CF6]/10 px-2.5 py-0.5 text-[#885CF6]">
                  <Sparkles size={11} /> {memories.length} memories
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-0.5 text-[#F59E0B]">
                  <CheckSquare size={11} /> {tasks.length} tasks
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-[#3882F6]/30 bg-[#3882F6]/10 px-2.5 py-0.5 text-[#60A5FA]">
                  <MessageSquareText size={11} /> {conversations.length} threads
                </span>
              </div>
            </div>

            {/* Coverage Ring & Core */}
            <div className="flex items-center gap-5 border-t border-[#334155]/30 pt-4 lg:border-t-0 lg:pt-0 shrink-0">
              <div className="flex items-center gap-3 rounded-2xl border border-[#334155]/40 bg-[#020407]/60 p-3.5 backdrop-blur-xl">
                <MicroRing progress={coverage} size={46} color="#00D1FF" />
                <div>
                  <div className="font-mono text-[16px] font-bold text-white">
                    {Math.round(coverage * 100)}%
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                    Index Density
                  </div>
                </div>
              </div>

              <div className="hidden sm:block">
                <BrainCore state="connected" size={isDesktop ? 100 : 70} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Navigation Tabs ──────────────────────────────── */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto border-b border-[#334155]/30 pb-3">
          {[
            { id: "overview", label: "Overview" },
            { id: "files", label: "Files", count: files.length },
            { id: "memories", label: "Memories", count: memories.length },
            { id: "tasks", label: "Tasks", count: tasks.length },
            { id: "timeline", label: "Timeline" },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as TabId)}
                className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-all ${
                  active
                    ? "border border-[#00D1FF]/50 bg-[#00D1FF]/10 text-white shadow-[0_0_14px_rgba(0,209,255,0.25)]"
                    : "border border-transparent text-[#94A3B8] hover:border-[#334155]/50 hover:bg-[#0F1B2D]/40 hover:text-white"
                }`}
              >
                <span>{t.label}</span>
                {typeof t.count === "number" && (
                  <span
                    className={`font-mono text-[10.5px] ${
                      active ? "text-[#00D1FF]" : "text-[#64748B]"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── 3. Tab Contents & Side Rail ─────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {tab === "overview" && (
              <>
                {/* State Strip */}
                <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                    ✦ OPERATIONAL TELEMETRY
                  </div>
                  <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                    Current Workspace Status
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {currentState.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center gap-3.5 rounded-xl border border-[#334155]/40 bg-[#020407]/60 px-4 py-3"
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                            row.done
                              ? "border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]"
                              : "border-[#00D1FF]/40 bg-[#00D1FF]/10 text-[#00D1FF]"
                          }`}
                        >
                          {row.done ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        <div className="min-w-0 font-mono">
                          <div className="text-[10px] uppercase tracking-wider text-[#64748B]">
                            {row.label}
                          </div>
                          <div className="mt-0.5 truncate text-[13px] font-semibold text-white">
                            {row.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions Section */}
                <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
                    ✦ ANCHORED DECISIONS
                  </div>
                  <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                    Architectural &amp; Strategic Choices
                  </h2>

                  <div className="mt-4 space-y-2.5">
                    {decisions.length === 0 ? (
                      <p className="text-[12px] text-[#64748B]">
                        No decisions captured for this project yet.
                      </p>
                    ) : (
                      decisions.map((decision) => (
                        <div
                          key={decision.id}
                          className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.04] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-semibold text-white">
                                {decision.title}
                              </div>
                              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#94A3B8]">
                                {decision.content}
                              </p>
                            </div>
                            <span className="shrink-0 font-mono text-[10.5px] text-[#64748B]">
                              {shortDate(decision.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Conversations Section */}
                <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3882F6]">
                    ✦ CONVERSATIONAL CONTEXT
                  </div>
                  <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                    {conversations.length} Active Threads
                  </h2>

                  <div className="mt-3 space-y-1.5">
                    {conversations.length === 0 ? (
                      <p className="text-[12px] text-[#64748B]">No conversations linked yet.</p>
                    ) : (
                      conversations.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#3882F6]/40 bg-[#020407] text-[#3882F6]">
                              <MessageSquareText size={13} />
                            </span>
                            <div>
                              <div className="text-[13px] font-medium text-white">{c.title}</div>
                              <div className="font-mono text-[10px] text-[#64748B]">
                                {c.messages.length} messages · {c.retentionStatus}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-[#64748B]">
                            {relativeTime(c.updatedAt, now)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "files" && (
              <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                      ✦ VECTOR INDEX
                    </div>
                    <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                      {files.length} Connected Documents
                    </h2>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {files.length === 0 ? (
                    <StateBlock
                      kind="empty"
                      title="No files in this workspace"
                      description="Add documents or folders from Knowledge Space and they will be indexed here."
                      compact
                    />
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                            <FileText size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-semibold text-white">
                              {file.name}
                            </div>
                            <div className="mt-0.5 truncate font-mono text-[11px] text-[#64748B]">
                              {file.pathOrReference}
                            </div>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                              <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C] px-2 py-0.2 uppercase text-[#94A3B8]">
                                {file.type}
                              </span>
                              <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C] px-2 py-0.2 text-[#94A3B8]">
                                {fileSize(file.sizeKb)}
                              </span>
                              <span className="rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2 py-0.2 text-[#00D1FF]">
                                {file.indexStatus}
                                {file.indexedAt ? ` · ${relativeTime(file.indexedAt, now)}` : ""}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              updateSource(file.id, { indexStatus: "indexing", indexError: undefined });
                              window.setTimeout(() => {
                                updateSource(file.id, {
                                  indexStatus: "indexed",
                                  indexedAt: new Date().toISOString(),
                                });
                                logActivity({
                                  type: "file",
                                  title: "File re-indexed",
                                  detail: file.name,
                                  status: "done",
                                  projectId: project.id,
                                });
                              }, 1100);
                            }}
                            className="border-[#334155]/40 hover:border-[#00D1FF]/40"
                          >
                            <RefreshCw size={12} /> Re-index
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "memories" && (
              <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#885CF6]">
                  ✦ MEMORY MESH
                </div>
                <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                  {memories.length} Linked Memories
                </h2>

                <div className="mt-4 space-y-2">
                  {memories.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">No memories filed here yet.</p>
                  ) : (
                    memories.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => navigate(`/app/memory?focus=${m.id}`)}
                        className="group flex w-full items-center justify-between rounded-xl border border-[#334155]/30 bg-[#020407]/50 p-3.5 text-left transition-all hover:border-[#00D1FF]/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                            {m.category === "decision" ? (
                              <ShieldCheck size={13} className="text-[#F59E0B]" />
                            ) : (
                              <Sparkles size={13} />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-white group-hover:text-[#00D1FF]">
                              {m.title}
                            </div>
                            <div className="font-mono text-[10px] text-[#64748B]">
                              {m.category} · {relativeTime(m.createdAt, now)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "tasks" && (
              <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
                  ✦ MISSION TASKS
                </div>
                <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                  {tasks.length} Workspace Action Items
                </h2>

                <div className="mt-4 space-y-2.5">
                  {tasks.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">No tasks linked to this workspace.</p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3.5 rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-3.5"
                      >
                        <button
                          type="button"
                          aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
                          onClick={() =>
                            updateTask(task.id, { status: task.status === "done" ? "open" : "done" })
                          }
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                            task.status === "done"
                              ? "border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]"
                              : "border-[#334155] text-transparent hover:border-[#00D1FF]"
                          }`}
                        >
                          <Check size={12} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[13px] ${
                              task.status === "done"
                                ? "text-[#64748B] line-through"
                                : "text-white font-medium"
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                            <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C] px-2 py-0.2 uppercase text-[#94A3B8]">
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-[#64748B]">due {shortDate(task.dueDate)}</span>
                            )}
                            {task.sourceMemoryId && (
                              <button
                                type="button"
                                className="text-[#00D1FF] hover:underline"
                                onClick={() => navigate(`/app/memory?focus=${task.sourceMemoryId}`)}
                              >
                                View Source Memory
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "timeline" && (
              <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                  ✦ AUDIT LOG
                </div>
                <h2 className="mt-1 font-display text-[18px] font-bold text-white">
                  Workspace Activity History
                </h2>

                <div className="mt-4">
                  {activity.length === 0 ? (
                    <StateBlock
                      kind="empty"
                      title="No activity recorded"
                      description="Events are logged as you capture, classify, and index files in this workspace."
                      compact
                    />
                  ) : (
                    <ActivityTimeline events={activity} now={now} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Side Rail Column ───────────────────────────────── */}
          <aside className="space-y-6">
            {/* Semantic Knowledge Graph Clusters */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                ✦ KNOWLEDGE TOPOLOGY
              </div>
              <h3 className="mt-1 font-display text-[18px] font-bold text-white">
                Semantic Graph Clusters
              </h3>

              <div className="mt-4 space-y-2">
                {state.knowledge.nodes
                  .filter((node) => node.projectId === project.id)
                  .slice(0, 6)
                  .map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => navigate("/app/knowledge")}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#334155]/30 bg-[#020407]/50 p-3 text-left transition-all hover:border-[#00D1FF]/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-white">
                          {node.label}
                        </div>
                        <div className="font-mono text-[10px] text-[#64748B]">
                          {node.kind} · {node.connections} neural links
                        </div>
                      </div>
                      <Brain size={14} className="shrink-0 text-[#00D1FF]" />
                    </button>
                  ))}
              </div>
            </div>

            {/* Sovereign Storage Allocation */}
            <div className="rounded-[24px] border border-[#334155]/50 bg-[#0B1320]/60 p-6 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                ✦ STORAGE FOOTPRINT
              </div>
              <h3 className="mt-1 font-display text-[18px] font-bold text-white">
                Workspace Allocation
              </h3>

              <div className="mt-4 space-y-3 font-mono text-[12px]">
                {[
                  { icon: HardDrive, label: "Local Files", value: `${files.length} references` },
                  { icon: NotebookPen, label: "Memories", value: `${memories.length} records` },
                  { icon: FolderKanban, label: "Last Modified", value: relativeTime(project.updatedAt, now) },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className="flex items-center justify-between border-b border-[#334155]/25 pb-2"
                    >
                      <span className="flex items-center gap-2 text-[#64748B]">
                        <Icon size={13} className="text-[#00D1FF]" /> {row.label}
                      </span>
                      <span className="text-white font-semibold">{row.value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 font-mono text-[10.5px] leading-relaxed text-[#64748B]">
                Workspace indices reside entirely on your hardware. Deleting a workspace preserves files on physical disk.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
