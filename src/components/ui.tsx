/**
 * Shared UI primitives.
 *
 * Everything visual that repeats across screens lives here so spacing, radii,
 * surface treatment and motion stay consistent. Classes come from the token
 * layer in index.css — no component invents its own palette.
 */

import { motion, useInView } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  Cpu,
  Loader2,
  Lock,
  MicOff,
  SearchX,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ surface */

export function Panel({
  children,
  className = "",
  padded = true,
  glow = false,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  glow?: boolean;
  as?: "div" | "section" | "article";
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <Tag
      className={[
        "panel relative overflow-hidden",
        padded ? "p-4 sm:p-5" : "",
        glow ? "shadow-elevated" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  label,
  title,
  action,
  className = "",
}: {
  label?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {label ? <div className="label mb-1.5">{label}</div> : null}
        <h2 className="title-md truncate">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ controls */

type ButtonVariant = "primary" | "default" | "ghost" | "danger";

export function Button({
  variant = "default",
  size = "md",
  icon: Icon,
  loading,
  children,
  className = "",
  ...rest
}: {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: LucideIcon;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "ghost"
        ? "btn-ghost"
        : variant === "danger"
          ? "btn-danger"
          : "";
  return (
    <button
      className={["btn", variantClass, size === "sm" ? "btn-sm" : "", className].join(" ")}
      {...rest}
      disabled={rest.disabled || loading}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <label htmlFor={inputId} className="min-w-0 cursor-pointer">
        <span className="block text-[13.5px] font-medium text-txt-primary">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-txt-muted">{description}</span>
        ) : null}
      </label>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 h-[26px] w-[46px] shrink-0 rounded-full border transition-all duration-300 ease-premium",
          checked
            ? "border-cyanx/60 bg-[linear-gradient(180deg,rgba(0,217,255,0.34),rgba(0,217,255,0.12))] shadow-[0_0_20px_-4px_rgba(0,217,255,0.7)]"
            : "border-line-soft bg-ink-800",
          disabled ? "opacity-40" : "",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full transition-all duration-300 ease-premium",
            checked
              ? "left-[25px] bg-cyanx shadow-[0_0_12px_rgba(0,217,255,0.9)]"
              : "left-[4px] bg-txt-muted",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className = "",
  as = "button",
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: "button" | "span";
}) {
  const classes = ["chip", active ? "chip-active" : "", className].join(" ");
  if (as === "span") return <span className={classes}>{children}</span>;
  return (
    <button type="button" onClick={onClick} className={classes} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={[
              "relative shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-medium transition-all duration-200 ease-premium",
              active
                ? "border-cyanx/45 bg-cyanx/10 text-[#cdf5ff] shadow-[0_0_22px_-8px_rgba(0,217,255,0.8)]"
                : "border-line-subtle bg-ink-800/60 text-txt-secondary hover:border-line-soft hover:text-txt-primary",
            ].join(" ")}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className={`ml-1.5 numeral text-[11px] ${active ? "text-cyanx" : "text-txt-muted"}`}>
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- data */

export function MetricTile({
  icon: Icon,
  value,
  label,
  accent = "cyan",
  hint,
  trend,
  bars,
  className = "",
  onClick,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent?: "cyan" | "violet" | "amber" | "green" | "blue";
  hint?: string;
  trend?: string;
  bars?: number[];
  className?: string;
  onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    cyan: "text-[#00D1FF]",
    violet: "text-[#885CF6]",
    amber: "text-[#F59E0B]",
    green: "text-[#10B981]",
    blue: "text-[#3882F6]",
  };
  const barColors: Record<string, string> = {
    cyan: "bg-[#00D1FF]",
    violet: "bg-[#885CF6]",
    amber: "bg-[#F59E0B]",
    green: "bg-[#10B981]",
    blue: "bg-[#3882F6]",
  };

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={[
        "group relative flex items-center justify-between overflow-hidden rounded-[14px] border border-[#334155]/50 bg-[#0B1320]/60 px-3.5 py-2.5 backdrop-blur-xl text-left transition-all duration-300 ease-premium shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)]",
        onClick ? "hover:border-[#00D1FF]/40 hover:bg-[#0F1B2D]/80 active:scale-[0.985]" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#334155]/40 bg-[#020407]/80">
          <Icon size={14} className={accents[accent]} strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-mono text-[19px] sm:text-[20px] font-semibold leading-none text-[#E2E8F0] tracking-tight shrink-0">{value}</span>
            <span className="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7E8F9F] truncate">{label}</span>
          </div>
          {hint ? <div className="mt-0.5 text-[9.5px] text-[#64748B] truncate">{hint}</div> : null}
        </div>
      </div>

      {/* Right-side trend or mini histogram */}
      <div className="flex flex-col items-end justify-center shrink-0 pl-1">
        {bars && bars.length > 0 ? (
          <div className="flex items-end gap-0.5 h-4 mb-0.5">
            {bars.map((b, i) => (
              <span
                key={i}
                className={`w-[3px] rounded-t-xs transition-all duration-300 ${barColors[accent]} ${
                  i === bars.length - 1 ? "opacity-100 shadow-[0_0_6px_#00D1FF]" : "opacity-35"
                }`}
                style={{ height: `${Math.max(20, Math.min(100, b * 100))}%` }}
              />
            ))}
          </div>
        ) : null}
        {trend ? (
          <span className="text-[9.5px] font-mono text-[#64748B]">{trend}</span>
        ) : null}
      </div>
    </Tag>
  );
}

export function MicroHistogram({
  values = [0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 1.0],
  accent = "cyan",
  height = 24,
}: {
  values?: number[];
  accent?: "cyan" | "blue" | "violet" | "amber";
  height?: number;
}) {
  const colorMap = {
    cyan: "bg-[#00D1FF]",
    blue: "bg-[#3882F6]",
    violet: "bg-[#885CF6]",
    amber: "bg-[#F59E0B]",
  };
  return (
    <div className="flex items-end gap-1.5" style={{ height: `${height}px` }}>
      {values.map((v, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-t-sm transition-all duration-300 ${colorMap[accent]} ${
            i === values.length - 1 ? "opacity-100 shadow-[0_0_6px_#00D1FF]" : "opacity-35"
          }`}
          style={{ height: `${Math.max(12, Math.min(100, v * 100))}%` }}
        />
      ))}
    </div>
  );
}

export function MicroRing({
  progress = 0.72,
  size = 40,
  strokeWidth = 3.5,
  color = "#00D1FF",
}: {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.5)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
    </div>
  );
}

export function MicroSpline({
  color = "#3882F6",
  width = 90,
  height = 24,
}: {
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 90 24" fill="none" className="overflow-visible">
      <path
        d="M2 18 C 20 12, 35 22, 50 14 C 65 6, 75 16, 88 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <circle cx="88" cy="10" r="2.5" fill="#00D1FF" style={{ filter: "drop-shadow(0 0 6px #00D1FF)" }} />
    </svg>
  );
}

export function StatusDot({
  tone = "cyan",
  pulse = false,
  className = "",
}: {
  tone?: "cyan" | "green" | "amber" | "violet" | "muted" | "danger";
  pulse?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    cyan: "bg-cyanx shadow-[0_0_10px_rgba(0,217,255,0.9)]",
    green: "bg-greenx shadow-[0_0_10px_rgba(35,215,160,0.9)]",
    amber: "bg-amberx shadow-[0_0_10px_rgba(255,154,87,0.9)]",
    violet: "bg-violetx shadow-[0_0_10px_rgba(141,108,255,0.9)]",
    muted: "bg-txt-muted",
    danger: "bg-dangerx shadow-[0_0_10px_rgba(255,77,94,0.9)]",
  };
  return (
    <span className={`relative inline-flex h-1.5 w-1.5 shrink-0 ${className}`}>
      <span className={`absolute inset-0 rounded-full ${tones[tone]}`} />
      {pulse ? (
        <span className={`absolute inset-0 animate-ping rounded-full ${tones[tone]} opacity-60`} />
      ) : null}
    </span>
  );
}

export function TechLabel({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "cyan" | "violet" | "amber" | "green";
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "text-txt-muted",
    cyan: "text-cyanx",
    violet: "text-violetx",
    amber: "text-amberx",
    green: "text-greenx",
  };
  return <div className={`label ${tones[tone]} ${className}`}>{children}</div>;
}

/* ------------------------------------------------- implementation honesty -- */

export type StateKind =
  | "loading"
  | "empty"
  | "search-empty"
  | "error"
  | "offline"
  | "permission"
  | "model"
  | "mic"
  | "success";

const STATE_ICONS: Record<StateKind, LucideIcon> = {
  loading: Loader2,
  empty: Cpu,
  "search-empty": SearchX,
  error: AlertTriangle,
  offline: WifiOff,
  permission: Lock,
  model: CloudOff,
  mic: MicOff,
  success: CheckCircle2,
};

const STATE_TONES: Record<StateKind, string> = {
  loading: "text-cyanx",
  empty: "text-txt-secondary",
  "search-empty": "text-txt-secondary",
  error: "text-dangerx",
  offline: "text-warnx",
  permission: "text-amberx",
  model: "text-violetx",
  mic: "text-amberx",
  success: "text-greenx",
};

/**
 * Honest state surface. Used for every loading / empty / error / permission /
 * unavailable-model condition so nothing fails silently.
 */
export function StateBlock({
  kind,
  title,
  description,
  action,
  compact = false,
}: {
  kind: StateKind;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  const Icon = STATE_ICONS[kind];
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-xl border border-line-subtle bg-ink-850/40 text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10",
      ].join(" ")}
      role={kind === "error" ? "alert" : undefined}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-full border border-line-subtle bg-ink-800/70 ${STATE_TONES[kind]}`}
      >
        <Icon size={17} className={kind === "loading" ? "animate-spin" : ""} strokeWidth={1.7} />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold text-txt-primary">{title}</div>
        {description ? (
          <p className="mx-auto mt-1 max-w-[38ch] text-[12px] leading-relaxed text-txt-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md border border-line-subtle bg-ink-800/60 ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(145,205,235,0.07),transparent)] bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}

export function Progress({ value, showLabel = false }: { value: number; showLabel?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="meter flex-1">
        <span style={{ width: `${pct}%` }} />
      </div>
      {showLabel ? <span className="numeral text-[11px] text-txt-secondary">{pct}%</span> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- list */

export function ListRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  trailing,
  onClick,
  accent = "cyan",
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  meta?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  accent?: "cyan" | "violet" | "amber" | "green" | "blue" | "muted";
  className?: string;
}) {
  const accents: Record<string, string> = {
    cyan: "text-cyanx",
    violet: "text-violetx",
    amber: "text-amberx",
    green: "text-greenx",
    blue: "text-bluex",
    muted: "text-txt-muted",
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors duration-200",
        onClick ? "hover:bg-[rgba(145,205,235,0.045)]" : "",
        className,
      ].join(" ")}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xs border border-line-subtle bg-ink-800/70 ${accents[accent]}`}
      >
        <Icon size={14} strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-txt-primary">{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-[11.5px] text-txt-muted">{subtitle}</span> : null}
      </span>
      {meta ? <span className="shrink-0 text-[11px] text-txt-muted">{meta}</span> : null}
      {trailing}
    </Tag>
  );
}

/* -------------------------------------------------------------------- sheet */

const SheetContext = createContext<{ close: () => void }>({ close: () => undefined });

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <SheetContext.Provider value={{ close: onClose }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute inset-0 bg-ink-900/75 backdrop-blur-sm"
        />
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="glass relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border-line-soft p-5 sm:max-w-lg sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="title-md">{title}</h2>
            <button type="button" onClick={onClose} className="icon-btn h-8 w-8" aria-label="Close">
              ✕
            </button>
          </div>
          {children}
          {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
        </motion.div>
      </div>
    </SheetContext.Provider>
  );
}

export function useSheet() {
  return useContext(SheetContext);
}

/* ------------------------------------------------------------------- motion */

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -8% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  if (!mounted) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      onAnimationComplete={() => {
        if (!open) setMounted(false);
      }}
    >
      {children}
    </motion.div>
  );
}
