import { useCallback, useState } from "react";
import { DevelopmentMockInferenceProvider, resolveInferenceProvider, runRetrieval, type RetrievalRun } from "./engine";
import { useBrain } from "./store";

/**
 * Shared question → answer flow used by Ask, Voice Mode and the quick actions.
 * Runs entirely on device and persists the answer so the Answer View can be
 * linked and reloaded.
 */
export function useAsk() {
  const brain = useBrain();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (question: string, projectId?: string): Promise<RetrievalRun | null> => {
      const trimmed = question.trim();
      if (!trimmed) return null;
      setBusy(true);
      setError(null);
      try {
        const provider = resolveInferenceProvider(brain.state.settings.privacy.cloudServices);
        const run = await runRetrieval({
          question: trimmed,
          memories: brain.state.memories.filter((memory) => !memory.deletedAt),
          sources: brain.state.sources,
          projects: brain.state.projects,
          provider,
          projectId,
        });
        brain.saveAnswer(run.answer);
        brain.logActivity({
          type: "insight",
          title: "Answer ready",
          detail: trimmed.length > 64 ? `${trimmed.slice(0, 61)}…` : trimmed,
          status: "done",
          projectId,
        });
        return run;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Retrieval failed. The development fallback is unavailable.";
        setError(message);
        // Fall back once, so the UI always has something honest to show.
        try {
          const run = await runRetrieval({
            question: trimmed,
            memories: brain.state.memories.filter((memory) => !memory.deletedAt),
            sources: brain.state.sources,
            projects: brain.state.projects,
            provider: DevelopmentMockInferenceProvider,
            projectId,
          });
          brain.saveAnswer(run.answer);
          return run;
        } catch {
          return null;
        }
      } finally {
        setBusy(false);
      }
    },
    [brain],
  );

  return { ask, busy, error };
}
