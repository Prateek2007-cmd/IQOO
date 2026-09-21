/**
 * BrainCore — NeoBrain's signature visual element.
 *
 * Not a glowing ball and not a human brain: a small computational core with a
 * translucent neural lattice, orbital rings and a controlled energy source.
 *
 * Implementation: a hand-written 3D renderer on a 2D canvas. Points are rotated
 * and perspective-projected each frame, depth-sorted, and drawn with additive
 * blending, which keeps the depth cues of real 3D without shipping WebGL.
 *
 * Performance + accessibility:
 *  - particle/edge counts scale with the rendered size,
 *  - the animation loop pauses when offscreen or when the tab is hidden,
 *  - `prefers-reduced-motion` renders a single high-quality static frame,
 *  - a pure-SVG fallback is used if a 2D context cannot be created.
 */

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotionPreference } from "../lib/hooks";

export type CoreState =
  | "idle"
  | "ready"
  | "listening"
  | "processing"
  | "responding"
  | "connected"
  | "disconnected";

export type CoreVariant = "stage" | "panel" | "inline";

interface Point3 {
  x: number;
  y: number;
  z: number;
}

interface Props {
  state?: CoreState;
  /** Square size in CSS pixels. */
  size?: number;
  variant?: CoreVariant;
  /** Extra energy 0–1 (e.g. live microphone level). */
  intensity?: number;
  className?: string;
  /** Pointer parallax. Disabled on small inline variants. */
  interactive?: boolean;
  label?: string;
  /** Colour of a fallback ring when no canvas is available. */
  fallbackAccent?: "cyan" | "violet" | "amber";
}

/* ---------------------------------------------------------------- palettes */

const PALETTE = {
  cyan: [0, 217, 255] as const,
  blue: [36, 123, 255] as const,
  violet: [141, 108, 255] as const,
  magenta: [196, 123, 255] as const,
  amber: [255, 154, 87] as const,
};

const rgba = (c: readonly [number, number, number], a: number) =>
  `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Per-state motion + light profile. */
const PROFILES: Record<
  CoreState,
  {
    speed: number;
    glow: number;
    ringSpin: number;
    particleBoost: number;
    accent: readonly [number, number, number];
    secondary: readonly [number, number, number];
  }
> = {
  idle: { speed: 0.28, glow: 0.72, ringSpin: 0.5, particleBoost: 0.6, accent: PALETTE.cyan, secondary: PALETTE.violet },
  ready: { speed: 0.42, glow: 0.95, ringSpin: 0.75, particleBoost: 0.9, accent: PALETTE.cyan, secondary: PALETTE.blue },
  listening: { speed: 0.75, glow: 1.15, ringSpin: 1, particleBoost: 1.35, accent: PALETTE.magenta, secondary: PALETTE.cyan },
  processing: { speed: 1.05, glow: 1.05, ringSpin: 1.5, particleBoost: 1.7, accent: PALETTE.violet, secondary: PALETTE.blue },
  responding: { speed: 0.6, glow: 1.25, ringSpin: 0.9, particleBoost: 1.1, accent: PALETTE.cyan, secondary: PALETTE.violet },
  connected: { speed: 0.34, glow: 0.85, ringSpin: 0.6, particleBoost: 0.75, accent: PALETTE.cyan, secondary: PALETTE.blue },
  disconnected: { speed: 0.16, glow: 0.35, ringSpin: 0.25, particleBoost: 0.3, accent: [90, 120, 140], secondary: [70, 95, 115] },
};

/* ------------------------------------------------------------ 3D geometry */

function fibonacciSphere(count: number): Point3[] {
  const points: Point3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }
  return points;
}

function buildLattice(points: Point3[], neighbours: number, maxDistance: number): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < points.length; i += 1) {
    const distances: { j: number; d: number }[] = [];
    for (let j = 0; j < points.length; j += 1) {
      if (i === j) continue;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dz = points[i].z - points[j].z;
      distances.push({ j, d: Math.sqrt(dx * dx + dy * dy + dz * dz) });
    }
    distances.sort((a, b) => a.d - b.d);
    for (let n = 0; n < neighbours; n += 1) {
      const candidate = distances[n];
      if (!candidate || candidate.d > maxDistance) continue;
      const key = i < candidate.j ? `${i}-${candidate.j}` : `${candidate.j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, candidate.j]);
    }
  }
  return edges;
}

function rotate(point: Point3, yaw: number, pitch: number): Point3 {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = point.y * cosP - z1 * sinP;
  const z2 = point.y * sinP + z1 * cosP;
  return { x: x1, y: y2, z: z2 };
}

/* --------------------------------------------------------------- component */

interface Scene {
  sphere: Point3[];
  edges: [number, number][];
  particles: { point: Point3; speed: number; phase: number; size: number }[];
  rings: { tiltX: number; tiltZ: number; radius: number; speed: number; phase: number; width: number }[];
}

function buildScene(quality: number): Scene {
  const sphereCount = Math.max(46, Math.round(58 + quality * 92));
  const sphere = fibonacciSphere(sphereCount);
  const edges = buildLattice(sphere, quality > 0.6 ? 2 : 1, quality > 0.6 ? 0.36 : 0.3);

  const particleCount = Math.max(28, Math.round(34 + quality * 74));
  const particles = Array.from({ length: particleCount }, () => {
    const point = fibonacciSphere(particleCount * 2)[Math.floor(Math.random() * particleCount * 2)];
    const radius = 1.08 + Math.random() * 0.62;
    const scaled = point ?? { x: 1, y: 0, z: 0 };
    return {
      point: { x: scaled.x * radius, y: scaled.y * radius * 0.92, z: scaled.z * radius },
      speed: 0.25 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      size: 0.9 + Math.random() * 1.5,
    };
  });

  const rings = [
    { tiltX: 0.34, tiltZ: 0.16, radius: 1.34, speed: 0.5, phase: 0, width: 1.1 },
    { tiltX: -0.62, tiltZ: -0.3, radius: 1.52, speed: -0.34, phase: 1.9, width: 0.85 },
    { tiltX: 1.12, tiltZ: 0.55, radius: 1.18, speed: 0.72, phase: 3.4, width: 0.7 },
  ];

  return { sphere, edges, particles, rings };
}

const SVG_CORES: Record<"cyan" | "violet" | "amber", string> = {
  cyan: "0,217,255",
  violet: "141,108,255",
  amber: "255,154,87",
};

/**
 * Static layered fallback. Used when a 2D context is unavailable or when the
 * user has asked for reduced motion.
 */
function StaticCore({ size, accent }: { size: number; accent: "cyan" | "violet" | "amber" }) {
  const rgb = SVG_CORES[accent];
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.86,
          height: size * 0.86,
          background: `radial-gradient(circle at 50% 52%, rgba(${rgb},0.34) 0%, rgba(${rgb},0.1) 42%, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id={`core-${accent}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgba(${rgb},0.95)`} />
            <stop offset="46%" stopColor={`rgba(${rgb},0.28)`} />
            <stop offset="100%" stopColor={`rgba(${rgb},0)`} />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="62" fill="none" stroke={`rgba(${rgb},0.22)`} strokeWidth="0.8" />
        <circle cx="100" cy="100" r="74" fill="none" stroke={`rgba(${rgb},0.14)`} strokeWidth="0.6" />
        <circle cx="100" cy="100" r="88" fill="none" stroke={`rgba(${rgb},0.1)`} strokeWidth="0.6" />
        <ellipse cx="100" cy="100" rx="92" ry="26" fill="none" stroke={`rgba(${rgb},0.4)`} strokeWidth="1" />
        <ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="98"
          fill="none"
          stroke="rgba(141,108,255,0.24)"
          strokeWidth="0.8"
          transform="rotate(24 100 100)"
        />
        <circle cx="100" cy="100" r="30" fill={`url(#core-${accent})`} />
      </svg>
    </div>
  );
}

function BrainCoreCanvas({
  state = "idle",
  size,
  variant = "stage",
  intensity = 0,
  interactive = true,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<CoreState>(state);
  const intensityRef = useRef(intensity);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const reduced = useReducedMotionPreference();
  const [ctxFailed, setCtxFailed] = useState(false);
  const [measured, setMeasured] = useState(size ?? 320);

  stateRef.current = state;
  intensityRef.current = intensity;

  const quality = useMemo(() => {
    if (measured < 110) return 0.18;
    if (measured < 200) return 0.45;
    if (measured < 320) return 0.7;
    return 1;
  }, [measured]);

  /* Responsive measurement when no explicit size is given. */
  useEffect(() => {
    if (size) {
      setMeasured(size);
      return;
    }
    const node = wrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      if (next > 0) setMeasured(Math.min(next, 560));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCtxFailed(true);
      return;
    }

    const scene = buildScene(quality);
    let raf = 0;
    let running = true;
    let visible = true;
    let time = 0;
    let last = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(measured * dpr);
    canvas.height = Math.round(measured * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = measured / 2;
    const cy = measured / 2;
    const radius = measured * 0.27;
    const fov = 3.15;

    const drawFrame = (delta: number) => {
      const profile = PROFILES[stateRef.current];
      const energy = intensityRef.current;
      time += delta;

      const yaw = time * 0.22 * profile.speed;
      const pitch = 0.42 + Math.sin(time * 0.16 * profile.speed) * 0.16;

      /* pointer easing */
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.06;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.06;
      const yawTotal = yaw + pointer.current.x * 0.5;
      const pitchTotal = pitch + pointer.current.y * 0.32;

      ctx.clearRect(0, 0, measured, measured);
      ctx.globalCompositeOperation = "lighter";

      const glow = profile.glow * (0.9 + energy * 0.35);
      const breathe = 1 + Math.sin(time * 1.1) * 0.012 + energy * 0.03;
      const R = radius * breathe;

      /* 1. ambient volume glow -------------------------------------------- */
      const volume = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.35);
      volume.addColorStop(0, rgba(profile.accent, 0.3 * glow));
      volume.addColorStop(0.34, rgba(profile.secondary, 0.13 * glow));
      volume.addColorStop(0.7, rgba(profile.secondary, 0.035 * glow));
      volume.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = volume;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.35, 0, Math.PI * 2);
      ctx.fill();

      /* 2. warm rim light (used sparingly, one side only) ------------------ */
      const rim = ctx.createRadialGradient(
        cx - R * 0.95,
        cy + R * 0.78,
        0,
        cx - R * 0.95,
        cy + R * 0.78,
        R * 1.9,
      );
      rim.addColorStop(0, rgba(PALETTE.amber, 0.16 * glow));
      rim.addColorStop(0.55, rgba(PALETTE.amber, 0.05 * glow));
      rim.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2, 0, Math.PI * 2);
      ctx.fill();

      /* project helper */
      const project = (point: Point3) => {
        const rotated = rotate(point, yawTotal, pitchTotal);
        const perspective = fov / (fov + rotated.z);
        return {
          x: cx + rotated.x * R * perspective,
          y: cy + rotated.y * R * perspective,
          z: rotated.z,
          s: perspective,
        };
      };

      /* 3. orbital rings --------------------------------------------------- */
      const segments = quality > 0.4 ? 88 : 44;
      for (const ring of scene.rings) {
        const spin = time * ring.speed * profile.ringSpin;
        ctx.beginPath();
        for (let i = 0; i <= segments; i += 1) {
          const a = (i / segments) * Math.PI * 2;
          const local: Point3 = { x: Math.cos(a) * ring.radius, y: 0, z: Math.sin(a) * ring.radius };
          const tilted = rotate(local, spin, ring.tiltX);
          const zTilted = rotate(tilted, 0, ring.tiltZ);
          const p = project({ x: zTilted.x, y: zTilted.y, z: zTilted.z });
          const depth = (zTilted.z + 1.6) / 3.2;
          ctx.globalAlpha = 0.1 + depth * 0.34;
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = rgba(ring.tiltX > 0.8 ? profile.secondary : profile.accent, 0.55);
        ctx.lineWidth = ring.width * (measured > 220 ? 1 : 0.8);
        ctx.stroke();
        ctx.globalAlpha = 1;

        /* travelling bead on the ring */
        const beadAngle = spin * 2.1 + ring.phase;
        const beadLocal: Point3 = {
          x: Math.cos(beadAngle) * ring.radius,
          y: 0,
          z: Math.sin(beadAngle) * ring.radius,
        };
        const beadTilted = rotate(beadLocal, spin, ring.tiltX);
        const bead = project(rotate(beadTilted, 0, ring.tiltZ));
        const beadR = 1.5 + bead.s * 1.6;
        const beadGlow = ctx.createRadialGradient(bead.x, bead.y, 0, bead.x, bead.y, beadR * 7);
        beadGlow.addColorStop(0, rgba(PALETTE.cyan, 0.9));
        beadGlow.addColorStop(0.3, rgba(profile.accent, 0.4));
        beadGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = beadGlow;
        ctx.beginPath();
        ctx.arc(bead.x, bead.y, beadR * 7, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 4. neural lattice -------------------------------------------------- */
      const projected = scene.sphere.map((point) => project(point));
      ctx.lineWidth = measured > 220 ? 0.7 : 0.6;
      for (const [a, b] of scene.edges) {
        const pa = projected[a];
        const pb = projected[b];
        if (!pa || !pb) continue;
        const depth = (pa.z + pb.z) / 2;
        const alpha = (0.05 + ((depth + 1) / 2) * 0.3) * glow;
        ctx.strokeStyle = rgba(profile.accent, Math.min(0.42, alpha));
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      /* 5. lattice nodes + data pulses ------------------------------------- */
      const pulsePosition = ((time * 0.5) % 1) * scene.sphere.length;
      for (let i = 0; i < projected.length; i += 1) {
        const p = projected[i];
        const depth = (p.z + 1) / 2;
        const alpha = 0.16 + depth * 0.6;
        const dot = Math.max(0.6, measured * 0.0026) * (0.65 + depth * 0.9);
        ctx.fillStyle = rgba(depth > 0.62 ? PALETTE.cyan : profile.accent, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, dot, 0, Math.PI * 2);
        ctx.fill();
        if (Math.abs(i - pulsePosition) < 1.2) {
          const flare = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dot * 9);
          flare.addColorStop(0, rgba(PALETTE.magenta, 0.85));
          flare.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dot * 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* 6. drifting particles ---------------------------------------------- */
      const boost = profile.particleBoost * (1 + energy * 0.8);
      for (const particle of scene.particles) {
        const drift = time * particle.speed * 0.24 * profile.speed + particle.phase;
        const wobble = 0.06 * Math.sin(drift * 2.2);
        const local: Point3 = {
          x: particle.point.x + wobble,
          y: particle.point.y * (1 + wobble * 0.4),
          z: particle.point.z - wobble,
        };
        const p = project(local);
        const depth = (p.z + 1.6) / 3.2;
        const alpha = (0.1 + depth * 0.4) * Math.min(1.4, boost * 0.6);
        ctx.fillStyle = rgba(depth > 0.6 ? PALETTE.violet : PALETTE.blue, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, particle.size * (measured > 220 ? 1 : 0.7) * (0.6 + depth * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }

      /* 7. core energy ------------------------------------------------------ */
      const corePulse = 1 + Math.sin(time * 2.1) * 0.05 + energy * 0.16;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.86 * corePulse);
      core.addColorStop(0, `rgba(255,255,255,${0.5 * glow})`);
      core.addColorStop(0.12, rgba(PALETTE.cyan, 0.5 * glow));
      core.addColorStop(0.42, rgba(profile.accent, 0.2 * glow));
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.86 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      /* 8. listening waveform band ----------------------------------------- */
      if (stateRef.current === "listening" || stateRef.current === "processing" || stateRef.current === "responding") {
        const bands = quality > 0.4 ? 5 : 3;
        for (let band = 0; band < bands; band += 1) {
          const bandRadius = R * (0.5 + band * 0.19);
          ctx.beginPath();
          for (let i = 0; i <= segments; i += 1) {
            const a = (i / segments) * Math.PI * 2;
            const wobble =
              Math.sin(a * 3 + time * 1.6 + band * 0.7) * 0.07 * (0.5 + energy) +
              Math.sin(a * 7 - time * 2.4 + band) * 0.035 * (0.4 + energy);
            const r = bandRadius * (1 + wobble);
            const local: Point3 = { x: Math.cos(a) * r / R, y: Math.sin(a) * r / R, z: 0 };
            const p = project(rotate(local, 0, pitchTotal));
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = rgba(band % 2 === 0 ? PALETTE.cyan : PALETTE.magenta, 0.2 * glow);
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      /* 9. floor ring — grounds the object ---------------------------------- */
      const floorY = cy + R * 1.42;
      ctx.globalAlpha = 1;
      const floor = ctx.createRadialGradient(cx, floorY, 0, cx, floorY, R * 1.5);
      floor.addColorStop(0, rgba(profile.accent, 0.16 * glow));
      floor.addColorStop(0.5, rgba(profile.secondary, 0.05 * glow));
      floor.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = floor;
      ctx.beginPath();
      ctx.ellipse(cx, floorY, R * 1.5, R * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(profile.accent, 0.22 * glow);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.ellipse(cx, floorY, R * 0.92, R * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (!running) return;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) drawFrame(delta);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      drawFrame(0.0001);
      return () => {
        running = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    if (wrapRef.current) observer.observe(wrapRef.current);

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [measured, quality, reduced]);

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.current.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const resetPointer = () => {
    pointer.current.tx = 0;
    pointer.current.ty = 0;
  };

  const accent = state === "processing" ? "violet" : state === "disconnected" ? "cyan" : "cyan";

  return (
    <div
      ref={wrapRef}
      className={className}
      onPointerMove={handlePointer}
      onPointerLeave={resetPointer}
      style={{ width: size ?? "100%", maxWidth: size ?? 560, aspectRatio: "1 / 1" }}
    >
      {ctxFailed ? (
        <StaticCore size={measured} accent={accent} />
      ) : (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`NeoBrain core, state: ${state}`}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      )}
      {variant === "inline" ? null : <span className="sr-only">{`NeoBrain core — ${state}`}</span>}
    </div>
  );
}

export const BrainCore = memo(BrainCoreCanvas);

/**
 * Framed stage for the core: radial lighting, faint technical grid and an
 * interaction invitation. Used on Home, Voice and the landing hero.
 */
export function BrainCoreStage({
  state = "idle",
  size,
  intensity = 0,
  hint,
  className = "",
}: {
  state?: CoreState;
  size?: number;
  intensity?: number;
  hint?: string;
  className?: string;
}) {
  const stageAccent =
    state === "listening"
      ? "rgba(196,123,255,0.30)"
      : state === "processing"
        ? "rgba(141,108,255,0.30)"
        : state === "disconnected"
          ? "rgba(90,120,140,0.16)"
          : "rgba(0,217,255,0.26)";

  return (
    <div className={`relative grid place-items-center ${className}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 48%, ${stageAccent} 0%, rgba(4,9,14,0) 62%)`,
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-line-soft to-transparent" aria-hidden="true" />
      <BrainCore state={state} size={size} intensity={intensity} />
      {hint ? (
        <button
          type="button"
          className="group absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line-soft bg-ink-900/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-label text-txt-secondary backdrop-blur transition hover:border-cyanx/50 hover:text-cyanx"
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyanx align-middle shadow-[0_0_10px_rgba(0,217,255,0.9)]" />
          {hint}
        </button>
      ) : null}
    </div>
  );
}

export default BrainCore;
