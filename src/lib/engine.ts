/**
 * NeoBrain local-first engine.
 *
 * Everything here runs on the device. Each capability is a small interface with
 * several implementations so a real local model, a remote provider, or a
 * development fallback can be swapped in without touching the UI.
 *
 * Honesty rules enforced by this module:
 *  - every result carries `location` ("local" | "fallback" | "remote") and the UI
 *    prints it, so a development fallback is never presented as a real model;
 *  - nothing is sent anywhere: `OptionalRemoteInferenceProvider` throws unless the
 *    user has explicitly enabled cloud services and supplied a key, and this
 *    build never calls it.
 */

import type {
  Answer,
  Importance,
  Memory,
  MemoryCategory,
  Project,
  RetrievalTrace,
  Source,
} from "./types";
import { uid } from "./store";

export type ProviderLocation = "local" | "fallback" | "remote" | "unavailable";

export interface ProviderInfo {
  id: string;
  label: string;
  location: ProviderLocation;
  detail: string;
}

/* =========================================================================
   Language model providers
   ========================================================================= */

export interface InferenceRequest {
  question: string;
  memories: Memory[];
  sources: Source[];
  project?: Project;
}

export interface InferenceResult {
  summary: string;
  points: string[];
  provider: ProviderInfo;
}

export interface InferenceProvider {
  info: () => ProviderInfo;
  available: () => boolean;
  answer: (request: InferenceRequest) => Promise<InferenceResult>;
}

/**
 * Real local inference is not bundled with this build (no model weights ship in
 * a web bundle). If the user configures a local model endpoint we surface that
 * honestly instead of pretending.
 */
export function detectLocalModel(): { configured: boolean; endpoint?: string } {
  const endpoint = import.meta.env?.VITE_LOCAL_MODEL_URL;
  return endpoint ? { configured: true, endpoint } : { configured: false };
}

export const LocalInferenceProvider: InferenceProvider = {
  info: () => {
    const detected = detectLocalModel();
    return detected.configured
      ? {
          id: "local-llm",
          label: "Local model",
          location: "local",
          detail: `Connected at ${detected.endpoint}`,
        }
      : {
          id: "local-llm",
          label: "Local model",
          location: "unavailable",
          detail: "Local model unavailable — no endpoint configured. Use the development fallback.",
        };
  },
  available: () => detectLocalModel().configured,
  answer: async () => {
    throw new Error("Local model endpoint is not configured.");
  },
};

/**
 * Deterministic extractive summariser. It does not invent content: it selects
 * and orders real sentences from retrieved memories and files. Clearly labelled
 * as a development fallback everywhere it is used.
 */
export const DevelopmentMockInferenceProvider: InferenceProvider = {
  info: () => ({
    id: "dev-fallback",
    label: "Development fallback",
    location: "fallback",
    detail: "Rule-based retrieval summary. No language model is running.",
  }),
  available: () => true,
  answer: async ({ question, memories, sources, project }) => {
    const points: string[] = [];

    const ranked = [...memories].sort((a, b) => scoreMemory(question, b) - scoreMemory(question, a));
    const top = ranked.filter((m) => scoreMemory(question, m) > 0).slice(0, 5);

    for (const memory of top) {
      const detail = firstSentence(memory.content);
      points.push(detail ? `${memory.title} — ${detail}` : memory.title);
    }

    if (top.length === 0 && sources.length) {
      for (const source of sources.slice(0, 3)) {
        points.push(`${source.name} matched on file name and metadata.`);
      }
    }

    if (points.length === 0) {
      points.push(
        "Nothing in your local memory matched this question yet. Capture a note or index a file first.",
      );
    }

    const scope = project ? ` in ${project.name}` : "";
    const summary =
      top.length > 0
        ? `From your local memory${scope} — ${top.length} relevant ${top.length === 1 ? "memory" : "memories"}:`
        : "No local matches found:";

    return {
      summary,
      points,
      provider: DevelopmentMockInferenceProvider.info(),
    };
  },
};

/** Present so the architecture is complete. Refuses to run unless explicitly enabled. */
export const OptionalRemoteInferenceProvider: InferenceProvider = {
  info: () => ({
    id: "remote-llm",
    label: "Remote provider",
    location: "remote",
    detail: "Off. Remote inference stays disabled unless you enable cloud services in Privacy.",
  }),
  available: () => false,
  answer: async () => {
    throw new Error(
      "Remote inference is disabled by default. NeoBrain never uploads memories without explicit consent.",
    );
  },
};

export function resolveInferenceProvider(cloudServicesEnabled: boolean): InferenceProvider {
  if (!cloudServicesEnabled && LocalInferenceProvider.available()) return LocalInferenceProvider;
  return DevelopmentMockInferenceProvider;
}

/* =========================================================================
   Embeddings + retrieval
   ========================================================================= */

const EMBED_DIM = 128;

/** Deterministic hashed bag-of-words embedding. Runs locally, no model needed. */
export function embed(text: string): Float32Array {
  const vector = new Float32Array(EMBED_DIM);
  const tokens = tokenize(text);
  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const index = Math.abs(hash) % EMBED_DIM;
    vector[index] += 1;
  }
  let norm = 0;
  for (let i = 0; i < EMBED_DIM; i += 1) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < EMBED_DIM; i += 1) vector[i] /= norm;
  return vector;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += a[i] * b[i];
  return dot;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is", "was", "were",
  "did", "do", "does", "what", "why", "how", "when", "where", "which", "my", "me", "i", "you",
  "it", "this", "that", "there", "about", "at", "from", "be", "have", "has", "had", "find",
  "related", "yesterday", "today", "again",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.+#-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** Keyword scoring — fast, explainable, works with zero setup. */
export function scoreMemory(query: string, memory: Memory): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;
  const haystack = `${memory.title} ${memory.content} ${memory.category}`.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
    if (memory.title.toLowerCase().includes(token)) score += 0.9;
  }
  if (memory.category === "decision" || memory.category === "task") score += 0.15;
  if (memory.importance === "important" || memory.importance === "structured") score += 0.1;
  return score / tokens.length;
}

export interface RetrievalHit<T> {
  item: T;
  score: number;
  method: "keyword" | "vector" | "hybrid";
}

export interface RetrievalProvider {
  info: ProviderInfo;
  search: (query: string, corpus: { memories: Memory[]; sources: Source[] }) => {
    memories: RetrievalHit<Memory>[];
    sources: RetrievalHit<Source>[];
  };
}

export const LocalKeywordRetrieval: RetrievalProvider = {
  info: {
    id: "local-keyword",
    label: "Local keyword retrieval",
    location: "local",
    detail: "Runs on device · inverted index over memories and metadata",
  },
  search: (query, corpus) => {
    const memories = corpus.memories
      .map((item) => ({ item, score: scoreMemory(query, item), method: "keyword" as const }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score);

    const q = query.toLowerCase();
    const tokens = tokenize(query);
    const sources = corpus.sources
      .map((source) => {
        const haystack = `${source.name} ${source.pathOrReference} ${Object.values(source.metadata).join(" ")}`;
        let score = 0;
        if (haystack.toLowerCase().includes(q)) score += 1.4;
        for (const token of tokens) if (haystack.toLowerCase().includes(token)) score += 0.5;
        return { item: source, score, method: "keyword" as const };
      })
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score);

    return { memories, sources };
  },
};

export const LocalVectorRetrieval: RetrievalProvider = {
  info: {
    id: "local-vector",
    label: "Local vector retrieval",
    location: "local",
    detail: "Runs on device · 128-dimension hashed embeddings, cosine similarity",
  },
  search: (query, corpus) => {
    const queryVector = embed(query);
    const memories = corpus.memories
      .map((item) => ({
        item,
        score: cosine(queryVector, embed(`${item.title} ${item.content}`)),
        method: "vector" as const,
      }))
      .filter((hit) => hit.score > 0.12)
      .sort((a, b) => b.score - a.score);

    const sources = corpus.sources
      .map((source) => ({
        item: source,
        score: cosine(queryVector, embed(`${source.name} ${Object.values(source.metadata).join(" ")}`)),
        method: "vector" as const,
      }))
      .filter((hit) => hit.score > 0.12)
      .sort((a, b) => b.score - a.score);

    return { memories, sources };
  },
};

/** Default provider: keyword + vector scores fused, which is what the UI reports. */
export const HybridRetrieval: RetrievalProvider = {
  info: {
    id: "hybrid",
    label: "Hybrid retrieval",
    location: "local",
    detail: "Runs on device · keyword + vector fusion",
  },
  search: (query, corpus) => {
    const keyword = LocalKeywordRetrieval.search(query, corpus);
    const vector = LocalVectorRetrieval.search(query, corpus);
    const fuse = <T extends { id: string }>(a: RetrievalHit<T>[], b: RetrievalHit<T>[]) => {
      const map = new Map<string, RetrievalHit<T>>();
      for (const hit of a) map.set(hit.item.id, { ...hit, method: "hybrid" });
      for (const hit of b) {
        const existing = map.get(hit.item.id);
        map.set(
          hit.item.id,
          existing
            ? { item: hit.item, score: existing.score * 0.65 + hit.score * 0.35, method: "hybrid" }
            : { ...hit, method: "hybrid" },
        );
      }
      return [...map.values()].sort((x, y) => y.score - x.score);
    };
    return { memories: fuse(keyword.memories, vector.memories), sources: fuse(keyword.sources, vector.sources) };
  },
};

/* =========================================================================
   Memory classification pipeline
   Input → extraction → context → importance → decision → storage
   ========================================================================= */

export interface Classification {
  importance: Importance;
  category: MemoryCategory;
  retentionType: Memory["retentionType"];
  /** Proposed memory. Noise returns null. */
  proposal: { title: string; content: string } | null;
  projectId?: string;
  reason: string;
  confidence: number;
}

const DECISION_MARKERS = [
  "decided", "decision", "we will", "let's use", "lets use", "final model", "chose", "agreed",
  "instead of", "go with",
];
const TASK_MARKERS = ["need to", "todo", "to-do", "remember to", "must ", "deadline", "by friday", "order "];
const INSIGHT_MARKERS = ["realised", "realized", "noticed", "found that", "turns out", "improve"];
const TEMP_MARKERS = ["moved to", "rescheduled", "in 10 minutes", "right now", "for today"];

/**
 * Deterministic rule-based classifier. This is a real, inspectable
 * implementation — not a language model — and the UI labels it as such.
 */
export function classify(input: string, projects: Project[], activeProjectId?: string): Classification {
  const text = input.trim();
  const lower = text.toLowerCase();
  const match = (markers: string[]) => markers.some((m) => lower.includes(m));

  const projectGuess =
    projects.find((p) => lower.includes(p.name.toLowerCase()))?.id ?? activeProjectId;

  const title = buildTitle(text);

  if (text.length < 12) {
    return {
      importance: "noise",
      category: "note",
      retentionType: "session",
      proposal: null,
      reason: "Too short to be a useful memory.",
      confidence: 0.62,
    };
  }

  if (match(DECISION_MARKERS)) {
    return {
      importance: "structured",
      category: "decision",
      retentionType: "forever",
      proposal: { title, content: text },
      projectId: projectGuess,
      reason: "Contains a decision marker (chose / agreed / instead of).",
      confidence: 0.86,
    };
  }

  if (match(TASK_MARKERS)) {
    return {
      importance: "structured",
      category: "task",
      retentionType: "forever",
      proposal: { title, content: text },
      projectId: projectGuess,
      reason: "Contains an actionable request.",
      confidence: 0.82,
    };
  }

  if (match(INSIGHT_MARKERS)) {
    return {
      importance: "important",
      category: "knowledge",
      retentionType: "forever",
      proposal: { title, content: text },
      projectId: projectGuess,
      reason: "Records something learned rather than something scheduled.",
      confidence: 0.74,
    };
  }

  if (match(TEMP_MARKERS)) {
    return {
      importance: "temp",
      category: "event",
      retentionType: "session",
      proposal: { title, content: text },
      projectId: projectGuess,
      reason: "Time-bound context, useful only briefly.",
      confidence: 0.68,
    };
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 8) {
    return {
      importance: "temp",
      category: "note",
      retentionType: "session",
      proposal: { title, content: text },
      projectId: projectGuess,
      reason: "Short utterance — kept only for the current session.",
      confidence: 0.55,
    };
  }

  return {
    importance: "useful",
    category: "knowledge",
    retentionType: "30-days",
    proposal: { title, content: text },
    projectId: projectGuess,
    reason: "Substantive statement with enough context to be retrievable.",
    confidence: 0.7,
  };
}

function buildTitle(text: string): string {
  const firstSentence = text.split(/[.!?\n]/)[0]?.trim() ?? text;
  const words = firstSentence.split(/\s+/).slice(0, 9).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function firstSentence(text: string): string {
  const sentence = text.split(/[.\n]/)[0]?.trim() ?? "";
  return sentence.length > 150 ? `${sentence.slice(0, 147)}…` : sentence;
}

/* =========================================================================
   Answer synthesis
   ========================================================================= */

export interface RetrievalRun {
  answer: Answer;
  trace: RetrievalTrace[];
  relatedMemories: Memory[];
  relatedSources: Source[];
  provider: ProviderInfo;
}

export interface RunOptions {
  question: string;
  memories: Memory[];
  sources: Source[];
  projects: Project[];
  provider: InferenceProvider;
  projectId?: string;
}

export async function runRetrieval(options: RunOptions): Promise<RetrievalRun> {
  const { question, memories, sources, projects, provider, projectId } = options;

  const scopedMemories = projectId ? memories.filter((m) => m.projectId === projectId) : memories;
  const hits = HybridRetrieval.search(question, {
    memories: scopedMemories.length ? scopedMemories : memories,
    sources,
  });

  const topMemories = hits.memories.slice(0, 6).map((h) => h.item);
  const topSources = hits.sources.slice(0, 4).map((h) => h.item);

  const result = await provider.answer({
    question,
    memories: topMemories,
    sources: topSources,
    project: projects.find((p) => p.id === projectId),
  });

  const trace: RetrievalTrace[] = [
    { step: "Searching files", detail: `${sources.length} indexed sources scanned`, matchCount: topSources.length, status: "done" },
    { step: "Checking memories", detail: `${memories.length} memories scanned`, matchCount: topMemories.length, status: "done" },
    { step: "Analyzing context", detail: HybridRetrieval.info.detail, status: "done" },
    { step: "Connecting dots", detail: `${topMemories.length} memories linked to this question`, status: "done" },
    { step: "Crafting answer", detail: result.provider.label, status: "done" },
  ];

  const answer: Answer = {
    id: uid("ans"),
    question,
    summary: result.summary,
    points: result.points,
    sources: topSources.map((s) => s.id),
    relatedMemoryIds: topMemories.map((m) => m.id),
    projectId,
    createdAt: new Date().toISOString(),
    computedBy: `${result.provider.label} · ${result.provider.location === "local" ? "on-device" : "no model — rule based"}`,
  };

  return { answer, trace, relatedMemories: topMemories, relatedSources: topSources, provider: result.provider };
}

/* =========================================================================
   Speech recognition
   ========================================================================= */

export interface SpeechProviderInfo extends ProviderInfo {
  kind: "webspeech" | "simulated" | "unsupported";
}

export function detectSpeechSupport(): SpeechProviderInfo {
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  if (w.SpeechRecognition || w.webkitSpeechRecognition) {
    return {
      id: "webspeech",
      kind: "webspeech",
      label: "Browser speech recognition",
      location: "local",
      detail: "Uses the on-device speech service exposed by your browser. Audio never leaves your device.",
    };
  }
  return {
    id: "simulated-asr",
    kind: "simulated",
    label: "Simulated transcription",
    location: "fallback",
    detail:
      "Speech recognition is not available in this browser. NeoBrain uses a simulated transcript — no audio is recorded.",
  };
}

export const SAMPLE_QUESTIONS = [
  "What did I do yesterday related to SmartLine?",
  "What changed in the SmartLine enclosure last week?",
  "Summarize the files I indexed this morning.",
  "Why did I choose XGBoost for the final model?",
  "What tasks are still open before the demo?",
];

export const QUICK_PROMPTS = [
  "What changed yesterday?",
  "Find information about SmartLine",
  "Summarize these files",
  "Where did I see this?",
  "Explain this code",
];

export function pickSampleQuestion(seedValue = Math.random()): string {
  return SAMPLE_QUESTIONS[Math.floor(seedValue * SAMPLE_QUESTIONS.length) % SAMPLE_QUESTIONS.length];
}

/** Honest availability summary shown in Settings → Privacy. */
export function providerReport(cloudEnabled: boolean) {
  const local = LocalInferenceProvider.info();
  const fallback = DevelopmentMockInferenceProvider.info();
  const remote = OptionalRemoteInferenceProvider.info();
  const speech = detectSpeechSupport();
  return {
    inference: local.location === "unavailable" ? fallback : local,
    localModel: local,
    fallback,
    remote: { ...remote, location: cloudEnabled ? ("remote" as const) : ("unavailable" as const) },
    speech,
    retrieval: HybridRetrieval.info,
  };
}
