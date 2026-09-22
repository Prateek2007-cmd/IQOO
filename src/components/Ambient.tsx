/**
 * AmbientBackground — the shared environment every screen sits inside.
 *
 * Layered: a deep graphite base, two soft radial auras (cool cyan, violet),
 * a restrained technical grid, and a slow drifting particle field drawn on a
 * canvas. Particles pause offscreen/hidden and are skipped for reduced motion.
 */

import { memo, useEffect, useRef } from "react";
import { useReducedMotionPreference } from "../lib/hooks";

interface Props {
  /** 0–1 multiplier for aura + particle brightness. */
  intensity?: number;
  particles?: boolean;
  grid?: boolean;
  /** Warmer treatment for marketing surfaces. */
  variant?: "app" | "marketing" | "voice";
}

function ParticleField({ intensity, density }: { intensity: number; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let visible = true;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      height = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.max(18, Math.round((width * height) / 26000) * density);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.06,
      vy: -0.04 - Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random(),
    }));

    let time = 0;
    let last = performance.now();

    const draw = (delta: number) => {
      time += delta;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        particle.x += particle.vx * delta * 12;
        particle.y += particle.vy * delta * 12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.1 + particle.phase));
        const alpha = 0.1 + twinkle * 0.32 * intensityRef.current;
        const color = particle.hue > 0.72 ? "141,108,255" : particle.hue > 0.42 ? "36,123,255" : "0,217,255";
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r * 6);
        glow.addColorStop(0, `rgba(${color},${alpha})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (!running) return;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) draw(delta);
      raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

function AmbientBase({ intensity = 1, particles = true, grid = true, variant = "app" }: Props) {
  const reduced = useReducedMotionPreference();

  const auraTop = variant === "voice" ? "rgba(136,92,246,0.22)" : "rgba(0,209,255,0.18)";
  const auraBottom = variant === "marketing" ? "rgba(245,158,11,0.12)" : "rgba(56,130,246,0.16)";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* 1. Deep Space Base #020407 */}
      <div className="absolute inset-0 bg-[#020407]" />

      {/* 2. Atmospheric computation gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 90% at 75% 15%, #0d1e33 0%, #081220 35%, #050b14 70%, #020407 100%)",
        }}
      />

      {/* 3. Celestial Orbital Horizon Arc (as seen in reference mockup) */}
      <div className="absolute -top-[18%] -right-[8%] h-[680px] w-[950px] overflow-hidden opacity-40">
        <div
          className="absolute inset-0 rounded-[100%] border-t border-[#00D1FF]/40 shadow-[0_-10px_50px_rgba(0,209,255,0.25)]"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(0, 209, 255, 0.12) 0%, rgba(56, 130, 246, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      {/* 4. Soft cyan and blue atmospheric light pools */}
      <div
        className="absolute -top-[20%] left-1/3 h-[60vh] w-[70vw] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: `radial-gradient(circle, ${auraTop} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.85 * intensity }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] h-[55vh] w-[65vw] rounded-full blur-[150px]"
        style={{ background: `radial-gradient(circle, ${auraBottom} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.75 * intensity }}
      />
      <div
        className="absolute -left-[15%] bottom-[10%] h-[40vh] w-[45vw] rounded-full blur-[130px]"
        style={{ background: `radial-gradient(circle, rgba(136,92,246,0.12) 0%, rgba(0,0,0,0) 70%)`, opacity: 0.5 * intensity }}
      />

      {/* 5. Subtle technical grid */}
      {grid ? (
        <div className="tech-grid absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(120%_80%_at_60%_30%,#000_0%,transparent_80%)]" />
      ) : null}

      {/* 6. Sparse drifting particles */}
      {particles && !reduced ? <ParticleField intensity={intensity} density={variant === "marketing" ? 1.2 : 0.8} /> : null}

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020407] to-transparent" />
    </div>
  );
}

export const AmbientBackground = memo(AmbientBase);
export default AmbientBackground;
