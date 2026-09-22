import { Suspense, lazy, useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/Chrome";
import { AmbientBackground } from "./components/Ambient";
import { NeoBrainWordmark } from "./components/Logo";
import { BrainCore } from "./components/BrainCore";
import { useBrain } from "./lib/store";

/* Public entry points stay in the initial bundle. */
import Landing from "./routes/Landing";
import Auth from "./routes/Auth";

/* The workspace is code-split so the public site loads fast. */
const BootSequence = lazy(() => import("./routes/Boot"));
const Overview = lazy(() => import("./routes/Overview"));
const Ask = lazy(() => import("./routes/Ask"));
const BrainConsole = lazy(() => import("./routes/BrainConsole"));
const VoiceMode = lazy(() => import("./routes/VoiceMode"));
const AnswerView = lazy(() => import("./routes/AnswerView"));
const ActivityPage = lazy(() => import("./routes/Activity"));
const MemoryPage = lazy(() => import("./routes/Memory"));
const ProjectsPage = lazy(() => import("./routes/Projects"));
const ProjectDetail = lazy(() => import("./routes/ProjectDetail"));
const KnowledgePage = lazy(() => import("./routes/Knowledge"));
const DevicesPage = lazy(() => import("./routes/Devices"));
const PrivacyPage = lazy(() => import("./routes/Privacy"));
const SettingsPage = lazy(() => import("./routes/Settings"));
const MorePage = lazy(() => import("./routes/More"));

/** Shown while a workspace chunk loads. */
function WorkspaceFallback() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <BrainCore state="processing" size={180} interactive={false} />
        <NeoBrainWordmark size={11} className="mt-6" />
        <p className="mt-3 text-[12px] text-txt-muted">Loading your workspace…</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/**
 * Local profile gate.
 *
 * NeoBrain has no accounts and no server. This guards the workspace behind the
 * on-device profile created at `/auth`, and preserves the requested path so the
 * user lands where they intended.
 */
/** Applies the user's appearance overrides to the document root. */
function AppearanceBridge() {
  const { state } = useBrain();
  const { reducedMotion, compactDensity } = state.settings.appearance;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("force-reduce", reducedMotion === true);
    root.classList.toggle("compact", compactDensity);
  }, [reducedMotion, compactDensity]);

  return null;
}

function RequireProfile() {
  const { session } = useBrain();
  const location = useLocation();

  if (!session.signedIn) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <>
      <AmbientBackground />
      <AppearanceBridge />
      <ScrollToTop />
      <Suspense fallback={<WorkspaceFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route element={<RequireProfile />}>
          <Route path="/app/boot" element={<BootSequence />} />
          <Route path="/app/voice" element={<VoiceMode />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="ask" element={<Ask />} />
            <Route path="brain" element={<BrainConsole />} />
            <Route path="answer/:id" element={<AnswerView />} />
            <Route path="activity" element={<ActivityPage mode="live" />} />
            <Route path="timeline" element={<ActivityPage mode="timeline" />} />
            <Route path="memory" element={<MemoryPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="more" element={<MorePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}
