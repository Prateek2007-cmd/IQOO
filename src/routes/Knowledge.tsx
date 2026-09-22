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
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

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

  const graph = (
    <Panel className="relative overflow-hidden p-0" padded={false}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line-subtle px-4 py-3">
        <div className="relative min-w-[180px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input h-9 pl-9 text-[12.5px]"
            placeholder="Search your knowledge…"
            aria-label="Search knowledge graph"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="icon-btn h-9 w-9"
            aria-label="Zoom out"
            onClick={() => setView((current) => ({ ...current, k: Math.max(0.5, current.k - 0.15) }))}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="icon-btn h-9 w-9"
            aria-label="Zoom in"
            onClick={() => setView((current) => ({ ...current, k: Math.min(2.2, current.k + 0.15) }))}
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="icon-btn h-9 px-3 text-[11.5px]"
            onClick={() => setView({ k: 1, x: 0, y: 0 })}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="relative touch-none bg-[radial-gradient(120%_90%_at_50%_0%,#0b1c27_0%,#050c13_70%)]"
        style={{ height: isDesktop ? 520 : 380 }}
      >
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
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {state.knowledge.edges.map((edge) => {
              const from = positions.find((node) => node.id === edge.from);
              const to = positions.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              const faded = !visibleIds.has(edge.from) && !visibleIds.has(edge.to);
              const active = selected === edge.from || selected === edge.to;
              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? "rgba(0,217,255,0.55)" : "rgba(145,205,235,0.18)"}
                  strokeWidth={active ? 1.4 : 0.7 + edge.strength * 0.6}
                  opacity={faded ? 0.12 : 1}
                />
              );
            })}

            {positions.map((node) => {
              const faded = !visibleIds.has(node.id);
              const isSelected = node.id === selected;
              const radius = 6 + node.weight * 12;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  opacity={faded ? 0.18 : 1}
                  className="cursor-pointer"
                  onClick={() => setSelected(node.id)}
                >
                  <circle r={radius * 2.4} fill="rgba(0,217,255,0.05)" />
                  <circle
                    r={radius}
                    fill={isSelected ? "rgba(0,217,255,0.22)" : "rgba(11,26,36,0.9)"}
                    stroke={isSelected ? "#00d9ff" : node.kind === "project" ? "rgba(141,108,255,0.6)" : "rgba(145,205,235,0.36)"}
                    strokeWidth={isSelected ? 1.6 : 1}
                  />
                  {node.kind === "project" ? (
                    <circle r={radius * 0.42} fill="rgba(0,217,255,0.65)" />
                  ) : null}
                  <text
                    y={radius + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isSelected ? "#eafcff" : "#91aab8"}
                    style={{ pointerEvents: "none" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-3 text-[10px] text-txt-muted">
          <span>{visibleNodes.length} nodes</span>
          <span>·</span>
          <span>drag to pan · use the buttons to zoom</span>
        </div>
      </div>
    </Panel>
  );

  const filesPanel = (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading label="Index" title={`${state.sources.length} known sources`} />
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

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: "Indexed", value: indexStats.indexed, tone: "text-greenx" },
          { label: "Queued", value: indexStats.queued, tone: "text-cyanx" },
          { label: "Permission needed", value: indexStats.blocked, tone: "text-amberx" },
          { label: "Inaccessible", value: indexStats.failed, tone: "text-warnx" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md border border-line-subtle bg-ink-850/40 p-3">
            <div className={`numeral text-[18px] ${stat.tone}`}>{stat.value}</div>
            <div className="mt-1 text-[10.5px] text-txt-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {state.sources.map((source) => (
          <div key={source.id} className="rounded-md border border-line-subtle bg-ink-850/40 p-3.5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                {source.type === "image" ? <ImageIcon size={14} /> : <FileText size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-txt-primary">{source.name}</div>
                <div className="mt-0.5 truncate font-mono text-[10.5px] text-txt-muted">
                  {source.pathOrReference}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Chip as="span">{source.type}</Chip>
                  <Chip as="span">{fileSize(source.sizeKb)}</Chip>
                  <Chip
                    as="span"
                    active={source.indexStatus === "indexed"}
                    className={source.indexStatus === "inaccessible" ? "border-warnx/40 text-warnx" : ""}
                  >
                    {source.indexStatus === "indexing" ? "indexing…" : source.indexStatus}
                  </Chip>
                  {source.permissionStatus !== "granted" ? (
                    <Chip as="span" className="border-amberx/40 text-amberx">
                      {source.permissionStatus}
                    </Chip>
                  ) : null}
                  {source.indexedAt ? (
                    <span className="text-[10.5px] text-txt-muted">
                      indexed {relativeTime(source.indexedAt, now)}
                    </span>
                  ) : null}
                </div>
                {source.indexError ? (
                  <div className="mt-2 flex items-start gap-2">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warnx" />
                    <span className="text-[11px] text-warnx">{source.indexError}</span>
                  </div>
                ) : null}
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

      <p className="mt-4 text-[10.5px] leading-relaxed text-txt-muted">
        NeoBrain only reads folders you grant. Blocked folders stay inaccessible and are reported here
        rather than failing silently.
      </p>
    </Panel>
  );

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Knowledge" tagline="Search across everything." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <TechLabel tone="cyan">Knowledge</TechLabel>
              <h1 className="mt-2 title-xl">See how everything connects.</h1>
              <p className="mt-2 text-[13px] text-txt-secondary">
                {state.knowledge.nodes.length} entities · {state.knowledge.edges.length} relationships ·
                built from your own files and memories
              </p>
            </div>
            <Tabs
              tabs={[
                { id: "graph", label: "Graph" },
                { id: "files", label: "Files", count: state.sources.length },
              ]}
              value={tab}
              onChange={setTab}
            />
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
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="space-y-3">
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

            <div className="space-y-4">
              <Panel className="p-5">
                <SectionHeading
                  label="Selected"
                  title={selectedNode?.label ?? "Nothing selected"}
                />
                {selectedNode ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip as="span" active>
                        {selectedNode.kind}
                      </Chip>
                      <Chip as="span">{selectedNode.connections} links</Chip>
                      {selectedNode.projectId ? (
                        <Chip as="span">
                          {state.projects.find((project) => project.id === selectedNode.projectId)?.name}
                        </Chip>
                      ) : null}
                    </div>

                    <div className="divider my-4" />
                    <TechLabel className="mb-2.5">Connected to</TechLabel>
                    <div className="space-y-1">
                      {relatedEdges.length === 0 ? (
                        <p className="text-[12px] text-txt-muted">No relationships recorded yet.</p>
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
                  <p className="mt-3 text-[12px] text-txt-muted">
                    Tap a node in the graph to inspect its relationships, files and memories.
                  </p>
                )}
              </Panel>

              <Panel className="p-5">
                <SectionHeading label="Related" title={`Files · ${relatedFiles.length}`} />
                <div className="mt-2.5 space-y-1">
                  {relatedFiles.length === 0 ? (
                    <p className="text-[12px] text-txt-muted">No files match this entity.</p>
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
                <div className="divider my-3.5" />
                <SectionHeading label="Related" title={`Memories · ${relatedMemories.length}`} />
                <div className="mt-2.5 space-y-1">
                  {relatedMemories.length === 0 ? (
                    <p className="text-[12px] text-txt-muted">No memories mention this entity.</p>
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
              </Panel>

              <Panel className="p-5">
                <div className="flex items-start gap-3">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-cyanx" />
                  <p className="text-[11.5px] leading-relaxed text-txt-secondary">
                    Links are derived from your own memories, file names and metadata using local
                    matching. No external service builds this graph.
                  </p>
                </div>
              </Panel>
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
