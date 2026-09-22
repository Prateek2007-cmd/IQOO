/**
 * Activity + Timeline — Real-time Signal Feed & Mission Control Log.
 *
 * Designed as a high-density sensory audit feed with continuous vertical signal trace,
 * live pulse indicators, and floating technical telemetry modules.
 */

import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  Cpu,
  Filter,
  Flame,
  Radio,
  Search,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIVITY_META } from "../components/ActivityFeed";
import { MobileTopBar } from "../components/Chrome";
import { Button, StatusDot } from "../components/ui";
import { clockTime, dayLabel, relativeTime } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { ActivityType } from "../lib/types";

const FILTERS: { id: ActivityType | "all"; label: string }[] = [
  { id: "all", label: "All Telemetry" },
  { id: "speech", label: "Speech" },
  { id: "candidate", label: "Memories" },
  { id: "file", label: "Files" },
  { id: "decision", label: "Decisions" },
  { id: "insight", label: "Insights" },
];

export default function ActivityPage({ mode }: { mode: "live" | "timeline" }) {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, clearActivity } = useBrain();
  const now = useNow(15_000);
  const [tab, setTab] = useState<"live" | "timeline">(mode);
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [query, setQuery] = useState("");

  const events = useMemo(() => {
    return state.activity.filter((event) => {
      if (filter !== "all" && event.type !== filter) return false;
      if (query.trim()) {
        const haystack = `${event.title} ${event.detail}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [state.activity, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const event of events) {
      const key = new Date(event.at).toDateString();
      const bucket = map.get(key) ?? [];
      bucket.push(event);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [events]);

  const liveEvents = state.activity.filter((event) => event.status === "active");
  const listening = state.activity.find(
    (event) => event.type === "listening" && event.status === "active"
  );

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? (
        <MobileTopBar
          title={tab === "live" ? "Signal Feed" : "Temporal Audit"}
          tagline={tab === "live" ? "Active mission log" : "Your history"}
        />
      ) : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* ── 1. Mission Control Header & Mode Tabs ───────────── */}
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                <Radio size={12} className="animate-pulse text-[#00D1FF]" />
                TELEMETRY &amp; SIGNAL FEED
              </div>
              <h1 className="mt-1.5 font-display text-[36px] font-bold text-white">
                {tab === "live" ? "Live Execution Audit" : "Chronological Audit Trail"}
              </h1>
              <p className="mt-1 text-[13px] text-[#94A3B8]">
                Deterministic audit trail of all background sensory capture, vector embeddings, and memory candidate evaluations.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center rounded-full border border-[#334155]/50 bg-[#0B1320]/80 p-1 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setTab("live");
                  navigate("/app/activity", { replace: true });
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-all ${
                  tab === "live"
                    ? "bg-[#00D1FF]/20 text-[#00D1FF] shadow-[0_0_12px_rgba(0,209,255,0.3)]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <ActivityIcon size={13} />
                Live Stream
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("timeline");
                  navigate("/app/timeline", { replace: true });
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-all ${
                  tab === "timeline"
                    ? "bg-[#00D1FF]/20 text-[#00D1FF] shadow-[0_0_12px_rgba(0,209,255,0.3)]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <Clock size={13} />
                Day Grouping
              </button>
            </div>
          </header>
        ) : (
          <div className="mb-4 flex items-center justify-center rounded-full border border-[#334155]/50 bg-[#0B1320]/80 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("live");
                navigate("/app/activity", { replace: true });
              }}
              className={`flex-1 rounded-full py-1.5 text-center text-[12px] font-medium transition-all ${
                tab === "live" ? "bg-[#00D1FF]/20 text-[#00D1FF]" : "text-[#94A3B8]"
              }`}
            >
              Live Stream
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("timeline");
                navigate("/app/timeline", { replace: true });
              }}
              className={`flex-1 rounded-full py-1.5 text-center text-[12px] font-medium transition-all ${
                tab === "timeline" ? "bg-[#00D1FF]/20 text-[#00D1FF]" : "text-[#94A3B8]"
              }`}
            >
              Timeline
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {/* ── 2. Active Sensor / Perception HUD ────────────── */}
            <div className="relative overflow-hidden rounded-[20px] border border-[#334155]/50 bg-gradient-to-r from-[#0F1B2D]/70 via-[#0B1320]/70 to-[#020407]/80 p-4.5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#00D1FF]/40 bg-[#020407] text-[#00D1FF] shadow-[0_0_12px_rgba(0,209,255,0.25)]">
                    <Waves size={18} className={listening ? "animate-pulse" : ""} />
                    {listening && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-white">
                        {listening ? "Perception Stream Engaged" : "Autonomous Standby"}
                      </span>
                      <StatusDot tone={listening ? "cyan" : "muted"} pulse={Boolean(listening)} />
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                      {listening
                        ? "Audio buffer active · Zero cloud transmission"
                        : "Passive background monitor · Speech engine idle"}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={listening ? "ghost" : "primary"}
                  onClick={() => navigate("/app/brain")}
                  className="shrink-0"
                >
                  {listening ? "Console" : "Engage"}
                </Button>
              </div>
            </div>

            {/* ── 3. Filters & Realtime Search ─────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {FILTERS.map((item) => {
                  const active = filter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`rounded-full px-3 py-1 font-mono text-[11px] transition-all ${
                        active
                          ? "border border-[#00D1FF]/50 bg-[#00D1FF]/15 text-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.2)]"
                          : "border border-[#334155]/40 bg-[#0B1320]/60 text-[#94A3B8] hover:border-[#334155] hover:text-[#E2E8F0]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-[180px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter log stream…"
                  className="h-8 w-full rounded-full border border-[#334155]/40 bg-[#0B1320]/60 pl-8 pr-3 text-[11.5px] text-[#E2E8F0] placeholder-[#64748B] outline-none transition-all focus:border-[#00D1FF]/50"
                />
              </div>
            </div>

            {/* ── 4. Vertical Signal Trace & Floating Event Modules ── */}
            {events.length === 0 ? (
              <div className="rounded-[20px] border border-[#334155]/40 bg-[#0B1320]/40 p-8 text-center backdrop-blur-xl">
                <Clock size={28} className="mx-auto text-[#64748B]" />
                <div className="mt-3 text-[14px] font-semibold text-white">No matching audit events</div>
                <p className="mt-1 text-[12px] text-[#64748B]">
                  Change your filter criteria or engage voice perception to start logging.
                </p>
              </div>
            ) : tab === "timeline" ? (
              <div className="space-y-6">
                {grouped.map(([day, dayEvents]) => (
                  <section key={day} className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                        ✦ {dayLabel(dayEvents[0].at)}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#00D1FF]/30 to-transparent" />
                      <span className="font-mono text-[10px] text-[#64748B]">
                        {dayEvents.length} events
                      </span>
                    </div>

                    <div className="relative pl-6">
                      <div className="absolute bottom-3 left-2 top-2 w-px bg-gradient-to-b from-[#00D1FF]/50 via-[#334155]/60 to-transparent" />
                      <div className="space-y-2.5">
                        {dayEvents.map((event) => renderEventModule(event, now))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Continuous Glowing Signal Line (Heartbeat Monitor feel) */}
                <div className="absolute bottom-3 left-2.5 top-2 w-px bg-gradient-to-b from-[#00D1FF]/70 via-[#3882F6]/50 to-[#334155]/20 shadow-[0_0_8px_rgba(0,209,255,0.4)]" />

                <div className="space-y-2.5">
                  {events.map((event) => renderEventModule(event, now))}
                </div>
              </div>
            )}
          </div>

          {/* ── 5. Side Rail Telemetry HUD ─────────────────────── */}
          <aside className="space-y-4">
            {/* Live Processes HUD */}
            <div className="rounded-[20px] border border-[#334155]/50 bg-[#0B1320]/60 p-5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
                  ✦ ACTIVE THREADS
                </div>
                <span className="font-mono text-[11px] text-[#00D1FF]">
                  {liveEvents.length} running
                </span>
              </div>

              <div className="mt-3.5 space-y-2">
                {liveEvents.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-[#334155]/30 bg-[#020407]/40 p-3 text-[12px] text-[#64748B]">
                    <CheckCircle2 size={13} className="text-[#10B981]" />
                    All perception and indexing cycles completed.
                  </div>
                ) : (
                  liveEvents.map((event) => {
                    const meta = ACTIVITY_META[event.type];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-xl border border-[#00D1FF]/30 bg-[#0F1B2D]/50 p-2.5 shadow-[0_0_12px_rgba(0,209,255,0.1)]"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#00D1FF]/40 bg-[#020407] text-[#00D1FF]">
                          <Icon size={14} className="animate-pulse" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-medium text-white">
                            {event.title}
                          </div>
                          <div className="font-mono text-[10px] text-[#64748B]">
                            {relativeTime(event.at, now)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Event Mix Distribution */}
            <div className="rounded-[20px] border border-[#334155]/50 bg-[#0B1320]/60 p-5 backdrop-blur-xl shadow-lg">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                ✦ TELEMETRY PROFILE
              </div>
              <h3 className="mt-1 font-display text-[16px] font-bold text-white">
                Signal Mix Distribution
              </h3>

              <div className="mt-4 space-y-3">
                {Object.entries(
                  state.activity.reduce<Record<string, number>>((acc, event) => {
                    acc[event.type] = (acc[event.type] ?? 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([type, count]) => {
                    const meta = ACTIVITY_META[type as ActivityType];
                    const Icon = meta?.icon ?? Clock;
                    const total = state.activity.length || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11.5px]">
                          <span className="flex items-center gap-2 text-[#CBD5E1]">
                            <Icon size={12} className={meta?.accent} />
                            {meta?.label ?? type}
                          </span>
                          <span className="text-[#94A3B8]">
                            {count} <span className="text-[#64748B]">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#020407]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3882F6] to-[#00D1FF]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#334155]/50 to-transparent" />

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearActivity}
                  className="border-[#334155]/40 hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                >
                  <Trash2 size={12} /> Clear Log
                </Button>
                <span className="font-mono text-[10px] text-[#64748B]">
                  Retains memories &amp; files
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function renderEventModule(
  event: { id: string; type: ActivityType; title: string; detail: string; at: string; status: "active" | "idle" | "done" },
  now: number
) {
  const meta = ACTIVITY_META[event.type];
  const Icon = meta.icon;
  const isLive = event.status === "active";

  return (
    <div key={event.id} className="group relative">
      {/* Node indicator dot along the vertical line */}
      <div
        className={`absolute -left-[23px] top-4.5 h-3 w-3 rounded-full border transition-all ${
          isLive
            ? "border-[#00D1FF] bg-[#00D1FF] shadow-[0_0_10px_#00D1FF]"
            : "border-[#334155] bg-[#020407] group-hover:border-[#00D1FF]"
        }`}
      />

      {/* Floating Technical Module */}
      <div
        className={`flex items-start gap-3.5 rounded-2xl border p-3.5 backdrop-blur-xl transition-all duration-200 ${
          isLive
            ? "border-[#00D1FF]/40 bg-[#0F1B2D]/70 shadow-[0_0_16px_rgba(0,209,255,0.08)]"
            : "border-[#334155]/40 bg-[#0B1320]/60 hover:border-[#334155]/80 hover:bg-[#0F1B2D]/50"
        }`}
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407] ${
            isLive ? "text-[#00D1FF]" : "text-[#94A3B8]"
          }`}
        >
          <Icon size={14} className={isLive ? "animate-pulse" : ""} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-white">
              {event.title}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-[#00D1FF]">
              {clockTime(event.at)}
            </span>
          </div>

          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[#94A3B8]">
            {event.detail}
          </p>

          <div className="mt-2 flex items-center gap-2 font-mono text-[9.5px]">
            <span className="rounded-full border border-[#334155]/50 bg-[#020407]/60 px-2 py-0.2 text-[#CBD5E1]">
              {meta.label}
            </span>
            <span className="text-[#64748B]">{relativeTime(event.at, now)}</span>
            {isLive && (
              <span className="ml-auto flex items-center gap-1 font-semibold text-[#00D1FF]">
                <StatusDot tone="cyan" pulse /> PROCESSING
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
