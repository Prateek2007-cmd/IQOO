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
  FileText,
  Filter,
  Pencil,
  Pin,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
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

type TabId = "all" | "important" | "decisions" | "tasks" | "notes";

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

  const memories = useMemo(() => {
    const base = state.memories.filter((memory) => !memory.deletedAt);
    const byTab =
      tab === "all"
        ? base
        : tab === "important"
          ? base.filter((memory) => memory.importance === "important" || memory.importance === "structured")
          : tab === "decisions"
            ? base.filter((memory) => memory.category === "decision")
            : tab === "tasks"
              ? base.filter((memory) => memory.category === "task")
              : base.filter((memory) => memory.category === "note" || memory.category === "knowledge");
    const byProject = projectFilter === "all" ? byTab : byTab.filter((memory) => memory.projectId === projectFilter);
    if (!query.trim()) return byProject;
    const needle = query.trim().toLowerCase();
    return byProject.filter((memory) =>
      `${memory.title} ${memory.content}`.toLowerCase().includes(needle),
    );
  }, [state.memories, tab, projectFilter, query]);

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
              <TechLabel tone="cyan">Memory</TechLabel>
              <h1 className="mt-2 title-xl">Things that matter to you.</h1>
              <p className="mt-2 text-[13px] text-txt-secondary">
                {state.memories.filter((memory) => !memory.deletedAt).length} memories ·{" "}
                {state.memories.filter((memory) => memory.status === "candidate").length} awaiting review
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
                className="input pl-10"
                placeholder="Search memories…"
                aria-label="Search memories"
              />
            </div>
            {!isDesktop ? (
              <button
                type="button"
                className="icon-btn h-[46px] w-[46px]"
                aria-label="New memory"
                onClick={() => setCreating(true)}
              >
                <Plus size={17} />
              </button>
            ) : null}
          </div>

          <Tabs
            tabs={[
              { id: "all", label: "All", count: state.memories.filter((m) => !m.deletedAt).length },
              { id: "important", label: "Important" },
              { id: "decisions", label: "Decisions" },
              { id: "tasks", label: "Tasks", count: openTasks.length },
              { id: "notes", label: "Notes" },
            ]}
            value={tab}
            onChange={setTab}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10.5px] text-txt-muted">
              <Filter size={12} /> Project
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

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
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
                    ? "Clear the search or pick a different tab or project."
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
              <div className="space-y-2.5">
                {memories.map((memory) => {
                  const project = state.projects.find((item) => item.id === memory.projectId);
                  return (
                    <button
                      key={memory.id}
                      type="button"
                      onClick={() => setOpenId(memory.id)}
                      className="group flex w-full items-start gap-3.5 rounded-lg border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.36)_0%,rgba(7,16,25,0.6)_100%)] p-3.5 text-left transition-all duration-300 ease-premium hover:border-line-soft hover:shadow-panel active:scale-[0.995]"
                    >
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70">
                        {memory.category === "decision" ? (
                          <ShieldCheck size={14} className="text-violetx" />
                        ) : memory.category === "task" ? (
                          <CheckSquare size={14} className="text-amberx" />
                        ) : (
                          <Sparkles size={14} className="text-cyanx" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-2">
                          <span className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-txt-primary">
                            {memory.title}
                          </span>
                          {memory.importance === "important" || memory.importance === "structured" ? (
                            <Star size={13} className="mt-0.5 shrink-0 text-amberx" />
                          ) : null}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[12px] leading-relaxed text-txt-secondary">
                          {memory.content}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <Chip as="span">{memory.category}</Chip>
                          {project ? <Chip as="span">{project.name}</Chip> : null}
                          {memory.status === "candidate" ? <Chip as="span" active>needs review</Chip> : null}
                          <span className="text-[10.5px] text-txt-muted">{shortDate(memory.createdAt)}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* side rail */}
          <div className="space-y-4">
            {tab === "tasks" ? (
              <Panel className="p-5">
                <SectionHeading label="Tasks" title={`${openTasks.length} open`} />
                <div className="mt-3 space-y-2">
                  {state.tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 rounded-md border border-line-subtle bg-ink-850/40 p-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, { status: task.status === "done" ? "open" : "done" })
                        }
                        className={[
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-xs border transition-colors",
                          task.status === "done"
                            ? "border-greenx/50 bg-greenx/15 text-greenx"
                            : "border-line-soft text-transparent hover:border-cyanx/50",
                        ].join(" ")}
                        aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
                      >
                        <Check size={12} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[12.5px] ${task.status === "done" ? "text-txt-muted line-through" : "text-txt-primary"}`}
                        >
                          {task.title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Chip as="span">{task.priority}</Chip>
                          {task.dueDate ? (
                            <span className="text-[10.5px] text-txt-muted">
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

            <Panel className="p-5">
              <SectionHeading label="Review" title="Waiting for you" />
              <div className="mt-3 space-y-1.5">
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

            <Panel className="p-5">
              <SectionHeading label="Archived" title={`${archived.length} removed`} />
              <div className="mt-3 space-y-1.5">
                {archived.length === 0 ? (
                  <p className="text-[12px] text-txt-muted">
                    Deleted memories land here first so you can restore them.
                  </p>
                ) : (
                  archived.map((memory) => (
                    <div key={memory.id} className="flex items-center gap-3 rounded-md border border-line-subtle bg-ink-850/40 p-3">
                      <Archive size={13} className="shrink-0 text-txt-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] text-txt-secondary">{memory.title}</div>
                        <div className="text-[10.5px] text-txt-muted">
                          deleted {memory.deletedAt ? relativeTime(memory.deletedAt) : "recently"}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-btn h-7 w-7"
                        aria-label="Restore memory"
                        onClick={() => restoreMemory(memory.id)}
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn h-7 w-7 text-dangerx"
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

      {/* detail / edit */}
      <Sheet
        open={open !== null}
        onClose={closeDetail}
        title="Memory"
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
                className="input"
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
                className="input h-auto resize-none py-3 leading-relaxed"
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
                  className="input"
                  value={open.category}
                  onChange={(event) =>
                    updateMemory(open.id, { category: event.target.value as Memory["category"] })
                  }
                >
                  {["knowledge", "decision", "task", "note", "conversation", "event"].map((category) => (
                    <option key={category} value={category} className="bg-ink-800">
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
                  className="input"
                  value={open.importance}
                  onChange={(event) =>
                    updateMemory(open.id, { importance: event.target.value as Importance })
                  }
                >
                  {["noise", "temp", "useful", "important", "structured"].map((importance) => (
                    <option key={importance} value={importance} className="bg-ink-800">
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
                  className="input"
                  value={open.retentionType}
                  onChange={(event) =>
                    updateMemory(open.id, { retentionType: event.target.value as RetentionType })
                  }
                >
                  {["session", "30-days", "forever"].map((retention) => (
                    <option key={retention} value={retention} className="bg-ink-800">
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
                  className="input"
                  value={open.projectId ?? ""}
                  onChange={(event) => updateMemory(open.id, { projectId: event.target.value || undefined })}
                >
                  <option value="" className="bg-ink-800">
                    None
                  </option>
                  {state.projects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-ink-800">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip
                active={open.importance === "important"}
                onClick={() =>
                  updateMemory(open.id, {
                    importance: open.importance === "important" ? "useful" : "important",
                  })
                }
              >
                <Star size={11} /> Mark important
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
                updated {relativeTime(open.updatedAt)}
              </Chip>
            </div>

            {open.reason ? (
              <div className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
                <TechLabel>Why this was captured</TechLabel>
                <p className="mt-1.5 text-[12px] leading-relaxed text-txt-secondary">{open.reason}</p>
              </div>
            ) : null}

            {open.sourceReferences.length ? (
              <div className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
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

            <div className="flex items-center gap-2">
              <Pencil size={12} className="text-txt-muted" />
              <span className="text-[10.5px] text-txt-muted">
                Changes save instantly to this device.
              </span>
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* create */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New memory"
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
              className="input"
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
              className="input h-auto resize-none py-3 leading-relaxed"
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
              className="input"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as Memory["category"] })}
            >
              {["note", "knowledge", "decision", "task"].map((category) => (
                <option key={category} value={category} className="bg-ink-800">
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
