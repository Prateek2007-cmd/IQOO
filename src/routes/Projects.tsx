/**
 * Projects — Mission Control & Workspace Constellation.
 *
 * Visualizes projects as intelligent mission control modules with MicroRing
 * vector coverage indicators, live activity counts, and inline data strips.
 */

import {
  ArrowUpRight,
  CheckCircle2,
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
  MicroRing,
  Panel,
  Sheet,
  StateBlock,
  StatusDot,
} from "../components/ui";
import { relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { Project } from "../lib/types";

export default function ProjectsPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, createProject, logActivity } = useBrain();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "", tags: "" });

  const projects = useMemo(() => state.projects, [state.projects]);

  const stats = (projectId: string) => {
    const files = state.sources.filter((source) => source.projectId === projectId);
    const indexed = files.filter((f) => f.indexStatus === "indexed").length;
    const memories = state.memories.filter((m) => !m.deletedAt && m.projectId === projectId).length;
    const tasks = state.tasks.filter((t) => t.projectId === projectId && t.status !== "done").length;
    const decisions = state.memories.filter(
      (m) => !m.deletedAt && m.projectId === projectId && m.category === "decision"
    ).length;

    return {
      files: files.length,
      indexed,
      coverage: files.length ? indexed / files.length : 0.85,
      memories,
      tasks,
      decisions,
    };
  };

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
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title="Workspaces" tagline="Mission Control" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* ── 1. Header ───────────────────────────────────────── */}
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                <FolderKanban size={12} className="text-[#00D1FF]" />
                INTELLIGENT WORKSPACES
              </div>
              <h1 className="mt-1.5 font-display text-[36px] font-bold text-white">
                Missions &amp; Project Constellation
              </h1>
              <p className="mt-1 text-[13px] text-[#94A3B8]">
                Context-bound operational spaces uniting semantic memory nodes, indexed files, and active decisions.
              </p>
            </div>

            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
              New Workspace
            </Button>
          </header>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[#64748B]">
              {projects.length} Workspaces Active
            </span>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 text-[11px] font-medium text-[#00D1FF]"
              onClick={() => setCreating(true)}
            >
              <Plus size={13} /> New
            </button>
          </div>
        )}

        {/* ── 2. Workspaces Layout ────────────────────────────── */}
        {projects.length === 0 ? (
          <StateBlock
            kind="empty"
            title="No Active Workspaces"
            description="Create a project workspace and NeoBrain will start routing relevant documents and conversations to it."
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={14} /> Create Workspace
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {projects.map((project, idx) => {
              const projectStats = stats(project.id);
              const isFirst = idx === 0;

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className={`group relative cursor-pointer overflow-hidden rounded-[24px] border p-6 backdrop-blur-2xl transition-all duration-300 ${
                    isFirst
                      ? "border-[#00D1FF]/40 bg-gradient-to-r from-[#0F1B2D]/90 via-[#0B1320]/80 to-[#020407]/90 shadow-[0_15px_40px_-15px_rgba(0,209,255,0.12)] hover:border-[#00D1FF]/70"
                      : "border-[#334155]/50 bg-gradient-to-r from-[#0F1B2D]/50 via-[#0B1320]/60 to-[#020407]/80 hover:border-[#3882F6]/50 shadow-md"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    {/* Left: Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#10B981]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                          ACTIVE MISSION
                        </span>
                        {project.tags.length > 0 && (
                          <span className="font-mono text-[10px] text-[#64748B]">
                            · {project.tags.join(" · ")}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-3">
                        <h2 className="font-display text-[22px] font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                          {project.name}
                        </h2>
                        <ArrowUpRight
                          size={16}
                          className="text-[#64748B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00D1FF]"
                        />
                      </div>

                      <p className="mt-1 line-clamp-2 max-w-[70ch] text-[13px] leading-relaxed text-[#94A3B8]">
                        {project.description}
                      </p>

                      {/* Micro-Telemetry Pills */}
                      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                        <span className="flex items-center gap-1.5 rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2.5 py-0.5 text-[#00D1FF]">
                          <FileText size={11} /> {projectStats.files} indexed files
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full border border-[#885CF6]/30 bg-[#885CF6]/10 px-2.5 py-0.5 text-[#885CF6]">
                          <Sparkles size={11} /> {projectStats.memories} memories
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-0.5 text-[#F59E0B]">
                          <ShieldCheck size={11} /> {projectStats.decisions} decisions
                        </span>
                        {projectStats.tasks > 0 && (
                          <span className="flex items-center gap-1.5 rounded-full border border-[#3882F6]/30 bg-[#3882F6]/10 px-2.5 py-0.5 text-[#60A5FA]">
                            {projectStats.tasks} open tasks
                          </span>
                        )}
                        <span className="text-[#64748B]">
                          Updated {relativeTime(project.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Coverage Ring & Quick Link */}
                    <div className="flex items-center gap-5 border-t border-[#334155]/30 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
                      <div className="flex items-center gap-3">
                        <MicroRing
                          progress={projectStats.coverage}
                          size={46}
                          color="#00D1FF"
                        />
                        <div>
                          <div className="font-mono text-[15px] font-bold text-white">
                            {Math.round(projectStats.coverage * 100)}%
                          </div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                            Index Density
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Create Sheet ─────────────────────────────────── */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="Initialize Intelligent Workspace"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Initialize Mission
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="label mb-1.5 block">
              Workspace Identifier
            </label>
            <input
              id="project-name"
              className="input bg-[#0A0F1C] border-[#334155]/50"
              placeholder="e.g. SmartLine Bearing Sensor"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="label mb-1.5 block">
              Mission Scope &amp; Purpose
            </label>
            <textarea
              id="project-desc"
              className="input h-auto resize-none py-3 leading-relaxed bg-[#0A0F1C] border-[#334155]/50"
              rows={3}
              placeholder="High-frequency acoustic anomaly detection and edge IoT architecture..."
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project-tags" className="label mb-1.5 block">
              Context Tags (comma separated)
            </label>
            <input
              id="project-tags"
              className="input bg-[#0A0F1C] border-[#334155]/50 font-mono text-[12px]"
              placeholder="iot, vibration, edge, rust"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
