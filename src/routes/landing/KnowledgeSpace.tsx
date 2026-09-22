import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Network, Sparkles, Compass } from "lucide-react";

interface Node {
  id: string;
  name: string;
  type: "PROJECT" | "PERSON" | "IDEA" | "FILE" | "DECISION" | "MEMORY";
  x: number; // 0 - 1000
  y: number; // 0 - 550
  radius: number;
  connections: string[];
  summary: string;
  timestamp: string;
}

const NODES: Node[] = [
  {
    id: "proj-smartline",
    name: "SmartLine",
    type: "PROJECT",
    x: 320,
    y: 240,
    radius: 12,
    connections: ["file-bearing", "dec-sqlite", "idea-optical", "person-elena", "mem-lab"],
    summary: "High-speed industrial vibration monitoring system.",
    timestamp: "Active project · Updated 2d ago",
  },
  {
    id: "file-bearing",
    name: "bearing_vibration.csv",
    type: "FILE",
    x: 180,
    y: 160,
    radius: 8,
    connections: ["proj-smartline", "idea-optical"],
    summary: "Raw 10kHz vibration sensor data from test bench 3.",
    timestamp: "Dataset · 42.8 MB",
  },
  {
    id: "dec-sqlite",
    name: "Adopt SQLite VSS",
    type: "DECISION",
    x: 480,
    y: 170,
    radius: 9,
    connections: ["proj-smartline", "proj-neobrain", "idea-spatial"],
    summary: "Selected embedded vector search engine for zero cloud dependency.",
    timestamp: "Verified architecture · Nov 24",
  },
  {
    id: "idea-optical",
    name: "Optical FFT Calibration",
    type: "IDEA",
    x: 170,
    y: 350,
    radius: 9,
    connections: ["proj-smartline", "file-bearing"],
    summary: "Combine laser tachometer reading with FFT to eliminate drift.",
    timestamp: "Hypothesis · Documented in notes",
  },
  {
    id: "person-elena",
    name: "Elena (Firmware Lead)",
    type: "PERSON",
    x: 460,
    y: 360,
    radius: 10,
    connections: ["proj-smartline", "mem-lab", "dec-pinout"],
    summary: "Collaborated on SPI bus timings and DMA buffer allocation.",
    timestamp: "3 discussions indexed",
  },
  {
    id: "dec-pinout",
    name: "ESP32 SPI Pinout Locked",
    type: "DECISION",
    x: 600,
    y: 420,
    radius: 8,
    connections: ["person-elena", "proj-neobrain"],
    summary: "Pins 18, 19, 23 assigned to high-speed accelerometer bus.",
    timestamp: "Milestone committed",
  },
  {
    id: "mem-lab",
    name: "Lab Bench Testing Session",
    type: "MEMORY",
    x: 350,
    y: 450,
    radius: 9,
    connections: ["proj-smartline", "person-elena"],
    summary: "Audio recording & notes captured during 12,000 RPM stress run.",
    timestamp: "Captured via Pocket Brain",
  },
  {
    id: "proj-neobrain",
    name: "NeoBrain System",
    type: "PROJECT",
    x: 680,
    y: 220,
    radius: 13,
    connections: ["dec-sqlite", "dec-pinout", "idea-spatial", "person-aris", "file-schema"],
    summary: "Autonomous ambient memory layer for engineering workflows.",
    timestamp: "Core system",
  },
  {
    id: "idea-spatial",
    name: "Spatial Memory Lattice",
    type: "IDEA",
    x: 550,
    y: 80,
    radius: 9,
    connections: ["dec-sqlite", "proj-neobrain"],
    summary: "Organize memory nodes by semantic proximity rather than chronological lists.",
    timestamp: "Core patent draft",
  },
  {
    id: "person-aris",
    name: "Dr. Aris (Advisor)",
    type: "PERSON",
    x: 820,
    y: 150,
    radius: 10,
    connections: ["proj-neobrain", "file-schema"],
    summary: "Feedback on memory retention thresholds and zero-knowledge guarantees.",
    timestamp: "Mentor session · Nov 19",
  },
  {
    id: "file-schema",
    name: "schema_v2.sql",
    type: "FILE",
    x: 840,
    y: 330,
    radius: 8,
    connections: ["proj-neobrain", "person-aris"],
    summary: "SQLite schema for hybrid vector embeddings and keyword indexing.",
    timestamp: "Migration script · Git commit 4e10",
  },
  {
    id: "mem-pitch",
    name: "MSME Hackathon Rehearsal",
    type: "MEMORY",
    x: 770,
    y: 440,
    radius: 8,
    connections: ["proj-neobrain", "proj-smartline"],
    summary: "Key presentation notes and slides Q&A rehearsal transcript.",
    timestamp: "Audio transcript indexed",
  },
];

const TYPE_COLORS: Record<string, { stroke: string; fill: string; text: string }> = {
  PROJECT: { stroke: "#00D1FF", fill: "rgba(0, 209, 255, 0.25)", text: "#00D1FF" },
  PERSON: { stroke: "#3882F6", fill: "rgba(56, 130, 246, 0.25)", text: "#3882F6" },
  IDEA: { stroke: "#885CF6", fill: "rgba(136, 92, 246, 0.25)", text: "#885CF6" },
  FILE: { stroke: "#94A3B8", fill: "rgba(148, 163, 184, 0.25)", text: "#94A3B8" },
  DECISION: { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.25)", text: "#F59E0B" },
  MEMORY: { stroke: "#E2E8F0", fill: "rgba(226, 232, 240, 0.25)", text: "#E2E8F0" },
};

export default function KnowledgeSpace() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>("proj-smartline");

  const hoveredNode = useMemo(
    () => NODES.find((n) => n.id === hoveredNodeId) || null,
    [hoveredNodeId]
  );

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-28 px-6">
      {/* SECTION HEADER */}
      <div className="relative z-10 mx-auto max-w-[1240px] w-full text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/40 backdrop-blur-md mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#94A3B8] uppercase">
            06 / NEURAL TOPOLOGY
          </span>
        </div>

        <h2 className="font-display text-[32px] sm:text-[46px] md:text-[54px] font-semibold tracking-tight text-[#E2E8F0] leading-[1.08] max-w-[22ch] mx-auto">
          SEE HOW EVERYTHING CONNECTS.
        </h2>

        <p className="mt-5 text-[14px] sm:text-[15px] text-[#94A3B8] max-w-[52ch] mx-auto font-normal leading-relaxed">
          Projects, tools, files, and conversations organize organically into a spatial graph. Hover
          any node to inspect its contextual relationships.
        </p>
      </div>

      {/* LEVEL 1: FULL DARK-SPACE INTERACTIVE NEURAL GRAPH */}
      <div className="relative z-10 mx-auto max-w-[1100px] w-full h-[520px] sm:h-[560px] rounded-3xl border border-[#334155]/40 bg-[#0A0F1C]/50 backdrop-blur-xl overflow-hidden">
        {/* Node Category Legend in Top Right */}
        <div className="absolute top-5 right-6 z-20 hidden sm:flex items-center gap-4 bg-[#0F1B2D]/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#334155]/40 text-[10px] font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00D1FF]" /> PROJECT
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3882F6]" /> PERSON
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#885CF6]" /> IDEA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> DECISION
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" /> MEMORY
          </span>
        </div>

        {/* SVG GRAPH CANVAS */}
        <svg
          viewBox="0 0 1000 550"
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* EDGES */}
          {NODES.flatMap((source) =>
            source.connections.map((targetId) => {
              const target = NODES.find((n) => n.id === targetId);
              if (!target || source.id > target.id) return null; // avoid duplicate lines

              const isConnectedToHovered =
                hoveredNodeId === source.id || hoveredNodeId === target.id;

              return (
                <line
                  key={`${source.id}-${target.id}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isConnectedToHovered ? "#00D1FF" : "#334155"}
                  strokeWidth={isConnectedToHovered ? 1.8 : 0.8}
                  strokeDasharray={isConnectedToHovered ? "none" : "3 6"}
                  opacity={isConnectedToHovered ? 0.9 : 0.25}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* NODES */}
          {NODES.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isLinked = hoveredNode?.connections.includes(node.id);
            const style = TYPE_COLORS[node.type];

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                className="cursor-pointer"
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 10}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth="1"
                    opacity="0.4"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? node.radius + 3 : node.radius}
                  fill={isHovered || isLinked ? style.stroke : style.fill}
                  stroke={style.stroke}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  className="transition-all duration-200"
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 14}
                  textAnchor="middle"
                  fill={isHovered ? "#FFFFFF" : isLinked ? "#E2E8F0" : "#94A3B8"}
                  fontSize={isHovered ? "11.5" : "10"}
                  fontFamily="monospace"
                  letterSpacing="0.04em"
                  opacity={isHovered ? 1 : 0.85}
                  className="pointer-events-none select-none transition-all duration-200"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HOVER TOOLTIP HUD (Level 3 Technical Data) */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={hoveredNode.id}
            className="absolute bottom-5 left-6 max-w-[340px] p-4 rounded-2xl border border-[#00D1FF]/40 bg-[#0F1B2D]/90 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] pointer-events-none z-30"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[9.5px] font-mono tracking-widest uppercase font-semibold"
                style={{ color: TYPE_COLORS[hoveredNode.type].text }}
              >
                {hoveredNode.type}
              </span>
              <span className="text-[9px] font-mono text-[#94A3B8]">
                {hoveredNode.connections.length} LINKS
              </span>
            </div>
            <h4 className="text-[14.5px] font-semibold text-white tracking-wide">
              {hoveredNode.name}
            </h4>
            <p className="mt-1.5 text-[11.5px] text-[#94A3B8] leading-relaxed">
              {hoveredNode.summary}
            </p>
            <div className="mt-2.5 pt-2 border-t border-[#334155]/40 text-[9.5px] font-mono text-[#00D1FF]">
              {hoveredNode.timestamp}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
