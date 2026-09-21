/**
 * More — the mobile hub for everything that does not fit in the tab bar.
 */

import {
  Activity,
  BookOpen,
  ChevronRight,
  Clock,
  Gauge,
  Lock,
  LogOut,
  MonitorSmartphone,
  NotebookPen,
  Settings as SettingsIcon,
  Sparkles,
  Waves,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileTopBar } from "../components/Chrome";
import { NeoBrainMark } from "../components/Logo";
import { Button, Chip, Panel, SectionHeading, StatusDot, TechLabel } from "../components/ui";
import { providerReport } from "../lib/engine";
import { relativeTime } from "../lib/format";
import { useIsDesktop } from "../lib/hooks";
import { useBrain, useCounts } from "../lib/store";

const GROUPS = [
  {
    title: "Explore",
    items: [
      { icon: Activity, label: "Live activity", hint: "What NeoBrain is doing", to: "/app/activity" },
      { icon: Clock, label: "Timeline", hint: "Your journey by day", to: "/app/timeline" },
      { icon: Sparkles, label: "Knowledge graph", hint: "How everything connects", to: "/app/knowledge" },
      { icon: Waves, label: "Voice mode", hint: "Immersive capture", to: "/app/voice" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: MonitorSmartphone, label: "Devices", hint: "Pocket and Deep Brain", to: "/app/devices" },
      { icon: Lock, label: "Privacy", hint: "Dashboard and data controls", to: "/app/privacy" },
      { icon: SettingsIcon, label: "Settings", hint: "Awareness, memory, motion", to: "/app/settings" },
      { icon: Gauge, label: "Boot sequence", hint: "Replay device pairing", to: "/app/boot" },
    ],
  },
];

export default function MorePage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { state, session, signOut } = useBrain();
  const counts = useCounts();
  const providers = providerReport(state.settings.privacy.cloudServices);
  const laptop = state.devices.find((device) => device.processingRole === "deep");

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="More" tagline="Everything else." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[880px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {/* profile card */}
        <Panel className="p-5">
          <div className="flex items-center gap-4">
            <NeoBrainMark size={46} state="active" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-txt-primary">{session.name || "You"}</div>
              <div className="mt-0.5 text-[11.5px] text-txt-muted">
                Local profile · stored on this device
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                signOut();
                navigate("/auth?returnTo=%2Fapp", { replace: true });
              }}
            >
              <LogOut size={13} /> Sign out
            </Button>
          </div>

          <div className="divider my-4" />

          <div className="flex flex-wrap gap-2">
            <Chip as="span">{counts.memories} memories</Chip>
            <Chip as="span">{counts.filesIndexed} files indexed</Chip>
            <Chip as="span">{counts.tasksPending} open tasks</Chip>
            <Chip as="span" active={laptop?.connectionStatus === "connected"}>
              <StatusDot
                tone={laptop?.connectionStatus === "connected" ? "green" : laptop?.connectionStatus === "syncing" ? "amber" : "muted"}
              />
              {laptop?.connectionStatus === "connected"
                ? "Deep Brain online"
                : laptop?.connectionStatus === "syncing"
                  ? "Syncing"
                  : "Local only"}
            </Chip>
          </div>

          {laptop ? (
            <p className="mt-3 text-[11px] text-txt-muted">
              Deep Brain last seen {relativeTime(laptop.lastSeen)}
            </p>
          ) : null}
        </Panel>

        {GROUPS.map((group) => (
          <section key={group.title} className="mt-5">
            <TechLabel className="mb-2.5">{group.title}</TechLabel>
            <Panel className="p-2" padded={false}>
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="flex w-full items-center gap-3.5 rounded-md px-3 py-3 text-left transition-colors hover:bg-[rgba(145,205,235,0.045)]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 text-cyanx">
                      <Icon size={14} strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-txt-primary">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-txt-muted">{item.hint}</span>
                    </span>
                    {index === 0 && group.title === "Explore" && counts.candidates > 0 ? (
                      <Chip as="span" active>
                        {counts.candidates} new
                      </Chip>
                    ) : null}
                    <ChevronRight size={14} className="shrink-0 text-txt-muted" />
                  </button>
                );
              })}
            </Panel>
          </section>
        ))}

        <section className="mt-5">
          <SectionHeading label="Running" title="Local capability" />
          <Panel className="mt-3 p-5">
            <div className="space-y-3">
              {[providers.inference, providers.retrieval, providers.speech].map((info) => (
                <div key={info.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-txt-primary">{info.label}</span>
                    <span className="text-[10.5px] uppercase tracking-label text-txt-muted">{info.location}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-txt-muted">{info.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-5">
          <Panel className="p-5">
            <div className="flex items-start gap-3">
              <BookOpen size={15} className="mt-0.5 shrink-0 text-cyanx" />
              <p className="text-[11.5px] leading-relaxed text-txt-secondary">
                NeoBrain keeps one memory across every screen. Anything you capture on the phone is
                available when the Deep Brain is connected — and your data never leaves your devices
                without your explicit choice.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => navigate("/app/ask")}>
                <NotebookPen size={13} /> Ask your brain
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("/")}>
                View public site
              </Button>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
