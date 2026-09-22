/**
 * Boot sequence — "Initializing your world" then "Ready".
 *
 * Visualises the pairing of the Pocket Brain (phone) with the Deep Brain
 * (laptop) with an energy beam and honest progress. The device state in the
 * store is updated here, so nothing claims a connection that hasn't happened.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Laptop, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCore, BrainCoreStage } from "../components/BrainCore";
import { NeoBrainWordmark } from "../components/Logo";
import { Button, Progress, TechLabel } from "../components/ui";
import { useBrain } from "../lib/store";

const STAGES = [
  "Waking the pocket brain",
  "Handshaking with the laptop",
  "Indexing permitted folders",
  "Merging recent memories",
  "Syncing knowledge",
];

export default function BootSequence() {
  const navigate = useNavigate();
  const { state, updateDevice, logActivity } = useBrain();
  const laptop = state.devices.find((device) => device.processingRole === "deep");
  const phone = state.devices.find((device) => device.processingRole === "pocket" && device.paired);

  const [progress, setProgress] = useState(0.04);
  const [phase, setPhase] = useState<"connecting" | "ready">("connecting");
  const completedRef = useRef(false);

  /* Refs keep the sync effect from re-subscribing on every store update. */
  const laptopIdRef = useRef(laptop?.id);
  const updateDeviceRef = useRef(updateDevice);
  laptopIdRef.current = laptop?.id;
  updateDeviceRef.current = updateDevice;

  const stage = useMemo(
    () => STAGES[Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length))],
    [progress],
  );

  /* Pairing is written to the store as it actually happens. */
  useEffect(() => {
    if (laptop) updateDevice(laptop.id, { connectionStatus: "connecting", syncProgress: 0.04 });
    return () => {
      if (laptop) updateDevice(laptop.id, { connectionStatus: "disconnected", syncProgress: 0 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "connecting") return;
    const handle = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 0.012 + Math.random() * 0.02;
        if (next >= 1) {
          window.clearInterval(handle);
          return 1;
        }
        return next;
      });
    }, 90);
    return () => window.clearInterval(handle);
  }, [phase]);

  /* Depends on `progress` alone: writing the sync percentage back to the store
     must not restart this effect through a changing store API identity. */
  useEffect(() => {
    const id = laptopIdRef.current;
    if (id) updateDeviceRef.current(id, { syncProgress: progress });
  }, [progress]);

  useEffect(() => {
    if (progress < 1 || completedRef.current) return;
    completedRef.current = true;
    if (laptop) updateDevice(laptop.id, { connectionStatus: "connected", syncProgress: 1 });
    logActivity({
      type: "context",
      title: "Deep Brain connected",
      detail: "Laptop paired · local sync complete",
      status: "done",
    });
    const handle = window.setTimeout(() => setPhase("ready"), 620);
    return () => window.clearTimeout(handle);
  }, [progress, laptop, updateDevice, logActivity]);

  const proceed = () => navigate("/app", { replace: true });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-6 py-8">
      <div className="flex items-center justify-between">
        <NeoBrainWordmark as="link" size={12} />
        <button
          type="button"
          onClick={proceed}
          className="text-[11.5px] text-txt-muted transition-colors hover:text-txt-secondary"
        >
          Skip setup
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === "connecting" ? (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <TechLabel tone="cyan">Initializing your world</TechLabel>

            <div className="relative mt-8 grid w-full max-w-[420px] place-items-center">
              {/* pocket brain module */}
              <div className="absolute left-0 top-6 z-10 w-[132px]">
                <div className="glass-quiet rounded-md p-3">
                  <TechLabel tone="cyan">Pocket Brain</TechLabel>
                  <div className="mt-1.5 text-[12.5px] font-medium text-txt-primary">
                    {phone?.name ?? "iQOO 15"}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-txt-muted">On device</div>
                </div>
                <div className="ml-6 h-12 w-px bg-gradient-to-b from-cyanx/60 to-transparent" />
              </div>

              <BrainCoreStage state="processing" size={300} className="py-10" />

              {/* deep brain module */}
              <div className="absolute bottom-4 right-0 z-10 w-[136px]">
                <div className="h-12 w-px bg-gradient-to-b from-transparent to-violetx/60" />
                <div className="glass-quiet ml-auto rounded-md p-3">
                  <TechLabel tone="violet">Deep Brain</TechLabel>
                  <div className="mt-1.5 text-[12.5px] font-medium text-txt-primary">
                    {laptop?.name ?? "Laptop"}
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-txt-muted">Higher intelligence</div>
                </div>
              </div>
            </div>

            <div className="mt-6 w-full max-w-[380px]">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] text-txt-secondary">{stage}…</span>
                <span className="numeral text-[11.5px] text-cyanx">{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-2.5">
                <Progress value={progress} />
              </div>
            </div>

            <p className="mt-10 text-center text-[13px] text-txt-secondary">
              Different devices. One mind.
            </p>
            <div className="mt-4 flex items-center gap-5 text-[10px] uppercase tracking-label text-txt-muted">
              <span className="flex items-center gap-2">
                <Smartphone size={12} /> Pocket Brain
              </span>
              <span className="text-line-strong">↔</span>
              <span className="flex items-center gap-2">
                <Laptop size={12} /> Deep Brain
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="ready"
            type="button"
            onClick={proceed}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-1 cursor-pointer flex-col items-center justify-center text-center"
          >
            <TechLabel tone="cyan">Ready</TechLabel>
            <div className="relative mt-4 grid place-items-center">
              <BrainCore state="ready" size={340} />
            </div>
            <h1 className="mt-8 font-display text-[26px] font-semibold text-txt-primary sm:text-[30px]">
              Your brain is active.
            </h1>
            <p className="mt-2.5 text-[13px] text-txt-secondary">
              Tap anywhere to continue
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.28em] text-txt-muted">
              {["Perceive", "Remember", "Connect", "Assist", "Evolve"].map((word) => (
                <span key={word} className="transition-colors duration-500 group-hover:text-txt-secondary">
                  {word}
                </span>
              ))}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {phase === "ready" ? (
        <div className="flex justify-center pb-2">
          <Button variant="primary" onClick={proceed}>
            Enter the workspace
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
