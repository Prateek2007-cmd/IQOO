/**
 * Application chrome.
 *
 * Mobile and desktop share one data model but not one layout: on phones this is
 * a five-tab app with an elevated bottom nav; from `lg` up it becomes a
 * workstation with a navigation rail, a workspace top bar and a wide canvas.
 */

import {
  Activity,
  Brain,
  ChevronRight,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Lock,
  type LucideIcon,
  MessageSquareText,
  MonitorSmartphone,
  NotebookPen,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  SquarePen,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NeoBrainMark, NeoBrainWordmark } from "./Logo";
import { StatusDot } from "./ui";
import { useBrain, useCounts } from "../lib/store";
import { relativeTime } from "../lib/format";
import { useNow } from "../lib/hooks";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const MOBILE_NAV: NavItem[] = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/brain", label: "Brain", icon: Brain },
  { to: "/app/memory", label: "Memory", icon: NotebookPen },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/more", label: "More", icon: Layers },
];

export const DESKTOP_NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Workspace",
    items: [
      { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/app/ask", label: "Ask Brain", icon: SquarePen },
      { to: "/app/memory", label: "Memory", icon: NotebookPen },
      { to: "/app/knowledge", label: "Knowledge", icon: Sparkles },
      { to: "/app/projects", label: "Projects", icon: FolderKanban },
      { to: "/app/timeline", label: "Timeline", icon: Clock },
      { to: "/app/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/app/devices", label: "Devices", icon: MonitorSmartphone },
      { to: "/app/privacy", label: "Privacy", icon: Lock },
      { to: "/app/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

/* ------------------------------------------------------------- brain status */

export function useDeviceStatus() {
  const { state } = useBrain();
  const now = useNow(15_000);
  const phone = state.devices.find((d) => d.processingRole === "pocket" && d.paired);
  const laptop = state.devices.find((d) => d.processingRole === "deep");
  const connected = Boolean(phone && laptop && laptop.connectionStatus !== "disconnected");
  return { phone, laptop, connected, now };
}

export function BrainStatusPill({ compact = false }: { compact?: boolean }) {
  const { connected, laptop } = useDeviceStatus();
  const tone = !connected ? "muted" : laptop?.connectionStatus === "syncing" ? "amber" : "green";
  const label = !connected
    ? "Pocket only"
    : laptop?.connectionStatus === "syncing"
      ? "Syncing"
      : "Brain active";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-ink-850/70 px-2.5 py-1">
      <StatusDot tone={tone} pulse={connected && laptop?.connectionStatus !== "disconnected"} />
      <span className={`text-[10.5px] font-medium tracking-wide ${connected ? "text-txt-secondary" : "text-txt-muted"}`}>
        {compact ? (connected ? "Deep Brain" : "Local only") : label}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- mobile bars */

export function MobileTopBar({ title, tagline }: { title?: string; tagline?: string }) {
  const navigate = useNavigate();
  return (
    <header className="safe-t sticky top-0 z-30 border-b border-line-subtle bg-ink-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        {title ? (
          <div className="min-w-0">
            <div className="label mb-1">{tagline ?? "NeoBrain"}</div>
            <div className="title-md truncate">{title}</div>
          </div>
        ) : (
          <NeoBrainWordmark as="link" size={13} tagline />
        )}
        <div className="flex items-center gap-2">
          <BrainStatusPill compact />
          <button
            type="button"
            className="icon-btn h-9 w-9"
            aria-label="Open settings"
            onClick={() => navigate("/app/settings")}
          >
            <SettingsIcon size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { counts } = { counts: useCounts() };
  const location = useLocation();
  return (
    <nav
      className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-[linear-gradient(180deg,rgba(9,23,32,0.92)_0%,rgba(4,9,14,0.98)_100%)] backdrop-blur-2xl"
      aria-label="Primary"
    >
      <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-cyanx/40 to-transparent" />
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-3 pb-1.5 pt-2">
        {MOBILE_NAV.map((item) => {
          const active = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="group relative flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-md px-1 py-1.5"
              aria-current={active ? "page" : undefined}
            >
              <span className="relative grid h-9 w-full max-w-[62px] place-items-center">
                {active ? (
                  <span className="absolute inset-0 rounded-sm border border-cyanx/35 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(0,217,255,0.26)_0%,rgba(0,217,255,0.02)_70%)] shadow-[0_0_26px_-10px_rgba(0,217,255,0.9)]" />
                ) : null}
                <Icon
                  size={18}
                  strokeWidth={active ? 1.9 : 1.6}
                  className={`relative transition-colors duration-200 ${active ? "text-cyanx" : "text-txt-muted group-hover:text-txt-secondary"}`}
                />
                {item.label === "Memory" && counts.candidates > 0 ? (
                  <span className="absolute right-2 top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-amberx text-[8px] font-bold text-ink-900">
                    {counts.candidates}
                  </span>
                ) : null}
              </span>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${active ? "text-cyanx" : "text-txt-muted"}`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------- desktop rail */

export function DesktopRail() {
  const { state } = useBrain();
  const counts = useCounts();
  const laptop = state.devices.find((d) => d.processingRole === "deep");

  const badgeFor = (to: string) => {
    if (to === "/app/memory" && counts.candidates > 0) return counts.candidates;
    return undefined;
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line-subtle bg-ink-900/70 backdrop-blur-xl lg:flex">
      <div className="px-5 pb-5 pt-6">
        <NeoBrainWordmark size={12} tagline />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Workspace">
        {DESKTOP_NAV.map((group) => (
          <div key={group.section} className="mb-5">
            <div className="label px-3 pb-2">{group.section}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const badge = badgeFor(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] transition-all duration-200 ease-premium",
                        isActive
                          ? "border border-cyanx/30 bg-[linear-gradient(90deg,rgba(0,217,255,0.14)_0%,rgba(0,217,255,0.02)_100%)] text-txt-primary"
                          : "border border-transparent text-txt-secondary hover:border-line-subtle hover:bg-ink-800/60 hover:text-txt-primary",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-cyanx shadow-[0_0_12px_rgba(0,217,255,0.9)]" />
                        ) : null}
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 1.9 : 1.6}
                          className={isActive ? "text-cyanx" : "text-txt-muted group-hover:text-txt-secondary"}
                        />
                        <span className="flex-1 truncate font-medium">{item.label}</span>
                        {badge ? (
                          <span className="numeral rounded-full bg-amberx/15 px-1.5 py-0.5 text-[10px] text-amberx">
                            {badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line-subtle p-4">
        <div className="rounded-md border border-line-subtle bg-ink-850/60 p-3">
          <div className="flex items-center justify-between">
            <span className="label">Deep Brain</span>
            <StatusDot
              tone={laptop?.connectionStatus === "syncing" ? "amber" : laptop?.connectionStatus === "connected" ? "green" : "muted"}
              pulse={laptop?.connectionStatus !== "disconnected"}
            />
          </div>
          <div className="mt-2 text-[12.5px] font-medium text-txt-primary">
            {laptop?.connectionStatus === "syncing"
              ? `Syncing · ${Math.round((laptop.syncProgress ?? 0) * 100)}%`
              : laptop?.connectionStatus === "connected"
                ? "Connected"
                : "Not connected"}
          </div>
          <div className="mt-1 text-[11px] text-txt-muted">
            {laptop ? `Last seen ${relativeTime(laptop.lastSeen)}` : "No laptop paired"}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function WorkspaceTopBar() {
  const navigate = useNavigate();
  const { session } = useBrain();
  const counts = useCounts();

  return (
    <header className="sticky top-0 z-30 border-b border-line-subtle bg-ink-900/75 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-6 py-3.5">
        <button
          type="button"
          onClick={() => navigate("/app/ask")}
          className="group flex h-10 flex-1 items-center gap-3 rounded-sm border border-line-subtle bg-ink-850/60 px-3.5 text-left transition-colors duration-200 hover:border-line-soft"
        >
          <Search size={15} className="text-txt-muted group-hover:text-cyanx" />
          <span className="text-[13px] text-txt-muted">Search memories, files and projects…</span>
          <span className="ml-auto hidden items-center gap-1 text-[10px] text-txt-muted xl:flex">
            <kbd className="rounded-xs border border-line-subtle bg-ink-800 px-1.5 py-0.5">⌘</kbd>
            <kbd className="rounded-xs border border-line-subtle bg-ink-800 px-1.5 py-0.5">K</kbd>
          </span>
        </button>

        <div className="hidden items-center gap-2 xl:flex">
          <BrainStatusPill />
          <span className="text-[11px] text-txt-muted">
            {counts.memories} memories · {counts.filesIndexed} files indexed
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/app/ask")}
          className="btn btn-primary h-9 px-3.5 text-[12.5px]"
        >
          <MessageSquareText size={15} />
          Ask
        </button>

        <button
          type="button"
          onClick={() => navigate("/app/settings")}
          className="flex items-center gap-2.5 rounded-full border border-line-subtle bg-ink-850/60 py-1 pl-1 pr-3 transition-colors hover:border-line-soft"
          aria-label="Account and settings"
        >
          <span className="grid h-7 w-7 place-items-center">
            <NeoBrainMark size={28} />
          </span>
          <span className="text-[12px] font-medium text-txt-secondary">{session.name || "You"}</span>
          <ChevronRight size={13} className="text-txt-muted" />
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- shell */

export function AppShell() {
  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="flex">
        <DesktopRail />
        <div className="min-w-0 flex-1">
          <div className="hidden lg:block">
            <WorkspaceTopBar />
          </div>
          <main className="pb-[92px] lg:pb-10">
            <Outlet />
          </main>
        </div>
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

/** Standalone immersive shell (voice mode, boot sequence). */
export function ImmersiveShell({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen overflow-hidden">{children}</div>;
}
