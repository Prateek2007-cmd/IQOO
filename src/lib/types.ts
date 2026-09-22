/**
 * NeoBrain shared data models.
 *
 * Single source of truth for both the mobile and desktop experiences.
 * Everything here is persisted locally (see lib/store.ts).
 */

export type ISODate = string;

/* ------------------------------------------------------------------ memory */

export type MemoryCategory =
  | "knowledge"
  | "decision"
  | "task"
  | "note"
  | "conversation"
  | "event";

/** Noise is discarded, temp is short lived, the rest is retained. */
export type Importance = "noise" | "temp" | "useful" | "important" | "structured";

export type RetentionType = "session" | "30-days" | "forever";

export type MemoryStatus = "candidate" | "active" | "archived";

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  importance: Importance;
  createdAt: ISODate;
  updatedAt: ISODate;
  sourceReferences: string[];
  projectId?: string;
  retentionType: RetentionType;
  status: MemoryStatus;
  deletedAt?: ISODate;
  /** Short, human explanation of why this was captured. Never chain-of-thought. */
  reason?: string;
}

/* ------------------------------------------------------------------ source */

export type SourceType = "pdf" | "code" | "image" | "audio" | "note" | "doc" | "dir";

export type PermissionStatus = "granted" | "denied" | "required" | "not-requested";

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  pathOrReference: string;
  createdAt: ISODate;
  modifiedAt: ISODate;
  indexedAt?: ISODate;
  projectId?: string;
  metadata: Record<string, string | number>;
  permissionStatus: PermissionStatus;
  /** Indexing pipeline state. */
  indexStatus: "queued" | "indexing" | "indexed" | "failed" | "inaccessible";
  indexError?: string;
  sizeKb?: number;
}

/* ----------------------------------------------------------------- project */

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  tags: string[];
  status: "active" | "paused" | "archived";
  accent?: "cyan" | "violet" | "amber" | "green";
}

/* -------------------------------------------------------------------- task */

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: ISODate;
  projectId?: string;
  sourceMemoryId?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ device */

export type DeviceConnectionStatus =
  | "connecting"
  | "connected"
  | "syncing"
  | "disconnected"
  | "local-only"
  | "permission-required";

export interface Device {
  id: string;
  name: string;
  type: "phone" | "laptop" | "tablet";
  connectionStatus: DeviceConnectionStatus;
  lastSeen: ISODate;
  capabilities: string[];
  processingRole: "pocket" | "deep";
  model: string;
  /** Sync progress 0–1 while syncing. */
  syncProgress?: number;
  paired: boolean;
}

/* ------------------------------------------------------------ conversation */

export interface ChatMessage {
  id: string;
  role: "user" | "brain";
  text: string;
  createdAt: ISODate;
  sourceIds?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: ISODate;
  updatedAt: ISODate;
  sourceReferences: string[];
  projectId?: string;
  retentionStatus: "session" | "saved" | "discarded";
}

/* ---------------------------------------------------------------- activity */

export type ActivityType =
  | "speech"
  | "context"
  | "candidate"
  | "file"
  | "insight"
  | "task"
  | "decision"
  | "listening";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  at: ISODate;
  status: "done" | "active" | "idle";
  projectId?: string;
}

/* --------------------------------------------------------------- knowledge */

export interface KnowledgeNode {
  id: string;
  label: string;
  kind: "project" | "tool" | "hardware" | "artifact" | "concept" | "document";
  projectId?: string;
  weight: number;
  connections: number;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  strength: number;
}

/* ---------------------------------------------------------------- settings */

export interface Settings {
  awareness: {
    alwaysAvailable: boolean;
    speechDetection: boolean;
    periodicScanning: boolean;
    scanIntervalMinutes: number;
  };
  memory: {
    automaticMemory: boolean;
    decisionDetection: boolean;
    temporaryRetention: boolean;
    retentionDays: number;
  };
  privacy: {
    localProcessingOnly: boolean;
    cloudServices: boolean;
    saveRawAudio: boolean;
    /** Honest, user-visible record of what data actually exists. */
    rawAudioStored: boolean;
  };
  profile: {
    name: string;
    wakeWordEnabled: boolean;
    simulateSpeech: boolean;
  };
  appearance: {
    reducedMotion: boolean | null;
    compactDensity: boolean;
  };
}

/* ------------------------------------------------------------------ answer */

export interface Answer {
  id: string;
  question: string;
  /** Concise structured answer sections — retrieval summary, not hidden reasoning. */
  summary: string;
  points: string[];
  sources: string[];
  relatedMemoryIds: string[];
  projectId?: string;
  createdAt: ISODate;
  /** Where the answer was computed. Shown honestly in the UI. */
  computedBy: string;
}

/* ------------------------------------------------------------- processing */

export interface RetrievalTrace {
  step: string;
  detail: string;
  matchCount?: number;
  status: "pending" | "active" | "done";
}
