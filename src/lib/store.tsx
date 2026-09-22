/**
 * NeoBrain local store.
 *
 * The whole product state lives on this device. There is no server: every
 * mutation writes through to `localStorage` so a refresh keeps your data, and
 * the export/delete controls in Privacy operate on exactly this object.
 *
 * Reactive by design — Convex is not used here because NeoBrain is explicitly
 * local-first; nothing is uploaded.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityEvent,
  Answer,
  Conversation,
  Device,
  KnowledgeEdge,
  KnowledgeNode,
  Memory,
  Project,
  Settings,
  Source,
  Task,
} from "./types";
import { DEFAULT_SETTINGS, createSeedState } from "./seed";

const STORAGE_KEY = "neobrain.state.v1";
const SESSION_KEY = "neobrain.session.v1";

export interface Session {
  signedIn: boolean;
  name: string;
  startedAt: string;
  /** Local-only passphrase gate. Never sent anywhere. */
  localOnly: true;
}

export interface BrainState {
  version: number;
  projects: Project[];
  memories: Memory[];
  sources: Source[];
  tasks: Task[];
  devices: Device[];
  conversations: Conversation[];
  activity: ActivityEvent[];
  answers: Answer[];
  knowledge: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };
  settings: Settings;
}

function initialState(): BrainState {
  const seed = createSeedState();
  return { version: 1, ...seed };
}

function loadState(): BrainState {
  if (typeof localStorage === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as BrainState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.memories)) {
      return initialState();
    }
    // Merge-in any settings keys added after the user's last visit.
    return {
      ...parsed,
      settings: {
        awareness: { ...DEFAULT_SETTINGS.awareness, ...parsed.settings?.awareness },
        memory: { ...DEFAULT_SETTINGS.memory, ...parsed.settings?.memory },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.settings?.privacy },
        profile: { ...DEFAULT_SETTINGS.profile, ...parsed.settings?.profile },
        appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.settings?.appearance },
      },
    };
  } catch {
    return initialState();
  }
}

function loadSession(): Session {
  const empty: Session = {
    signedIn: false,
    name: "",
    startedAt: new Date().toISOString(),
    localOnly: true,
  };
  if (typeof localStorage === "undefined") return empty;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.signedIn ? { ...empty, ...parsed, localOnly: true } : empty;
  } catch {
    return empty;
  }
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export interface BrainApi {
  state: BrainState;
  session: Session;

  /* session */
  signIn: (name: string) => void;
  signOut: () => void;

  /* memory */
  createMemory: (input: Partial<Memory> & { title: string; content: string }) => Memory;
  updateMemory: (id: string, patch: Partial<Memory>) => void;
  softDeleteMemory: (id: string) => void;
  restoreMemory: (id: string) => void;
  purgeMemory: (id: string) => void;
  acceptCandidate: (id: string) => void;
  rejectCandidate: (id: string) => void;

  /* projects + tasks */
  createProject: (input: Partial<Project> & { name: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createTask: (input: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  /* sources */
  addSource: (input: Partial<Source> & { name: string; type: Source["type"] }) => Source;
  updateSource: (id: string, patch: Partial<Source>) => void;
  removeSource: (id: string) => void;

  /* conversations + answers */
  saveAnswer: (answer: Answer) => void;
  upsertConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;

  /* devices */
  updateDevice: (id: string, patch: Partial<Device>) => void;

  /* activity */
  logActivity: (event: Omit<ActivityEvent, "id" | "at"> & { at?: string }) => void;
  clearActivity: () => void;

  /* settings */
  updateSettings: (patch: DeepPartial<Settings>) => void;

  /* data control */
  exportJson: () => string;
  deleteAllMemories: () => void;
  resetToSeed: () => void;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const BrainContext = createContext<BrainApi | null>(null);

function mergeDeep<T extends object>(base: T, patch: DeepPartial<T>): T {
  const out = { ...base } as T;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value === undefined) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      out[key] = mergeDeep(base[key] as object, value as object) as T[keyof T];
    } else {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}

export function BrainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrainState>(() => loadState());
  const [session, setSession] = useState<Session>(() => loadSession());
  const stateRef = useRef(state);
  stateRef.current = state;

  /* Persist. Debounced through rAF-free microtask batching via timeout. */
  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* storage full or blocked — the app keeps working in memory */
      }
    }, 120);
    return () => window.clearTimeout(handle);
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }, [session]);

  const patchState = useCallback((fn: (current: BrainState) => BrainState) => {
    setState((current) => fn(current));
  }, []);

  const logActivity = useCallback<BrainApi["logActivity"]>(
    (event) =>
      patchState((current) => ({
        ...current,
        activity: [
          { id: uid("a"), at: event.at ?? new Date().toISOString(), ...event },
          ...current.activity,
        ].slice(0, 240),
      })),
    [patchState],
  );

  const api = useMemo<BrainApi>(() => {
    const now = () => new Date().toISOString();

    return {
      state,
      session,

      signIn: (name) =>
        setSession({
          signedIn: true,
          name: name.trim() || "Prateek",
          startedAt: now(),
          localOnly: true,
        }),
      signOut: () =>
        setSession({ signedIn: false, name: "", startedAt: now(), localOnly: true }),

      createMemory: (input) => {
        const memory: Memory = {
          id: uid("m"),
          title: input.title,
          content: input.content,
          category: input.category ?? "note",
          importance: input.importance ?? "useful",
          createdAt: input.createdAt ?? now(),
          updatedAt: now(),
          sourceReferences: input.sourceReferences ?? [],
          projectId: input.projectId,
          retentionType: input.retentionType ?? "30-days",
          status: input.status ?? "active",
          reason: input.reason,
        };
        patchState((current) => ({ ...current, memories: [memory, ...current.memories] }));
        return memory;
      },

      updateMemory: (id, patch) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.map((m) =>
            m.id === id ? { ...m, ...patch, updatedAt: now() } : m,
          ),
        })),

      softDeleteMemory: (id) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.map((m) =>
            m.id === id ? { ...m, deletedAt: now(), status: "archived", updatedAt: now() } : m,
          ),
        })),

      restoreMemory: (id) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.map((m) =>
            m.id === id ? { ...m, deletedAt: undefined, status: "active", updatedAt: now() } : m,
          ),
        })),

      purgeMemory: (id) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.filter((m) => m.id !== id),
          answers: current.answers.map((a) => ({
            ...a,
            relatedMemoryIds: a.relatedMemoryIds.filter((mid) => mid !== id),
          })),
        })),

      acceptCandidate: (id) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.map((m) =>
            m.id === id ? { ...m, status: "active", updatedAt: now() } : m,
          ),
        })),

      rejectCandidate: (id) =>
        patchState((current) => ({
          ...current,
          memories: current.memories.filter((m) => m.id !== id),
        })),

      createProject: (input) => {
        const project: Project = {
          id: uid("p"),
          name: input.name,
          description: input.description ?? "",
          createdAt: now(),
          updatedAt: now(),
          tags: input.tags ?? [],
          status: input.status ?? "active",
          accent: input.accent ?? "cyan",
        };
        patchState((current) => ({ ...current, projects: [project, ...current.projects] }));
        return project;
      },

      updateProject: (id, patch) =>
        patchState((current) => ({
          ...current,
          projects: current.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: now() } : p,
          ),
        })),

      deleteProject: (id) =>
        patchState((current) => ({
          ...current,
          projects: current.projects.filter((p) => p.id !== id),
          memories: current.memories.map((m) =>
            m.projectId === id ? { ...m, projectId: undefined } : m,
          ),
          tasks: current.tasks.filter((t) => t.projectId !== id),
          sources: current.sources.map((s) =>
            s.projectId === id ? { ...s, projectId: undefined } : s,
          ),
        })),

      createTask: (input) => {
        const task: Task = {
          id: uid("t"),
          title: input.title,
          description: input.description ?? "",
          status: input.status ?? "open",
          priority: input.priority ?? "medium",
          dueDate: input.dueDate,
          projectId: input.projectId,
          sourceMemoryId: input.sourceMemoryId,
          createdAt: now(),
          updatedAt: now(),
        };
        patchState((current) => ({ ...current, tasks: [task, ...current.tasks] }));
        return task;
      },

      updateTask: (id, patch) =>
        patchState((current) => ({
          ...current,
          tasks: current.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
        })),

      deleteTask: (id) =>
        patchState((current) => ({ ...current, tasks: current.tasks.filter((t) => t.id !== id) })),

      addSource: (input) => {
        const source: Source = {
          id: uid("s"),
          type: input.type,
          name: input.name,
          pathOrReference: input.pathOrReference ?? `local://${input.name}`,
          createdAt: now(),
          modifiedAt: now(),
          indexedAt: undefined,
          projectId: input.projectId,
          metadata: input.metadata ?? {},
          permissionStatus: input.permissionStatus ?? "granted",
          indexStatus: input.indexStatus ?? "queued",
          sizeKb: input.sizeKb,
        };
        patchState((current) => ({ ...current, sources: [source, ...current.sources] }));
        return source;
      },

      updateSource: (id, patch) =>
        patchState((current) => ({
          ...current,
          sources: current.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      removeSource: (id) =>
        patchState((current) => ({
          ...current,
          sources: current.sources.filter((s) => s.id !== id),
          memories: current.memories.map((m) =>
            m.sourceReferences.includes(id)
              ? { ...m, sourceReferences: m.sourceReferences.filter((r) => r !== id) }
              : m,
          ),
        })),

      saveAnswer: (answer) =>
        patchState((current) => ({
          ...current,
          answers: [answer, ...current.answers.filter((a) => a.id !== answer.id)].slice(0, 60),
        })),

      upsertConversation: (conversation) =>
        patchState((current) => ({
          ...current,
          conversations: [
            conversation,
            ...current.conversations.filter((c) => c.id !== conversation.id),
          ],
        })),

      deleteConversation: (id) =>
        patchState((current) => ({
          ...current,
          conversations: current.conversations.filter((c) => c.id !== id),
        })),

      updateDevice: (id, patch) =>
        patchState((current) => ({
          ...current,
          devices: current.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      logActivity,

      clearActivity: () => patchState((current) => ({ ...current, activity: [] })),

      updateSettings: (patch) =>
        patchState((current) => ({
          ...current,
          settings: mergeDeep(current.settings, patch),
        })),

      exportJson: () => JSON.stringify(stateRef.current, null, 2),

      deleteAllMemories: () =>
        patchState((current) => ({
          ...current,
          memories: [],
          answers: [],
          conversations: [],
        })),

      resetToSeed: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setState(initialState());
      },
    };
  }, [state, session, patchState, logActivity]);

  return <BrainContext.Provider value={api}>{children}</BrainContext.Provider>;
}

export function useBrain(): BrainApi {
  const ctx = useContext(BrainContext);
  if (!ctx) throw new Error("useBrain must be used inside <BrainProvider>");
  return ctx;
}

/* ------------------------------------------------------------- selectors */

export function useActiveMemories(): Memory[] {
  const { state } = useBrain();
  return useMemo(() => state.memories.filter((m) => !m.deletedAt), [state.memories]);
}

export function useCandidates(): Memory[] {
  const { state } = useBrain();
  return useMemo(
    () => state.memories.filter((m) => m.status === "candidate" && !m.deletedAt),
    [state.memories],
  );
}

export function useProject(id?: string): Project | undefined {
  const { state } = useBrain();
  return useMemo(() => state.projects.find((p) => p.id === id), [state.projects, id]);
}

export function useProjectMemories(projectId?: string): Memory[] {
  const { state } = useBrain();
  return useMemo(
    () => state.memories.filter((m) => !m.deletedAt && m.projectId === projectId),
    [state.memories, projectId],
  );
}

export function useSourceMap(): Record<string, Source> {
  const { state } = useBrain();
  return useMemo(
    () => Object.fromEntries(state.sources.map((s) => [s.id, s])),
    [state.sources],
  );
}

export function useCounts() {
  const { state } = useBrain();
  return useMemo(() => {
    const active = state.memories.filter((m) => !m.deletedAt);
    return {
      memories: active.length,
      memoriesToday: active.filter(
        (m) => Date.now() - new Date(m.createdAt).getTime() < 24 * 3600 * 1000,
      ).length,
      filesIndexed: state.sources.filter((s) => s.indexStatus === "indexed").length,
      filesTotal: state.sources.length,
      tasksPending: state.tasks.filter((t) => t.status !== "done").length,
      decisions: active.filter((m) => m.category === "decision").length,
      projects: state.projects.filter((p) => p.status === "active").length,
      knowledge: active.filter((m) => m.category === "knowledge").length,
      candidates: active.filter((m) => m.status === "candidate").length,
    };
  }, [state]);
}
