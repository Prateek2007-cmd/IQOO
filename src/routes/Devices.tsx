/**
 * Devices — Hardware Constellation & Local Mesh Network.
 *
 * Visualized as an encrypted device constellation with direct P2P mesh links,
 * real-time sync progress rings, and cryptographic status telemetry.
 */

import {
  Activity,
  ArrowRightLeft,
  Check,
  Cpu,
  HardDrive,
  Laptop,
  Loader2,
  Lock,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Unplug,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MobileTopBar } from "../components/Chrome";
import {
  Button,
  MicroRing,
  Panel,
  Sheet,
  StateBlock,
  StatusDot,
} from "../components/ui";
import { relativeTime } from "../lib/format";
import { useIsDesktop, useNow } from "../lib/hooks";
import { useBrain } from "../lib/store";
import type { Device, DeviceConnectionStatus } from "../lib/types";

const STATUS_TONE: Record<DeviceConnectionStatus, "cyan" | "green" | "amber" | "muted" | "danger"> = {
  connecting: "cyan",
  connected: "green",
  syncing: "amber",
  disconnected: "muted",
  "local-only": "cyan",
  "permission-required": "amber",
};

const STATUS_LABEL: Record<DeviceConnectionStatus, string> = {
  connecting: "P2P Handshake…",
  connected: "Online · Synced",
  syncing: "P2P Synchronizing",
  disconnected: "Offline",
  "local-only": "Local Storage Only",
  "permission-required": "Key Exchange Required",
};

export default function DevicesPage() {
  const isDesktop = useIsDesktop();
  const { state, updateDevice, logActivity } = useBrain();
  const now = useNow(15_000);
  const [pairing, setPairing] = useState<Device | null>(null);
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 899999)));

  /* Drive sync progress while a device reports "syncing" */
  const devicesRef = useRef(state.devices);
  devicesRef.current = state.devices;
  const updateRef = useRef(updateDevice);
  updateRef.current = updateDevice;
  const logRef = useRef(logActivity);
  logRef.current = logActivity;

  useEffect(() => {
    const handle = window.setInterval(() => {
      const syncing = devicesRef.current.filter((device) => device.connectionStatus === "syncing");
      if (syncing.length === 0) return;
      const updateDevice = updateRef.current;
      const logActivity = logRef.current;
      for (const device of syncing) {
        const next = Math.min(1, (device.syncProgress ?? 0) + 0.04);
        if (next >= 1) {
          updateDevice(device.id, {
            connectionStatus: "connected",
            syncProgress: 1,
            lastSeen: new Date().toISOString(),
          });
          logActivity({
            type: "context",
            title: "P2P Sync complete",
            detail: `${device.name} verified in sync with local memory graph`,
            status: "done",
          });
        } else {
          updateDevice(device.id, { syncProgress: next });
        }
      }
    }, 280);
    return () => window.clearInterval(handle);
  }, []);

  const startPairing = (device: Device) => {
    setPairing(device);
    updateDevice(device.id, { connectionStatus: "connecting" });
  };

  const confirmPairing = () => {
    if (!pairing) return;
    updateDevice(pairing.id, {
      paired: true,
      connectionStatus: "syncing",
      syncProgress: 0.05,
      lastSeen: new Date().toISOString(),
    });
    logActivity({
      type: "context",
      title: "Device paired",
      detail: `${pairing.name} · secure local tunnel established`,
      status: "done",
    });
    setPairing(null);
  };

  const disconnect = (device: Device) => {
    updateDevice(device.id, {
      paired: false,
      connectionStatus: "disconnected",
      syncProgress: 0,
    });
    logActivity({
      type: "context",
      title: "Device disconnected",
      detail: device.name,
      status: "idle",
    });
  };

  const syncNow = (device: Device) => {
    updateDevice(device.id, { connectionStatus: "syncing", syncProgress: 0.02 });
  };

  const bothPaired = state.devices.filter((d) => d.paired).length >= 2;

  return (
    <div className="relative min-h-screen text-[#E2E8F0]">
      {!isDesktop ? <MobileTopBar title="Devices" tagline="Constellation" /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1360px] px-8 py-8" : "px-4 pb-12 pt-4"}>
        {/* ── 1. Header ───────────────────────────────────────── */}
        {isDesktop ? (
          <header className="mb-6 flex items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                <Radio size={12} className="text-[#00D1FF]" />
                HARDWARE TOPOLOGY
              </div>
              <h1 className="mt-1.5 font-display text-[36px] font-bold text-white">
                One mind. Distributed across devices.
              </h1>
              <p className="mt-1 text-[13px] text-[#94A3B8]">
                Your phone perceives reality in real-time; your laptop indexes, reasons, and builds your persistent memory galaxy.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#10B981]">
              <Lock size={13} />
              <span>P2P Mutual TLS 1.3 Active</span>
            </div>
          </header>
        ) : null}

        {/* ── 2. Mesh Connection Visualizer Strip ─────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#64748B]">
              <Radio size={12} className="text-[#00D1FF]" /> P2P Mesh
            </div>
            <div className="mt-1.5 font-mono text-[16px] font-bold text-white">Direct Local Link</div>
            <div className="font-mono text-[10px] text-[#10B981]">Zero Cloud Relays</div>
          </div>

          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#64748B]">
              <Lock size={12} className="text-[#10B981]" /> Encryption
            </div>
            <div className="mt-1.5 font-mono text-[16px] font-bold text-white">ChaCha20-Poly1305</div>
            <div className="font-mono text-[10px] text-[#64748B]">Ephemeral Handshake</div>
          </div>

          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#64748B]">
              <ArrowRightLeft size={12} className="text-[#3882F6]" /> Sync State
            </div>
            <div className="mt-1.5 font-mono text-[16px] font-bold text-[#00D1FF]">
              {bothPaired ? "Harmonized" : "Local Standalone"}
            </div>
            <div className="font-mono text-[10px] text-[#64748B]">
              {state.memories.filter((m) => !m.deletedAt).length} synchronized
            </div>
          </div>

          <div className="rounded-2xl border border-[#334155]/40 bg-[#0B1320]/60 p-3.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#64748B]">
              <Activity size={12} className="text-[#885CF6]" /> LAN Latency
            </div>
            <div className="mt-1.5 font-mono text-[16px] font-bold text-white">&lt; 2.8 ms</div>
            <div className="font-mono text-[10px] text-[#64748B]">Subnet Broadcast</div>
          </div>
        </div>

        {/* ── 3. Constellation Node Cards ──────────────────────── */}
        <div className="relative mb-6 grid gap-6 lg:grid-cols-2">
          {state.devices.map((device) => {
            const isDeep = device.processingRole === "deep";
            const isPhone = device.type === "phone";
            const connected =
              device.connectionStatus === "connected" || device.connectionStatus === "syncing";

            return (
              <div
                key={device.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-6 backdrop-blur-2xl transition-all duration-300 ${
                  isDeep
                    ? "border-[#00D1FF]/40 bg-gradient-to-b from-[#0F1B2D]/90 via-[#0B1320]/90 to-[#020407]/90 shadow-[0_20px_50px_-20px_rgba(0,209,255,0.15)]"
                    : "border-[#334155]/50 bg-gradient-to-b from-[#0F1B2D]/60 via-[#0B1320]/60 to-[#020407]/80 hover:border-[#3882F6]/50 shadow-lg"
                }`}
              >
                {/* Glow backdrop */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-[70px] opacity-25"
                  style={{ backgroundColor: isDeep ? "#00D1FF" : "#3882F6" }}
                />

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          isDeep
                            ? "border-[#00D1FF]/40 bg-[#00D1FF]/10 text-[#00D1FF]"
                            : "border-[#3882F6]/40 bg-[#3882F6]/15 text-[#60A5FA]"
                        }`}
                      >
                        {isDeep ? "Deep Brain Node" : "Pocket Brain Node"}
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {isDeep ? "Heavy Reasoning & Graph" : "Real-time Perceiver"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <StatusDot tone={STATUS_TONE[device.connectionStatus]} pulse={connected} />
                      <span className="text-[#CBD5E1]">{STATUS_LABEL[device.connectionStatus]}</span>
                    </div>
                  </div>

                  {/* Device Header */}
                  <div className="mt-5 flex items-start gap-4">
                    <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#334155]/60 bg-[#020407] text-[#00D1FF] shadow-inner">
                      {isPhone ? (
                        <Smartphone size={26} strokeWidth={1.6} className="text-[#3882F6]" />
                      ) : device.type === "laptop" ? (
                        <Laptop size={28} strokeWidth={1.6} className="text-[#00D1FF]" />
                      ) : (
                        <Tablet size={26} strokeWidth={1.6} className="text-[#885CF6]" />
                      )}
                      {connected && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#10B981] bg-[#020407]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-[20px] font-bold text-white tracking-tight">
                        {device.name}
                      </h2>
                      <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                        {device.model} · Active {relativeTime(device.lastSeen, now)}
                      </p>
                    </div>

                    {/* Sync progress ring if syncing */}
                    {device.connectionStatus === "syncing" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <MicroRing
                          progress={device.syncProgress ?? 0.4}
                          size={36}
                          color="#F59E0B"
                        />
                        <span className="font-mono text-[11px] text-[#F59E0B]">
                          {Math.round((device.syncProgress ?? 0) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Technical Roles */}
                  <div className="mt-5 space-y-2 rounded-xl border border-[#334155]/40 bg-[#020407]/60 p-3.5 font-mono text-[11.5px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <Cpu size={12} className="text-[#00D1FF]" /> Compute Role:
                      </span>
                      <span className="text-[#E2E8F0]">
                        {isDeep ? "Vector Indexing & Graph Inference" : "Microphone & Low-Power Perception"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <HardDrive size={12} className="text-[#3882F6]" /> Storage:
                      </span>
                      <span className="text-[#E2E8F0]">
                        {isDeep ? "Master Encrypted Local Store" : "Ephemeral Circular Cache"}
                      </span>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {device.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full border border-[#334155]/50 bg-[#0B1320]/60 px-2.5 py-0.5 text-[#94A3B8]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-[#334155]/40 pt-4">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748B]">
                    <Wifi size={12} className={connected ? "text-[#10B981]" : "text-[#64748B]"} />
                    {connected ? "Mesh Connection Active" : "Standby Link"}
                  </span>

                  <div className="flex items-center gap-2">
                    {!device.paired ? (
                      <Button variant="primary" size="sm" onClick={() => startPairing(device)}>
                        <Zap size={13} /> Pair Device
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => syncNow(device)}
                          disabled={device.connectionStatus === "syncing"}
                          className="border-[#334155]/50 hover:border-[#00D1FF]/50"
                        >
                          {device.connectionStatus === "syncing" ? (
                            <Loader2 size={13} className="animate-spin text-[#00D1FF]" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                          Sync Now
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => disconnect(device)}
                          className="border-[#334155]/50 hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                        >
                          <Unplug size={13} /> Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 4. Cryptographic Security & Offline Continuity ──── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#334155]/40 bg-[#0B1320]/60 p-6 backdrop-blur-xl">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
              ✦ SOVEREIGN SECURITY
            </div>
            <h3 className="mt-1 font-display text-[18px] font-bold text-white">
              Zero-Knowledge Mesh Architecture
            </h3>

            <div className="mt-4 space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Mutual Device Authentication",
                  desc: "Devices pair via short ephemeral 6-digit cryptographic PIN verified directly over your local subnet.",
                },
                {
                  icon: WifiOff,
                  title: "Isolated Network Perimeter",
                  desc: "No public port forwards, turn servers, or external relays. All vector exchanges stay on your Wi-Fi.",
                },
                {
                  icon: Cpu,
                  title: "Autonomous Offline Continuity",
                  desc: "When traveling with your phone, captures queue locally and reconcile automatically upon returning to your Deep Brain workstation.",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.title} className="flex items-start gap-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#334155]/40 bg-[#020407] text-[#00D1FF]">
                      <Icon size={15} />
                    </span>
                    <div>
                      <div className="text-[13.5px] font-semibold text-white">{row.title}</div>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-[#94A3B8]">
                        {row.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#334155]/40 bg-[#0B1320]/60 p-6 backdrop-blur-xl">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
              ✦ TOPOLOGY TELEMETRY
            </div>
            <h3 className="mt-1 font-display text-[18px] font-bold text-white">
              Mesh Telemetry Summary
            </h3>

            <div className="mt-4 space-y-3 font-mono text-[12px]">
              <div className="flex items-center justify-between border-b border-[#334155]/30 pb-2.5">
                <span className="text-[#64748B]">PAIRED NODES</span>
                <span className="text-white font-semibold">
                  {state.devices.filter((d) => d.paired).length} of 2 Active
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#334155]/30 pb-2.5">
                <span className="text-[#64748B]">GRAPH MEMORIES SYNCHRONIZED</span>
                <span className="text-[#00D1FF] font-semibold">
                  {state.memories.filter((m) => !m.deletedAt).length} entries
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#334155]/30 pb-2.5">
                <span className="text-[#64748B]">ENCRYPTION CIPHER</span>
                <span className="text-[#E2E8F0]">ChaCha20-Poly1305</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">EXTERNAL CLOUD EXPOSURE</span>
                <span className="text-[#10B981] font-semibold">0.0% (STRICTLY PROHIBITED)</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#334155]/30 bg-[#020407]/50 p-3.5">
              <div className="text-[12px] font-medium text-white">Encrypted Handshake Protocol</div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
                Each device generates an isolated ED25519 keypair. Identity public keys are signed locally during first pairing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Pairing Sheet ─────────────────────────────────── */}
      <Sheet
        open={pairing !== null}
        onClose={() => {
          if (pairing) updateDevice(pairing.id, { connectionStatus: "disconnected" });
          setPairing(null);
        }}
        title={`Authenticate ${pairing?.name ?? "Device"}`}
        footer={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (pairing) updateDevice(pairing.id, { connectionStatus: "disconnected" });
                setPairing(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmPairing}>
              <Check size={14} /> Confirm Pairing
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-[#CBD5E1]">
            Enter this zero-knowledge verification code on{" "}
            <span className="text-[#00D1FF] font-medium">{pairing?.name ?? "the companion device"}</span>{" "}
            to authenticate mutual local access.
          </p>
          <div className="rounded-2xl border border-[#00D1FF]/40 bg-gradient-to-b from-[#0F1B2D] to-[#020407] py-6 text-center shadow-[0_0_25px_rgba(0,209,255,0.15)]">
            <div className="font-mono text-[36px] font-bold tracking-[0.32em] text-[#00D1FF]">
              {code}
            </div>
            <div className="mt-2 font-mono text-[10.5px] text-[#64748B]">
              P2P Ephemeral Token · Valid for 120s
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
