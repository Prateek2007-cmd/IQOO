/**
 * Memory — everything NeoBrain remembers, fully editable.
 *
 * Every memory here can be opened, edited, re-scoped to a project, re-classified,
 * given a different retention rule, archived or permanently deleted. The store
 * writes through to local storage immediately.
 */

import {
  Archive,
  Check,
  CheckSquare,
  Clock,
  FileText,
  Filter,
  FolderKanban,
  Lightbulb,
  Pencil,
  Pin,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  ListRow,
  Panel,
  SectionHeading,
  Sheet,
  StateBlock,
  Tabs,
  TechLabel,
} from "../components/ui";
import { relativeTime, shortDate } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { Importance, Memory, RetentionType } from "../lib/types";

type TabId = "all" | "people" | "projects" | "ideas" | "decisions" | "tasks";

export default function MemoryPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const {
    state,
    updateMemory,
    softDeleteMemory,
    restoreMemory,
    purgeMemory,
    updateTask,
    createMemory,
    logActivity,
  } = useBrain();

  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(params.get("focus"));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", category: "note" as Memory["category"] });

  /* Deep-link support: /app/memory?focus=<id> */
  useEffect(() => {
    const focus = params.get("focus");
    if (focus) setOpenId(focus);
  }, [params]);

  const activeMemories = useMemo(() => state.memories.filter((m) => !m.deletedAt), [state.memories]);

  const memories = useMemo(() => {
    const base = activeMemories;
    const byTab =
      tab === "all"
        ? base
        : tab === "people"
          ? base.filter(
              (m) =>
                m.category === "conversation" ||
                /sarah|marcus|elena|david|alex|chen|team|client|advisor|founder/i.test(`${m.title} ${m.content}`),
            )
          : tab === "projects"
            ? base.filter((m) => Boolean(m.projectId))
            : tab === "ideas"
              ? base.filter((m) => m.category === "knowledge" || m.category === "note")
              : tab === "decisions"
                ? base.filter((m) => m.category === "decision")
                : base.filter((m) => m.category === "task");

    const byProject = projectFilter === "all" ? byTab : byTab.filter((m) => m.projectId === projectFilter);
    if (!query.trim()) return byProject;
    const needle = query.trim().toLowerCase();
    return byProject.filter((m) => `${m.title} ${m.content}`.toLowerCase().includes(needle));
  }, [activeMemories, tab, projectFilter, query]);

  const open = state.memories.find((memory) => memory.id === openId) ?? null;
  const archived = state.memories.filter((memory) => memory.deletedAt);
  const openTasks = state.tasks.filter((task) => task.status !== "done");

  const closeDetail = () => {
    setOpenId(null);
    setConfirmDelete(false);
    if (params.get("focus")) {
      params.delete("focus");
      setParams(params, { replace: true });
    }
  };

  const handleCreate = () => {
    if (!draft.title.trim() && !draft.content.trim()) return;
    const memory = createMemory({
      title: draft.title.trim() || draft.content.slice(0, 48),
      content: draft.content.trim(),
      category: draft.category,
      importance: "useful",
      retentionType: "30-days",
      reason: "Added manually.",
    });
    logActivity({ type: "candidate", title: "Memory added", detail: memory.title, status: "done" });
    setDraft({ title: "", content: "", category: "note" });
    setCreating(false);
    setOpenId(memory.id);
  };

  return (
    <div className="relative">
      {!isDesktop ? (
        <MobileTopBar
          title="Memory"
          tagline="Things that matter to you."
        />
      ) : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <TechLabel tone="cyan">Memory Space</TechLabel>
              <h1 className="mt-2 title-xl">Things that matter to you.</h1>
              <p className="mt-2 text-[13px] text-txt-secondary">
                {activeMemories.length} memories retained ·{" "}
                {activeMemories.filter((m) => m.importance === "important" || m.importance === "structured").length} high-priority beacons ·{" "}
                {activeMemories.filter((m) => m.status === "candidate").length} awaiting review
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              New memory
            </Button>
          </header>
        ) : null}

        {/* controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input pl-10 bg-surface/70 border-border"
                placeholder="Search memories across time…"
                aria-label="Search memories"
              />
            </div>
            {!isDesktop ? (
              <button
                type="button"
                className="icon-btn h-[46px] w-[46px] border-border bg-surface text-cyanx"
                aria-label="New memory"
                onClick={() => setCreating(true)}
              >
                <Plus size={17} />
              </button>
            ) : null}
          </div>

          <Tabs
            tabs={[
              { id: "all", label: "ALL", count: activeMemories.length },
              {
                id: "people",
                label: "PEOPLE",
                count: activeMemories.filter(
                  (m) =>
                    m.category === "conversation" ||
                    /sarah|marcus|elena|david|alex|chen|team|client|advisor|founder/i.test(`${m.title} ${m.content}`),
                ).length,
              },
              {
                id: "projects",
                label: "PROJECTS",
                count: activeMemories.filter((m) => Boolean(m.projectId)).length,
              },
              {
                id: "ideas",
                label: "IDEAS",
                count: activeMemories.filter((m) => m.category === "knowledge" || m.category === "note").length,
              },
              {
                id: "decisions",
                label: "DECISIONS",
                count: activeMemories.filter((m) => m.category === "decision").length,
              },
              {
                id: "tasks",
                label: "TASKS",
                count: openTasks.length,
              },
            ]}
            value={tab}
            onChange={(val) => setTab(val as TabId)}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-txt-muted font-mono">
              <Filter size={11} className="text-cyanx" /> Project Scope:
            </span>
            <Chip active={projectFilter === "all"} onClick={() => setProjectFilter("all")}>
              All
            </Chip>
            {state.projects.map((project) => (
              <Chip
                key={project.id}
                active={projectFilter === project.id}
                onClick={() => setProjectFilter(project.id)}
              >
                {project.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Main timeline column */}
          <div>
            {memories.length === 0 ? (
              <StateBlock
                kind={query || projectFilter !== "all" || tab !== "all" ? "search-empty" : "empty"}
                title={
                  query || projectFilter !== "all" || tab !== "all"
                    ? "Nothing matches those filters"
                    : "No memories yet"
                }
                description={
                  query || projectFilter !== "all" || tab !== "all"
                    ? "Clear the search or pick a different category tab."
                    : "Captures you accept — decisions, tasks and knowledge — collect here."
                }
                action={
                  query || projectFilter !== "all" || tab !== "all" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setQuery("");
                        setProjectFilter("all");
                        setTab("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => navigate("/app/voice")}>
                      Capture something
                    </Button>
                  )
                }
              />
            ) : (
              <div className="relative pl-6 sm:pl-8">
                {/* Continuous vertical timeline connector line */}
                <div
                  className="pointer-events-none absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-cyanx/50 via-border/80 to-transparent"
                  aria-hidden="true"
                />

                <div className="space-y-4">
                  {memories.map((memory) => {
                    const project = state.projects.find((item) => item.id === memory.projectId);
                    const isImportant =
                      memory.importance === "important" || memory.importance === "structured";
                    const isDecision = memory.category === "decision";
                    const isTask = memory.category === "task";

                    return (
                      <div key={memory.id} className="relative group">
                        {/* Timeline Node Orb */}
                        <div
                          className={`absolute -left-[19px] sm:-left-[23px] top-5 h-[17px] w-[17px] rounded-full border transition-all duration-300 ${
                            isImportant
                              ? "border-cyanx bg-space shadow-[0_0_12px_rgba(0,209,255,0.7)]"
                              : "border-border bg-space group-hover:border-line-soft"
                          }`}
                        >
                          <div
                            className={`h-full w-full rounded-full ${
                              isImportant
                                ? "bg-cyanx scale-[0.45] animate-pulse"
                                : "bg-txt-muted/30 scale-[0.35] group-hover:bg-cyanx/60"
                            }`}
                          />
                        </div>

                        {/* Memory Panel */}
                        <button
                          type="button"
                          onClick={() => setOpenId(memory.id)}
                          className={`w-full text-left rounded-2xl border p-4.5 transition-all duration-300 ease-premium ${
                            isImportant
                              ? "border-cyanx/35 bg-gradient-to-b from-[#0F1B2D]/90 to-[#0A0F1C]/90 shadow-[0_0_24px_rgba(0,209,255,0.07)] hover:border-cyanx/60 hover:shadow-[0_0_30px_rgba(0,209,255,0.14)]"
                              : "border-border bg-gradient-to-b from-surface/70 to-space/80 hover:border-line-soft hover:bg-surface/90"
                          } active:scale-[0.995]`}
                        >
                          <div className="flex items-start gap-3.5">
                            <span
                              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
                                isDecision
                                  ? "border-purplex/30 bg-purplex/10 text-purplex"
                                  : isTask
                                    ? "border-amberx/30 bg-amberx/10 text-amberx"
                                    : isImportant
                                      ? "border-cyanx/30 bg-cyanx/10 text-cyanx shadow-[0_0_10px_rgba(0,209,255,0.2)]"
                                      : "border-border bg-panel/60 text-txt-secondary"
                              }`}
                            >
                              {isDecision ? (
                                <ShieldCheck size={16} />
                              ) : isTask ? (
                                <CheckSquare size={16} />
                              ) : memory.category === "conversation" ? (
                                <Users size={16} />
                              ) : (
                                <Sparkles size={16} />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`text-[14px] font-semibold leading-snug ${
                                    isImportant ? "text-txt-primary font-medium" : "text-txt-primary/95"
                                  }`}
                                >
                                  {memory.title}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isImportant ? (
                                    <span className="flex items-center gap-1 rounded-full border border-amberx/30 bg-amberx/10 px-2 py-0.5 text-[10px] font-mono uppercase text-amberx">
                                      <Star size={10} className="fill-amberx text-amberx" /> Beacon
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-txt-secondary">
                                {memory.content}
                              </p>

                              {/* Level 3 Micro-Modules */}
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="micro-module capitalize text-cyanx">
                                  {memory.category}
                                </span>
                                {project ? (
                                  <span className="micro-module text-bluex">
                                    <FolderKanban size={10} className="inline mr-1 -mt-0.5" />
                                    {project.name}
                                  </span>
                                ) : null}
                                {memory.sourceReferences.length > 0 ? (
                                  <span className="micro-module text-txt-secondary">
                                    <FileText size={10} className="inline mr-1 -mt-0.5" />
                                    {memory.sourceReferences.length} sources
                                  </span>
                                ) : null}
                                {memory.status === "candidate" ? (
                                  <span className="micro-module border-amberx/40 text-amberx bg-amberx/10">
                                    Needs review
                                  </span>
                                ) : null}
                                <span className="ml-auto font-mono text-[10.5px] text-txt-muted flex items-center gap-1">
                                  <Clock size={10} />
                                  {shortDate(memory.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Side rail column */}
          <div className="space-y-4">
            {tab === "tasks" ? (
              <Panel className="p-5">
                <SectionHeading label="Tasks" title={`${openTasks.length} open`} />
                <div className="mt-3 space-y-2">
                  {state.tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-panel/50 p-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, { status: task.status === "done" ? "open" : "done" })
                        }
                        className={[
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                          task.status === "done"
                            ? "border-greenx/50 bg-greenx/15 text-greenx"
                            : "border-border text-transparent hover:border-cyanx/50",
                        ].join(" ")}
                        aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
                      >
                        <Check size={12} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[12.5px] ${
                            task.status === "done" ? "text-txt-muted line-through" : "text-txt-primary font-medium"
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="micro-module uppercase">{task.priority}</span>
                          {task.dueDate ? (
                            <span className="text-[10.5px] font-mono text-txt-muted">
                              due {shortDate(task.dueDate)} {new Date(task.dueDate) < new Date() ? "· overdue" : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {/* Waiting for review panel */}
            <Panel className="p-5">
              <SectionHeading label="Review" title="Waiting for you" />
              <div className="mt-3 space-y-2">
                {state.memories.filter((memory) => memory.status === "candidate").length === 0 ? (
                  <p className="text-[12px] text-txt-muted">Nothing needs a decision right now.</p>
                ) : (
                  state.memories
                    .filter((memory) => memory.status === "candidate")
                    .map((memory) => (
                      <ListRow
                        key={memory.id}
                        icon={Sparkles}
                        title={memory.title}
                        subtitle={memory.reason ?? "Candidate memory"}
                        accent="amber"
                        onClick={() => setOpenId(memory.id)}
                      />
                    ))
                )}
              </div>
            </Panel>

            {/* Telemetry overview */}
            <Panel className="p-5">
              <SectionHeading label="Telemetry" title="Memory Topology" />
              <div className="mt-3.5 space-y-2.5 font-mono text-[11.5px]">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-txt-muted">TOTAL STORED</span>
                  <span className="text-cyanx">{activeMemories.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-txt-muted">DECISIONS RECORDED</span>
                  <span className="text-purplex">
                    {activeMemories.filter((m) => m.category === "decision").length}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-txt-muted">KNOWLEDGE & NOTES</span>
                  <span className="text-bluex">
                    {activeMemories.filter((m) => m.category === "knowledge" || m.category === "note").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-txt-muted">RETENTION EXPIRATION</span>
                  <span className="text-txt-secondary">30-day default</span>
                </div>
              </div>
            </Panel>

            {/* Archived drawer */}
            <Panel className="p-5">
              <SectionHeading label="Archived" title={`${archived.length} removed`} />
              <div className="mt-3 space-y-2">
                {archived.length === 0 ? (
                  <p className="text-[12px] text-txt-muted">
                    Deleted memories land here first so you can restore them.
                  </p>
                ) : (
                  archived.map((memory) => (
                    <div key={memory.id} className="flex items-center gap-3 rounded-xl border border-border bg-panel/40 p-3">
                      <Archive size={13} className="shrink-0 text-txt-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] text-txt-secondary">{memory.title}</div>
                        <div className="text-[10.5px] text-txt-muted">
                          deleted {memory.deletedAt ? relativeTime(memory.deletedAt) : "recently"}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-btn h-7 w-7 border-border hover:border-cyanx/50 hover:text-cyanx"
                        aria-label="Restore memory"
                        onClick={() => restoreMemory(memory.id)}
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn h-7 w-7 border-border text-dangerx hover:border-dangerx"
                        aria-label="Delete permanently"
                        onClick={() => purgeMemory(memory.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* detail / edit inspector sheet */}
      <Sheet
        open={open !== null}
        onClose={closeDetail}
        title="Memory Inspector"
        footer={
          open ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  softDeleteMemory(open.id);
                  logActivity({ type: "context", title: "Memory archived", detail: open.title, status: "idle" });
                  closeDetail();
                }}
              >
                <Archive size={14} /> Archive
              </Button>
              {confirmDelete ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    purgeMemory(open.id);
                    closeDetail();
                  }}
                >
                  <Trash2 size={14} /> Confirm permanent delete
                </Button>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </>
          ) : null
        }
      >
        {open ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="memory-title" className="label mb-2 block">
                Title
              </label>
              <input
                id="memory-title"
                className="input bg-surface/70 border-border"
                value={open.title}
                onChange={(event) => updateMemory(open.id, { title: event.target.value })}
              />
            </div>

            <div>
              <label htmlFor="memory-content" className="label mb-2 block">
                Content
              </label>
              <textarea
                id="memory-content"
                className="input h-auto resize-none py-3 leading-relaxed bg-surface/70 border-border"
                rows={5}
                value={open.content}
                onChange={(event) => updateMemory(open.id, { content: event.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="memory-category" className="label mb-2 block">
                  Category
                </label>
                <select
                  id="memory-category"
                  className="input bg-surface border-border"
                  value={open.category}
                  onChange={(event) =>
                    updateMemory(open.id, { category: event.target.value as Memory["category"] })
                  }
                >
                  {["knowledge", "decision", "task", "note", "conversation", "event"].map((category) => (
                    <option key={category} value={category} className="bg-panel">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="memory-importance" className="label mb-2 block">
                  Importance
                </label>
                <select
                  id="memory-importance"
                  className="input bg-surface border-border"
                  value={open.importance}
                  onChange={(event) =>
                    updateMemory(open.id, { importance: event.target.value as Importance })
                  }
                >
                  {["noise", "temp", "useful", "important", "structured"].map((importance) => (
                    <option key={importance} value={importance} className="bg-panel">
                      {importance}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="memory-retention" className="label mb-2 block">
                  Retention
                </label>
                <select
                  id="memory-retention"
                  className="input bg-surface border-border"
                  value={open.retentionType}
                  onChange={(event) =>
                    updateMemory(open.id, { retentionType: event.target.value as RetentionType })
                  }
                >
                  {["session", "30-days", "forever"].map((retention) => (
                    <option key={retention} value={retention} className="bg-panel">
                      {retention}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="memory-project" className="label mb-2 block">
                  Project
                </label>
                <select
                  id="memory-project"
                  className="input bg-surface border-border"
                  value={open.projectId ?? ""}
                  onChange={(event) => updateMemory(open.id, { projectId: event.target.value || undefined })}
                >
                  <option value="" className="bg-panel">
                    None
                  </option>
                  {state.projects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-panel">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Chip
                active={open.importance === "important"}
                onClick={() =>
                  updateMemory(open.id, {
                    importance: open.importance === "important" ? "useful" : "important",
                  })
                }
              >
                <Star size={11} /> Mark as Beacon
              </Chip>
              <Chip
                active={open.status === "active"}
                onClick={() =>
                  updateMemory(open.id, { status: open.status === "active" ? "candidate" : "active" })
                }
              >
                <Pin size={11} /> {open.status === "active" ? "Active" : "Needs review"}
              </Chip>
              <Chip as="span">
                Updated {relativeTime(open.updatedAt)}
              </Chip>
            </div>

            {open.reason ? (
              <div className="rounded-xl border border-border bg-panel/40 p-3.5">
                <TechLabel>Why this was captured</TechLabel>
                <p className="mt-1.5 text-[12px] leading-relaxed text-txt-secondary">{open.reason}</p>
              </div>
            ) : null}

            {open.sourceReferences.length ? (
              <div className="rounded-xl border border-border bg-panel/40 p-3.5">
                <TechLabel>Sources · {open.sourceReferences.length}</TechLabel>
                <div className="mt-2 space-y-1.5">
                  {open.sourceReferences.map((id) => {
                    const source = state.sources.find((item) => item.id === id);
                    if (!source) return null;
                    return (
                      <div key={id} className="flex items-center gap-2.5">
                        <FileText size={12} className="text-cyanx" />
                        <span className="truncate text-[12px] text-txt-secondary">{source.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2 pt-1 text-[11px] text-txt-muted">
              <Pencil size={12} className="text-cyanx" />
              <span>
                Changes persist instantly in device local storage.
              </span>
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* create sheet */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New Memory"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Save memory
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="new-title" className="label mb-2 block">
              Title
            </label>
            <input
              id="new-title"
              className="input bg-surface border-border"
              placeholder="What should NeoBrain remember?"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="new-content" className="label mb-2 block">
              Details
            </label>
            <textarea
              id="new-content"
              className="input h-auto resize-none py-3 leading-relaxed bg-surface border-border"
              rows={4}
              placeholder="Add the context that makes this useful later."
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="new-category" className="label mb-2 block">
              Category
            </label>
            <select
              id="new-category"
              className="input bg-surface border-border"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as Memory["category"] })}
            >
              {["note", "knowledge", "decision", "task"].map((category) => (
                <option key={category} value={category} className="bg-panel">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
