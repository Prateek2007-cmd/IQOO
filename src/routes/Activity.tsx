/**
 * Activity + Timeline.
 *
 * One route with two modes: `live` shows what NeoBrain is doing right now,
 * `timeline` groups the same events into days so you can scroll your history.
 */

import { Activity as ActivityIcon, Clock, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIVITY_META, ActivityTimeline } from "../components/ActivityFeed";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  Chip,
  Panel,
  SectionHeading,
  StateBlock,
  StatusDot,
  Tabs,
  TechLabel,
} from "../components/ui";
import { dayLabel, relativeTime } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { ActivityType } from "../lib/types";

const FILTERS: { id: ActivityType | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
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
  const listening = state.activity.find((event) => event.type === "listening" && event.status === "active");

  return (
    <div className="relative">
      {!isDesktop ? (
        <MobileTopBar
          title={tab === "live" ? "Live activity" : "Timeline"}
          tagline={tab === "live" ? "Quietly working for you" : "Your journey"}
        />
      ) : null}

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <TechLabel tone="cyan">{tab === "live" ? "Live activity" : "Timeline"}</TechLabel>
              <h1 className="mt-2 title-xl">
                {tab === "live" ? "What NeoBrain is doing" : "Your journey"}
              </h1>
              <p className="mt-2 text-[13px] text-txt-secondary">
                Every capture, classification and index event, in order.
              </p>
            </div>
            <Tabs
              tabs={[
                { id: "live", label: "Live" },
                { id: "timeline", label: "Timeline" },
              ]}
              value={tab}
              onChange={(next) => {
                setTab(next);
                navigate(next === "live" ? "/app/activity" : "/app/timeline", { replace: true });
              }}
            />
          </header>
        ) : (
          <div className="mb-4">
            <Tabs
              tabs={[
                { id: "live", label: "Live" },
                { id: "timeline", label: "Timeline" },
              ]}
              value={tab}
              onChange={(next) => {
                setTab(next);
                navigate(next === "live" ? "/app/activity" : "/app/timeline", { replace: true });
              }}
            />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            {/* listening status card */}
            <Panel className="p-4">
              <div className="flex items-center gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line-subtle bg-ink-800/70 text-cyanx">
                  <ActivityIcon size={15} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-txt-primary">
                      {listening ? "Listening" : "Standby"}
                    </span>
                    <StatusDot tone={listening ? "cyan" : "muted"} pulse={Boolean(listening)} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-txt-muted">
                    {listening
                      ? "Speech detection active · local processing"
                      : "Speech detection off · nothing is being captured"}
                  </div>
                </div>
                <Button size="sm" variant={listening ? "ghost" : "primary"} onClick={() => navigate("/app/brain")}>
                  {listening ? "Manage" : "Start listening"}
                </Button>
              </div>
            </Panel>

            {/* filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10.5px] text-txt-muted">
                <Filter size={12} /> Filter
              </span>
              {FILTERS.map((item) => (
                <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input pl-10"
                placeholder="Search activity…"
                aria-label="Search activity"
              />
            </div>

            {/* feed */}
            {events.length === 0 ? (
              <StateBlock
                kind={query || filter !== "all" ? "search-empty" : "empty"}
                title={query || filter !== "all" ? "No matching activity" : "No activity recorded yet"}
                description={
                  query || filter !== "all"
                    ? "Try a different filter or clear the search."
                    : "Start a voice session or capture a note and everything NeoBrain does will appear here."
                }
                action={
                  query || filter !== "all" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => navigate("/app/voice")}>
                      Start listening
                    </Button>
                  )
                }
              />
            ) : tab === "timeline" ? (
              <div className="space-y-6">
                {grouped.map(([day, dayEvents]) => (
                  <section key={day}>
                    <div className="mb-2 flex items-center gap-3">
                      <TechLabel tone="cyan">{dayLabel(dayEvents[0].at)}</TechLabel>
                      <span className="h-px flex-1 bg-line-subtle" />
                      <span className="text-[10.5px] text-txt-muted">{dayEvents.length} events</span>
                    </div>
                    <ActivityTimeline events={dayEvents} now={now} />
                  </section>
                ))}
              </div>
            ) : (
              <ActivityTimeline events={events} now={now} />
            )}
          </div>

          {/* side rail */}
          <div className="space-y-4">
            <Panel className="p-5">
              <SectionHeading label="Now" title={`${liveEvents.length} active`} />
              <div className="mt-3 space-y-2.5">
                {liveEvents.length === 0 ? (
                  <p className="text-[12px] text-txt-muted">No active processes.</p>
                ) : (
                  liveEvents.map((event) => {
                    const meta = ACTIVITY_META[event.type];
                    const Icon = meta.icon;
                    return (
                      <div key={event.id} className="flex items-center gap-3">
                        <span className="relative grid h-8 w-8 place-items-center rounded-xs border border-cyanx/30 bg-cyanx/10">
                          <Icon size={13} className="text-cyanx" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[12.5px] text-txt-primary">{event.title}</div>
                          <div className="text-[10.5px] text-txt-muted">{relativeTime(event.at, now)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionHeading label="Summary" title="Activity mix" />
              <div className="mt-3.5 space-y-2.5">
                {Object.entries(
                  state.activity.reduce<Record<string, number>>((accumulator, event) => {
                    accumulator[event.type] = (accumulator[event.type] ?? 0) + 1;
                    return accumulator;
                  }, {}),
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([type, count]) => {
                    const meta = ACTIVITY_META[type as ActivityType];
                    const Icon = meta?.icon ?? Clock;
                    const total = state.activity.length || 1;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="flex items-center gap-2 text-txt-secondary">
                            <Icon size={12} className={meta?.accent} /> {meta?.label ?? type}
                          </span>
                          <span className="numeral text-txt-muted">{count}</span>
                        </div>
                        <div className="mt-1.5">
                          <div className="meter">
                            <span style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="divider my-4" />
              <Button size="sm" variant="ghost" onClick={clearActivity}>
                Clear activity log
              </Button>
              <p className="mt-2 text-[10.5px] leading-relaxed text-txt-muted">
                Clearing the log removes the history entries only. Your memories and files are not
                touched.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
