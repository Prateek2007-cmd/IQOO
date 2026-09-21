/**
 * Devices — Pocket Brain and Deep Brain.
 *
 * Pairing is explicit and local: a device is never shown as connected until a
 * connection is established, and unpaired devices show as disconnected. Nothing
 * here exposes a network endpoint.
 */

import {
  Check,
  Laptop,
  Loader2,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Tablet,
  Unplug,
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
  connecting: "Connecting",
  connected: "Connected",
  syncing: "Syncing",
  disconnected: "Disconnected",
  "local-only": "Local only",
  "permission-required": "Permission required",
};

const DEVICE_ICON = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
} as const;

export default function DevicesPage() {
  const isDesktop = useIsDesktop();
  const { state, updateDevice, logActivity } = useBrain();
  const now = useNow(15_000);
  const [pairing, setPairing] = useState<Device | null>(null);
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 899999)));

  /* Drive sync progress while a device reports "syncing".
     Reads from refs inside a single interval so store updates cannot cause the
     effect to re-subscribe on every tick. */
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
        const next = Math.min(1, (device.syncProgress ?? 0) + 0.02);
        if (next >= 1) {
          updateDevice(device.id, {
            connectionStatus: "connected",
            syncProgress: 1,
            lastSeen: new Date().toISOString(),
          });
          logActivity({
            type: "context",
            title: "Sync complete",
            detail: `${device.name} is up to date`,
            status: "done",
          });
        } else {
          updateDevice(device.id, { syncProgress: next });
        }
      }
    }, 320);
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
      detail: `${pairing.name} · local pairing confirmed`,
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

      <div className={isDesktop ? "mx-auto max-w-[1080px] px-8 py-8" : "px-5 pb-8 pt-5"}>
        {isDesktop ? (
          <header className="mb-6">
            <TechLabel tone="cyan">Devices</TechLabel>
            <h1 className="mt-2 title-xl">One mind, many devices.</h1>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-txt-secondary">
              The phone captures; the laptop indexes and reasons. Pairing happens locally and either
              side keeps working alone if the other is offline.
            </p>
          </header>
        ) : null}

        <div className="space-y-3">
          {state.devices.map((device) => {
            const Icon = DEVICE_ICON[device.type];
            const connected = device.connectionStatus === "connected" || device.connectionStatus === "syncing";
            return (
              <Panel key={device.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-line-subtle bg-ink-800/70 text-cyanx">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-[15px] font-semibold text-txt-primary">{device.name}</h2>
                      <Chip as="span" active={device.processingRole === "deep"}>
                        {device.processingRole === "deep" ? "Deep Brain" : "Pocket Brain"}
                      </Chip>
                      <span className="flex items-center gap-2">
                        <StatusDot tone={STATUS_TONE[device.connectionStatus]} pulse={connected} />
                        <span className="text-[11.5px] text-txt-secondary">
                          {STATUS_LABEL[device.connectionStatus]}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1.5 text-[12px] text-txt-muted">
                      {device.model} · last seen {relativeTime(device.lastSeen, now)}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {device.capabilities.map((capability) => (
                        <Chip key={capability} as="span">
                          {capability}
                        </Chip>
                      ))}
                    </div>

                    {device.connectionStatus === "syncing" ? (
                      <div className="mt-3.5 max-w-[420px]">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-txt-muted">
                          <span>Merging recent memories…</span>
                          <span className="numeral">{Math.round((device.syncProgress ?? 0) * 100)}%</span>
                        </div>
                        <Progress value={device.syncProgress ?? 0} />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!device.paired ? (
                      <Button variant="primary" size="sm" onClick={() => startPairing(device)}>
                        <Zap size={13} /> Pair device
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => syncNow(device)} disabled={device.connectionStatus === "syncing"}>
                          {device.connectionStatus === "syncing" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Zap size={13} />
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
              </Panel>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel className="p-5">
            <SectionHeading label="Security" title="How pairing works" />
            <div className="mt-3.5 space-y-3">
              {[
                { icon: ShieldCheck, text: "Pairing requires a short code shown on both devices." },
                { icon: WifiOff, text: "No network endpoint is exposed without authentication." },
                { icon: MonitorSmartphone, text: "Either device keeps working if the other disappears." },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.text} className="flex gap-3">
                    <Icon size={15} className="mt-0.5 shrink-0 text-cyanx" strokeWidth={1.7} />
                    <span className="text-[12.5px] leading-relaxed text-txt-secondary">{row.text}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHeading label="Status" title="Sync summary" />
            <div className="mt-3.5 space-y-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-txt-secondary">Paired devices</span>
                <span className="text-txt-primary">{state.devices.filter((d) => d.paired).length}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-txt-secondary">Items awaiting sync</span>
                <span className="text-txt-primary">
                  {state.memories.filter((memory) => !memory.deletedAt).length} memories
                </span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-txt-secondary">Offline behaviour</span>
                <span className="text-txt-primary">Local only</span>
              </div>
            </div>
            <div className="divider my-4" />
            <StateBlock
              kind="offline"
              title="Cross-device transport is not implemented in this build"
              description="The pairing model, states and sync progress above are real UI state. Moving data between a phone and laptop needs the device agent."
              compact
            />
          </Panel>
        </div>
      </div>

      <Sheet
        open={pairing !== null}
        onClose={() => {
          if (pairing) updateDevice(pairing.id, { connectionStatus: "disconnected" });
          setPairing(null);
        }}
        title={`Pair ${pairing?.name ?? "device"}`}
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
            Enter this code on {pairing?.name ?? "the other device"} to confirm it is really you.
          </p>
          <div className="rounded-lg border border-line-soft bg-ink-850/50 py-5 text-center">
            <div className="numeral text-[30px] tracking-[0.28em] text-cyanx">{code}</div>
            <div className="mt-2 text-[11px] text-txt-muted">Local pairing code · expires in 2 minutes</div>
          </div>
          <StateBlock
            kind="permission"
            title="Development pairing"
            description="This confirmation is local to the prototype. A production build verifies the code over an authenticated channel between the two devices."
            compact
          />
        </div>
      </Sheet>
    </div>
  );
}
