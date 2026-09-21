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

  const auraTop = variant === "voice" ? "rgba(196,123,255,0.30)" : "rgba(0,217,255,0.24)";
  const auraBottom = variant === "marketing" ? "rgba(255,154,87,0.14)" : "rgba(36,123,255,0.22)";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-ink-900" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #0a1a26 0%, #050c13 55%, #04090e 100%)",
        }}
      />
      <div
        className="absolute -top-[26%] left-1/2 h-[70vh] w-[92vw] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle, ${auraTop} 0%, rgba(0,0,0,0) 68%)`, opacity: 0.85 * intensity }}
      />
      <div
        className="absolute -bottom-[30%] right-[-14%] h-[64vh] w-[76vw] rounded-full blur-[130px]"
        style={{ background: `radial-gradient(circle, ${auraBottom} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.7 * intensity }}
      />
      <div
        className="absolute -left-[18%] bottom-[-8%] h-[42vh] w-[52vw] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(circle, rgba(141,108,255,0.18) 0%, rgba(0,0,0,0) 72%)`, opacity: 0.6 * intensity }}
      />
      {grid ? (
        <div className="tech-grid absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(120%_80%_at_50%_20%,#000_0%,transparent_78%)]" />
      ) : null}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {particles && !reduced ? <ParticleField intensity={intensity} density={variant === "marketing" ? 1.5 : 1} /> : null}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900 to-transparent" />
    </div>
  );
}

export const AmbientBackground = memo(AmbientBase);
export default AmbientBackground;
