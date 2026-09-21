import { useCallback, useEffect, useRef, useState } from "react";

/** Tailwind-aligned breakpoint query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Desktop = the workspace layout (sidebar rail), not a stretched phone screen. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useReducedMotionPreference(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Re-renders on an interval — used for live clocks and “x min ago” labels. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(handle);
  }, [intervalMs]);
  return now;
}

export interface MicMeter {
  /**
   * Real audio level 0–1 when a stream is attached, otherwise a simulated level.
   * React state, throttled to ~10 fps so consumers can show text/tints cheaply.
   */
  level: number;
  /** Full-rate level for canvas consumers — read inside your own frame loop. */
  levelRef: { current: number };
  mode: "live" | "simulated";
  error: string | null;
  active: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Microphone level meter.
 *
 * Tries a real `getUserMedia` stream + AnalyserNode. If permission is denied or
 * unavailable we transparently fall back to a simulated signal and say so. The
 * stream is always torn down on stop — audio is never recorded or stored.
 */
export function useMicLevel(simulated = true): MicMeter {
  const [level, setLevel] = useState(0);
  const [mode, setMode] = useState<"live" | "simulated">("simulated");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const levelRef = useRef(0);
  const lastPublished = useRef(0);
  const publish = (value: number) => {
    levelRef.current = value;
    const now = performance.now();
    if (now - lastPublished.current > 100) {
      lastPublished.current = now;
      setLevel(value);
    }
  };

  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    setActive(false);
    levelRef.current = 0;
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setActive(true);

    const beginSimulation = () => {
      setMode("simulated");
      const startedAt = performance.now();
      const tick = () => {
        const t = (performance.now() - startedAt) / 1000;
        const wave =
          0.42 +
          0.26 * Math.sin(t * 2.4) +
          0.16 * Math.sin(t * 7.1 + 1.2) +
          0.12 * Math.sin(t * 13.7);
        publish(Math.min(1, Math.max(0.08, wave)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    };

    if (!navigator.mediaDevices?.getUserMedia || !simulated) {
      if (!simulated) {
        setError("Microphone capture is not available in this environment.");
        setActive(false);
        return;
      }
      beginSimulation();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) throw new Error("AudioContext unavailable");
      const ctx = new AudioCtor();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setMode("live");

      const tick = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) sum += buffer[i];
        const avg = sum / buffer.length / 255;
        publish(Math.min(1, Math.max(0.06, avg * 2.6)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      const message =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone permission was denied."
          : "The microphone could not be opened.";
      setError(message);
      beginSimulation();
    }
  }, [simulated]);

  useEffect(() => teardown, [teardown]);

  return { level, levelRef, mode, error, active, start, stop: teardown };
}

/** Detects whether WebGL is usable, for the 3D fallback path. */
export function useWebglSupport(): boolean {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}
