/**
 * Overview — the home dashboard.
 *
 * One route, two compositions. On phones it is a vertical, connected slate led
 * by the BrainCore; from `lg` up it becomes a wide workspace with statistics,
 * brain status, highlights and quick actions arranged for a large screen.
 */

import {
  ArrowRight,
  Bell,
  Brain,
  Calendar,
  CheckSquare,
  FileText,
  FolderKanban,
  HardDrive,
  LayoutGrid,
  Mic,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Timer,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivityTimeline } from "../components/ActivityFeed";
import { BrainCore, BrainCoreStage } from "../components/BrainCore";
import { MobileTopBar, useDeviceStatus } from "../components/Chrome";
import { NeoBrainMark } from "../components/Logo";
import {
  Button,
  Chip,
  MetricTile,
  Panel,
  Progress,
  SectionHeading,
  StateBlock,
  StatusDot,
  TechLabel,
} from "../components/ui";
import { dayLabel, dayPart, greeting, relativeTime } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain, useCandidates, useCounts } from "../lib/store";
import { useAsk } from "../lib/useAsk";

export default function Overview() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopOverview /> : <MobileHome />;
}

/* ==========================================================================
   Mobile
   ========================================================================== */

function MobileHome() {
  const navigate = useNavigate();
  const { state, session, acceptCandidate, rejectCandidate, logActivity } = useBrain();
  const counts = useCounts();
  const candidates = useCandidates();
  const { phone, laptop, connected } = useDeviceStatus();
  const { ask, busy } = useAsk();
  const [digesting, setDigesting] = useState(false);

  const now = useNow(30_000);
  const topCandidate = candidates[0];

  const summarizeToday = async () => {
    setDigesting(true);
    const run = await ask("What did I work on today across my projects?");
    setDigesting(false);
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  return (
    <div className="relative">
      <MobileTopBar />

      <div className="space-y-6 px-5 pb-8 pt-6">
        {/* greeting + context */}
        <section className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <TechLabel className="mb-2.5">{dayLabel(new Date().toISOString())}</TechLabel>
            <h1 className="font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.02em]">
              {greeting()},
              <br />
              <span className="text-txt-primary">{session.name || "there"}.</span>
            </h1>
            <p className="mt-2.5 text-[13.5px] text-txt-secondary">
              {connected ? "Your brain is active." : "Running on this device only."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/app/activity")}
            className="shrink-0 rounded-lg border border-line-subtle bg-[linear-gradient(180deg,rgba(255,154,87,0.12)_0%,rgba(7,16,25,0.7)_100%)] p-3 text-left transition-colors hover:border-amberx/35"
          >
            <Sun size={15} className="text-amberx" strokeWidth={1.7} />
            <div className="mt-2 text-[11.5px] font-medium text-txt-primary">
              {new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
            </div>
            <div className="mt-0.5 max-w-[92px] text-[10px] leading-snug text-txt-muted">{dayPart()}</div>
          </button>
        </section>

        {/* brain core stage */}
        <section className="relative">
          <button
            type="button"
            onClick={() => navigate("/app/voice")}
            className="block w-full"
            aria-label="Open voice mode"
          >
            <BrainCoreStage
              state={connected ? "ready" : "idle"}
              size={280}
              className="mx-auto"
            />
          </button>
          <div className="mt-1 flex flex-col items-center">
            <span className="label">Tap orbit to engage voice</span>
            <div className="mt-3 flex items-center gap-2.5">
              <Chip active>
                <Mic size={12} />
                Voice
              </Chip>
              <Chip onClick={() => navigate("/app/ask")}>
                <Sparkles size={12} />
                Ask
              </Chip>
              <Chip onClick={summarizeToday}>
                <Zap size={12} />
                Digest
              </Chip>
            </div>
          </div>
        </section>

        {/* deep brain connection module */}
        <section className="relative overflow-hidden rounded-xl border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.5)_0%,rgba(7,16,25,0.72)_100%)] p-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line-subtle bg-ink-800/70">
              <NeoBrainMark size={26} state={connected ? "active" : "idle"} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-semibold text-txt-primary">Deep Brain</span>
                <StatusDot
                  tone={laptop?.connectionStatus === "syncing" ? "amber" : connected ? "green" : "muted"}
                  pulse={Boolean(connected)}
                />
                <span className="text-[11px] text-txt-muted">
                  {laptop?.connectionStatus === "syncing"
                    ? "Syncing"
                    : connected
                      ? "Connected"
                      : "Not connected"}
                </span>
              </div>
              <div className="mt-1.5 text-[11.5px] text-txt-muted">
                {phone?.name ?? "iQOO 15"} ↔ {laptop?.name ?? "Laptop"}
              </div>
              <div className="mt-2.5 text-[11px] italic text-txt-secondary">"Same brain. More possibilities."</div>
            </div>
          </div>
          {laptop?.connectionStatus === "syncing" ? (
            <div className="mt-3.5">
              <Progress value={laptop.syncProgress ?? 0} showLabel />
            </div>
          ) : null}
        </section>

        {/* candidate review */}
        {topCandidate ? (
          <section className="rounded-xl border border-amberx/25 bg-[linear-gradient(180deg,rgba(255,181,71,0.1)_0%,rgba(7,16,25,0.7)_100%)] p-4">
            <TechLabel tone="amber">Memory candidate</TechLabel>
            <div className="mt-2 text-[13.5px] font-medium text-txt-primary">{topCandidate.title}</div>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-txt-secondary">
              {topCandidate.content}
            </p>
            <div className="mt-3.5 flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  acceptCandidate(topCandidate.id);
                  logActivity({
                    type: "candidate",
                    title: "Memory accepted",
                    detail: topCandidate.title,
                    status: "done",
                  });
                }}
              >
                Remember
              </Button>
              <Button size="sm" variant="ghost" onClick={() => rejectCandidate(topCandidate.id)}>
                Ignore
              </Button>
            </div>
          </section>
        ) : null}

        {/* statistics */}
        <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MetricTile icon={NotebookPen} value={counts.memories} label="Memories" accent="cyan" onClick={() => navigate("/app/memory")} />
          <MetricTile icon={FileText} value={counts.filesIndexed} label="Files indexed" accent="green" onClick={() => navigate("/app/knowledge")} />
          <MetricTile icon={CheckSquare} value={counts.tasksPending} label="Tasks pending" accent="amber" onClick={() => navigate("/app/memory")} />
          <MetricTile icon={Sparkles} value={counts.knowledge} label="Knowledge found" accent="violet" onClick={() => navigate("/app/knowledge")} />
        </section>

        {/* recent activity */}
        <section>
          <SectionHeading
            title="Recent activity"
            action={
              <Link to="/app/activity" className="flex items-center gap-1 text-[11.5px] text-cyanx">
                See all <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="mt-3">
            {state.activity.length === 0 ? (
              <StateBlock
                kind="empty"
                title="No activity yet"
                description="Start voice mode or capture a note and NeoBrain will show what it is doing here."
                action={
                  <Button size="sm" variant="primary" onClick={() => navigate("/app/voice")}>
                    <Mic size={14} /> Start listening
                  </Button>
                }
                compact
              />
            ) : (
              <ActivityTimeline events={state.activity} limit={5} now={now} />
            )}
          </div>
        </section>

        {/* quick actions */}
        <section>
          <SectionHeading title="Quick actions" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { icon: Mic, label: "Ask your brain", hint: "Voice or text", to: "/app/voice" },
              { icon: HardDrive, label: "Index a folder", hint: "Choose permission", to: "/app/knowledge" },
              { icon: Brain, label: "Find connections", hint: "Knowledge graph", to: "/app/knowledge" },
              { icon: Timer, label: "Open timeline", hint: "See your journey", to: "/app/timeline" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="group flex flex-col gap-3 rounded-lg border border-line-subtle bg-ink-850/45 p-3.5 text-left transition-all duration-300 ease-premium hover:border-line-soft hover:bg-ink-800/60 active:scale-[0.985]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx transition-colors group-hover:border-cyanx/40">
                    <Icon size={14} strokeWidth={1.7} />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-medium text-txt-primary">{action.label}</span>
                    <span className="mt-0.5 block text-[10.5px] text-txt-muted">{action.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {busy || digesting ? (
          <p className="text-center text-[11px] text-txt-muted">Running local retrieval…</p>
        ) : null}
      </div>
    </div>
  );
}

/* ==========================================================================
   Desktop
   ========================================================================== */

function DesktopOverview() {
  const navigate = useNavigate();
  const { state, session } = useBrain();
  const counts = useCounts();
  const { connected, laptop } = useDeviceStatus();
  const { ask } = useAsk();
  const now = useNow(30_000);

  const digest = async () => {
    const run = await ask("Summarize everything I worked on today.");
    if (run) navigate(`/app/answer/${run.answer.id}`);
  };

  const highlights = [
    { label: "New memories captured", value: counts.memoriesToday, icon: NotebookPen, tone: "cyan" as const },
    { label: "Important decisions", value: counts.decisions, icon: Brain, tone: "violet" as const },
    { label: "Files captured & indexed", value: counts.filesIndexed, icon: FileText, tone: "green" as const },
    { label: "Knowledge indexed", value: `${Math.round((counts.filesIndexed / Math.max(1, counts.filesTotal)) * 100)}%`, icon: Sparkles, tone: "amber" as const },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-8 py-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em]">
            {greeting()}, {session.name || "there"}.
          </h1>
          <p className="mt-2 text-[13.5px] text-txt-secondary">
            Ideas, files and conversations. All connected.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button icon={Mic} onClick={() => navigate("/app/voice")}>
            Voice mode
          </Button>
          <Button variant="primary" icon={Sparkles} onClick={() => navigate("/app/ask")}>
            Ask brain
          </Button>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={16} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      {/* statistic row */}
      <section className="mt-7 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <MetricTile icon={NotebookPen} value={counts.memories} label="Memories" accent="cyan" onClick={() => navigate("/app/memory")} />
        <MetricTile icon={FileText} value={counts.filesIndexed} label="Files indexed" accent="green" onClick={() => navigate("/app/knowledge")} />
        <MetricTile icon={FolderKanban} value={counts.projects} label="Active projects" accent="violet" onClick={() => navigate("/app/projects")} />
        <MetricTile icon={CheckSquare} value={counts.tasksPending} label="Open tasks" accent="amber" onClick={() => navigate("/app/timeline")} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* left column */}
        <div className="space-y-5">
          <Panel className="p-6">
            <SectionHeading label="System" title="Brain status" />
            <div className="mt-5 flex items-center gap-6">
              <div className="relative shrink-0">
                <BrainCore state={connected ? "connected" : "idle"} size={168} />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                {[
                  {
                    name: laptop?.name ?? "Laptop",
                    role: "Deep Brain",
                    detail: "Local model host · retrieval · file index",
                    status:
                      laptop?.connectionStatus === "syncing"
                        ? "Syncing"
                        : laptop?.connectionStatus === "connected"
                          ? "Online"
                          : "Offline",
                    tone: laptop?.connectionStatus === "connected" ? ("green" as const) : ("amber" as const),
                  },
                  {
                    name: state.devices.find((d) => d.processingRole === "pocket")?.name ?? "iQOO 15",
                    role: "Pocket Brain",
                    detail: "Capture · voice · camera",
                    status: "Connected",
                    tone: "green" as const,
                  },
                ].map((device) => (
                  <div key={device.role} className="flex items-center gap-3.5 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                      <HardDrive size={15} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-txt-primary">{device.name}</span>
                        <span className="label">{device.role}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[11.5px] text-txt-muted">{device.detail}</div>
                    </div>
                    <span className="flex items-center gap-2">
                      <StatusDot tone={device.tone} pulse />
                      <span className="text-[11.5px] text-txt-secondary">{device.status}</span>
                    </span>
                  </div>
                ))}

                {laptop?.connectionStatus === "syncing" ? <Progress value={laptop.syncProgress ?? 0} showLabel /> : null}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate("/app/devices")}>
                    Manage devices
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate("/app/privacy")}>
                    Privacy dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading
              label="Live"
              title="Recent activity"
              action={
                <Link to="/app/activity" className="flex items-center gap-1 text-[11.5px] text-cyanx">
                  See all <ArrowRight size={12} />
                </Link>
              }
            />
            <div className="mt-3">
              <ActivityTimeline events={state.activity} limit={6} now={now} />
            </div>
          </Panel>
        </div>

        {/* right column */}
        <div className="space-y-5">
          <Panel className="p-6">
            <SectionHeading label="Today" title="Highlights" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => {
                const Icon = item.icon;
                const tones: Record<string, string> = {
                  cyan: "text-cyanx",
                  violet: "text-violetx",
                  green: "text-greenx",
                  amber: "text-amberx",
                };
                return (
                  <div key={item.label} className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
                    <Icon size={15} className={tones[item.tone]} strokeWidth={1.7} />
                    <div className="numeral mt-2.5 text-[20px] text-txt-primary">{item.value}</div>
                    <div className="mt-1 text-[11px] leading-snug text-txt-muted">{item.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="divider my-5" />

            <TechLabel>Quick actions</TechLabel>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                { icon: Sparkles, label: "Ask your brain", run: () => navigate("/app/ask") },
                { icon: Zap, label: "Summarize today", run: digest },
                { icon: Brain, label: "Knowledge graph", run: () => navigate("/app/knowledge") },
                { icon: Timer, label: "Open timeline", run: () => navigate("/app/timeline") },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.run}
                    className="flex items-center gap-2.5 rounded-sm border border-line-subtle bg-ink-850/40 px-3 py-2.5 text-left text-[12.5px] text-txt-secondary transition-all duration-200 hover:border-line-soft hover:text-txt-primary active:scale-[0.99]"
                  >
                    <Icon size={14} className="text-cyanx" strokeWidth={1.7} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading
              label="Projects"
              title="Workspaces"
              action={
                <Link to="/app/projects" className="text-[11.5px] text-cyanx">
                  All projects
                </Link>
              }
            />
            <div className="mt-4 space-y-2.5">
              {state.projects.slice(0, 4).map((project) => {
                const projectMemories = state.memories.filter(
                  (memory) => !memory.deletedAt && memory.projectId === project.id,
                ).length;
                const projectFiles = state.sources.filter((source) => source.projectId === project.id).length;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => navigate(`/app/projects/${project.id}`)}
                    className="flex w-full items-center gap-3.5 rounded-md border border-line-subtle bg-ink-850/40 px-3.5 py-3 text-left transition-colors hover:border-line-soft"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70">
                      <LayoutGrid size={15} className="text-cyanx" strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-txt-primary">{project.name}</span>
                      <span className="mt-0.5 block text-[11px] text-txt-muted">
                        {projectFiles} files · {projectMemories} memories
                      </span>
                    </span>
                    <span className="shrink-0 text-[10.5px] text-txt-muted">
                      {relativeTime(project.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading label="Context" title="This device" />
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <Calendar size={13} /> Today
                </span>
                <span className="text-txt-primary">{dayLabel(new Date().toISOString())}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <HardDrive size={13} /> Storage
                </span>
                <span className="text-txt-primary">Local browser storage</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-2 text-txt-secondary">
                  <SettingsIcon size={13} /> Profile
                </span>
                <span className="text-txt-primary">{session.name || "Unnamed"}</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-txt-muted">
              Everything on this screen is stored on this device. Nothing is uploaded, and remote
              providers stay off until you enable them in Privacy.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
