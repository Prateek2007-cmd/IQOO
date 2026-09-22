/**
 * NeoBrain landing page.
 *
 * Cinematic, dark, hardware-inspired. The product story is told with a
 * scroll-driven device narrative rather than a static screenshot, and every
 * claim on the page matches what the app actually does.
 */

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Camera,
  Check,
  CloudOff,
  Cpu,
  FileSearch,
  Fingerprint,
  FlaskConical,
  HardDrive,
  Laptop,
  Mic,
  MonitorSmartphone,
  NotebookPen,
  PlayCircle,
  Search,
  Sparkles,
  Smartphone,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCore } from "../components/BrainCore";
import NeoBrainCore from "./NeoBrainCore";
import observatoryBg from "../neobrain-observatory.png";
import {
  AnswerPreview,
  GraphPreview,
  HomePreview,
  LaptopFrame,
  PhoneFrame,
  VoicePreview,
  WorkspacePreview,
} from "../components/DeviceFrame";
import { NeoBrainMark, NeoBrainWordmark } from "../components/Logo";
import { Button, Reveal, StatusDot, TechLabel } from "../components/ui";

/* --------------------------------------------------------------------- nav */

/* --------------------------------------------------------------------- nav */

function SiteNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  const links = [
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#privacy", label: "Privacy" },
    { href: "#developers", label: "For Developers" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#02050a]/80 backdrop-blur-xl py-3"
          : "border-b border-white/[0.03] bg-[#02050a]/20 backdrop-blur-md py-4 sm:py-4.5"
      }`}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 sm:px-8" aria-label="Main">
        {/* Left: Brand */}
        <a href="#home" className="group flex items-center gap-2.5">
          <span className="text-cyan-400 transition-transform duration-300 group-hover:scale-105 inline-flex items-center">
            <NeoBrainMark size={18} />
          </span>
          <span className="font-display text-[14.5px] font-bold tracking-[0.18em] text-white">
            NEOBRAIN
          </span>
        </a>

        {/* Center: Links */}
        <div className="hidden items-center gap-7 lg:gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11.5px] font-medium tracking-[0.14em] text-neutral-400 uppercase transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-950/25 px-4 py-1.5 text-[12px] font-medium tracking-[0.05em] text-cyan-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/55 hover:bg-cyan-500/15 hover:text-white hover:shadow-[0_0_20px_rgba(0,217,255,0.25)] active:scale-95"
          >
            <span>Get Early Access</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------- atmospheric particles */

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

    // Micro-particles drifting slowly in the central observatory air column
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

        const alpha = p.opacity * (0.75 + 0.25 * Math.sin(t * 1.3 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.isWarm) {
          ctx.fillStyle = `rgba(255, 235, 210, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(90, 220, 255, ${alpha})`;
        }
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

  // Scroll animations for seamless gradual transition into the next section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax & depth transforms
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const bgDarken = useTransform(scrollYProgress, [0, 0.9], [0, 0.76]);
  const coreY = useTransform(scrollYProgress, [0, 1], ["0px", "-130px"]);
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const topTextFade = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const topTextY = useTransform(scrollYProgress, [0, 0.42], ["0px", "-35px"]);
  const bottomTextFade = useTransform(scrollYProgress, [0, 0.52], [1, 0]);
  const bottomTextY = useTransform(scrollYProgress, [0, 0.52], ["0px", "35px"]);

  const handleCoreEngage = () => {
    // Interactively cycle states on click
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
      className="relative h-screen min-h-[680px] w-full overflow-hidden select-none bg-[#020408]"
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
          LAYER 2: Very subtle dark blue/black gradient overlay
          - Atmospheric aerospace laboratory tone
          - Scroll darkening to seamlessly introduce next section
          ========================================================================= */}
      {/* Scroll-driven darkening layer */}
      <motion.div
        style={{ opacity: bgDarken }}
        className="pointer-events-none absolute inset-0 z-[1] bg-[#020408]"
      />
      {/* Top & bottom gentle darkening vignette */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[#02050b]/70 via-transparent to-[#020408]/90" />
      {/* Radial depth vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 35%, rgba(2, 5, 11, 0.55) 100%)",
        }}
      />
      {/* Seamless bottom transition gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-[#020408] via-[#020408]/75 to-transparent" />

      {/* =========================================================================
          LAYER 3: Very subtle atmospheric particles and light effects
          - Upward cyan platform illumination
          - Volumetric skylight downbeam
          - Ambient presence halo around the Core
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        {/* Floating atmospheric micro-particles */}
        <AtmosphericParticles />

        {/* Upward cyan illumination from circular platform base onto lower Core */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-opacity duration-700"
          style={{
            width: "clamp(360px, 46vw, 640px)",
            height: "clamp(140px, 20vh, 240px)",
            bottom: "clamp(12%, 18vh, 24%)",
            background:
              "radial-gradient(ellipse 65% 55% at 50% 90%, rgba(0, 225, 255, 0.28) 0%, rgba(0, 160, 255, 0.09) 45%, transparent 75%)",
            filter: "blur(22px)",
            opacity: isHovered ? 0.95 : 0.75,
          }}
        />

        {/* Soft volumetric light shaft connecting floor platform with the Core */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "clamp(340px, 42vw, 540px)",
            height: "clamp(220px, 30vh, 340px)",
            bottom: "clamp(12%, 18vh, 24%)",
            background:
              "radial-gradient(ellipse 60% 85% at 50% 100%, rgba(0, 220, 255, 0.18) 0%, rgba(0, 150, 255, 0.06) 55%, transparent 80%)",
            filter: "blur(28px)",
          }}
        />

        {/* Atmospheric presence glow centered around the Core */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{
            width: "clamp(480px, 58vw, 760px)",
            height: "clamp(480px, 58vw, 760px)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 215, 255, 0.09) 0%, rgba(15, 60, 110, 0.035) 45%, transparent 70%)",
            filter: "blur(32px)",
            opacity: isHovered ? 1 : 0.8,
          }}
        />

        {/* Skylight downlight from observatory dome aperture */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "clamp(280px, 34vw, 480px)",
            height: "40vh",
            background:
              "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(215, 245, 255, 0.12) 0%, rgba(140, 210, 255, 0.03) 60%, transparent 90%)",
            filter: "blur(26px)",
          }}
        />
      </div>

      {/* =========================================================================
          LAYER 4: The real interactive NeoBrainCore
          - Physically integrated into the empty circular platform
          - Floating slightly above the platform in 3D perspective
          - Desktop: 380–500px, Large desktop: 450–560px
          - Reacts to mouse movement, hover increases activity, click interacts
          ========================================================================= */}
      <motion.div
        style={{ y: coreY, scale: coreScale, opacity: coreOpacity }}
        className="pointer-events-none absolute inset-0 z-[10] flex items-center justify-center will-change-transform"
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="pointer-events-auto relative group cursor-pointer transition-transform duration-500 hover:scale-[1.03]"
          style={{
            width: "clamp(400px, 48vw, 640px)",
            height: "clamp(400px, 48vw, 640px)",
            maxWidth: "640px",
            maxHeight: "640px",
            transform: "scale(1.18)",
          }}
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
      </motion.div>

      {/* =========================================================================
          LAYER 5: Navigation and Typography
          - Placed above and around the Core
          - Core remains the undisputed visual focal point
          ========================================================================= */}
      <div className="pointer-events-none relative z-[20] mx-auto flex h-full w-full max-w-[1280px] flex-col justify-between px-6 pb-12 pt-24 sm:pt-28 md:pt-32">
        {/* UPPER TYPOGRAPHY (Above Core) */}
        <motion.div
          style={{ opacity: topTextFade, y: topTextY }}
          className="mx-auto flex flex-col items-center text-center will-change-transform"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-2.5 sm:mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.9)] animate-pulse" />
            <span className="text-[10.5px] sm:text-[11.5px] font-semibold tracking-[0.28em] text-cyan-300 uppercase">
              YOUR SECOND BRAIN
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-[46px] sm:text-[68px] md:text-[82px] lg:text-[94px] font-bold tracking-[-0.025em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70 drop-shadow-[0_4px_30px_rgba(0,180,255,0.18)]">
            NEOBRAIN
          </h1>
        </motion.div>

        {/* LOWER TYPOGRAPHY & CTAs (Below Core / Around Platform) */}
        <motion.div
          style={{ opacity: bottomTextFade, y: bottomTextY }}
          className="mx-auto flex flex-col items-center text-center will-change-transform"
        >
          {/* Supporting Line */}
          <div className="text-[13px] sm:text-[15px] md:text-[16px] font-medium tracking-[0.24em] uppercase text-cyan-200 drop-shadow-[0_2px_12px_rgba(0,217,255,0.25)]">
            Perceive. Remember. Connect.
          </div>

          {/* Secondary Text */}
          <p className="mt-2 text-[13.5px] sm:text-[15px] leading-relaxed text-neutral-300 max-w-[48ch] drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            An intelligent memory layer for everything you do.
          </p>

          {/* Action CTAs */}
          <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
              className="group relative inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-6 py-3 text-[13.5px] font-medium tracking-[0.04em] text-white shadow-[0_0_28px_rgba(0,217,255,0.3)] backdrop-blur-md transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_36px_rgba(0,217,255,0.45)] active:scale-95"
            >
              <span>Explore NeoBrain</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>

            <button
              onClick={() => navigate("/auth?returnTo=%2Fapp%2Fvoice")}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[13.5px] font-medium tracking-[0.04em] text-neutral-300 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
            >
              <PlayCircle size={15} className="text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
              <span>Watch the experience</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5 text-neutral-400">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- scroll story */

const STORY = [
  {
    key: "catch",
    eyebrow: "01 · Capture",
    title: "It listens when you let it",
    body:
      "Voice, text, camera, files or screen. NeoBrain captures what you choose and clearly shows when the microphone is active. Raw audio is off by default.",
    screen: <HomePreview />,
    accent: "cyan" as const,
  },
  {
    key: "understand",
    eyebrow: "02 · Understand",
    title: "Classification you can inspect",
    body:
      "Every capture runs through a visible pipeline: context → importance → memory decision. You review candidates and accept, edit or reject them.",
    screen: <VoicePreview label="Listening…" />,
    accent: "violet" as const,
  },
  {
    key: "retrieve",
    eyebrow: "03 · Retrieve",
    title: "Answers with their receipts",
    body:
      "Hybrid keyword and vector retrieval runs on device, so every answer lists the exact memories and files it came from.",
    screen: <AnswerPreview />,
    accent: "cyan" as const,
  },
  {
    key: "connect",
    eyebrow: "04 · Connect",
    title: "See how everything links",
    body:
      "Projects, tools, hardware and documents become a readable knowledge graph — not decoration, a way to find what you forgot you knew.",
    screen: <GraphPreview />,
    accent: "amber" as const,
  },
];

function ScrollStory() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(STORY.length - 1, Math.max(0, Math.floor(value * STORY.length + 0.0001)));
    setIndex((current) => (current === next ? current : next));
  });

  const active = STORY[index];

  return (
    <section ref={ref} className="relative h-[380vh]" id="how">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <TechLabel tone="cyan" className="mb-6">
              How NeoBrain works
            </TechLabel>
            <div className="space-y-7">
              {STORY.map((step, i) => {
                const isActive = i === index;
                return (
                  <div key={step.key} className="flex gap-5">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border transition-all duration-500 ${
                          isActive
                            ? "border-cyanx bg-cyanx shadow-[0_0_18px_rgba(0,217,255,0.95)]"
                            : "border-line-soft bg-ink-800"
                        }`}
                      />
                      {i < STORY.length - 1 ? (
                        <span className="mt-1.5 w-px flex-1 bg-gradient-to-b from-line-soft to-transparent" />
                      ) : null}
                    </div>
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0.42 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="pb-2"
                    >
                      <div className={`label mb-2 ${isActive ? "text-cyanx" : ""}`}>{step.eyebrow}</div>
                      <h3 className="text-[19px] font-semibold text-txt-primary sm:text-[22px]">{step.title}</h3>
                      <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-txt-secondary">{step.body}</p>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 max-w-[320px]">
              <div className="meter">
                <span style={{ width: `${((index + 1) / STORY.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="relative hidden justify-center lg:flex">
            <div
              className="pointer-events-none absolute inset-0 blur-3xl"
              style={{
                background:
                  active.accent === "violet"
                    ? "radial-gradient(50% 40% at 50% 45%, rgba(141,108,255,0.22), transparent 70%)"
                    : "radial-gradient(50% 40% at 50% 45%, rgba(0,217,255,0.22), transparent 70%)",
              }}
            />
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 26, rotateX: 6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[280px]"
            >
              <PhoneFrame>{active.screen}</PhoneFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- marquee */

function PrinciplesMarquee() {
  const items = ["Perceive", "Remember", "Connect", "Assist", "Evolve"];
  return (
    <section className="relative overflow-hidden border-y border-line-subtle py-6">
      <motion.div
        className="flex w-max gap-14 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-14">
            <span className="font-display text-[13px] uppercase tracking-[0.4em] text-txt-muted">{item}</span>
            <span className="h-1 w-1 rounded-full bg-cyanx/60" />
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- features */

const FEATURES = [
  {
    icon: Brain,
    title: "Always aware — on your terms",
    body: "Speech detection, periodic scanning and awareness are switches you own. Turn any of them off and NeoBrain stops immediately.",
  },
  {
    icon: Sparkles,
    title: "Understands context",
    body: "Captures are linked to the project, file or conversation they came from, so later answers point back to the real source.",
  },
  {
    icon: NotebookPen,
    title: "Remembers what matters",
    body: "A transparent classifier sorts noise from decisions, tasks and long-term knowledge. Nothing is stored without a visible reason.",
  },
  {
    icon: MonitorSmartphone,
    title: "Works across devices",
    body: "The phone captures; the laptop indexes and reasons. Pair them explicitly — nothing connects until you do.",
  },
  {
    icon: HardDrive,
    title: "Local by default",
    body: "Retrieval and classification run on device in this build. Remote providers exist in the architecture but are off until you enable them.",
  },
  {
    icon: Wand2,
    title: "Built for builders",
    body: "Ask about your own code, CAD revisions, datasets and decisions, and get an answer that cites the exact artefacts.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6">
        <Reveal>
          <TechLabel tone="cyan">More than an assistant</TechLabel>
          <h2 className="mt-4 max-w-[20ch] font-display text-[34px] font-semibold leading-[1.05] sm:text-[46px]">
            A memory that lives with you.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.05}>
                <article className="group relative h-full overflow-hidden rounded-xl border border-line-subtle bg-[linear-gradient(180deg,rgba(16,42,55,0.42)_0%,rgba(7,16,25,0.7)_100%)] p-6 transition-all duration-500 ease-premium hover:border-line-soft hover:shadow-panel">
                  <div
                    className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle, rgba(0,217,255,0.22), transparent 70%)" }}
                  />
                  <span className="relative grid h-11 w-11 place-items-center rounded-md border border-line-soft bg-ink-800/70 text-cyanx">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <h3 className="relative mt-5 text-[15.5px] font-semibold text-txt-primary">{feature.title}</h3>
                  <p className="relative mt-2.5 text-[13px] leading-relaxed text-txt-secondary">{feature.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- privacy */

const PRIVACY_DO = [
  "Local processing first — retrieval and classification run on device",
  "Raw audio off by default; transcripts only",
  "Explicit microphone state shown whenever input is active",
  "Edit, archive or permanently delete any memory",
  "Export your entire dataset as JSON whenever you want",
  "Retention rules per capture: session, 30 days or forever",
];

const PRIVACY_DONT = [
  { icon: CloudOff, text: "Silent cloud uploads" },
  { icon: Users, text: "Selling or sharing your data" },
  { icon: Fingerprint, text: "Cloud accounts you didn't ask for" },
  { icon: Camera, text: "Recording without an indicator" },
];

function PrivacySection() {
  return (
    <section id="privacy" className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <TechLabel tone="violet">Your data. Your device. Your rules.</TechLabel>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.05] sm:text-[44px]">
              Everything stays local.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[14px] leading-relaxed text-txt-secondary">
              NeoBrain is honest about its boundaries: this build has no language model running
              on-device, so it uses a labelled rule-based fallback. What it does guarantee is that your
              memories are stored here, and never leave without your explicit choice.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {["Local storage", "No telemetry", "Export anytime", "Delete anytime"].map((tag) => (
                <span key={tag} className="chip">
                  <Check size={12} className="text-greenx" />
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-2xl p-6 sm:p-7">
              <TechLabel tone="green">Privacy dashboard</TechLabel>
              <div className="mt-5 space-y-3.5">
                {PRIVACY_DO.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-greenx/40 bg-greenx/10">
                      <Check size={11} className="text-greenx" />
                    </span>
                    <span className="text-[13px] leading-relaxed text-txt-secondary">{item}</span>
                  </div>
                ))}
              </div>

              <div className="divider my-6" />

              <TechLabel tone="amber">Never in this product</TechLabel>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PRIVACY_DONT.map(({ text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xs border border-dangerx/25 bg-dangerx/10 text-dangerx">
                      <X size={12} />
                    </span>
                    <span className="text-[12.5px] text-txt-secondary">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- use cases */

const USE_CASES = [
  { icon: FlaskConical, label: "Students", body: "Notes, lectures, assignments — recalled by question.", accent: "text-cyanx" },
  { icon: Cpu, label: "Developers", body: "Code decisions, bugs, architecture choices.", accent: "text-bluex" },
  { icon: Search, label: "Researchers", body: "Papers, findings, experiment history.", accent: "text-violetx" },
  { icon: Users, label: "Professionals", body: "Meetings, tasks, follow-ups, client context.", accent: "text-amberx" },
  { icon: Sparkles, label: "Creators", body: "Ideas, references, content inspiration.", accent: "text-greenx" },
];

function UseCases() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6">
        <Reveal>
          <TechLabel tone="cyan">Built for real people</TechLabel>
          <h2 className="mt-4 max-w-[24ch] font-display text-[32px] font-semibold leading-[1.06] sm:text-[42px]">
            Different work. Same second brain.
          </h2>
        </Reveal>
        <div className="mt-11 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {USE_CASES.map((useCase, i) => {
            const Icon = useCase.icon;
            return (
              <Reveal key={useCase.label} delay={i * 0.05}>
                <div className="h-full rounded-lg border border-line-subtle bg-ink-850/40 p-5 transition-colors duration-400 hover:border-line-soft">
                  <Icon size={17} className={useCase.accent} strokeWidth={1.6} />
                  <div className="mt-4 text-[14px] font-semibold text-txt-primary">{useCase.label}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-txt-muted">{useCase.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- devices */

function DevicesSection() {
  return (
    <section id="devices" className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6">
        <Reveal className="text-center">
          <TechLabel tone="cyan">Connected devices</TechLabel>
          <h2 className="mx-auto mt-4 max-w-[22ch] font-display text-[32px] font-semibold leading-[1.06] sm:text-[42px]">
            Different devices. One mind.
          </h2>
          <p className="mx-auto mt-5 max-w-[54ch] text-[14px] leading-relaxed text-txt-secondary">
            The phone is the Pocket Brain: fast capture, voice and camera. The laptop is the Deep
            Brain: file indexing, longer memory and heavier retrieval.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <Reveal>
            <div className="relative mx-auto flex max-w-[520px] items-end justify-center gap-5">
              <PhoneFrame className="w-[38%] max-w-[180px]" label="Pocket Brain">
                <HomePreview />
              </PhoneFrame>
              <LaptopFrame className="w-[58%] max-w-[280px]">
                <WorkspacePreview />
              </LaptopFrame>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="panel space-y-4 p-6">
              {[
                {
                  icon: Smartphone,
                  name: "iQOO 15",
                  role: "Pocket Brain",
                  capabilities: "Microphone · Camera · Screen · Local ASR",
                  status: "Connected",
                  tone: "green" as const,
                },
                {
                  icon: Laptop,
                  name: "Laptop",
                  role: "Deep Brain",
                  capabilities: "File indexing · Long-term store · Retrieval",
                  status: "Syncing",
                  tone: "amber" as const,
                },
              ].map((device) => {
                const Icon = device.icon;
                return (
                  <div key={device.name} className="flex items-start gap-4 rounded-lg border border-line-subtle bg-ink-850/50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line-subtle bg-ink-800/70 text-cyanx">
                      <Icon size={17} strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[14px] font-semibold text-txt-primary">{device.name}</span>
                        <span className="label">{device.role}</span>
                      </div>
                      <div className="mt-1.5 text-[12px] text-txt-muted">{device.capabilities}</div>
                    </div>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusDot tone={device.tone} pulse />
                      <span className="text-[11px] text-txt-secondary">{device.status}</span>
                    </span>
                  </div>
                );
              })}

              <p className="pt-1 text-[12px] leading-relaxed text-txt-muted">
                Pairing is explicit. A device is never shown as connected until a real connection is
                established, and there are no unauthenticated endpoints in this design.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- knowledge */

function KnowledgeTeaser() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <TechLabel tone="amber">Knowledge graph</TechLabel>
            <h2 className="mt-4 max-w-[20ch] font-display text-[32px] font-semibold leading-[1.06] sm:text-[42px]">
              See how everything connects.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[14px] leading-relaxed text-txt-secondary">
              Projects, tools, hardware and documents are linked as you work. Open the graph to find
              the file you forgot, or the decision behind a design you're still using.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["SmartLine", "XGBoost", "Sensors", "CAD", "ESP32", "Bearing", "Firmware", "Dataset"].map((node) => (
                <span key={node} className="chip">
                  {node}
                </span>
              ))}
            </div>
            <Button
              className="mt-8"
              onClick={() => {
                window.location.assign("/auth?returnTo=%2Fapp%2Fknowledge");
              }}
            >
              <FileSearch size={16} />
              Explore the graph
            </Button>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="panel relative aspect-[4/3] overflow-hidden p-4">
              <div className="absolute inset-0 opacity-70">
                <GraphPreview />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- final CTA */

function FinalCta() {
  const navigate = useNavigate();
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="panel relative overflow-hidden px-6 py-16 text-center sm:px-14">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 h-80 blur-3xl"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(0,217,255,0.22), transparent 70%)" }}
          />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 opacity-40">
            <BrainCore state="responding" size={288} interactive={false} />
          </div>

          <TechLabel tone="cyan" className="relative">
            Start today
          </TechLabel>
          <h2 className="relative mt-4 font-display text-[34px] font-semibold leading-[1.04] sm:text-[50px]">
            Turn your everyday
            <br />
            into a second brain.
          </h2>
          <p className="relative mx-auto mt-5 max-w-[46ch] text-[14px] leading-relaxed text-txt-secondary">
            Built for what you build. Set up a local profile and explore the prototype — no account,
            no server, no upload.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Button variant="primary" className="h-12 px-6 text-[14px]" onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}>
              Get Started
              <ArrowRight size={17} />
            </Button>
            <Button className="h-12 px-6 text-[14px]" icon={Mic} onClick={() => navigate("/auth?returnTo=%2Fapp%2Fvoice")}>
              Try voice mode
            </Button>
          </div>
          <p className="relative mt-6 text-[11px] text-txt-muted">
            Same brain. More possibilities.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

function SiteFooter() {
  return (
    <footer className="relative border-t border-line-subtle py-14">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <NeoBrainWordmark size={13} />
            <p className="mt-4 max-w-[34ch] text-[12px] leading-relaxed text-txt-muted">
              A privacy-first personal memory assistant that understands your context and keeps your
              data on your devices.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              { title: "Product", links: ["Overview", "Voice mode", "Knowledge graph", "Devices"] },
              { title: "Privacy", links: ["Local first", "Retention", "Export data", "Delete all"] },
              { title: "Company", links: ["About", "Roadmap", "Contact"] },
            ].map((column) => (
              <div key={column.title}>
                <TechLabel>{column.title}</TechLabel>
                <ul className="mt-3.5 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <span className="cursor-default text-[12.5px] text-txt-secondary transition-colors hover:text-txt-primary">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider my-10" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <NeoBrainMark size={26} />
            <span className="text-[11px] text-txt-muted">Local / Private / Contextual / Always yours</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-label text-txt-muted">
            <span>NeoBrain</span>
            <span className="text-line-strong">×</span>
            <span className="font-display text-txt-secondary">iQOO 15</span>
            <span className="text-txt-muted">Built for thinkers, makers, doers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------- page */

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:border focus:border-cyanx/50 focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-[12px]"
      >
        Skip to content
      </a>
      <SiteNav />
      <main>
        <Hero />
        <PrinciplesMarquee />
        <ScrollStory />
        <Features />
        <PrivacySection />
        <UseCases />
        <DevicesSection />
        <KnowledgeTeaser />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
