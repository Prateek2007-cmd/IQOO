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
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainCore } from "../components/BrainCore";
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

function SiteNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  const links = [
    { href: "#product", label: "Product" },
    { href: "#features", label: "Features" },
    { href: "#privacy", label: "Privacy" },
    { href: "#devices", label: "Devices" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-line-subtle bg-ink-900/78 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-6 py-4" aria-label="Main">
        <NeoBrainWordmark as="link" size={12} />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[12.5px] font-medium text-txt-secondary transition-colors hover:text-txt-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth?returnTo=%2Fapp" className="btn btn-ghost h-9 px-3.5 text-[12.5px]">
            Sign in
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}
            className="hidden sm:inline-flex"
          >
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const coreY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const deviceY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-32 sm:pt-40" id="product">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div style={{ opacity: copyOpacity }}>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-line-soft bg-ink-850/60 px-3 py-1.5">
            <StatusDot tone="cyan" pulse />
            <span className="text-[10.5px] font-medium uppercase tracking-label text-txt-secondary">
              Privacy-first · Local by default
            </span>
          </div>

          <h1 className="mt-7 font-display text-[42px] font-semibold leading-[0.98] tracking-[-0.02em] sm:text-[62px] lg:text-[68px]">
            <span className="block text-txt-primary">YOUR SECOND</span>
            <span className="block text-txt-primary">BRAIN.</span>
            <span className="mt-1 block text-signal">ALWAYS WITH YOU.</span>
          </h1>

          <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-txt-secondary">
            NeoBrain is a private memory system that lives across your phone and laptop. It remembers
            your conversations, files and decisions, then answers questions about your own work — on
            your device.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" className="h-12 px-5 text-[14px]" onClick={() => navigate("/auth?returnTo=%2Fapp%2Fboot")}>
              Get Started
              <ArrowRight size={17} />
            </Button>
            <Button className="h-12 px-5 text-[14px]" icon={PlayCircle} onClick={() => navigate("/auth?returnTo=%2Fapp%2Fvoice")}>
              Watch demo
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {["LOCAL", "PRIVATE", "CONTEXTUAL", "ALWAYS YOURS"].map((principle) => (
              <span key={principle} className="flex items-center gap-2 text-[10px] uppercase tracking-label text-txt-muted">
                <span className="h-px w-4 bg-gradient-to-r from-cyanx/70 to-transparent" />
                {principle}
              </span>
            ))}
          </div>
        </motion.div>

        {/* cinematic device composition */}
        <motion.div style={{ y: deviceY, scale: stageScale }} className="relative">
          <motion.div style={{ y: coreY }} className="pointer-events-none absolute inset-0 grid place-items-center">
            <BrainCore state="ready" size={560} interactive={false} className="opacity-[0.85]" />
          </motion.div>

          {/* orbital rings */}
          <svg
            viewBox="0 0 600 600"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ring-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(0,217,255,0)" />
                <stop offset="50%" stopColor="rgba(0,217,255,0.5)" />
                <stop offset="100%" stopColor="rgba(141,108,255,0)" />
              </linearGradient>
            </defs>
            <ellipse cx="300" cy="300" rx="272" ry="88" fill="none" stroke="url(#ring-a)" strokeWidth="1" opacity="0.7" />
            <ellipse
              cx="300"
              cy="300"
              rx="212"
              ry="286"
              fill="none"
              stroke="rgba(141,108,255,0.22)"
              strokeWidth="0.8"
              transform="rotate(22 300 300)"
            />
          </svg>

          <div className="relative mx-auto w-full max-w-[560px]">
            <LaptopFrame className="relative z-10 mx-auto w-[92%] translate-y-6">
              <WorkspacePreview />
            </LaptopFrame>
            <PhoneFrame className="relative z-20 mx-auto -mt-[38%] w-[42%] max-w-[190px]">
              <VoicePreview label="Listening…" />
            </PhoneFrame>
          </div>

          {/* technical callouts */}
          <div className="pointer-events-none absolute left-0 top-[18%] hidden xl:block">
            <div className="glass-quiet rounded-md px-3 py-2.5">
              <TechLabel tone="cyan">Pocket Brain</TechLabel>
              <div className="mt-1 text-[12.5px] font-medium text-txt-primary">iQOO 15</div>
              <div className="text-[11px] text-txt-muted">On device</div>
            </div>
            <div className="ml-6 mt-3 h-14 w-px bg-gradient-to-b from-cyanx/50 to-transparent" />
          </div>

          <div className="pointer-events-none absolute bottom-[16%] right-0 hidden xl:block">
            <div className="h-14 w-px bg-gradient-to-b from-transparent to-violetx/50" />
            <div className="glass-quiet ml-[-42px] mt-3 rounded-md px-3 py-2.5">
              <TechLabel tone="violet">Deep Brain</TechLabel>
              <div className="mt-1 text-[12.5px] font-medium text-txt-primary">Laptop</div>
              <div className="text-[11px] text-txt-muted">Higher intelligence</div>
            </div>
          </div>
        </motion.div>
      </div>

      <Reveal delay={0.15} className="mx-auto mt-20 max-w-[1240px] px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-label text-txt-muted">
          <span>Perceive</span>
          <span className="text-line-strong">·</span>
          <span>Remember</span>
          <span className="text-line-strong">·</span>
          <span>Connect</span>
          <span className="text-line-strong">·</span>
          <span>Assist</span>
          <span className="text-line-strong">·</span>
          <span>Evolve</span>
        </div>
      </Reveal>
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
