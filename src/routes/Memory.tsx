/**
 * Memory — Personal Memory Layer
 *
 * Implements the spatial neural memory galaxy matching the NeoBrain master UI specification:
 * - Celestial deep-space interactive neural graph with organic connections
 * - Inline telemetry stats rail (Memories, Projects, Decisions, Ideas)
 * - Category filter tabs (All, Today, People, Projects, Ideas, Decisions, Files, Tasks)
 * - Floating inspector HUD with Keep, Connect, Edit, Forget actions
 * - Horizontal bottom "Memory Stream" timeline
 * - Seamless desktop spatial graph / mobile structured list view
 * - Full business logic preservation: create, edit, archive, restore, purge
 */

import {
  Archive,
  Bookmark,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Crosshair,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  Lightbulb,
  Link2,
  Minus,
  Network,
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
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  Panel,
  Sheet,
  StateBlock,
  TechLabel,
} from "../components/ui";
import { relativeTime, shortDate } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { Importance, Memory, RetentionType } from "../lib/types";

type TabId = "all" | "today" | "people" | "projects" | "ideas" | "decisions" | "files" | "tasks";

interface GraphNode {
  id: string;
  memory: Memory;
  x: number;
  y: number;
  r: number;
  color: string;
  glow: string;
  iconType: "project" | "person" | "decision" | "idea" | "file" | "note" | "task";
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
}

const GRAPH_WIDTH = 1100;
const GRAPH_HEIGHT = 620;

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
  const [editingInSheet, setEditingInSheet] = useState(false);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [draft, setDraft] = useState({ title: "", content: "", category: "note" as Memory["category"] });

  // Pan & Zoom state for spatial graph
  const [pan, setPan] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  /* Deep-link support: /app/memory?focus=<id> */
  useEffect(() => {
    const focus = params.get("focus");
    if (focus) {
      setOpenId(focus);
    }
  }, [params]);

  const activeMemories = useMemo(
    () => state.memories.filter((m) => !m.deletedAt),
    [state.memories]
  );

  // Set default selected memory to focus or the first important memory
  useEffect(() => {
    if (!openId && activeMemories.length > 0) {
      const preferred =
        activeMemories.find((m) => m.importance === "important" || m.importance === "structured") ||
        activeMemories[0];
      setOpenId(preferred.id);
    }
  }, [activeMemories, openId]);

  const filteredMemories = useMemo(() => {
    const base = activeMemories;
    const now = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    let filtered = base;
    if (tab === "today") {
      filtered = base.filter((m) => isToday(m.createdAt));
    } else if (tab === "people") {
      filtered = base.filter(
        (m) =>
          m.category === "conversation" ||
          /sarah|marcus|elena|david|alex|chen|aarav|mehta|team|client|advisor|founder/i.test(
            `${m.title} ${m.content}`
          )
      );
    } else if (tab === "projects") {
      filtered = base.filter((m) => Boolean(m.projectId));
    } else if (tab === "ideas") {
      filtered = base.filter((m) => m.category === "knowledge" || m.category === "note");
    } else if (tab === "decisions") {
      filtered = base.filter((m) => m.category === "decision");
    } else if (tab === "files") {
      filtered = base.filter((m) => m.sourceReferences && m.sourceReferences.length > 0);
    } else if (tab === "tasks") {
      filtered = base.filter((m) => m.category === "task");
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter((m) => m.projectId === projectFilter);
    }

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      filtered = filtered.filter((m) => `${m.title} ${m.content}`.toLowerCase().includes(needle));
    }

    return filtered;
  }, [activeMemories, tab, projectFilter, query]);

  const selectedMemory = useMemo(
    () => state.memories.find((m) => m.id === openId) ?? null,
    [state.memories, openId]
  );

  const selectedProject = useMemo(() => {
    if (!selectedMemory?.projectId) return null;
    return state.projects.find((p) => p.id === selectedMemory.projectId) ?? null;
  }, [state.projects, selectedMemory]);

  const archived = useMemo(() => state.memories.filter((m) => m.deletedAt), [state.memories]);

  // Telemetry counts matching the mockup
  const stats = useMemo(() => {
    return {
      memories: activeMemories.length,
      projects: state.projects.length,
      decisions: activeMemories.filter((m) => m.category === "decision").length,
      ideas: activeMemories.filter((m) => m.category === "knowledge" || m.category === "note").length,
    };
  }, [activeMemories, state.projects]);

  // Deterministic Spatial Layout computation for the Neural Memory Galaxy
  const { nodes, edges } = useMemo(() => {
    const memoryList = filteredMemories.slice(0, 36);
    const map = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];

    const centerX = GRAPH_WIDTH / 2;
    const centerY = GRAPH_HEIGHT / 2;

    const getColorInfo = (category: Memory["category"], importance: Memory["importance"]) => {
      if (category === "decision") return { color: "#F59E0B", glow: "rgba(245, 158, 11, 0.6)", iconType: "decision" as const };
      if (category === "conversation") return { color: "#3882F6", glow: "rgba(56, 130, 246, 0.6)", iconType: "person" as const };
      if (category === "task") return { color: "#10B981", glow: "rgba(16, 185, 129, 0.6)", iconType: "task" as const };
      if (category === "knowledge") return { color: "#885CF6", glow: "rgba(136, 92, 246, 0.6)", iconType: "idea" as const };
      if (importance === "important" || importance === "structured") {
        return { color: "#00D1FF", glow: "rgba(0, 209, 255, 0.8)", iconType: "file" as const };
      }
      return { color: "#94A3B8", glow: "rgba(148, 163, 184, 0.4)", iconType: "note" as const };
    };

    memoryList.forEach((mem, idx) => {
      const isSelected = mem.id === openId;
      const { color, glow, iconType } = getColorInfo(mem.category, mem.importance);

      let x = centerX;
      let y = centerY;
      let r = 16;

      if (isSelected) {
        x = centerX;
        y = centerY;
        r = 26;
      } else {
        const ring = (idx % 3);
        const radius = ring === 0 ? 130 + (idx * 16) % 40 : ring === 1 ? 210 + (idx * 22) % 50 : 290 + (idx * 28) % 50;
        const angle = (idx / Math.max(1, memoryList.length - 1)) * Math.PI * 2 + (ring * 0.4);
        x = centerX + Math.cos(angle) * radius * 1.25;
        y = centerY + Math.sin(angle) * radius * 0.85;
        r = mem.importance === "important" || mem.importance === "structured" ? 21 : 16;
      }

      map.set(mem.id, {
        id: mem.id,
        memory: mem,
        x: Math.max(60, Math.min(GRAPH_WIDTH - 60, x)),
        y: Math.max(60, Math.min(GRAPH_HEIGHT - 60, y)),
        r,
        color,
        glow,
        iconType,
      });
    });

    const nodeList = Array.from(map.values());
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const a = nodeList[i];
        const b = nodeList[j];

        const sameProject = a.memory.projectId && b.memory.projectId && a.memory.projectId === b.memory.projectId;
        const sameCategory = a.memory.category === b.memory.category;
        const connectedToSelected = a.id === openId || b.id === openId;

        if (sameProject || (connectedToSelected && (sameCategory || a.memory.importance === "important"))) {
          edgeList.push({
            id: `edge-${a.id}-${b.id}`,
            source: a.id,
            target: b.id,
            strength: sameProject ? 0.9 : 0.45,
          });
        }
      }
    }

    return { nodes: nodeList, edges: edgeList };
  }, [filteredMemories, openId]);

  // Related memories for selected item in the inspector
  const relatedMemories = useMemo(() => {
    if (!selectedMemory) return [];
    return activeMemories
      .filter((m) => m.id !== selectedMemory.id)
      .filter(
        (m) =>
          (selectedMemory.projectId && m.projectId === selectedMemory.projectId) ||
          m.category === selectedMemory.category ||
          m.importance === "important"
      )
      .slice(0, 5);
  }, [activeMemories, selectedMemory]);

  // Chronological Memory Stream for bottom rail
  const memoryStreamItems = useMemo(() => {
    return [...activeMemories]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [activeMemories]);

  const closeDetail = () => {
    setEditingInSheet(false);
    setConfirmDelete(false);
  };

  const handleCreate = () => {
    if (!draft.title.trim() && !draft.content.trim()) return;
    const memory = createMemory({
      title: draft.title.trim() || draft.content.slice(0, 48),
      content: draft.content.trim(),
      category: draft.category,
      importance: "useful",
      retentionType: "30-days",
      reason: "Added manually through Memory Layer.",
    });
    logActivity({ type: "candidate", title: "Memory added", detail: memory.title, status: "done" });
    setDraft({ title: "", content: "", category: "note" });
    setCreating(false);
    setOpenId(memory.id);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).tagName === "svg" || (e.target as Element).id === "graph-bg") {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan((prev) => ({
      ...prev,
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const resetZoom = () => {
    setPan({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? (
        <MobileTopBar title="Memory" tagline="Personal memory layer" />
      ) : null}

      <div className={isDesktop ? "mx-auto max-w-[1580px] px-8 py-7" : "px-4 pb-8 pt-4"}>
        {/* ── 1. Header & Telemetry Stats Rail ────────────────── */}
        <header className="mb-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00D1FF]">
              <Sparkles size={12} className="text-[#00D1FF]" />
              PERSONAL MEMORY LAYER
            </div>
            <h1 className="mt-1.5 font-display text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
              Everything you've chosen to remember.
            </h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Your conversations, decisions, ideas and moments — connected by context.
            </p>
          </div>

          {/* Inline Telemetry Stats (from Mockup) */}
          <div className="flex items-center gap-7 border-t border-[#334155]/30 pt-3 lg:border-t-0 lg:pt-0">
            <div>
              <div className="font-mono text-[22px] font-semibold leading-none text-white sm:text-[24px]">
                {stats.memories.toLocaleString()}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                MEMORIES
              </div>
            </div>
            <div className="h-7 w-px bg-[#334155]/40" />
            <div>
              <div className="font-mono text-[22px] font-semibold leading-none text-[#3882F6] sm:text-[24px]">
                {stats.projects}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                PROJECTS
              </div>
            </div>
            <div className="h-7 w-px bg-[#334155]/40" />
            <div>
              <div className="font-mono text-[22px] font-semibold leading-none text-[#F59E0B] sm:text-[24px]">
                {stats.decisions}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                DECISIONS
              </div>
            </div>
            <div className="h-7 w-px bg-[#334155]/40" />
            <div>
              <div className="font-mono text-[22px] font-semibold leading-none text-[#885CF6] sm:text-[24px]">
                {stats.ideas}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
                IDEAS
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. Filter Tabs & Actions Bar ────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#334155]/30 pb-3.5">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
            {[
              { id: "all", label: "All" },
              { id: "today", label: "Today" },
              { id: "people", label: "People" },
              { id: "projects", label: "Projects" },
              { id: "ideas", label: "Ideas" },
              { id: "decisions", label: "Decisions" },
              { id: "files", label: "Files" },
              { id: "tasks", label: "Tasks" },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as TabId)}
                  className={`relative shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-all duration-200 ${
                    active
                      ? "border border-[#00D1FF]/50 bg-[#00D1FF]/10 text-white shadow-[0_0_16px_rgba(0,209,255,0.25)]"
                      : "border border-transparent text-[#94A3B8] hover:border-[#334155]/50 hover:bg-[#0F1B2D]/40 hover:text-[#E2E8F0]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories…"
                className="h-8 w-44 rounded-full border border-[#334155]/40 bg-[#0B1320]/60 pl-8 pr-3 text-[12px] text-[#E2E8F0] placeholder-[#64748B] outline-none transition-all focus:w-60 focus:border-[#00D1FF]/50"
              />
            </div>

            {/* View Mode Toggle for Desktop */}
            {isDesktop ? (
              <div className="flex items-center rounded-full border border-[#334155]/40 bg-[#0B1320]/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("graph")}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    viewMode === "graph" ? "bg-[#00D1FF]/20 text-[#00D1FF]" : "text-[#64748B] hover:text-[#94A3B8]"
                  }`}
                >
                  <Network size={12} /> Graph
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    viewMode === "list" ? "bg-[#00D1FF]/20 text-[#00D1FF]" : "text-[#64748B] hover:text-[#94A3B8]"
                  }`}
                >
                  <FileText size={12} /> List
                </button>
              </div>
            ) : null}

            {/* New Memory CTA */}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#00D1FF]/40 bg-gradient-to-r from-[#00D1FF]/20 to-[#3882F6]/20 px-3 text-[12px] font-medium text-white shadow-[0_0_14px_rgba(0,209,255,0.2)] transition-all hover:border-[#00D1FF]/70"
            >
              <Plus size={13} className="text-[#00D1FF]" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* ── 3. Main Stage: Spatial Neural Graph + Floating Inspector HUD ──── */}
        {viewMode === "graph" && isDesktop ? (
          <div className="relative mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_390px]">
            {/* The Celestial Spatial Neural Canvas */}
            <div className="relative h-[620px] overflow-hidden rounded-[24px] border border-[#334155]/50 bg-[#020407] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.95)]">
              {/* Galaxy Star Atmosphere & Cyan/Blue Deep Space Glow Pools */}
              <div className="pointer-events-none absolute inset-0 z-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(110% 90% at 45% 45%, #08162b 0%, #050c18 45%, #020407 100%)",
                  }}
                />
                <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[700px] rounded-full blur-[110px] bg-[radial-gradient(circle,rgba(0,209,255,0.18)_0%,transparent_70%)]" />
                <div className="absolute -bottom-[20%] right-[10%] h-[450px] w-[600px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(136,92,246,0.16)_0%,transparent_70%)]" />
                <div className="absolute inset-0 tech-grid opacity-[0.25] [mask-image:radial-gradient(90%_90%_at_50%_50%,#000_0%,transparent_85%)]" />
              </div>

              {/* Floating Zoom & Controls HUD on Left (from Mockup) */}
              <div className="absolute left-5 top-5 z-30 flex flex-col gap-1.5 rounded-xl border border-[#334155]/50 bg-[#0B1320]/80 p-1 backdrop-blur-xl shadow-lg">
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => setPan((p) => ({ ...p, scale: Math.min(2.4, p.scale + 0.15) }))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-all hover:bg-[#00D1FF]/15 hover:text-[#00D1FF]"
                >
                  <Plus size={15} />
                </button>
                <div className="h-px w-full bg-[#334155]/40" />
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => setPan((p) => ({ ...p, scale: Math.max(0.6, p.scale - 0.15) }))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-all hover:bg-[#00D1FF]/15 hover:text-[#00D1FF]"
                >
                  <Minus size={15} />
                </button>
                <div className="h-px w-full bg-[#334155]/40" />
                <button
                  type="button"
                  aria-label="Recenter view"
                  onClick={resetZoom}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-all hover:bg-[#00D1FF]/15 hover:text-[#00D1FF]"
                >
                  <Crosshair size={14} />
                </button>
              </div>

              {/* Interactive SVG Neural Memory Canvas */}
              <svg
                id="graph-bg"
                ref={svgRef}
                viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                className="relative z-10 h-full w-full cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <defs>
                  <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="node-aura" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${pan.scale})`}>
                  {/* Neural Graph Edges */}
                  {edges.map((edge) => {
                    const sourceNode = nodes.find((n) => n.id === edge.source);
                    const targetNode = nodes.find((n) => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isConnectedToSelected =
                      edge.source === openId || edge.target === openId;

                    return (
                      <g key={edge.id}>
                        {isConnectedToSelected ? (
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="#00D1FF"
                            strokeWidth="2.2"
                            strokeOpacity="0.8"
                            filter="url(#cyan-glow)"
                          />
                        ) : (
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="#3882F6"
                            strokeWidth="0.85"
                            strokeOpacity="0.28"
                            strokeDasharray="3 4"
                          />
                        )}

                        {isConnectedToSelected && (
                          <circle r="2.2" fill="#00D1FF">
                            <animate
                              attributeName="cx"
                              values={`${sourceNode.x};${targetNode.x}`}
                              dur="3.2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              values={`${sourceNode.y};${targetNode.y}`}
                              dur="3.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Neural Graph Nodes */}
                  {nodes.map((node) => {
                    const isSelected = node.id === openId;
                    const isHovered = node.id === hoveredNodeId;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => {
                          setOpenId(node.id);
                          setConfirmDelete(false);
                        }}
                        onPointerEnter={() => setHoveredNodeId(node.id)}
                        onPointerLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer"
                      >
                        {/* Outer Glow Halo */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={node.r * (isSelected ? 2.4 : 1.9)}
                            fill={node.glow}
                            opacity={isSelected ? 0.35 : 0.2}
                            filter="url(#node-aura)"
                          />
                        )}

                        {/* Concentric orbital rings for selected node */}
                        {isSelected && (
                          <circle
                            r={node.r * 1.5}
                            fill="none"
                            stroke="#00D1FF"
                            strokeWidth="0.8"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              values="0;360"
                              dur="24s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        {/* Node Body */}
                        <circle
                          r={node.r}
                          fill={isSelected ? "#00D1FF" : "#0A0F1C"}
                          stroke={isSelected ? "#CDF5FF" : node.color}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          style={{
                            filter: isSelected ? "drop-shadow(0 0 14px rgba(0,209,255,0.9))" : undefined,
                          }}
                        />

                        {/* Icon Inside Node */}
                        <g
                          transform={`translate(-${node.r * 0.45}, -${node.r * 0.45}) scale(${node.r / 26})`}
                          fill="none"
                          stroke={isSelected ? "#020407" : node.color}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {node.iconType === "project" ? (
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          ) : node.iconType === "person" ? (
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                          ) : node.iconType === "decision" ? (
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          ) : node.iconType === "idea" ? (
                            <path d="M9 18h6 M10 22h4 M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
                          ) : (
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
                          )}
                        </g>

                        {/* Title Label below node */}
                        <text
                          y={node.r + 14}
                          textAnchor="middle"
                          fontFamily="Space Grotesk, sans-serif"
                          fontSize={isSelected ? "11.5" : "10"}
                          fontWeight={isSelected ? 600 : 400}
                          fill={isSelected ? "#FFFFFF" : "#CBD5E1"}
                          style={{
                            pointerEvents: "none",
                            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                          }}
                        >
                          {node.memory.title.length > 24
                            ? node.memory.title.slice(0, 22) + "…"
                            : node.memory.title}
                        </text>

                        {/* Subtitle date / category */}
                        <text
                          y={node.r + 26}
                          textAnchor="middle"
                          fontFamily="Space Mono, monospace"
                          fontSize="8.5"
                          fill={isSelected ? "#00D1FF" : "#64748B"}
                          style={{ pointerEvents: "none" }}
                        >
                          {node.memory.category} · {shortDate(node.memory.createdAt)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* ── Floating Inspector HUD on Right (exact match to Mockup) ── */}
            <aside className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#334155]/60 bg-[#0B1320]/80 p-6 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95)]">
              {selectedMemory ? (
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                      <Bookmark size={12} />
                      MEMORY
                    </div>
                    <button
                      type="button"
                      aria-label="Close details"
                      onClick={() => setOpenId(null)}
                      className="grid h-7 w-7 place-items-center rounded-full text-[#64748B] transition-colors hover:bg-[#334155]/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Memory Title */}
                  <h2 className="font-display text-[21px] font-bold leading-tight text-white">
                    {selectedMemory.title}
                  </h2>

                  {/* Date & Time Metadata */}
                  <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#94A3B8]" />
                      {new Date(selectedMemory.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[#94A3B8]" />
                      {new Date(selectedMemory.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#3882F6]/40 bg-[#3882F6]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#60A5FA]">
                      {selectedProject ? selectedProject.name : "Personal Memory"}
                    </span>
                    {(selectedMemory.importance === "important" ||
                      selectedMemory.importance === "structured") && (
                      <span className="rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#00D1FF]">
                        Important
                      </span>
                    )}
                    <span className="rounded-full border border-[#334155]/50 bg-[#0F1B2D]/60 px-2 py-0.5 font-mono text-[10.5px] uppercase text-[#94A3B8]">
                      {selectedMemory.category}
                    </span>
                  </div>

                  {/* Section: What happened */}
                  <div className="pt-2">
                    <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                      What happened
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#CBD5E1]">
                      {selectedMemory.content}
                    </p>
                  </div>

                  {/* Section: Source */}
                  <div className="pt-1">
                    <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                      Source
                    </div>
                    {selectedProject ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/app/projects/${selectedProject.id}`)}
                        className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-[#334155]/50 bg-[#0A0F1C]/70 p-3 text-left transition-all hover:border-[#00D1FF]/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#3882F6]">
                            <FolderKanban size={13} />
                          </span>
                          <div>
                            <div className="text-[12.5px] font-medium text-white">
                              {selectedProject.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#64748B]">
                              Project · {shortDate(selectedMemory.createdAt)}
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={13} className="text-[#64748B]" />
                      </button>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#334155]/40 bg-[#0A0F1C]/50 p-2.5 font-mono text-[11px] text-[#94A3B8]">
                        <Pin size={12} className="text-[#00D1FF]" />
                        Direct Capture / Autonomous
                      </div>
                    )}
                  </div>

                  {/* Section: Related memories */}
                  {relatedMemories.length > 0 && (
                    <div className="pt-1">
                      <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                        Related memories
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {relatedMemories.map((rm) => (
                          <button
                            key={rm.id}
                            type="button"
                            onClick={() => setOpenId(rm.id)}
                            className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition-all hover:border-[#334155]/40 hover:bg-[#0F1B2D]/40"
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                              {rm.category === "decision" ? (
                                <ShieldCheck size={12} className="text-[#F59E0B]" />
                              ) : rm.category === "knowledge" ? (
                                <Lightbulb size={12} className="text-[#885CF6]" />
                              ) : rm.category === "conversation" ? (
                                <Users size={12} className="text-[#3882F6]" />
                              ) : (
                                <FileText size={12} className="text-[#00D1FF]" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12px] text-[#E2E8F0] group-hover:text-[#00D1FF]">
                                {rm.title}
                              </div>
                              <div className="font-mono text-[9.5px] text-[#64748B]">
                                {rm.category} · {shortDate(rm.createdAt)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <Network size={32} className="text-[#334155]" />
                  <div className="mt-3 text-[14px] font-semibold text-white">
                    Select a memory node
                  </div>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    Click any node on the galaxy graph to inspect its context, source documents, and relationships.
                  </p>
                </div>
              )}

              {/* Action Buttons: [Keep] [Connect] [Edit] [Forget] (from Mockup) */}
              {selectedMemory && (
                <div className="mt-4 border-t border-[#334155]/40 pt-3.5">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateMemory(selectedMemory.id, {
                          importance:
                            selectedMemory.importance === "important" ? "useful" : "important",
                        });
                        logActivity({
                          type: "candidate",
                          title: "Memory priority toggled",
                          detail: selectedMemory.title,
                          status: "done",
                        });
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 text-[11px] font-medium transition-all ${
                        selectedMemory.importance === "important" ||
                        selectedMemory.importance === "structured"
                          ? "border-[#00D1FF]/50 bg-[#00D1FF]/10 text-[#00D1FF]"
                          : "border-[#334155]/50 bg-[#0F1B2D]/40 text-[#94A3B8] hover:border-[#334155]"
                      }`}
                    >
                      <Bookmark size={13} />
                      Keep
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/app/knowledge")}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#334155]/50 bg-[#0F1B2D]/40 py-2 text-[11px] font-medium text-[#94A3B8] transition-all hover:border-[#3882F6]/50 hover:text-[#3882F6]"
                    >
                      <Link2 size={13} />
                      Connect
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingInSheet(true)}
                      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#334155]/50 bg-[#0F1B2D]/40 py-2 text-[11px] font-medium text-[#94A3B8] transition-all hover:border-[#00D1FF]/50 hover:text-[#00D1FF]"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    {confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          softDeleteMemory(selectedMemory.id);
                          logActivity({
                            type: "context",
                            title: "Memory archived",
                            detail: selectedMemory.title,
                            status: "idle",
                          });
                          setConfirmDelete(false);
                          setOpenId(null);
                        }}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#EF4444]/60 bg-[#EF4444]/20 py-2 text-[10.5px] font-semibold text-[#EF4444] transition-all"
                      >
                        <Trash2 size={13} />
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-[#334155]/50 bg-[#0F1B2D]/40 py-2 text-[11px] font-medium text-[#94A3B8] transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                      >
                        <Trash2 size={13} />
                        Forget
                      </button>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        ) : (
          /* ── List Mode (Mobile Default or Desktop List Toggle) ──── */
          <div className="mb-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-3">
              {filteredMemories.length === 0 ? (
                <StateBlock
                  kind={query || projectFilter !== "all" || tab !== "all" ? "search-empty" : "empty"}
                  title={query ? "No memories match your query" : "No memories in this view"}
                  description="Clear the search or try another category filter tab."
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setQuery("");
                        setTab("all");
                        setProjectFilter("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                filteredMemories.map((mem) => {
                  const isSelected = mem.id === openId;
                  const isImportant =
                    mem.importance === "important" || mem.importance === "structured";

                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => {
                        setOpenId(mem.id);
                        if (!isDesktop) setEditingInSheet(true);
                      }}
                      className={`group w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-[#00D1FF]/50 bg-[#0F1B2D]/80 shadow-[0_0_20px_rgba(0,209,255,0.1)]"
                          : "border-[#334155]/40 bg-[#0B1320]/50 hover:border-[#334155]/80 hover:bg-[#0F1B2D]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                          {mem.category === "decision" ? (
                            <ShieldCheck size={14} className="text-[#F59E0B]" />
                          ) : mem.category === "task" ? (
                            <CheckSquare size={14} className="text-[#10B981]" />
                          ) : mem.category === "conversation" ? (
                            <Users size={14} className="text-[#3882F6]" />
                          ) : (
                            <FileText size={14} className="text-[#00D1FF]" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[14px] font-semibold text-white">
                              {mem.title}
                            </span>
                            <span className="font-mono text-[10px] text-[#64748B]">
                              {shortDate(mem.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#94A3B8]">
                            {mem.content}
                          </p>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                            <span className="rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2 py-0.2 text-[#00D1FF]">
                              {mem.category}
                            </span>
                            {isImportant && (
                              <span className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.2 text-[#F59E0B]">
                                Beacon
                              </span>
                            )}
                            {mem.sourceReferences?.length ? (
                              <span className="text-[#64748B]">
                                {mem.sourceReferences.length} sources
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Side column for desktop list view */}
            {isDesktop && (
              <div className="space-y-4">
                {selectedMemory ? (
                  <div className="rounded-2xl border border-[#334155]/50 bg-[#0B1320]/60 p-5 backdrop-blur-xl">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                      SELECTED MEMORY
                    </div>
                    <h3 className="mt-2 text-[17px] font-bold text-white">
                      {selectedMemory.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[#94A3B8]">
                      {selectedMemory.content}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingInSheet(true)}>
                        <Pencil size={12} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          softDeleteMemory(selectedMemory.id);
                          setOpenId(null);
                        }}
                      >
                        <Archive size={12} /> Archive
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Archived Memories Panel */}
                <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/40 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Archived ({archived.length})
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {archived.length === 0 ? (
                      <p className="text-[12px] text-[#64748B]">No archived memories.</p>
                    ) : (
                      archived.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[#334155]/30 bg-[#0A0F1C]/40 p-2 text-[12px]"
                        >
                          <span className="truncate text-[#94A3B8]">{m.title}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => restoreMemory(m.id)}
                              className="grid h-6 w-6 place-items-center text-[#00D1FF] hover:text-white"
                              title="Restore"
                            >
                              <RotateCcw size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => purgeMemory(m.id)}
                              className="grid h-6 w-6 place-items-center text-[#EF4444] hover:text-red-300"
                              title="Permanently Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. Bottom Horizontal "Memory Stream" (from Mockup) ──── */}
        <div className="mt-3 rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-4.5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#334155]/30 pb-2.5">
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
              <Clock size={12} className="text-[#00D1FF]" />
              MEMORY STREAM
            </div>
            <button
              type="button"
              onClick={() => navigate("/app/timeline")}
              className="flex items-center gap-1 font-mono text-[11px] text-[#00D1FF] hover:underline"
            >
              View all →
            </button>
          </div>

          <div className="no-scrollbar mt-3 flex items-center gap-6 overflow-x-auto pb-1 pt-1">
            {memoryStreamItems.map((item, idx) => {
              const isSelected = item.id === openId;
              const timeStr = new Date(item.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpenId(item.id);
                    if (!isDesktop) setEditingInSheet(true);
                  }}
                  className="group relative flex shrink-0 items-start gap-3 text-left"
                >
                  <div className="relative mt-1">
                    <span
                      className={`block h-3 w-3 rounded-full border transition-all ${
                        isSelected
                          ? "border-[#00D1FF] bg-[#00D1FF] shadow-[0_0_10px_#00D1FF]"
                          : "border-[#334155] bg-[#0A0F1C] group-hover:border-[#00D1FF]"
                      }`}
                    />
                    {idx < memoryStreamItems.length - 1 && (
                      <span className="absolute left-1.5 top-3 h-px w-6 bg-[#334155]/40" />
                    )}
                  </div>

                  <div className="min-w-0 max-w-[170px]">
                    <div className="font-mono text-[10px] text-[#00D1FF]">
                      {timeStr}
                    </div>
                    <div
                      className={`truncate text-[12px] font-medium transition-colors ${
                        isSelected ? "text-white font-semibold" : "text-[#94A3B8] group-hover:text-[#E2E8F0]"
                      }`}
                    >
                      {item.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Edit Memory Inspector Sheet ──────────────────── */}
      <Sheet
        open={editingInSheet && selectedMemory !== null}
        onClose={closeDetail}
        title="Edit Memory"
        footer={
          selectedMemory ? (
            <div className="flex w-full items-center justify-between">
              <Button
                variant="danger"
                onClick={() => {
                  softDeleteMemory(selectedMemory.id);
                  closeDetail();
                }}
              >
                <Trash2 size={13} /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={closeDetail}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={closeDetail}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {selectedMemory ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="memory-title" className="label mb-1.5 block">
                Title
              </label>
              <input
                id="memory-title"
                className="input bg-[#0A0F1C] border-[#334155]/50"
                value={selectedMemory.title}
                onChange={(e) => updateMemory(selectedMemory.id, { title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="memory-content" className="label mb-1.5 block">
                Details &amp; Context
              </label>
              <textarea
                id="memory-content"
                className="input h-auto resize-none py-3 leading-relaxed bg-[#0A0F1C] border-[#334155]/50"
                rows={4}
                value={selectedMemory.content}
                onChange={(e) => updateMemory(selectedMemory.id, { content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="memory-category" className="label mb-1.5 block">
                  Category
                </label>
                <select
                  id="memory-category"
                  className="input bg-[#0A0F1C] border-[#334155]/50"
                  value={selectedMemory.category}
                  onChange={(e) =>
                    updateMemory(selectedMemory.id, {
                      category: e.target.value as Memory["category"],
                    })
                  }
                >
                  {["knowledge", "decision", "task", "note", "conversation"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="memory-importance" className="label mb-1.5 block">
                  Importance
                </label>
                <select
                  id="memory-importance"
                  className="input bg-[#0A0F1C] border-[#334155]/50"
                  value={selectedMemory.importance}
                  onChange={(e) =>
                    updateMemory(selectedMemory.id, {
                      importance: e.target.value as Importance,
                    })
                  }
                >
                  {["useful", "important", "structured", "temp", "noise"].map((imp) => (
                    <option key={imp} value={imp}>
                      {imp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="memory-project" className="label mb-1.5 block">
                Project Link
              </label>
              <select
                id="memory-project"
                className="input bg-[#0A0F1C] border-[#334155]/50"
                value={selectedMemory.projectId ?? ""}
                onChange={(e) =>
                  updateMemory(selectedMemory.id, {
                    projectId: e.target.value || undefined,
                  })
                }
              >
                <option value="">None (Global)</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* ── 6. New Memory Creation Sheet ────────────────────── */}
      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="Add to Memory Layer"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Save Memory
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="new-title" className="label mb-1.5 block">
              Title
            </label>
            <input
              id="new-title"
              className="input bg-[#0A0F1C] border-[#334155]/50"
              placeholder="What should NeoBrain remember?"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="new-content" className="label mb-1.5 block">
              Details
            </label>
            <textarea
              id="new-content"
              className="input h-auto resize-none py-3 leading-relaxed bg-[#0A0F1C] border-[#334155]/50"
              rows={4}
              placeholder="Context, implications, numbers or key people..."
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="new-category" className="label mb-1.5 block">
              Category
            </label>
            <select
              id="new-category"
              className="input bg-[#0A0F1C] border-[#334155]/50"
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as Memory["category"] })
              }
            >
              {["note", "knowledge", "decision", "task", "conversation"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
