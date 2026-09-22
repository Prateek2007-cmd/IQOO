/**
 * NeoBrain Landing Page
 *
 * Cinematic, continuous computational environment.
 * The user travels deeper into the NeoBrain system as they scroll:
 * HERO (Observatory) -> OBSERVATORY DISSOLUTION -> DEEP COMPUTATIONAL SPACE
 * -> NEURAL SPACE (Perceive) -> MEMORY SPACE (Remember) -> INTELLIGENCE SPACE (Ask)
 * -> DEVICE CONTINUUM (Connect) -> NEURAL TOPOLOGY (Knowledge Graph)
 * -> SOVEREIGN ENCLAVE (Privacy) -> FINAL HORIZON (Return to NeoBrainCore)
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NeoBrainCore from "../components/NeoBrainCore";
import observatoryBg from "../neobrain-observatory.png";
import { NeoBrainMark, NeoBrainWordmark } from "../components/Logo";

// Continuous Space Modules
import GlobalAmbientField from "./landing/GlobalAmbientField";
import ProblemSpace from "./landing/ProblemSpace";
import PerceiveSpace from "./landing/PerceiveSpace";
import RememberSpace from "./landing/RememberSpace";
import AskSpace from "./landing/AskSpace";
import ConnectSpace from "./landing/ConnectSpace";
import KnowledgeSpace from "./landing/KnowledgeSpace";
import PrivacySpace from "./landing/PrivacySpace";
import FinalHorizon from "./landing/FinalHorizon";

/* --------------------------------------------------------------------- navigation */

function SiteNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  const links = [
    { href: "#home", label: "Home", active: true },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#privacy", label: "Privacy" },
    { href: "#knowledge", label: "Knowledge" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[#334155]/50 bg-[#020407]/80 backdrop-blur-xl py-3"
          : "border-b border-transparent bg-[#020407]/20 backdrop-blur-md py-4 sm:py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-6 sm:px-10" aria-label="Main">
        {/* Left: Brand */}
        <a href="#home" className="group flex items-center">
          <span className="font-display text-[14.5px] font-semibold tracking-[0.38em] text-white transition-opacity duration-300 group-hover:opacity-90">
            N E O B R A I N
          </span>
        </a>

        {/* Center: Links */}
        <div className="hidden items-center gap-7 lg:gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-[13px] font-normal tracking-[0.02em] transition-colors duration-200 ${
                link.active
                  ? "relative text-white after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[1.5px] after:bg-[#00D1FF] after:shadow-[0_0_8px_#00D1FF]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-white/20 bg-black/40 px-4 sm:px-5 py-1.5 text-[12.5px] font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:border-[#00D1FF]/70 hover:bg-[#00D1FF]/10 hover:shadow-[0_0_18px_rgba(0,209,255,0.25)] active:scale-95"
          >
            <span>Get Early Access</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------- hero particles */

function AtmosphericParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const count = 36;
    const particles = Array.from({ length: count }, () => ({
      x: width * 0.5 + (Math.random() - 0.5) * width * 0.55,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.6,
      speedY: Math.random() * 0.22 + 0.08,
      speedX: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.32 + 0.08,
      phase: Math.random() * Math.PI * 2,
      isWarm: Math.random() > 0.72,
    }));

    let t = 0;
    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.speedY;
        p.x += Math.sin(t + p.phase) * 0.22 + p.speedX;

        if (p.y < 0) {
          p.y = height + 8;
          p.x = width * 0.5 + (Math.random() - 0.5) * width * 0.55;
        }

        const pulse = Math.sin(t * 1.4 + p.phase) * 0.25 + 0.75;
        const alpha = p.opacity * pulse;

        if (p.isWarm) {
          ctx.fillStyle = `rgba(255, 185, 110, ${alpha * 0.75})`;
        } else {
          ctx.fillStyle = `rgba(160, 240, 255, ${alpha})`;
        }

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
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-65"
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [coreState, setCoreState] = useState<"idle" | "listening" | "thinking" | "responding">("idle");
  const [isHovered, setIsHovered] = useState(false);

  // Scroll animations for seamless gradual transition into deep space
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax & depth transforms
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  // Dissolves the observatory architecture gradually as user scrolls
  const bgDarken = useTransform(scrollYProgress, [0, 0.95], [0, 0.92]);
  const coreY = useTransform(scrollYProgress, [0, 1], ["0px", "-130px"]);
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const topTextFade = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const topTextY = useTransform(scrollYProgress, [0, 0.42], ["0px", "-35px"]);

  const handleCoreEngage = () => {
    setCoreState((prev) => {
      if (prev === "idle") return "listening";
      if (prev === "listening") return "thinking";
      if (prev === "thinking") return "responding";
      return "idle";
    });
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative h-screen min-h-[680px] w-full overflow-hidden select-none bg-[#020407]"
    >
      {/* =========================================================================
          LAYER 1: Cinematic background image
          - Covers entire hero viewport (100vw × 100vh)
          - object-fit: cover, object-position: center
          - Preserves cinematic composition with slow parallax on scroll
          ========================================================================= */}
      <motion.div
        style={{ scale: bgScale, y: bgY }}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden will-change-transform"
      >
        <img
          src={observatoryBg}
          alt="NeoBrain Futuristic Observatory Stage"
          className="h-full w-full object-cover object-center select-none"
        />
      </motion.div>

      {/* =========================================================================
          LAYER 2: Dark blue/black gradient overlay & scroll dissolution
          - Fades the observatory into deep space as user scrolls
          ========================================================================= */}
      <motion.div
        style={{ opacity: bgDarken }}
        className="pointer-events-none absolute inset-0 z-[1] bg-[#020407]"
      />
      {/* Top & bottom gentle darkening vignette */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[#020407]/70 via-transparent to-[#020407]/95" />
      {/* Radial depth vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 35%, rgba(2, 4, 7, 0.6) 100%)",
        }}
      />
      {/* Seamless bottom transition dissolution */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-[#020407] via-[#020407]/80 to-transparent" />

      {/* =========================================================================
          LAYER 3: Atmospheric environmental integration
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        <AtmosphericParticles />

        {/* Occlusion shadow on circular platform under the Core */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "clamp(260px, 30vw, 440px)",
            height: "clamp(36px, 5vh, 65px)",
            bottom: "clamp(65px, 9vh, 110px)",
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(1, 4, 10, 0.55) 0%, rgba(1, 4, 10, 0.2) 55%, transparent 80%)",
            filter: "blur(14px)",
          }}
        />

        {/* Reflected cyan light pool on platform floor */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-opacity duration-700 pointer-events-none"
          style={{
            width: "clamp(380px, 44vw, 640px)",
            height: "clamp(65px, 8.5vh, 110px)",
            bottom: "clamp(60px, 8.5vh, 105px)",
            background:
              "radial-gradient(ellipse 70% 48% at 50% 50%, rgba(0, 209, 255, 0.14) 0%, rgba(0, 160, 245, 0.045) 50%, transparent 80%)",
            filter: "blur(22px)",
            opacity: isHovered ? 0.95 : 0.75,
          }}
        />

        {/* Faint volumetric shaft */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "clamp(300px, 34vw, 500px)",
            height: "clamp(190px, 24vh, 290px)",
            bottom: "clamp(70px, 9.5vh, 115px)",
            background:
              "radial-gradient(ellipse 55% 85% at 50% 100%, rgba(0, 209, 255, 0.08) 0%, rgba(0, 140, 240, 0.025) 60%, transparent 85%)",
            filter: "blur(28px)",
          }}
        />

        {/* Atmospheric presence glow behind Core */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none"
          style={{
            top: "58%",
            width: "clamp(540px, 52vw, 820px)",
            height: "clamp(540px, 52vw, 820px)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 209, 255, 0.065) 0%, rgba(0, 140, 230, 0.02) 45%, transparent 70%)",
            filter: "blur(48px)",
            opacity: isHovered ? 1 : 0.8,
          }}
        />

        {/* Skylight downlight from dome aperture */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "clamp(280px, 34vw, 480px)",
            height: "36vh",
            background:
              "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(215, 245, 255, 0.1) 0%, rgba(140, 210, 255, 0.02) 60%, transparent 90%)",
            filter: "blur(26px)",
          }}
        />
      </div>

      {/* =========================================================================
          LAYER 4: The real interactive NeoBrainCore (~443px desktop)
          ========================================================================= */}
      <motion.div
        style={{ y: coreY, scale: coreScale, opacity: coreOpacity }}
        className="pointer-events-none absolute inset-0 z-[10] flex items-center justify-center will-change-transform"
      >
        <div
          style={{
            position: "absolute",
            top: "58%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(720px, 73vw, 1060px)",
            height: "clamp(720px, 73vw, 1060px)",
          }}
          className="flex items-center justify-center pointer-events-none"
        >
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto relative group cursor-grab active:cursor-grabbing w-full h-full transition-transform duration-300 select-none"
          >
            <NeoBrainCore
              state={coreState}
              quality="high"
              amplitude={isHovered ? 0.3 : 0}
              onEngage={handleCoreEngage}
              style={{
                background: "transparent",
                borderRadius: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          LAYER 5: Hero Foreground UI & Typography
          ========================================================================= */}
      {/* Side Environmental Coordinates */}
      <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 z-[20] hidden xl:flex flex-col gap-1.5 opacity-40">
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">INTELLIGENCE</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">THAT LIVES</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">WITH YOU</span>
      </div>

      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-[20] hidden xl:flex flex-col gap-3 opacity-40 text-right">
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">CAPTURE</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">UNDERSTAND</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">REMEMBER</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">CONNECT</span>
        <span className="text-[9px] font-mono tracking-[0.24em] text-neutral-400 uppercase">EVOLVE</span>
      </div>

      {/* UPPER-MID TYPOGRAPHY & CTA BLOCK */}
      <div className="pointer-events-none relative z-[20] mx-auto flex h-full w-full max-w-[1360px] flex-col items-center justify-start px-6 pt-[72px] sm:pt-20 md:pt-22">
        <motion.div
          style={{ opacity: topTextFade, y: topTextY }}
          className="mx-auto flex flex-col items-center text-center will-change-transform"
        >
          {/* Eyebrow */}
          <div className="mb-1.5 sm:mb-2 flex items-center justify-center gap-2">
            <span className="text-[9.5px] sm:text-[10.5px] font-medium tracking-[0.32em] text-neutral-400 uppercase font-mono">
              YOUR SECOND BRAIN
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-[38px] sm:text-[52px] md:text-[66px] lg:text-[76px] font-bold tracking-[0.14em] sm:tracking-[0.16em] leading-none select-none">
            <span className="text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)]">NEO</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#38bdf8] to-cyan-300 drop-shadow-[0_0_36px_rgba(0,209,255,0.65)]">
              BRAIN
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[16px] md:text-[17px] font-normal tracking-[0.04em] text-neutral-200">
            Perceive. Remember. Connect.
          </p>
          <p className="mt-0.5 sm:mt-1 text-[11.5px] sm:text-[12.5px] text-neutral-400/90 font-normal max-w-[46ch]">
            An intelligent memory layer for everything you do.
          </p>

          {/* Action CTAs: Positioned cleanly ABOVE the Core */}
          <div className="pointer-events-auto mt-4 sm:mt-5 flex items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
              className="group rounded-full border border-white/20 bg-black/50 px-5 sm:px-6 py-2 sm:py-2.5 text-[12.5px] sm:text-[13px] font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:border-[#00D1FF]/80 hover:bg-[#00D1FF]/10 hover:shadow-[0_0_24px_rgba(0,209,255,0.35)] active:scale-95"
            >
              <span>Explore NeoBrain</span>
              <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
            </button>

            <button
              onClick={() => navigate("/auth?returnTo=%2Fapp%2Fvoice")}
              className="group rounded-full border border-white/10 hover:border-white/25 bg-black/30 px-3.5 sm:px-4 py-2 sm:py-2.5 text-[12.5px] sm:text-[13px] font-medium tracking-wide text-neutral-300 hover:text-white backdrop-blur-sm transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <span className="flex items-center justify-center w-5 sm:w-5.5 h-5 sm:h-5.5 rounded-full border border-[#00D1FF]/60 bg-[#00D1FF]/10 text-[#00D1FF] text-[9px] sm:text-[10px] pl-0.5 shadow-[0_0_10px_rgba(0,209,255,0.3)] transition-transform duration-300 group-hover:scale-110">
                ▶
              </span>
              <span>Watch Video</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

function SiteFooter() {
  return (
    <footer className="relative border-t border-[#334155]/40 py-14 bg-[#020407]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <NeoBrainWordmark size={13} />
            <p className="mt-4 max-w-[34ch] text-[12px] leading-relaxed text-[#94A3B8]">
              A privacy-first personal memory assistant that understands your context and keeps your
              data on your devices.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              { title: "Product", links: ["Overview", "Voice mode", "Knowledge graph", "Devices"] },
              { title: "Privacy", links: ["Local first", "Retention", "Export data", "Delete all"] },
              { title: "Architecture", links: ["SQLite VSS", "P2P Sync", "Offline ASR", "Security"] },
            ].map((column) => (
              <div key={column.title}>
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#94A3B8] uppercase block mb-3">
                  {column.title}
                </span>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <span className="cursor-default text-[12.5px] text-[#94A3B8]/80 transition-colors hover:text-white">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[#334155]/30" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <NeoBrainMark size={24} />
            <span className="text-[11px] font-mono text-[#94A3B8]">
              Local / Private / Contextual / Always yours
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase font-mono tracking-widest text-[#94A3B8]/70">
            <span>NEOBRAIN</span>
            <span className="text-[#334155]">×</span>
            <span className="font-display text-[#E2E8F0]">iQOO 15</span>
            <span>BUILT FOR THINKERS &amp; BUILDERS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------- main page */

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#020407] text-[#E2E8F0] selection:bg-[#00D1FF]/30 selection:text-white">
      {/* 1. Global Ambient Field: Continuous background continuum */}
      <GlobalAmbientField />

      {/* 2. Fixed Glass Navigation */}
      <SiteNav />

      {/* 3. The Continuous Cinematic Computing World */}
      <main className="relative z-10">
        {/* 00. Hero: Observatory Stage */}
        <Hero />

        {/* 01. The Problem: Data Fragmentation & Convergence */}
        <div id="features">
          <ProblemSpace />
        </div>

        {/* 02. Perceive: Flowing Neural Waveform */}
        <div id="how-it-works">
          <PerceiveSpace />
        </div>

        {/* 03. Remember: Vertical Distillation Pipeline */}
        <div id="remember">
          <RememberSpace />
        </div>

        {/* 04. Ask Your Brain: Spatial Retrieval Intelligence HUD */}
        <div id="ask">
          <AskSpace />
        </div>

        {/* 05. Connect: Device Continuum (Deep Brain & Pocket Brain) */}
        <div id="connect">
          <ConnectSpace />
        </div>

        {/* 06. Knowledge Graph: Dark-Space Neural Topology */}
        <div id="knowledge">
          <KnowledgeSpace />
        </div>

        {/* 07. Privacy: Sovereign Enclave */}
        <div id="privacy">
          <PrivacySpace />
        </div>

        {/* 08. Final Horizon: Celestial Cyan Horizon Arc & Return to Core */}
        <FinalHorizon />
      </main>

      {/* 4. Site Footer */}
      <SiteFooter />
    </div>
  );
}
