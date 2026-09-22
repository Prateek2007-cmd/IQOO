/**
 * Projects — automatically organised by your work.
 *
 * Projects are intelligent workspaces: files, memories, tasks and conversations all
 * point at them, and every count on this screen is derived, never hardcoded.
 */

import {
  ArrowUpRight,
  Clock,
  FileText,
  FolderKanban,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { Project } from "../lib/types";

const ACCENTS: Record<string, string> = {
  cyan: "from-cyanx/20 border-cyanx/30 text-cyanx",
  violet: "from-purplex/20 border-purplex/30 text-purplex",
  amber: "from-amberx/20 border-amberx/30 text-amberx",
  green: "from-greenx/20 border-greenx/30 text-greenx",
};

function ProjectArt({ accent = "cyan" }: { accent?: Project["accent"] }) {
  return (
    <div className="relative h-[110px] overflow-hidden rounded-xl border border-border/80 bg-space/90">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,#0F1B2D_0%,#020407_80%)]" />
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[accent]} to-transparent opacity-40`} />
      <svg viewBox="0 0 320 110" className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
        <defs>
          <linearGradient id={`art-${accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#885CF6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="80" rx="110" ry="18" fill="none" stroke={`url(#art-${accent})`} strokeWidth="0.8" />
        <ellipse cx="160" cy="80" rx="65" ry="11" fill="none" stroke="rgba(0,209,255,0.25)" strokeWidth="0.7" />
        <circle cx="160" cy="80" r="18" fill="rgba(2,4,7,0.8)" stroke="#00D1FF" strokeWidth="0.9" />
        <circle cx="160" cy="80" r="5" fill="#00D1FF" className="animate-pulse" />
        <rect x="30" y="16" width="36" height="26" rx="6" fill="rgba(15,27,45,0.8)" stroke="rgba(51,65,85,0.8)" />
        <rect x="254" y="20" width="36" height="26" rx="6" fill="rgba(15,27,45,0.8)" stroke="rgba(51,65,85,0.8)" />
        <path d="M66 29 H254" stroke="rgba(0,209,255,0.2)" strokeWidth="0.7" strokeDasharray="3 3" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-panel/90 to-transparent" />
    </div>
  );
}

export default function ProjectsPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, createProject, logActivity } = useBrain();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "", tags: "" });

  const projects = useMemo(() => state.projects, [state.projects]);

  const stats = (projectId: string) => ({
    files: state.sources.filter((source) => source.projectId === projectId).length,
    memories: state.memories.filter((memory) => !memory.deletedAt && memory.projectId === projectId).length,
    tasks: state.tasks.filter((task) => task.projectId === projectId && task.status !== "done").length,
    decisions: state.memories.filter(
      (memory) => !memory.deletedAt && memory.projectId === projectId && memory.category === "decision",
    ).length,
  });

  const handleCreate = () => {
    if (!draft.name.trim()) return;
    const project = createProject({
      name: draft.name.trim(),
      description: draft.description.trim() || "Intelligent Workspace",
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      accent: "cyan",
    });
    logActivity({
      type: "context",
      title: "Project created",
      detail: project.name,
      status: "done",
      projectId: project.id,
    });
    setDraft({ name: "", description: "", tags: "" });
    setCreating(false);
    navigate(`/app/projects/${project.id}`);
  };

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Projects" tagline="Automatically organized." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <TechLabel tone="cyan">Intelligent Workspaces</TechLabel>
              <h1 className="mt-2 title-xl">Automatically organized by your work.</h1>
              <p className="mt-2 text-[13.5px] text-txt-secondary">
                Files, memories, tasks, and conversations automatically grouped into the missions you actually build.
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              New Workspace
            </Button>
          </header>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <TechLabel>Active Workspaces · {projects.length}</TechLabel>
            <button
              type="button"
              className="icon-btn h-9 w-9 border-border bg-surface text-cyanx"
              aria-label="New project"
              onClick={() => setCreating(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <StateBlock
            kind="empty"
            title="No projects yet"
            description="Create a project workspace and NeoBrain will start linking files, conversations, and memories to it."
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={15} /> Create Workspace
              </Button>
            }
          />
        ) : (
          <div className={`grid gap-5 ${isDesktop ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}>
            {projects.map((project) => {
              const counts = stats(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface/80 via-panel/50 to-space/90 p-4.5 text-left transition-all duration-300 ease-premium hover:border-cyanx/40 hover:shadow-[0_0_24px_rgba(0,209,255,0.08)] active:scale-[0.995]"
                >
                  <ProjectArt accent={project.accent} />
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-[16px] font-semibold text-txt-primary tracking-tight">{project.name}</h2>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-txt-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyanx"
                      />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-txt-secondary">
                      {project.description}
                    </p>

                    {/* Level 3 Micro-Module telemetry badges */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-border/80 bg-space/60 p-2 text-center">
                        <div className="font-mono text-[14px] font-semibold text-txt-primary">{counts.files}</div>
                        <div className="text-[10px] font-mono uppercase text-txt-muted">Files</div>
                      </div>
                      <div className="rounded-lg border border-border/80 bg-space/60 p-2 text-center">
                        <div className="font-mono text-[14px] font-semibold text-cyanx">{counts.memories}</div>
                        <div className="text-[10px] font-mono uppercase text-txt-muted">Memories</div>
                      </div>
                      <div className="rounded-lg border border-border/80 bg-space/60 p-2 text-center">
                        <div className="font-mono text-[14px] font-semibold text-amberx">{counts.tasks}</div>
                        <div className="text-[10px] font-mono uppercase text-txt-muted">Tasks</div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="micro-module text-[10.5px]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-txt-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {relativeTime(project.updatedAt)}
                      </span>
                      {counts.decisions > 0 ? (
                        <span className="text-purplex flex items-center gap-1">
                          <ShieldCheck size={11} /> {counts.decisions} decisions
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isDesktop ? (
          <Panel className="mt-6 p-6">
            <SectionHeading label="Intelligent Linkage" title="How Workspace Clustering Works" />
            <p className="mt-2 max-w-[76ch] text-[13px] leading-relaxed text-txt-secondary">
              Anything captured while a project is active in your mind is indexed against it: answers, conversation records,
              source documents, and detected action items. Switch contexts instantly with full provenance and continuous memory.
            </p>
          </Panel>
        ) : null}
      </div>

      {/* New Project Sheet */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New Workspace"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!draft.name.trim()}>
              Create Workspace
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="label mb-2 block">
              Workspace Name
            </label>
            <input
              id="project-name"
              className="input bg-surface border-border"
              placeholder="e.g. SmartLine / Orbit Core"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project-description" className="label mb-2 block">
              Objective & Scope
            </label>
            <textarea
              id="project-description"
              className="input h-auto resize-none py-3 leading-relaxed bg-surface border-border"
              rows={3}
              placeholder="What are you creating or exploring in this workspace?"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project-tags" className="label mb-2 block">
              Tags (comma separated)
            </label>
            <input
              id="project-tags"
              className="input bg-surface border-border"
              placeholder="AI, Hardware, Research"
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
