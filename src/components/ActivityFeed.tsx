/**
 * Flowing activity timeline.
 *
 * Deliberately not a card grid: events are separated by a hairline connector,
 * spacing and typography, so the list reads as one continuous system.
 */

import {
  Brain,
  CheckSquare,
  FileText,
  Lightbulb,
  Mic,
  ShieldCheck,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEvent, ActivityType } from "../lib/types";
import { clockTime, relativeTime } from "../lib/format";
import { Chip, StatusDot } from "./ui";

export const ACTIVITY_META: Record<ActivityType, { icon: LucideIcon; accent: string; label: string; chip: string }> = {
  speech: { icon: Mic, accent: "text-cyanx", label: "Speech", chip: "Speech" },
  context: { icon: Brain, accent: "text-bluex", label: "Context", chip: "Context" },
  candidate: { icon: Sparkles, accent: "text-amberx", label: "Memory", chip: "Memory" },
  file: { icon: FileText, accent: "text-greenx", label: "File", chip: "File" },
  insight: { icon: Lightbulb, accent: "text-violetx", label: "Insight", chip: "Insight" },
  task: { icon: CheckSquare, accent: "text-amberx", label: "Task", chip: "Task" },
  decision: { icon: ShieldCheck, accent: "text-magentax", label: "Decision", chip: "Decision" },
  listening: { icon: Waves, accent: "text-cyanx", label: "Listening", chip: "Live" },
};

export function ActivityTimeline({
  events,
  limit,
  showType = true,
  now,
  onSelect,
}: {
  events: ActivityEvent[];
  limit?: number;
  showType?: boolean;
  now?: number;
  onSelect?: (event: ActivityEvent) => void;
}) {
  const rows = limit ? events.slice(0, limit) : events;

  return (
    <ol className="relative">
      {rows.map((event, index) => {
        const meta = ACTIVITY_META[event.type];
        const Icon = meta.icon;
        const isLast = index === rows.length - 1;
        const Row = onSelect ? "button" : "div";
        return (
          <li key={event.id} className="relative">
            {!isLast ? (
              <span
                className="absolute left-[19px] top-[38px] bottom-0 w-px bg-gradient-to-b from-line-soft to-transparent"
                aria-hidden="true"
              />
            ) : null}
            <Row
              type={onSelect ? "button" : undefined}
              onClick={onSelect ? () => onSelect(event) : undefined}
              className={[
                "group flex w-full gap-3.5 rounded-md px-2 py-2.5 text-left transition-colors duration-200",
                onSelect ? "hover:bg-[rgba(145,205,235,0.045)]" : "",
              ].join(" ")}
            >
              <span className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-850/70">
                <Icon size={14} className={meta.accent} strokeWidth={1.7} />
                {event.status === "active" ? (
                  <span className="absolute -right-0.5 -top-0.5">
                    <StatusDot tone="cyan" pulse />
                  </span>
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-txt-primary">{event.title}</span>
                  {showType ? <Chip as="span">{meta.chip}</Chip> : null}
                </span>
                <span className="mt-1 block truncate text-[11.5px] text-txt-muted">{event.detail}</span>
              </span>

              <span className="shrink-0 text-right">
                <span className="numeral block text-[11px] text-txt-secondary">{clockTime(event.at)}</span>
                <span className="mt-0.5 block text-[10px] text-txt-muted">
                  {now ? relativeTime(event.at, now) : relativeTime(event.at)}
                </span>
              </span>
            </Row>
          </li>
        );
      })}
    </ol>
  );
}
