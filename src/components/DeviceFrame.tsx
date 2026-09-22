/**
 * Device frames + miniature but real screen previews.
 *
 * These are used on the landing page and on Devices. The previews render the
 * product's own visual language at small scale rather than fake UI art.
 */

import { Brain, FileText, Image as ImageIcon, LayoutDashboard, NotebookPen, Search, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { BrainCore } from "./BrainCore";
import { NeoBrainMark } from "./Logo";

/* -------------------------------------------------------------- containers */

export function PhoneFrame({
  children,
  className = "",
  glow = true,
  label,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  label?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {glow ? (
        <div
          className="pointer-events-none absolute -inset-8 rounded-[64px] blur-3xl"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 45%, rgba(0,217,255,0.20) 0%, rgba(141,108,255,0.10) 45%, rgba(0,0,0,0) 72%)",
          }}
          aria-hidden="true"
        />
      ) : null}
      <div className="relative rounded-[44px] border border-[rgba(145,205,235,0.16)] bg-[linear-gradient(160deg,#16232c_0%,#080f16_46%,#04090e_100%)] p-[9px] shadow-[0_50px_120px_-40px_rgba(0,0,0,1),inset_0_1px_0_rgba(200,235,255,0.10)]">
        <div className="relative overflow-hidden rounded-[36px] border border-black/60 bg-ink-900">
          <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black/90" />
          <div className="relative aspect-[9/19.4] w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-10%,#0c1f2b_0%,#04090e_70%)]" />
            <div className="relative h-full w-full">{children}</div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-[36px]"
            style={{
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.045) 100%)",
            }}
          />
        </div>
        {/* side buttons */}
        <span className="absolute -right-[3px] top-[128px] h-14 w-[3px] rounded-r bg-[rgba(145,205,235,0.18)]" />
        <span className="absolute -left-[3px] top-[104px] h-8 w-[3px] rounded-l bg-[rgba(145,205,235,0.14)]" />
      </div>
      {label ? (
        <div className="mt-4 text-center text-[11px] uppercase tracking-label text-txt-muted">{label}</div>
      ) : null}
    </div>
  );
}

export function LaptopFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute -inset-10 rounded-[60px] blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(36,123,255,0.16) 0%, rgba(141,108,255,0.08) 45%, rgba(0,0,0,0) 72%)",
        }}
        aria-hidden="true"
      />
      <div className="relative rounded-[20px] border border-[rgba(145,205,235,0.16)] bg-[linear-gradient(160deg,#1a2830_0%,#080f16_52%,#04090e_100%)] p-[10px] shadow-[0_60px_130px_-50px_rgba(0,0,0,1),inset_0_1px_0_rgba(200,235,255,0.10)]">
        <div className="overflow-hidden rounded-[13px] border border-black/60 bg-ink-900">
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_20%_-10%,#0b1d29_0%,#04090e_72%)]" />
            <div className="relative h-full w-full">{children}</div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-[9px] w-[34%] rounded-b-[10px] border border-t-0 border-[rgba(145,205,235,0.14)] bg-[linear-gradient(180deg,#101d25,#070e14)]" />
    </div>
  );
}

/* ---------------------------------------------------------------- previews */

function PreviewChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-7 text-[9px] text-txt-muted">
        <span className="font-medium tabular-nums">9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-greenx" />
          on device
        </span>
      </div>
      <div className="px-4 pb-1 text-[9.5px] uppercase tracking-label text-txt-muted">{title}</div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function HomePreview() {
  return (
    <PreviewChrome title="Overview">
      <div className="flex h-full flex-col px-4 pb-3">
        <div className="mt-1 text-[15px] font-semibold leading-tight text-txt-primary">
          Good morning, <span className="block">Prateek.</span>
        </div>
        <p className="mt-1 text-[10px] text-txt-secondary">Your brain is active.</p>

        <div className="relative my-2 grid place-items-center">
          <BrainCore state="idle" size={124} interactive={false} />
        </div>

        <div className="mb-2 flex items-center gap-2 rounded-md border border-line-subtle bg-ink-850/60 px-2.5 py-2">
          <NeoBrainMark size={18} />
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-medium text-txt-primary">Deep Brain connected</div>
            <div className="text-[8.5px] text-txt-muted">iQOO 15 ↔ Laptop</div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-greenx" />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { v: "12", l: "Memories" },
            { v: "47", l: "Files" },
            { v: "3", l: "Tasks" },
            { v: "82%", l: "Indexed" },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-xs border border-line-subtle bg-ink-850/50 px-1 py-1.5 text-center"
            >
              <div className="numeral text-[12px] text-cyanx">{stat.v}</div>
              <div className="text-[7.5px] uppercase tracking-wide text-txt-muted">{stat.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex-1 space-y-1.5 overflow-hidden">
          {["SmartLine.pdf indexed", "New mention: XGBoost", "Decision remembered"].map((row, i) => (
            <div key={row} className="flex items-center gap-2">
              <span className={`h-4 w-4 shrink-0 rounded-xs border border-line-subtle ${i === 1 ? "bg-cyanx/20" : "bg-violetx/20"}`} />
              <span className="truncate text-[9px] text-txt-secondary">{row}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-around border-t border-line-subtle pt-2">
          {[LayoutDashboard, Brain, NotebookPen, Sparkles].map((Icon, i) => (
            <Icon key={i} size={11} className={i === 0 ? "text-cyanx" : "text-txt-muted"} />
          ))}
        </div>
      </div>
    </PreviewChrome>
  );
}

export function VoicePreview({ label = "Listening…" }: { label?: string }) {
  return (
    <PreviewChrome title="Voice">
      <div className="flex h-full flex-col items-center justify-between px-4 pb-4 pt-2">
        <div className="grid flex-1 place-items-center">
          <BrainCore state="listening" size={188} intensity={0.6} interactive={false} />
        </div>
        <div className="text-center">
          <div className="text-[14px] font-semibold text-txt-primary">{label}</div>
          <p className="mt-1 text-[10px] text-txt-secondary">Speak naturally</p>
          <div className="mt-3 flex items-end justify-center gap-[3px]" aria-hidden="true">
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-[linear-gradient(180deg,#00d9ff,#8d6cff)]"
                style={{
                  height: `${6 + Math.abs(Math.sin(i * 0.7)) * 20}px`,
                  opacity: 0.4 + Math.abs(Math.cos(i * 0.5)) * 0.6,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 grid h-11 w-11 place-items-center rounded-full border border-cyanx/45 bg-[radial-gradient(70%_70%_at_50%_20%,rgba(0,217,255,0.34),rgba(8,21,33,0.9))] shadow-[0_0_28px_-6px_rgba(0,217,255,0.8)]">
          <span className="h-3.5 w-3.5 rounded-full bg-cyanx" />
        </div>
      </div>
    </PreviewChrome>
  );
}

export function AnswerPreview() {
  return (
    <PreviewChrome title="Answer">
      <div className="flex h-full flex-col px-4 pb-3">
        <div className="rounded-md border border-line-subtle bg-ink-850/50 p-2.5">
          <div className="text-[8.5px] uppercase tracking-label text-txt-muted">You asked</div>
          <div className="mt-0.5 text-[10px] text-txt-primary">
            What did I do yesterday related to SmartLine?
          </div>
        </div>
        <div className="mt-2.5 flex-1 space-y-2 overflow-hidden">
          <div className="text-[9.5px] text-txt-secondary">
            You worked on SmartLine yesterday. Here's a summary:
          </div>
          {[
            "Trained the XGBoost model (92.4%)",
            "Updated the CAD enclosure to v3",
            "Discussed sensor placement",
            "Edited the presentation slides",
          ].map((point) => (
            <div key={point} className="flex gap-2">
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-cyanx" />
              <span className="text-[9.5px] leading-snug text-txt-secondary">{point}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-line-subtle pt-2">
          <div className="text-[8.5px] uppercase tracking-label text-txt-muted">Sources · 4</div>
          <div className="mt-1.5 flex gap-1.5">
            {[FileText, ImageIcon, NotebookPen].map((Icon, i) => (
              <span
                key={i}
                className="grid h-6 w-6 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx"
              >
                <Icon size={11} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

export function MemoryPreview() {
  return (
    <PreviewChrome title="Memory">
      <div className="flex h-full flex-col px-4 pb-3">
        <div className="flex items-center gap-2 rounded-sm border border-line-subtle bg-ink-850/60 px-2 py-1.5">
          <Search size={10} className="text-txt-muted" />
          <span className="text-[9px] text-txt-muted">Search memories…</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {["All", "Important", "Decisions"].map((tab, i) => (
            <span
              key={tab}
              className={`rounded-full border px-2 py-0.5 text-[8px] ${
                i === 0 ? "border-cyanx/40 bg-cyanx/10 text-cyanx" : "border-line-subtle text-txt-muted"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="mt-2.5 space-y-1.5 overflow-hidden">
          {[
            "Use XGBoost for final model",
            "Order new bearing sensors",
            "Prefer dark mode interfaces",
            "Finish presentation by Friday",
            "CAD enclosure moved to v3",
          ].map((row, i) => (
            <div key={row} className="flex items-center gap-2 rounded-xs border border-line-subtle bg-ink-850/40 p-1.5">
              <span className={`h-5 w-5 shrink-0 rounded-xs ${i % 2 ? "bg-violetx/20" : "bg-amberx/20"}`} />
              <span className="min-w-0 flex-1 truncate text-[9px] text-txt-secondary">{row}</span>
              <span className="text-[7.5px] text-txt-muted">Sep {18 - i}</span>
            </div>
          ))}
        </div>
      </div>
    </PreviewChrome>
  );
}

export function GraphPreview() {
  const nodes = [
    { x: 50, y: 50, label: "SmartLine", r: 7 },
    { x: 20, y: 26, label: "Research", r: 4 },
    { x: 78, y: 24, label: "XGBoost", r: 4 },
    { x: 84, y: 62, label: "CAD", r: 4 },
    { x: 62, y: 82, label: "Sensors", r: 4.5 },
    { x: 22, y: 72, label: "Firmware", r: 4 },
    { x: 40, y: 16, label: "Dataset", r: 3.5 },
  ];
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {nodes.slice(1).map((node) => (
          <line
            key={node.label}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="rgba(0,217,255,0.28)"
            strokeWidth="0.4"
          />
        ))}
        {nodes.map((node) => (
          <g key={node.label}>
            <circle cx={node.x} cy={node.y} r={node.r * 1.9} fill="rgba(0,217,255,0.08)" />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#0d1f2a"
              stroke={node.label === "SmartLine" ? "#00d9ff" : "rgba(145,205,235,0.4)"}
              strokeWidth="0.5"
            />
            <text
              x={node.x}
              y={node.y + node.r + 4}
              textAnchor="middle"
              fontSize="3.2"
              fill="#91aab8"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Desktop workspace preview used in the laptop frame. */
export function WorkspacePreview() {
  return (
    <div className="flex h-full">
      <div className="w-[16%] space-y-2 border-r border-line-subtle px-2 py-3">
        <div className="wordmark text-[5px]">NEOBRAIN</div>
        {["Overview", "Ask Brain", "Memory", "Knowledge", "Projects", "Activity"].map((item, i) => (
          <div
            key={item}
            className={`truncate rounded-xs px-1.5 py-1 text-[6px] ${
              i === 0 ? "bg-cyanx/10 text-cyanx" : "text-txt-muted"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="flex-1 px-3 py-3">
        <div className="text-[9px] font-semibold text-txt-primary">Good morning, Prateek.</div>
        <div className="mt-0.5 text-[6.5px] text-txt-muted">
          Ideas, files, conversations. All connected.
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { v: "1,248", l: "Files" },
            { v: "326", l: "Images" },
            { v: "71", l: "Memories" },
            { v: "8", l: "Projects" },
          ].map((stat) => (
            <div key={stat.l} className="rounded-xs border border-line-subtle bg-ink-850/50 p-1.5">
              <div className="numeral text-[10px] text-txt-primary">{stat.v}</div>
              <div className="text-[5.5px] uppercase tracking-wide text-txt-muted">{stat.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-xs border border-line-subtle bg-ink-850/40 p-2">
            <div className="text-[6px] uppercase tracking-label text-txt-muted">Brain status</div>
            <div className="mt-1 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-greenx" />
              <span className="text-[7px] text-txt-secondary">Deep Brain online</span>
            </div>
            <div className="mt-2 h-[28px] w-full overflow-hidden rounded-xs bg-[radial-gradient(60%_80%_at_50%_20%,rgba(0,217,255,0.22),transparent)]">
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full">
                <path
                  d="M0 20 Q25 4 50 18 T100 12"
                  fill="none"
                  stroke="rgba(0,217,255,0.6)"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          </div>
          <div className="rounded-xs border border-line-subtle bg-ink-850/40 p-2">
            <div className="text-[6px] uppercase tracking-label text-txt-muted">Recent activity</div>
            {["SmartLine_Report.pdf indexed", "New decision captured", "CAD file modified"].map((row) => (
              <div key={row} className="mt-1 truncate text-[6.5px] text-txt-secondary">
                · {row}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
