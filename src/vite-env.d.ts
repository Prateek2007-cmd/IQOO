/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional local model endpoint. Unset in this build. */
  readonly VITE_LOCAL_MODEL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
