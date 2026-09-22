import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * GlobalAmbientField
 * Persistent, continuous atmospheric background spanning across the entire landing page.
 * - Deep space base (#020407 -> #0A0F1C)
 * - Persistent micro star dust and slow drifting particles
 * - Continuous flowing neural bezier streams
 * - Subtle technical grid marks (+) and coordinates
 * - Slow scroll-linked environmental lighting changes
 */
export default function GlobalAmbientField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();

  // Subtle ambient light pools that move and modulate smoothly with scroll
  const glow1Y = useTransform(scrollYProgress, [0, 1], ["15%", "85%"]);
  const glow1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.9, 1], [0.12, 0.08, 0.14, 0.06, 0.2]);
  const glow2Y = useTransform(scrollYProgress, [0, 1], ["75%", "25%"]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // 48 persistent slow-drifting cosmic dust particles
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.4 + 0.4,
      speedY: Math.random() * 0.18 + 0.04,
      speedX: (Math.random() - 0.5) * 0.06,
      opacity: Math.random() * 0.35 + 0.08,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(t + p.phase) * 0.15 + p.speedX;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const pulse = Math.sin(t * 1.8 + p.phase) * 0.18 + 0.82;
        ctx.fillStyle = `rgba(226, 232, 240, ${p.opacity * pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020407]">
      {/* 1. Base Gradient Continuum */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 0%, #0A0F1C 0%, #060B14 45%, #020407 100%)",
        }}
      />

      {/* 2. Persistent Technical Grid Accents */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
        }}
      />

      {/* 3. Subtle Cyan & Blue Ambient Light Pools */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1100px] h-[500px] rounded-full blur-[140px]"
        style={{
          top: glow1Y,
          opacity: glow1Opacity,
          background: "radial-gradient(circle, rgba(0, 209, 255, 0.28) 0%, rgba(56, 130, 246, 0.08) 55%, transparent 75%)",
        }}
      />

      <motion.div
        className="absolute left-[35%] -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[160px]"
        style={{
          top: glow2Y,
          opacity: 0.07,
          background: "radial-gradient(circle, rgba(56, 130, 246, 0.25) 0%, rgba(136, 92, 246, 0.06) 60%, transparent 80%)",
        }}
      />

      {/* 4. Canvas for persistent dust particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Continuous vertical subtle neural lines in deep space */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M 200 0 Q 350 400 220 900 T 280 1800 T 150 2700 T 260 3600"
          fill="none"
          stroke="#00D1FF"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <path
          d="M 1200 0 Q 1050 450 1180 950 T 1100 1850 T 1250 2750 T 1120 3600"
          fill="none"
          stroke="#3882F6"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
      </svg>
    </div>
  );
}
