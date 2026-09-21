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
  className = "",
  onClick,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent?: "cyan" | "violet" | "amber" | "green" | "blue";
  hint?: string;
  className?: string;
  onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    cyan: "text-cyanx",
    violet: "text-violetx",
    amber: "text-amberx",
    green: "text-greenx",
    blue: "text-bluex",
  };
  const ring: Record<string, string> = {
    cyan: "rgba(0,217,255,0.22)",
    violet: "rgba(141,108,255,0.22)",
    amber: "rgba(255,154,87,0.22)",
    green: "rgba(35,215,160,0.22)",
    blue: "rgba(36,123,255,0.22)",
  };

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={[
        "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.5)_0%,rgba(7,16,25,0.72)_100%)] p-3.5 text-left transition-all duration-300 ease-premium",
        onClick ? "hover:border-line-soft hover:shadow-panel active:scale-[0.985]" : "",
        className,
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${ring[accent]} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.7 }}
      />
      <Icon size={16} className={`relative mb-3 ${accents[accent]}`} strokeWidth={1.6} />
      <div className="relative">
        <div className="numeral text-[24px] leading-none text-txt-primary">{value}</div>
        <div className="mt-1.5 text-[11px] font-medium leading-tight text-txt-secondary">{label}</div>
        {hint ? <div className="mt-1 text-[10px] text-txt-muted">{hint}</div> : null}
      </div>
    </Tag>
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
