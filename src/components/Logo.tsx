import { Link } from "react-router-dom";

interface WordmarkProps {
  /** Height of the type in px. */
  size?: number;
  as?: "link" | "text";
  to?: string;
  tagline?: boolean;
  className?: string;
}

/** Editorial, wide-tracked wordmark. */
export function NeoBrainWordmark({
  size = 14,
  as = "text",
  to = "/",
  tagline = false,
  className = "",
}: WordmarkProps) {
  const content = (
    <span className={`inline-flex flex-col ${className}`}>
      <span
        className="wordmark leading-none"
        style={{ fontSize: `${size}px`, letterSpacing: "0.34em" }}
      >
        NEOBRAIN
      </span>
      {tagline ? (
        <span
          className="mt-1.5 font-display uppercase text-txt-muted"
          style={{ fontSize: `${Math.max(8, size * 0.5)}px`, letterSpacing: "0.22em" }}
        >
          Your second brain. Always with you.
        </span>
      ) : null}
    </span>
  );

  return as === "link" ? (
    <Link to={to} className="focus-visible:rounded-xs">
      {content}
    </Link>
  ) : (
    content
  );
}

/** Compact orbital mark used as an app icon / avatar substitute. */
export function NeoBrainMark({ size = 32, state = "idle" }: { size?: number; state?: "idle" | "active" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <defs>
        <radialGradient id="mark-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eafcff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#00d9ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#247bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mark-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d9ff" />
          <stop offset="60%" stopColor="#247bff" />
          <stop offset="100%" stopColor="#8d6cff" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="#071019" stroke="rgba(145,205,235,0.18)" />
      <circle cx="20" cy="20" r="7" fill="url(#mark-core)" />
      <ellipse
        cx="20"
        cy="20"
        rx="13"
        ry="5.4"
        fill="none"
        stroke="url(#mark-ring)"
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="9"
        ry="13.6"
        fill="none"
        stroke="url(#mark-ring)"
        strokeWidth="0.8"
        opacity="0.55"
        transform="rotate(28 20 20)"
      />
      <circle cx="31.4" cy="20" r="1.5" fill="#00d9ff">
        {state === "active" ? (
          <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <circle cx="20" cy="20" r="2.1" fill="#eafcff" />
    </svg>
  );
}

export default NeoBrainWordmark;
