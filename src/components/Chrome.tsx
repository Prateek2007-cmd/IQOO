/**
 * Application chrome.
 *
 * Mobile and desktop share one data model but not one layout: on phones this is
 * a five-tab app with an elevated bottom nav; from `lg` up it becomes a
 * workstation with a navigation rail, a workspace top bar and a wide canvas.
 */

import {
  Activity,
  Bell,
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Lock,
  type LucideIcon,
  MessageSquareText,
  Mic,
  MonitorSmartphone,
  NotebookPen,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  SquarePen,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
    <header className="safe-t sticky top-0 z-30 border-b border-[#334155]/40 bg-[#020407]/85 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        {title ? (
          <div className="min-w-0">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#64748B] uppercase mb-1">{tagline ?? "NeoBrain"}</div>
            <div className="text-[16px] font-display font-semibold text-[#E2E8F0] truncate">{title}</div>
          </div>
        ) : (
          <Link to="/" className="flex flex-col">
            <span className="font-display text-[15px] font-bold tracking-[0.28em] text-white">
              NEO<span className="text-[#00D1FF]">BRAIN</span>
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <BrainStatusPill compact />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#334155]/60 bg-[#0F1B2D]/60 text-[#94A3B8] backdrop-blur-xl transition-all hover:border-[#00D1FF]/40 hover:text-white"
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
      className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-[#334155]/50 bg-[#020407]/95 backdrop-blur-2xl"
      aria-label="Primary"
    >
      <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-[#00D1FF]/40 to-transparent" />
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
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-[#334155]/45 bg-[#020407]/90 backdrop-blur-2xl lg:flex z-30">
      {/* Brand Header */}
      <div className="px-6 pb-5 pt-7">
        <Link to="/" className="group flex flex-col gap-1">
          <div className="font-display text-[15px] font-bold tracking-[0.28em] text-white">
            NEO<span className="text-[#00D1FF] drop-shadow-[0_0_12px_rgba(0,209,255,0.8)]">BRAIN</span>
          </div>
          <div className="text-[9px] font-mono tracking-[0.14em] text-[#94A3B8]/80 uppercase">
            YOUR SECOND BRAIN. ALWAYS WITH YOU.
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3.5 pb-4" aria-label="Workspace">
        {DESKTOP_NAV.map((group) => (
          <div key={group.section} className="mb-5">
            <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-[#64748B] px-3 pb-2">
              {group.section}
            </div>
            <div className="space-y-1">
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
                        "group relative flex items-center gap-3.5 rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "border border-[#00D1FF]/35 bg-[#0F1B2D]/70 text-white shadow-[0_0_16px_rgba(0,209,255,0.1)]"
                          : "border border-transparent text-[#7E8F9F] hover:border-[#334155]/40 hover:bg-[#0F1B2D]/30 hover:text-[#CBD5E1]",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <span className="absolute inset-y-2 left-1.5 w-[2px] rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
                        ) : null}
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 1.8 : 1.5}
                          className={isActive ? "text-[#00D1FF]" : "text-[#5C6E82] group-hover:text-[#94A3B8]"}
                        />
                        <span className="flex-1 truncate tracking-tight">{item.label}</span>
                        {badge ? (
                          <span className="rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 px-1.5 py-0.2 text-[10px] font-mono text-[#F59E0B]">
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

      {/* Bottom Status Card */}
      <div className="border-t border-[#334155]/40 p-4">
        <div className="rounded-[16px] border border-[#334155]/60 bg-[#0F1B2D]/60 p-3 backdrop-blur-xl shadow-[0_10px_25px_-10px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#020407] border border-[#00D1FF]/40 shadow-[0_0_12px_rgba(0,209,255,0.4)]">
              <div className="h-3.5 w-3.5 rounded-full bg-[#00D1FF] blur-[1px] animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-[#00D1FF]/30 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#E2E8F0]">DEEP BRAIN</span>
                <span className="flex items-center gap-1.5 text-[10px] text-[#00D1FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_6px_#00D1FF]" />
                  Connected
                </span>
              </div>
              <div className="text-[10px] text-[#94A3B8] truncate">Laptop · Local Model</div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-[10px] font-bold tracking-[0.28em] text-[#64748B]">N E O B R A I N</div>
          <div className="text-[9px] text-[#475569] font-mono tracking-wider mt-0.5">v0.1.0 · PRIVATE. PERSONAL. POWERFUL.</div>
        </div>
      </div>
    </aside>
  );
}

export function WorkspaceTopBar() {
  const navigate = useNavigate();
  const { session } = useBrain();

  return (
    <header className="sticky top-0 z-20 border-b border-[#334155]/40 bg-[#020407]/75 backdrop-blur-2xl">
      <div className="flex items-center gap-3.5 px-8 py-3.5">
        {/* Command Search Input */}
        <button
          type="button"
          onClick={() => navigate("/app/ask")}
          className="group flex h-10 flex-1 max-w-[540px] items-center gap-3 rounded-[12px] border border-[#334155]/50 bg-[#0B1320]/60 px-3.5 text-left backdrop-blur-xl transition-all duration-200 hover:border-[#00D1FF]/40 hover:bg-[#0F1B2D]/70"
        >
          <Search size={15} className="text-[#64748B] group-hover:text-[#00D1FF] transition-colors" />
          <span className="text-[12.5px] text-[#94A3B8] truncate">
            Search memories, files, conversations, projects...
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-[#64748B]">
            <kbd className="rounded-[4px] border border-[#334155]/60 bg-[#0A0F1C] px-1.5 py-0.5 font-mono">⌘</kbd>
            <kbd className="rounded-[4px] border border-[#334155]/60 bg-[#0A0F1C] px-1.5 py-0.5 font-mono">K</kbd>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Audio Waveform Pill */}
          <div className="flex h-9 items-center gap-1 rounded-full border border-[#334155]/60 bg-[#0B1320]/60 px-3 backdrop-blur-xl">
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: "0.9s" }} />
              <span className="w-0.5 h-3 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: "0.6s" }} />
              <span className="w-0.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: "1.1s" }} />
              <span className="w-0.5 h-2.5 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: "0.8s" }} />
              <span className="w-0.5 h-1 rounded-full bg-[#00D1FF] animate-pulse" style={{ animationDuration: "1.2s" }} />
            </div>
          </div>

          {/* Ask Button — hardware metallic feel */}
          <button
            type="button"
            onClick={() => navigate("/app/ask")}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#334155]/80 bg-gradient-to-b from-[#1E2A3F]/80 to-[#0F1B2D]/90 px-3.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:border-[#00D1FF]/60 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_12px_rgba(0,209,255,0.2)]"
          >
            <Sparkles size={14} className="text-[#00D1FF]" />
            Ask
          </button>

          {/* Voice Button — hardware metallic feel */}
          <button
            type="button"
            onClick={() => navigate("/app/voice")}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#334155]/80 bg-gradient-to-b from-[#1E2A3F]/80 to-[#0F1B2D]/90 px-3.5 text-[12.5px] font-medium text-[#E2E8F0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:border-[#00D1FF]/60 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_12px_rgba(0,209,255,0.2)]"
          >
            <Mic size={14} className="text-[#94A3B8]" />
            Voice
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => navigate("/app/activity")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#334155]/60 bg-[#0F1B2D]/60 text-[#94A3B8] backdrop-blur-xl transition-all hover:border-[#00D1FF]/40 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_6px_#00D1FF]" />
          </button>

          {/* Profile Badge */}
          <button
            type="button"
            onClick={() => navigate("/app/settings")}
            className="flex h-9 items-center gap-2 rounded-full border border-[#334155]/60 bg-[#0F1B2D]/60 py-1 pl-1.5 pr-3 text-[#E2E8F0] backdrop-blur-xl transition-all hover:border-[#00D1FF]/40"
          >
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#3882F6] to-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.6)]">
              <span className="text-[11px] font-bold text-black">{session.name ? session.name[0].toUpperCase() : "P"}</span>
            </span>
            <span className="text-[12.5px] font-medium text-[#E2E8F0]">{session.name || "Prateek"}</span>
            <ChevronDown size={13} className="text-[#94A3B8]" />
          </button>
        </div>
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
