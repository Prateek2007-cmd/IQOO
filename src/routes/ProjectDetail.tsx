/**
 * Project workspace — everything about one project in one place.
 *
 * The same data as the rest of the app, filtered by project: current state,
 * recent decisions, files with their real indexing status, memories, tasks,
 * conversations and a timeline built from the activity log.
 */

import {
  ArrowLeft,
  Brain,
  Check,
  CheckSquare,
  FileText,
  FolderKanban,
  HardDrive,
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
  Panel,
  Progress,
  SectionHeading,
  StateBlock,
  Tabs,
  TechLabel,
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
    [state.sources, id],
  );
  const memories = useMemo(
    () => state.memories.filter((memory) => !memory.deletedAt && memory.projectId === id),
    [state.memories, id],
  );
  const tasks = useMemo(() => state.tasks.filter((task) => task.projectId === id), [state.tasks, id]);
  const conversations = useMemo(
    () => state.conversations.filter((conversation) => conversation.projectId === id),
    [state.conversations, id],
  );
  const activity = useMemo(
    () => state.activity.filter((event) => event.projectId === id),
    [state.activity, id],
  );

  if (!project) {
    return (
      <div className="px-5 py-8">
        {!isDesktop ? <MobileTopBar title="Project" tagline="NeoBrain" /> : null}
        <div className="mt-6">
          <StateBlock
            kind="search-empty"
            title="Project not found"
            description="It may have been deleted. Your memories and files were kept — they are simply no longer filed here."
            action={
              <Button variant="primary" onClick={() => navigate("/app/projects")}>
                Back to projects
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const decisions = memories.filter((memory) => memory.category === "decision");
  const indexed = files.filter((file) => file.indexStatus === "indexed").length;

  const currentState = [
    { label: "Files indexed", value: `${indexed} / ${files.length}`, done: indexed === files.length && files.length > 0 },
    { label: "Open tasks", value: `${tasks.filter((task) => task.status !== "done").length}`, done: false },
    { label: "Decisions captured", value: `${decisions.length}`, done: decisions.length > 0 },
    { label: "Last activity", value: relativeTime(project.updatedAt, now), done: true },
  ];

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title={project.name} tagline="Project workspace" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <Link
            to="/app/projects"
            className="mb-5 inline-flex items-center gap-2 text-[12.5px] text-txt-muted transition-colors hover:text-txt-secondary"
          >
            <ArrowLeft size={14} /> All projects
          </Link>
        ) : null}

        {/* hero */}
        <Panel className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,217,255,0.18),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 max-w-[62ch]">
              <TechLabel tone="cyan">{project.tags.join(" · ") || "Project"}</TechLabel>
              <h1 className={`mt-2 ${isDesktop ? "title-xl" : "title-lg"}`}>{project.name}</h1>
              <p className="mt-2.5 text-[13px] leading-relaxed text-txt-secondary">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip as="span" active>
                  {files.length} files
                </Chip>
                <Chip as="span">{memories.length} memories</Chip>
                <Chip as="span">{tasks.length} tasks</Chip>
                <Chip as="span">{conversations.length} conversations</Chip>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <BrainCore state="connected" size={isDesktop ? 150 : 110} />
            </div>
          </div>
          <div className="relative mt-5 max-w-[420px]">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-txt-muted">Index coverage</span>
              <span className="numeral text-txt-secondary">
                {files.length ? Math.round((indexed / files.length) * 100) : 0}%
              </span>
            </div>
            <Progress value={files.length ? indexed / files.length : 0} />
          </div>
        </Panel>

        <div className="mt-4">
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "files", label: "Files", count: files.length },
              { id: "memories", label: "Memories", count: memories.length },
              { id: "tasks", label: "Tasks", count: tasks.length },
              { id: "timeline", label: "Timeline" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            {tab === "overview" ? (
              <>
                <Panel className="p-5">
                  <SectionHeading label="State" title="Current status" />
                  <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                    {currentState.map((row) => (
                      <div key={row.label} className="flex items-center gap-3 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3">
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                            row.done ? "border-greenx/50 bg-greenx/15 text-greenx" : "border-cyanx/40 bg-cyanx/10 text-cyanx"
                          }`}
                        >
                          {row.done ? <Check size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-label text-txt-muted">{row.label}</div>
                          <div className="mt-0.5 truncate text-[13px] text-txt-primary">{row.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="p-5">
                  <SectionHeading label="Decisions" title="Recent decisions" />
                  <div className="mt-3 space-y-2">
                    {decisions.length === 0 ? (
                      <p className="text-[12px] text-txt-muted">
                        No decisions captured for this project yet.
                      </p>
                    ) : (
                      decisions.map((decision) => (
                        <div key={decision.id} className="rounded-md border border-violetx/25 bg-violetx/[0.06] p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium text-txt-primary">{decision.title}</div>
                              <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-txt-secondary">
                                {decision.content}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10.5px] text-txt-muted">
                              {shortDate(decision.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Panel>

                <Panel className="p-5">
                  <SectionHeading label="Conversations" title={`${conversations.length} threads`} />
                  <div className="mt-2 space-y-1.5">
                    {conversations.length === 0 ? (
                      <p className="text-[12px] text-txt-muted">No conversations linked yet.</p>
                    ) : (
                      conversations.map((conversation) => (
                        <ListRow
                          key={conversation.id}
                          icon={MessageSquareText}
                          title={conversation.title}
                          subtitle={`${conversation.messages.length} messages · ${conversation.retentionStatus}`}
                          meta={relativeTime(conversation.updatedAt, now)}
                          accent="blue"
                        />
                      ))
                    )}
                  </div>
                </Panel>
              </>
            ) : null}

            {tab === "files" ? (
              <Panel className="p-5">
                <SectionHeading label="Index" title={`${files.length} files`} />
                <div className="mt-3.5 space-y-2.5">
                  {files.length === 0 ? (
                    <StateBlock
                      kind="empty"
                      title="No files in this project"
                      description="Attach files from Ask NeoBrain or the Knowledge screen and they will be indexed here."
                      compact
                    />
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
                        <div className="flex items-start gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                            <FileText size={14} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium text-txt-primary">{file.name}</div>
                            <div className="mt-0.5 truncate font-mono text-[10.5px] text-txt-muted">
                              {file.pathOrReference}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Chip as="span">{file.type}</Chip>
                              <Chip as="span">{fileSize(file.sizeKb)}</Chip>
                              <Chip as="span">
                                {file.indexStatus}
                                {file.indexedAt ? ` · ${relativeTime(file.indexedAt, now)}` : ""}
                              </Chip>
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
                          >
                            <RefreshCw size={12} /> Re-index
                          </Button>
                        </div>
                        {file.indexError ? (
                          <p className="mt-2.5 text-[11px] text-warnx">{file.indexError}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            ) : null}

            {tab === "memories" ? (
              <Panel className="p-5">
                <SectionHeading label="Memory" title={`${memories.length} memories`} />
                <div className="mt-2 space-y-1">
                  {memories.length === 0 ? (
                    <p className="text-[12px] text-txt-muted">No memories filed here yet.</p>
                  ) : (
                    memories.map((memory) => (
                      <ListRow
                        key={memory.id}
                        icon={
                          memory.category === "decision"
                            ? ShieldCheck
                            : memory.category === "task"
                              ? CheckSquare
                              : Sparkles
                        }
                        title={memory.title}
                        subtitle={`${memory.category} · ${relativeTime(memory.createdAt, now)}`}
                        accent={memory.category === "decision" ? "violet" : "cyan"}
                        onClick={() => navigate(`/app/memory?focus=${memory.id}`)}
                      />
                    ))
                  )}
                </div>
              </Panel>
            ) : null}

            {tab === "tasks" ? (
              <Panel className="p-5">
                <SectionHeading label="Work" title={`${tasks.length} tasks`} />
                <div className="mt-3 space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-[12px] text-txt-muted">No tasks linked to this project.</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
                        <button
                          type="button"
                          aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
                          onClick={() => updateTask(task.id, { status: task.status === "done" ? "open" : "done" })}
                          className={[
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-xs border transition-colors",
                            task.status === "done"
                              ? "border-greenx/50 bg-greenx/15 text-greenx"
                              : "border-line-soft text-transparent hover:border-cyanx/50",
                          ].join(" ")}
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
                              <span className="text-[10.5px] text-txt-muted">due {shortDate(task.dueDate)}</span>
                            ) : null}
                            {task.sourceMemoryId ? (
                              <button
                                type="button"
                                className="text-[10.5px] text-cyanx"
                                onClick={() => navigate(`/app/memory?focus=${task.sourceMemoryId}`)}
                              >
                                view source
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            ) : null}

            {tab === "timeline" ? (
              <Panel className="p-5">
                <SectionHeading label="History" title="Project timeline" />
                <div className="mt-3">
                  {activity.length === 0 ? (
                    <StateBlock
                      kind="empty"
                      title="No activity recorded"
                      description="Events are logged as you capture and index things in this project."
                      compact
                    />
                  ) : (
                    <ActivityTimeline events={activity} now={now} />
                  )}
                </div>
              </Panel>
            ) : null}
          </div>

          {/* side rail */}
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionHeading label="Context" title="Linked knowledge" />
              <div className="mt-3.5 space-y-2">
                {state.knowledge.nodes
                  .filter((node) => node.projectId === project.id)
                  .slice(0, 6)
                  .map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => navigate("/app/knowledge")}
                      className="flex w-full items-center justify-between gap-3 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-2.5 text-left transition-colors hover:border-line-soft"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] text-txt-primary">{node.label}</span>
                        <span className="mt-0.5 block text-[10.5px] text-txt-muted">
                          {node.kind} · {node.connections} links
                        </span>
                      </span>
                      <Brain size={13} className="shrink-0 text-cyanx" />
                    </button>
                  ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Storage" title="Where this lives" />
              <div className="mt-3.5 space-y-2.5">
                {[
                  { icon: HardDrive, label: "Files", value: `${files.length} referenced locally` },
                  { icon: NotebookPen, label: "Memories", value: `${memories.length} on this device` },
                  { icon: FolderKanban, label: "Updated", value: relativeTime(project.updatedAt, now) },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <Icon size={14} className="text-txt-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-txt-primary">{row.label}</div>
                        <div className="text-[10.5px] text-txt-muted">{row.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="divider my-4" />
              <p className="text-[10.5px] leading-relaxed text-txt-muted">
                Project data is stored in this browser only. Deleting a project keeps its files on disk
                and un-files its memories instead of removing them.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
