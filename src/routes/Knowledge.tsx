/**
 * Knowledge — the graph, and the file index behind it.
 *
 * The graph layout is computed locally with a deterministic spring simulation
 * over the stored nodes and edges, so it is stable between renders and needs no
 * external service. Pan, zoom, filter and select are all real interactions.
 */

import {
  AlertTriangle,
  Brain,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  ListRow,
  Panel,
  SectionHeading,
  StateBlock,
  Tabs,
  TechLabel,
} from "../components/ui";
import { fileSize, relativeTime, shortDate } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { KnowledgeNode } from "../lib/types";

const WIDTH = 1000;
const HEIGHT = 680;

interface Positioned extends KnowledgeNode {
  x: number;
  y: number;
}

/** Deterministic force layout — same input always produces the same picture. */
function computeLayout(nodes: KnowledgeNode[], edges: { from: string; to: string; strength: number }[]): Positioned[] {
  const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
  nodes.forEach((node, index) => {
    const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2;
    const radius = node.kind === "project" ? 90 : 210;
    positions.set(node.id, {
      x: WIDTH / 2 + Math.cos(angle) * radius,
      y: HEIGHT / 2 + Math.sin(angle) * radius * 0.82,
      vx: 0,
      vy: 0,
    });
  });

  const spring = edges.map((edge) => ({ ...edge }));
  for (let iteration = 0; iteration < 320; iteration += 1) {
    const cooling = 1 - iteration / 360;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = positions.get(nodes[i].id)!;
        const b = positions.get(nodes[j].id)!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDistance = 132;
        if (distance < minDistance) {
          const push = ((minDistance - distance) / distance) * 0.5 * cooling;
          dx *= push;
          dy *= push;
          a.x += dx;
          a.y += dy;
          b.x -= dx;
          b.y -= dy;
        }
      }
    }

    for (const edge of spring) {
      const a = positions.get(edge.from);
      const b = positions.get(edge.to);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const target = 220 - edge.strength * 60;
      const force = ((distance - target) / distance) * 0.02 * cooling;
      const moveX = dx * force;
      const moveY = dy * force;
      a.x += moveX;
      a.y += moveY;
      b.x -= moveX;
      b.y -= moveY;
    }

    for (const node of nodes) {
      const point = positions.get(node.id)!;
      point.x += (WIDTH / 2 - point.x) * 0.006 * cooling;
      point.y += (HEIGHT / 2 - point.y) * 0.006 * cooling;
    }
  }

  return nodes.map((node) => {
    const point = positions.get(node.id)!;
    return {
      ...node,
      x: Math.max(70, Math.min(WIDTH - 70, point.x)),
      y: Math.max(60, Math.min(HEIGHT - 60, point.y)),
    };
  });
}

export default function KnowledgePage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, addSource, updateSource, removeSource, logActivity } = useBrain();
  const now = useNow(30_000);

  const [tab, setTab] = useState<"graph" | "files">("graph");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>("k-smartline");
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const KIND_COLORS: Record<string, { stroke: string; fill: string; glow: string }> = {
    project: { stroke: "#3882F6", fill: "rgba(56, 130, 246, 0.25)", glow: "rgba(56, 130, 246, 0.5)" },
    person: { stroke: "#885CF6", fill: "rgba(136, 92, 246, 0.25)", glow: "rgba(136, 92, 246, 0.5)" },
    idea: { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.25)", glow: "rgba(245, 158, 11, 0.5)" },
    file: { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.25)", glow: "rgba(16, 185, 129, 0.5)" },
    decision: { stroke: "#00D1FF", fill: "rgba(0, 209, 255, 0.3)", glow: "rgba(0, 209, 255, 0.7)" },
    memory: { stroke: "#885CF6", fill: "rgba(136, 92, 246, 0.25)", glow: "rgba(136, 92, 246, 0.5)" },
  };

  const KIND_ICONS: Record<string, string> = {
    project: "⬡",
    person: "◎",
    idea: "◇",
    file: "▫",
    decision: "◆",
    memory: "○",
  };

  const positions = useMemo(
    () => computeLayout(state.knowledge.nodes, state.knowledge.edges),
    [state.knowledge],
  );

  const visibleNodes = useMemo(() => {
    return positions.filter((node) => {
      if (projectFilter !== "all" && node.projectId && node.projectId !== projectFilter) return false;
      if (projectFilter !== "all" && !node.projectId) return false;
      if (query.trim()) return node.label.toLowerCase().includes(query.trim().toLowerCase());
      return true;
    });
  }, [positions, projectFilter, query]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const selectedNode = positions.find((node) => node.id === selected) ?? null;

  const relatedEdges = useMemo(
    () => state.knowledge.edges.filter((edge) => edge.from === selected || edge.to === selected),
    [state.knowledge.edges, selected],
  );

  const relatedFiles = useMemo(() => {
    if (!selectedNode) return [];
    const needle = selectedNode.label.toLowerCase();
    return state.sources.filter((source) =>
      `${source.name} ${Object.values(source.metadata).join(" ")}`.toLowerCase().includes(needle),
    );
  }, [selectedNode, state.sources]);

  const relatedMemories = useMemo(() => {
    if (!selectedNode) return [];
    const needle = selectedNode.label.toLowerCase();
    return state.memories.filter(
      (memory) =>
        !memory.deletedAt &&
        `${memory.title} ${memory.content}`.toLowerCase().includes(needle),
    );
  }, [selectedNode, state.memories]);

  const indexStats = {
    indexed: state.sources.filter((source) => source.indexStatus === "indexed").length,
    queued: state.sources.filter((source) => source.indexStatus === "queued").length,
    blocked: state.sources.filter((source) => source.permissionStatus !== "granted").length,
    failed: state.sources.filter((source) => source.indexStatus === "failed" || source.indexStatus === "inaccessible").length,
  };

  const reindex = (id: string, name: string) => {
    updateSource(id, { indexStatus: "indexing", indexError: undefined });
    window.setTimeout(() => {
      updateSource(id, {
        indexStatus: "indexed",
        indexedAt: new Date().toISOString(),
        permissionStatus: "granted",
      });
      logActivity({ type: "file", title: "File indexed", detail: name, status: "done" });
    }, 1200);
  };

  /* ----------------------------------------------------------------- Graph */
  const graph = (
    <div className="relative overflow-hidden rounded-2xl border border-[#334155]/40 bg-[#050a12]/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
      {/* Graph toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#334155]/30 px-4 py-2.5">
        <div className="relative min-w-[160px] max-w-[280px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 w-full rounded-lg border border-[#334155]/30 bg-[#020407]/60 pl-8 pr-3 text-[12px] text-[#E2E8F0] placeholder-[#64748B] outline-none transition-all focus:border-[#00D1FF]/40 focus:shadow-[0_0_12px_-4px_rgba(0,209,255,0.3)]"
            placeholder="Search topology…"
            aria-label="Search knowledge graph"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-2 font-mono text-[10px] text-[#64748B]">
            {visibleNodes.length}/{positions.length}
          </span>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg border border-[#334155]/40 bg-[#0A0F1C]/60 text-[#94A3B8] transition-all hover:border-[#00D1FF]/40 hover:text-[#00D1FF]"
            aria-label="Zoom out"
            onClick={() => setView((current) => ({ ...current, k: Math.max(0.5, current.k - 0.15) }))}
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg border border-[#334155]/40 bg-[#0A0F1C]/60 text-[#94A3B8] transition-all hover:border-[#00D1FF]/40 hover:text-[#00D1FF]"
            aria-label="Zoom in"
            onClick={() => setView((current) => ({ ...current, k: Math.min(2.2, current.k + 0.15) }))}
          >
            <Plus size={12} />
          </button>
          <button
            type="button"
            className="ml-1 grid h-7 place-items-center rounded-lg border border-[#334155]/40 bg-[#0A0F1C]/60 px-2.5 font-mono text-[10px] text-[#94A3B8] transition-all hover:border-[#00D1FF]/40 hover:text-[#00D1FF]"
            onClick={() => setView({ k: 1, x: 0, y: 0 })}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Graph canvas */}
      <div
        className="relative touch-none"
        style={{ height: isDesktop ? 560 : 380 }}
      >
        {/* Atmospheric background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,rgba(0,209,255,0.06)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_30%_70%,rgba(136,92,246,0.04)_0%,transparent_50%)]" />
          <div className="absolute inset-0 tech-grid opacity-[0.15] [mask-image:radial-gradient(80%_80%_at_50%_50%,#000_0%,transparent_80%)]" />
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={(event) => {
            dragRef.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y };
            (event.target as Element).setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || !svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const scale = WIDTH / rect.width;
            setView((current) => ({
              ...current,
              x: drag.ox + (event.clientX - drag.x) * scale,
              y: drag.oy + (event.clientY - drag.y) * scale,
            }));
          }}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          onPointerLeave={() => {
            dragRef.current = null;
          }}
          role="application"
          aria-label="Knowledge graph"
        >
          <defs>
            <filter id="edge-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {/* Edges */}
            {state.knowledge.edges.map((edge) => {
              const from = positions.find((node) => node.id === edge.from);
              const to = positions.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              const faded = !visibleIds.has(edge.from) && !visibleIds.has(edge.to);
              const active = selected === edge.from || selected === edge.to || hovered === edge.from || hovered === edge.to;
              return (
                <g key={edge.id}>
                  {/* Background glow line */}
                  {active && (
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#00D1FF"
                      strokeWidth={4}
                      opacity={0.15}
                      filter="url(#edge-glow)"
                    />
                  )}
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={active ? "#00D1FF" : "rgba(51, 65, 85, 0.45)"}
                    strokeWidth={active ? 1.5 : 0.7}
                    opacity={faded ? 0.08 : active ? 0.85 : 0.35}
                    strokeDasharray={active ? "none" : "4 6"}
                  />
                  {active && (
                    <circle r="2.5" fill="#00D1FF" opacity={0.9}>
                      <animate attributeName="cx" values={`${from.x};${to.x}`} dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="cy" values={`${from.y};${to.y}`} dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {positions.map((node) => {
              const faded = !visibleIds.has(node.id);
              const isSelected = node.id === selected;
              const isHovered = node.id === hovered;
              const radius = 7 + node.weight * 11;
              const colors = KIND_COLORS[node.kind] || KIND_COLORS.idea;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  opacity={faded ? 0.12 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelected(node.id)}
                  onPointerEnter={() => setHovered(node.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  {/* Outer Atmosphere */}
                  <circle
                    r={radius * (isSelected ? 3.0 : isHovered ? 2.4 : 1.8)}
                    fill={colors.glow}
                    opacity={isSelected ? 0.2 : isHovered ? 0.12 : 0.03}
                  />

                  {/* Orbital ring for selected */}
                  {isSelected && (
                    <circle
                      r={radius * 2.0}
                      fill="none"
                      stroke="#00D1FF"
                      strokeWidth={0.5}
                      opacity={0.4}
                      strokeDasharray="3 5"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0;360"
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Node body */}
                  <circle
                    r={radius}
                    fill={isSelected ? colors.fill : "#0A0F1C"}
                    stroke={isSelected ? "#00D1FF" : isHovered ? colors.stroke : colors.stroke}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                    filter={isSelected || isHovered ? "url(#node-glow)" : undefined}
                  />

                  {/* Inner nucleus for projects */}
                  {node.kind === "project" && (
                    <circle r={radius * 0.4} fill="#00D1FF" opacity={0.8}>
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Kind symbol */}
                  {node.kind !== "project" && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="8"
                      fill={colors.stroke}
                      opacity={0.7}
                      style={{ pointerEvents: "none" }}
                    >
                      {KIND_ICONS[node.kind] || "◇"}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    y={radius + 16}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight={isSelected || isHovered ? 600 : 400}
                    fill={isSelected ? "#FFFFFF" : isHovered ? "#E2E8F0" : "#94A3B8"}
                    style={{ pointerEvents: "none", textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
                  >
                    {node.label}
                  </text>

                  {/* Connections count for selected */}
                  {isSelected && node.connections > 0 && (
                    <text
                      y={radius + 28}
                      textAnchor="middle"
                      fontSize="8"
                      fontFamily="Space Mono, monospace"
                      fill="#64748B"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.connections} connections
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Bottom status bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3 font-mono text-[9px] text-[#64748B]">
            <span>{visibleNodes.length} entities</span>
            <span className="h-px w-4 bg-[#334155]/50" />
            <span>{state.knowledge.edges.length} relationships</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-[#64748B]">
            {Object.entries(KIND_COLORS).slice(0, 5).map(([kind, colors]) => (
              <span key={kind} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.stroke }} />
                {kind}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------------------------------------------------------- Files */
  const filesPanel = (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">◆ FILE INDEX</div>
          <h2 className="mt-1 font-display text-[20px] font-semibold text-[#E2E8F0]">
            {state.sources.length} known sources
          </h2>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const name = `Workspace_${new Date().toISOString().slice(0, 10)}`;
            addSource({
              name,
              type: "dir",
              pathOrReference: "~/NeoBrain/workspace/",
              permissionStatus: "required",
              indexStatus: "queued",
              metadata: { origin: "manual", files: 0 },
            });
            logActivity({
              type: "context",
              title: "Folder permission requested",
              detail: name,
              status: "idle",
            });
          }}
        >
          <FolderOpen size={13} /> Index a folder
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 border-b border-[#334155]/30 pb-4">
        {[
          { label: "INDEXED", value: indexStats.indexed, color: "#10B981" },
          { label: "QUEUED", value: indexStats.queued, color: "#00D1FF" },
          { label: "BLOCKED", value: indexStats.blocked, color: "#F59E0B" },
          { label: "FAILED", value: indexStats.failed, color: "#EF4444" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-semibold leading-none" style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#64748B]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Source list */}
      <div className="space-y-2">
        {state.sources.map((source) => (
          <div
            key={source.id}
            className="group rounded-xl border border-[#334155]/30 bg-[#0B1320]/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#334155]/60 hover:bg-[#0F1B2D]/50"
          >
            <div className="flex items-start gap-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407]/80">
                {source.type === "image" ? (
                  <ImageIcon size={14} className="text-[#10B981]" />
                ) : (
                  <FileText size={14} className="text-[#00D1FF]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[#E2E8F0]">{source.name}</div>
                <div className="mt-0.5 truncate font-mono text-[10px] text-[#64748B]">
                  {source.pathOrReference}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                    {source.type}
                  </span>
                  <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                    {fileSize(source.sizeKb)}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                      source.indexStatus === "indexed"
                        ? "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]"
                        : source.indexStatus === "inaccessible" || source.indexStatus === "failed"
                          ? "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]"
                          : "border-[#334155]/40 bg-[#0A0F1C]/60 text-[#94A3B8]"
                    }`}
                  >
                    {source.indexStatus === "indexing" ? "indexing…" : source.indexStatus}
                  </span>
                  {source.permissionStatus !== "granted" && (
                    <span className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] text-[#F59E0B]">
                      {source.permissionStatus}
                    </span>
                  )}
                  {source.indexedAt && (
                    <span className="font-mono text-[10px] text-[#64748B]">
                      indexed {relativeTime(source.indexedAt, now)}
                    </span>
                  )}
                </div>
                {source.indexError && (
                  <div className="mt-2 flex items-start gap-2">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                    <span className="text-[11px] text-[#F59E0B]">{source.indexError}</span>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {source.permissionStatus !== "granted" ? (
                  <Button size="sm" variant="primary" onClick={() => reindex(source.id, source.name)}>
                    Grant &amp; index
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => reindex(source.id, source.name)}>
                    <RefreshCw size={12} /> Re-index
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removeSource(source.id);
                    logActivity({
                      type: "file",
                      title: "Source forgotten",
                      detail: source.name,
                      status: "idle",
                    });
                  }}
                >
                  <Trash2 size={12} /> Forget
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-[#64748B]">
        NeoBrain only reads folders you grant. Blocked folders stay inaccessible and are reported here
        rather than failing silently.
      </p>
    </div>
  );

  /* ----------------------------------------------------------------- Page */
  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Knowledge" tagline="Search across everything." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1320px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {/* Header */}
        {isDesktop ? (
          <header className="mb-6">
            <div className="flex items-end justify-between gap-5">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                  ◆ NEURAL TOPOLOGY
                </div>
                <h1 className="mt-2 font-display text-[38px] font-semibold leading-[1.05] text-[#E2E8F0]">
                  See how everything connects.
                </h1>
              </div>
              <Tabs
                tabs={[
                  { id: "graph", label: "Graph" },
                  { id: "files", label: "Files", count: state.sources.length },
                ]}
                value={tab}
                onChange={setTab}
              />
            </div>

            {/* Inline stats */}
            <div className="mt-4 flex items-center gap-6 font-mono text-[11px]">
              <span className="text-[#00D1FF]">{state.knowledge.nodes.length} entities</span>
              <span className="h-px w-4 bg-[#334155]/50" />
              <span className="text-[#94A3B8]">{state.knowledge.edges.length} relationships</span>
              <span className="h-px w-4 bg-[#334155]/50" />
              <span className="text-[#64748B]">built from your files and memories</span>
            </div>
          </header>
        ) : (
          <div className="mb-4">
            <Tabs
              tabs={[
                { id: "graph", label: "Graph" },
                { id: "files", label: "Files", count: state.sources.length },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
        )}

        {tab === "graph" ? (
          <div className="grid gap-5 lg:grid-cols-[1.6fr_0.7fr]">
            <div className="space-y-3">
              {/* Project filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <Chip active={projectFilter === "all"} onClick={() => setProjectFilter("all")}>
                  All projects
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
              {graph}
            </div>

            {/* Inspector sidebar */}
            <div className="space-y-4">
              {/* Selected node inspector */}
              <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/50 p-5 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  ✦ SELECTED ENTITY
                </div>
                <h3 className="mt-2 font-display text-[18px] font-semibold text-[#E2E8F0]">
                  {selectedNode?.label ?? "Nothing selected"}
                </h3>
                {selectedNode ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#00D1FF]">
                        {selectedNode.kind}
                      </span>
                      <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2.5 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                        {selectedNode.connections} links
                      </span>
                      {selectedNode.projectId && (
                        <span className="rounded-full border border-[#334155]/40 bg-[#0A0F1C]/60 px-2.5 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                          {state.projects.find((project) => project.id === selectedNode.projectId)?.name}
                        </span>
                      )}
                    </div>

                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B] mb-2.5">
                      ✦ CONNECTIONS
                    </div>
                    <div className="space-y-1">
                      {relatedEdges.length === 0 ? (
                        <p className="text-[12px] text-[#64748B]">No relationships recorded yet.</p>
                      ) : (
                        relatedEdges.map((edge) => {
                          const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                          const other = positions.find((node) => node.id === otherId);
                          if (!other) return null;
                          return (
                            <ListRow
                              key={edge.id}
                              icon={Brain}
                              title={other.label}
                              subtitle={`${edge.label} · strength ${Math.round(edge.strength * 100)}%`}
                              accent="cyan"
                              onClick={() => setSelected(other.id)}
                            />
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-[12px] leading-relaxed text-[#64748B]">
                    Tap a node in the graph to inspect its relationships, files and memories.
                  </p>
                )}
              </div>

              {/* Related files & memories */}
              <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/50 p-5 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B] mb-2.5">
                  ✦ RELATED FILES · {relatedFiles.length}
                </div>
                <div className="space-y-1">
                  {relatedFiles.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">No files match this entity.</p>
                  ) : (
                    relatedFiles.map((file) => (
                      <ListRow
                        key={file.id}
                        icon={FileText}
                        title={file.name}
                        subtitle={`${file.type} · indexed ${file.indexedAt ? relativeTime(file.indexedAt, now) : "—"}`}
                        accent="green"
                      />
                    ))
                  )}
                </div>

                <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748B] mb-2.5">
                  ✦ RELATED MEMORIES · {relatedMemories.length}
                </div>
                <div className="space-y-1">
                  {relatedMemories.length === 0 ? (
                    <p className="text-[12px] text-[#64748B]">No memories mention this entity.</p>
                  ) : (
                    relatedMemories.slice(0, 5).map((memory) => (
                      <ListRow
                        key={memory.id}
                        icon={ShieldCheck}
                        title={memory.title}
                        subtitle={`${memory.category} · ${shortDate(memory.createdAt)}`}
                        accent="violet"
                        onClick={() => navigate(`/app/memory?focus=${memory.id}`)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Attribution */}
              <div className="flex items-start gap-3 rounded-xl border border-[#334155]/25 bg-[#0B1320]/30 p-4">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-[#00D1FF]" />
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Links are derived from your own memories, file names and metadata using local
                  matching. No external service builds this graph.
                </p>
              </div>
            </div>
          </div>
        ) : (
          filesPanel
        )}

        {state.sources.length === 0 ? (
          <div className="mt-4">
            <StateBlock
              kind="empty"
              title="Nothing indexed yet"
              description="Attach a file from Ask NeoBrain and NeoBrain will record its metadata here."
              action={
                <Button variant="primary" onClick={() => navigate("/app/ask")}>
                  Attach a file
                </Button>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
