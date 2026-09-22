import { ArrowRight, HardDrive, Lock, Mic, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BrainCoreStage } from "../components/BrainCore";
import { NeoBrainWordmark } from "../components/Logo";
import { Button } from "../components/ui";
import { useBrain } from "../lib/store";

/**
 * Local profile gate.
 *
 * There is deliberately no password, email or server here — and the copy says
 * exactly that. The profile exists so the workspace has a name to greet and so
 * the "returnTo" redirect has an auth boundary; it is stored on-device only.
 */
export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, session } = useBrain();
  const [name, setName] = useState(session.name || "");
  const [acknowledged, setAcknowledged] = useState(true);
  const [busy, setBusy] = useState(false);

  const returnTo = useMemo(() => {
    const raw = params.get("returnTo");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/app/boot";
    return raw;
  }, [params]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    signIn(name);
    window.setTimeout(() => {
      setBusy(false);
      navigate(returnTo, { replace: true });
    }, 220);
  };

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1240px] grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        {/* brand side */}
        <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-12 lg:flex">
          <NeoBrainWordmark as="link" size={13} tagline />
          <div className="relative flex flex-1 items-center justify-center">
            <BrainCoreStage state="ready" size={380} />
          </div>
          <div className="max-w-[46ch]">
            <div className="label mb-3">Local / Private / Contextual / Always yours</div>
            <p className="text-[13.5px] leading-relaxed text-txt-secondary">
              NeoBrain keeps your memories on your own devices. This prototype runs entirely in your
              browser — no server, no uploads, no telemetry.
            </p>
          </div>
        </div>

        {/* form side */}
        <div className="flex items-center justify-center px-6 py-14 lg:px-12">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden">
              <NeoBrainWordmark as="link" size={13} tagline />
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="label mb-3">Step 1 · Local profile</div>
              <h1 className="title-lg">Set up this device</h1>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-txt-secondary">
                Your profile lives on this device only. You can delete everything from Privacy at any
                time.
              </p>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="profile-name" className="label mb-2 block">
                  What should NeoBrain call you?
                </label>
                <input
                  id="profile-name"
                  className="input"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <ul className="space-y-3 rounded-xl border border-line-subtle bg-ink-850/40 p-4">
                {[
                  { icon: HardDrive, text: "Memories are stored in this browser's local storage." },
                  { icon: Lock, text: "No account, no password, nothing sent to a server." },
                  { icon: Mic, text: "Microphone access is requested only when you start voice mode." },
                  { icon: ShieldCheck, text: "Cloud services stay off until you turn them on yourself." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3">
                    <Icon size={15} className="mt-0.5 shrink-0 text-cyanx" strokeWidth={1.7} />
                    <span className="text-[12.5px] leading-relaxed text-txt-secondary">{text}</span>
                  </li>
                ))}
              </ul>

              <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-txt-secondary">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-cyanx"
                />
                I understand this workspace keeps my data on this device.
              </label>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!acknowledged || busy}
                loading={busy}
              >
                Enter NeoBrain
                <ArrowRight size={16} />
              </Button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-center text-[12px] text-txt-muted transition-colors hover:text-txt-secondary"
              >
                Back to the overview
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
