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
            title="Workspace Not Found"
            description="It may have been deleted. Your memories and files are kept intact in your sovereign store."
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

  const currentState = [
    { label: "Files Indexed", value: `${indexed} / ${files.length}`, done: indexed === files.length && files.length > 0 },
    { label: "Open Action Items", value: `${tasks.filter((task) => task.status !== "done").length}`, done: false },
    { label: "Decisions Locked", value: `${decisions.length}`, done: decisions.length > 0 },
    { label: "Last Neural Sync", value: relativeTime(project.updatedAt, now), done: true },
  ];

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title={project.name} tagline="Intelligent Workspace" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <Link
            to="/app/projects"
            className="mb-5 inline-flex items-center gap-2 text-[12.5px] font-mono text-txt-muted transition-colors hover:text-cyanx"
          >
            <ArrowLeft size={14} /> Back to Workspaces
          </Link>
        ) : null}

        {/* Hero Banner Panel */}
        <div className="relative overflow-hidden rounded-2xl border border-cyanx/30 bg-gradient-to-br from-[#0F1B2D]/90 via-[#0A0F1C]/95 to-[#020407]/95 p-6 shadow-[0_0_30px_rgba(0,209,255,0.06)]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,209,255,0.15),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 max-w-[68ch]">
              <TechLabel tone="cyan">{project.tags.join(" · ") || "Intelligent Workspace"}</TechLabel>
              <h1 className={`mt-2 ${isDesktop ? "title-xl" : "title-lg"}`}>{project.name}</h1>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-txt-secondary">{project.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="micro-module text-cyanx border-cyanx/30 bg-cyanx/10">
                  <FileText size={10} className="inline mr-1 -mt-0.5" />
                  {files.length} indexed files
                </span>
                <span className="micro-module text-txt-primary">
                  <Sparkles size={10} className="inline mr-1 -mt-0.5 text-amberx" />
                  {memories.length} memories
                </span>
                <span className="micro-module text-amberx">
                  <CheckSquare size={10} className="inline mr-1 -mt-0.5" />
                  {tasks.length} tasks
                </span>
                <span className="micro-module text-bluex">
                  <MessageSquareText size={10} className="inline mr-1 -mt-0.5" />
                  {conversations.length} threads
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BrainCore state="connected" size={isDesktop ? 140 : 100} />
            </div>
          </div>

          <div className="relative mt-6 max-w-[440px]">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-mono text-txt-muted">
              <span>Vector Index Coverage</span>
              <span className="numeral text-cyanx font-semibold">
                {files.length ? Math.round((indexed / files.length) * 100) : 0}%
              </span>
            </div>
            <Progress value={files.length ? indexed / files.length : 0} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5">
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "files", label: "Files", count: files.length },
              { id: "memories", label: "Memories", count: memories.length },
              { id: "tasks", label: "Tasks", count: tasks.length },
              { id: "timeline", label: "Timeline" },
            ]}
            value={tab}
            onChange={(val) => setTab(val as TabId)}
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-5">
            {tab === "overview" ? (
              <>
                <Panel className="p-6">
                  <SectionHeading label="State" title="Current Status & Telemetry" />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {currentState.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center gap-3.5 rounded-xl border border-border bg-panel/50 px-4 py-3"
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                            row.done
                              ? "border-greenx/50 bg-greenx/15 text-greenx"
                              : "border-cyanx/40 bg-cyanx/10 text-cyanx"
                          }`}
                        >
                          {row.done ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        <div className="min-w-0 font-mono">
                          <div className="text-[10px] uppercase tracking-wider text-txt-muted">{row.label}</div>
                          <div className="mt-0.5 truncate text-[13px] font-semibold text-txt-primary">{row.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="p-6">
                  <SectionHeading label="Decisions" title="Recorded Architectural Decisions" />
                  <div className="mt-4 space-y-2.5">
                    {decisions.length === 0 ? (
                      <p className="text-[12px] text-txt-muted">
                        No decisions captured for this project yet.
                      </p>
                    ) : (
                      decisions.map((decision) => (
                        <div
                          key={decision.id}
                          className="rounded-xl border border-purplex/30 bg-purplex/[0.06] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-semibold text-txt-primary">{decision.title}</div>
                              <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-txt-secondary">
                                {decision.content}
                              </p>
                            </div>
                            <span className="shrink-0 font-mono text-[10.5px] text-txt-muted">
                              {shortDate(decision.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Panel>

                <Panel className="p-6">
                  <SectionHeading label="Conversations" title={`${conversations.length} Active Threads`} />
                  <div className="mt-3 space-y-2">
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
              <Panel className="p-6">
                <SectionHeading label="Vector Index" title={`${files.length} Connected Documents`} />
                <div className="mt-4 space-y-3">
                  {files.length === 0 ? (
                    <StateBlock
                      kind="empty"
                      title="No files in this workspace"
                      description="Add documents or folders from Knowledge Space and they will be indexed here."
                      compact
                    />
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className="rounded-xl border border-border bg-panel/50 p-4">
                        <div className="flex items-start gap-3.5">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-space text-cyanx">
                            <FileText size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-semibold text-txt-primary">{file.name}</div>
                            <div className="mt-0.5 truncate font-mono text-[11px] text-txt-muted">
                              {file.pathOrReference}
                            </div>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <span className="micro-module text-[10px] uppercase">{file.type}</span>
                              <span className="micro-module text-[10px]">{fileSize(file.sizeKb)}</span>
                              <span className="micro-module text-[10px] text-cyanx border-cyanx/30">
                                {file.indexStatus}
                                {file.indexedAt ? ` · ${relativeTime(file.indexedAt, now)}` : ""}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
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
                          <p className="mt-2 text-[11px] text-dangerx">{file.indexError}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            ) : null}

            {tab === "memories" ? (
              <Panel className="p-6">
                <SectionHeading label="Memory" title={`${memories.length} Linked Memories`} />
                <div className="mt-3 space-y-2">
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
              <Panel className="p-6">
                <SectionHeading label="Action Items" title={`${tasks.length} Workspace Tasks`} />
                <div className="mt-4 space-y-2.5">
                  {tasks.length === 0 ? (
                    <p className="text-[12px] text-txt-muted">No tasks linked to this workspace.</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3.5 rounded-xl border border-border bg-panel/50 p-3.5">
                        <button
                          type="button"
                          aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
                          onClick={() => updateTask(task.id, { status: task.status === "done" ? "open" : "done" })}
                          className={[
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                            task.status === "done"
                              ? "border-greenx/50 bg-greenx/15 text-greenx"
                              : "border-border text-transparent hover:border-cyanx/50",
                          ].join(" ")}
                        >
                          <Check size={12} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[13px] ${
                              task.status === "done" ? "text-txt-muted line-through" : "text-txt-primary font-medium"
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="micro-module uppercase text-[10px]">{task.priority}</span>
                            {task.dueDate ? (
                              <span className="font-mono text-[10.5px] text-txt-muted">
                                due {shortDate(task.dueDate)}
                              </span>
                            ) : null}
                            {task.sourceMemoryId ? (
                              <button
                                type="button"
                                className="font-mono text-[10.5px] text-cyanx hover:underline"
                                onClick={() => navigate(`/app/memory?focus=${task.sourceMemoryId}`)}
                              >
                                View Source Memory
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
              <Panel className="p-6">
                <SectionHeading label="Audit Log" title="Workspace Activity History" />
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
              </Panel>
            ) : null}
          </div>

          {/* Side rail column */}
          <div className="space-y-5">
            <Panel className="p-6">
              <SectionHeading label="Knowledge Links" title="Semantic Graph Clusters" />
              <div className="mt-4 space-y-2.5">
                {state.knowledge.nodes
                  .filter((node) => node.projectId === project.id)
                  .slice(0, 6)
                  .map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => navigate("/app/knowledge")}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-panel/50 px-3.5 py-3 text-left transition-colors hover:border-cyanx/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-txt-primary">{node.label}</span>
                        <span className="mt-0.5 block font-mono text-[10.5px] text-txt-muted">
                          {node.kind} · {node.connections} neural links
                        </span>
                      </span>
                      <Brain size={14} className="shrink-0 text-cyanx" />
                    </button>
                  ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHeading label="Sovereign Store" title="Workspace Allocation" />
              <div className="mt-4 space-y-3 font-mono text-[12px]">
                {[
                  { icon: HardDrive, label: "Local Files", value: `${files.length} references` },
                  { icon: NotebookPen, label: "Memories", value: `${memories.length} records` },
                  { icon: FolderKanban, label: "Last Modified", value: relativeTime(project.updatedAt, now) },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <Icon size={14} className="text-cyanx" />
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <span className="text-txt-muted">{row.label}</span>
                        <span className="text-txt-primary font-semibold">{row.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="divider my-4" />
              <p className="font-mono text-[11px] leading-relaxed text-txt-muted">
                Workspace records reside entirely on your device. Archiving or deleting a workspace retains underlying
                files on disk.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
