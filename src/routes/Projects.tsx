/**
 * Projects — automatically organised by your work.
 *
 * Projects are plain local records: files, memories, tasks and conversations all
 * point at them, and every count on this screen is derived, never hardcoded.
 */

import { ArrowUpRight, FolderKanban, Plus, Sparkles, Tag } from "lucide-react";
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
  cyan: "from-cyanx/24",
  violet: "from-violetx/24",
  amber: "from-amberx/22",
  green: "from-greenx/22",
};

function ProjectArt({ accent = "cyan" }: { accent?: Project["accent"] }) {
  return (
    <div className="relative h-[132px] overflow-hidden rounded-lg border border-line-subtle">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,#0e222e_0%,#050c13_70%)]" />
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[accent]} to-transparent`} />
      <svg viewBox="0 0 320 132" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`art-${accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(0,217,255,0.65)" />
            <stop offset="100%" stopColor="rgba(141,108,255,0.25)" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="96" rx="120" ry="22" fill="none" stroke={`url(#art-${accent})`} strokeWidth="0.8" />
        <ellipse cx="160" cy="96" rx="78" ry="14" fill="none" stroke="rgba(145,205,235,0.22)" strokeWidth="0.7" />
        <circle cx="160" cy="96" r="26" fill="rgba(4,9,14,0.6)" stroke="rgba(0,217,255,0.35)" strokeWidth="0.9" />
        <circle cx="160" cy="96" r="9" fill="rgba(0,217,255,0.22)" />
        <rect x="24" y="18" width="46" height="34" rx="6" fill="rgba(11,26,36,0.9)" stroke="rgba(145,205,235,0.18)" />
        <rect x="250" y="26" width="46" height="34" rx="6" fill="rgba(11,26,36,0.9)" stroke="rgba(145,205,235,0.18)" />
        <path d="M70 35 H250" stroke="rgba(0,217,255,0.24)" strokeWidth="0.7" strokeDasharray="3 4" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-ink-900/95 to-transparent" />
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
  });

  const handleCreate = () => {
    if (!draft.name.trim()) return;
    const project = createProject({
      name: draft.name.trim(),
      description: draft.description.trim() || "New workspace",
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
              <TechLabel tone="cyan">Projects</TechLabel>
              <h1 className="mt-2 title-xl">Automatically organized by your work.</h1>
              <p className="mt-2 text-[13px] text-txt-secondary">
                Files, memories, tasks and conversations grouped into the things you actually build.
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              New project
            </Button>
          </header>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <TechLabel>Active projects · {projects.length}</TechLabel>
            <button type="button" className="icon-btn h-9 w-9" aria-label="New project" onClick={() => setCreating(true)}>
              <Plus size={16} />
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <StateBlock
            kind="empty"
            title="No projects yet"
            description="Create a project and NeoBrain will start linking files and memories to it."
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={15} /> Create project
              </Button>
            }
          />
        ) : (
          <div className={`grid gap-4 ${isDesktop ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}>
            {projects.map((project) => {
              const counts = stats(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="group panel overflow-hidden p-3.5 text-left transition-all duration-400 ease-premium hover:border-line-soft hover:shadow-elevated active:scale-[0.995]"
                >
                  <ProjectArt accent={project.accent} />
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-[15.5px] font-semibold text-txt-primary">{project.name}</h2>
                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-txt-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyanx"
                      />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-txt-secondary">
                      {project.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] text-txt-muted">
                      <span className="flex items-center gap-1.5">
                        <FolderKanban size={11} /> {counts.files} files
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={11} /> {counts.memories} memories
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Tag size={11} /> {counts.tasks} tasks
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Chip key={tag} as="span">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                    <div className="mt-3.5 text-[10.5px] text-txt-muted">
                      Last activity {relativeTime(project.updatedAt)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isDesktop ? (
          <Panel className="mt-6 p-5">
            <SectionHeading label="Tip" title="Projects link everything" />
            <p className="mt-2 max-w-[70ch] text-[12.5px] leading-relaxed text-txt-secondary">
              Anything captured while a project is in context is filed against it: answers, memories,
              indexed files and detected tasks. Open a project to see its timeline and current state.
            </p>
          </Panel>
        ) : null}
      </div>

      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="New project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={!draft.name.trim()}>
              Create project
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="label mb-2 block">
              Name
            </label>
            <input
              id="project-name"
              className="input"
              placeholder="e.g. SmartLine"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project-description" className="label mb-2 block">
              Description
            </label>
            <textarea
              id="project-description"
              className="input h-auto resize-none py-3 leading-relaxed"
              rows={3}
              placeholder="What is this project about?"
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
              className="input"
              placeholder="ML, Hardware"
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
