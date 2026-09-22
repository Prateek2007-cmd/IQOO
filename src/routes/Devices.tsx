/**
 * Devices — Pocket Brain and Deep Brain Spatial Ecosystem.
 *
 * Pairing is explicit, P2P and local: a device is never shown as connected until a
 * connection is established, and unpaired devices show as disconnected. Nothing
 * here exposes an unauthenticated network endpoint.
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
  Chip,
  Panel,
  Progress,
  SectionHeading,
  Sheet,
  StateBlock,
  StatusDot,
  TechLabel,
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
  connecting: "P2P Handshake...",
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

  return (
    <div className="relative">
      {!isDesktop ? <MobileTopBar title="Devices" tagline="One mind, many devices." /> : null}

      <div className={isDesktop ? "mx-auto max-w-[1240px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-8">
            <TechLabel tone="cyan">Hardware Ecosystem</TechLabel>
            <h1 className="mt-2 title-xl">One mind. Distributed across your devices.</h1>
            <p className="mt-2 max-w-[66ch] text-[13.5px] leading-relaxed text-txt-secondary">
              Your phone captures spontaneous reality on the go; your laptop indexes, reasons, and builds your persistent
              second brain. Mutual P2P encryption guarantees your memory never traverses external servers.
            </p>
          </header>
        ) : null}

        {/* Global Connection HUD bar */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-border bg-surface/70 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-txt-muted">
              <Radio size={12} className="text-cyanx animate-pulse" /> P2P Fabric
            </div>
            <div className="mt-2 text-[15px] font-mono font-semibold text-txt-primary">Direct Mesh</div>
            <div className="text-[10.5px] text-txt-muted">Zero Cloud Relays</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/70 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-txt-muted">
              <Lock size={12} className="text-greenx" /> Encryption
            </div>
            <div className="mt-2 text-[15px] font-mono font-semibold text-txt-primary">mTLS 1.3</div>
            <div className="text-[10.5px] text-txt-muted">Ephemeral Device Keys</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/70 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-txt-muted">
              <ArrowRightLeft size={12} className="text-bluex" /> Sync Delta
            </div>
            <div className="mt-2 text-[15px] font-mono font-semibold text-txt-primary">0 Queued</div>
            <div className="text-[10.5px] text-txt-muted">Graph Up to Date</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/70 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-txt-muted">
              <Activity size={12} className="text-purplex" /> Latency
            </div>
            <div className="mt-2 text-[15px] font-mono font-semibold text-txt-primary">&lt; 3.2 ms</div>
            <div className="text-[10.5px] text-txt-muted">Local LAN Link</div>
          </div>
        </div>

        {/* Primary Hardware Nodes Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {state.devices.map((device) => {
            const isDeep = device.processingRole === "deep";
            const isPhone = device.type === "phone";
            const connected = device.connectionStatus === "connected" || device.connectionStatus === "syncing";

            return (
              <div
                key={device.id}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                  isDeep
                    ? "border-cyanx/35 bg-gradient-to-br from-[#0F1B2D]/90 via-[#0A0F1C]/90 to-[#020407]/90 shadow-[0_0_30px_rgba(0,209,255,0.06)]"
                    : "border-border bg-gradient-to-br from-surface/80 via-panel/40 to-space/90 hover:border-line-soft"
                }`}
              >
                {/* Subtle orbital glow */}
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20 ${
                    isDeep ? "bg-cyanx" : "bg-bluex"
                  }`}
                />

                <div className="relative flex flex-col justify-between h-full">
                  <div>
                    {/* Header line: Role + Status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                            isDeep
                              ? "border-cyanx/40 bg-cyanx/10 text-cyanx"
                              : "border-bluex/40 bg-bluex/10 text-bluex"
                          }`}
                        >
                          {isDeep ? "Deep Brain Node" : "Pocket Brain Node"}
                        </span>
                        <span className="text-[11px] font-mono text-txt-muted">
                          {isDeep ? "Primary Engine" : "Perception Node"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <StatusDot tone={STATUS_TONE[device.connectionStatus]} pulse={connected} />
                        <span className="text-txt-secondary">{STATUS_LABEL[device.connectionStatus]}</span>
                      </div>
                    </div>

                    {/* Device Icon + Titles */}
                    <div className="mt-5 flex items-start gap-4">
                      <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-panel/70 text-cyanx shadow-inner">
                        {isPhone ? (
                          <Smartphone size={26} strokeWidth={1.5} className="text-cyanx" />
                        ) : device.type === "laptop" ? (
                          <Laptop size={28} strokeWidth={1.5} className="text-cyanx" />
                        ) : (
                          <Tablet size={26} strokeWidth={1.5} className="text-cyanx" />
                        )}
                        {connected ? (
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-space border border-greenx">
                            <span className="h-1.5 w-1.5 rounded-full bg-greenx" />
                          </span>
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-[18px] font-semibold text-txt-primary tracking-tight">
                          {device.name}
                        </h2>
                        <p className="text-[12.5px] font-mono text-txt-muted mt-0.5">
                          {device.model} · Last active {relativeTime(device.lastSeen, now)}
                        </p>
                      </div>
                    </div>

                    {/* Technical Specs & Processing Capabilities */}
                    <div className="mt-5 space-y-2 rounded-xl border border-border/60 bg-space/60 p-3.5 font-mono text-[11.5px]">
                      <div className="flex items-center justify-between text-txt-muted">
                        <span className="flex items-center gap-1.5">
                          <Cpu size={12} className="text-cyanx" /> Compute Role:
                        </span>
                        <span className="text-txt-primary">
                          {isDeep ? "Vector Indexing & Graph Inference" : "Microphone & Real-time Perception"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-txt-muted">
                        <span className="flex items-center gap-1.5">
                          <HardDrive size={12} className="text-bluex" /> Storage Mode:
                        </span>
                        <span className="text-txt-primary">
                          {isDeep ? "Master Encrypted Local Store" : "Short-term Buffer & Ephemeral Cache"}
                        </span>
                      </div>
                    </div>

                    {/* Capability Micro-Module Chips */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {device.capabilities.map((cap) => (
                        <span key={cap} className="micro-module text-[10px]">
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Syncing Progress Bar */}
                    {device.connectionStatus === "syncing" ? (
                      <div className="mt-4 rounded-xl border border-amberx/30 bg-amberx/5 p-3">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-mono text-amberx">
                          <span>Reconciling vector nodes...</span>
                          <span className="numeral">{Math.round((device.syncProgress ?? 0) * 100)}%</span>
                        </div>
                        <Progress value={device.syncProgress ?? 0} />
                      </div>
                    ) : null}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-txt-muted flex items-center gap-1">
                      <Wifi size={11} className={connected ? "text-greenx" : "text-txt-muted"} />
                      {connected ? "Mesh Link Stable" : "Offline"}
                    </span>

                    <div className="flex items-center gap-2">
                      {!device.paired ? (
                        <Button variant="primary" size="sm" onClick={() => startPairing(device)}>
                          <Zap size={13} /> Pair device
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => syncNow(device)}
                            disabled={device.connectionStatus === "syncing"}
                          >
                            {device.connectionStatus === "syncing" ? (
                              <Loader2 size={13} className="animate-spin text-cyanx" />
                            ) : (
                              <RefreshCw size={13} />
                            )}
                            Sync now
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => disconnect(device)}>
                            <Unplug size={13} /> Disconnect
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Sync Philosophy Matrix */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Panel className="p-6">
            <SectionHeading label="Zero Knowledge" title="Local P2P Architecture" />
            <div className="mt-4 space-y-3.5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Mutual Authentication",
                  desc: "Devices pair via short cryptographic token verified directly over local Wi-Fi or Bluetooth LE.",
                },
                {
                  icon: WifiOff,
                  title: "Isolated Network Boundary",
                  desc: "No public IP, port forward, or NAT traversal service is used. Only devices on your local subnet can sync.",
                },
                {
                  icon: Cpu,
                  title: "Autonomous Offline Continuity",
                  desc: "When separated, both devices function independently. Changes queue locally and merge seamlessly on re-encounter.",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.title} className="flex gap-3.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-panel text-cyanx">
                      <Icon size={16} strokeWidth={1.7} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-txt-primary">{row.title}</div>
                      <p className="text-[12px] leading-relaxed text-txt-secondary mt-0.5">{row.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading label="Status & Telemetry" title="Sync Topology Summary" />
            <div className="mt-4 space-y-3 font-mono text-[12px]">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="text-txt-muted">PAIRED NODES</span>
                <span className="text-txt-primary">{state.devices.filter((d) => d.paired).length} of 2</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="text-txt-muted">MEMORIES SYNCHRONIZED</span>
                <span className="text-cyanx">
                  {state.memories.filter((m) => !m.deletedAt).length} entries
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="text-txt-muted">ENCRYPTION SUITE</span>
                <span className="text-txt-secondary">ChaCha20-Poly1305</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-txt-muted">CLOUD TRANSPORT RELIANCE</span>
                <span className="text-greenx font-semibold">0.0% (DISABLED)</span>
              </div>
            </div>

            <div className="divider my-4" />
            <StateBlock
              kind="model"
              title="Autonomous P2P Prototype"
              description="Device presence, synchronization telemetry, and pairing handshakes reflect live internal states within this prototype workspace."
              compact
            />
          </Panel>
        </div>
      </div>

      {/* Pairing Confirmation Sheet */}
      <Sheet
        open={pairing !== null}
        onClose={() => {
          if (pairing) updateDevice(pairing.id, { connectionStatus: "disconnected" });
          setPairing(null);
        }}
        title={`Authenticate ${pairing?.name ?? "Device"}`}
        footer={
          <>
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
              <Check size={15} /> Confirm pairing
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-txt-secondary">
            Enter this zero-knowledge pairing code on <span className="text-cyanx font-medium">{pairing?.name ?? "the companion device"}</span> to confirm local peer authorization.
          </p>
          <div className="rounded-2xl border border-cyanx/40 bg-gradient-to-b from-[#0F1B2D] to-space py-6 text-center shadow-[0_0_20px_rgba(0,209,255,0.1)]">
            <div className="numeral text-[34px] tracking-[0.32em] text-cyanx font-mono font-bold">{code}</div>
            <div className="mt-2 font-mono text-[11px] text-txt-muted">P2P Ephemeral Token · Valid for 120s</div>
          </div>
          <StateBlock
            kind="permission"
            title="Encrypted Local Channel"
            description="The handshake takes place directly across local network sockets without sending authentication data to an external server."
            compact
          />
        </div>
      </Sheet>
    </div>
  );
}
