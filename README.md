# NeoBrain

**Your second brain. Always with you.**

A privacy-first personal memory system: it captures what you choose, classifies it
with an inspectable pipeline, and answers questions about your own work — all on
device. It ships as one responsive product with a cinematic public site, a phone
app experience, and a desktop workspace that share a single data model.

```
Local · Private · Contextual · Always yours
```

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 on a centralised token layer (`src/index.css`) |
| Motion | Framer Motion |
| Icons | Lucide |
| Routing | React Router 6 |
| Backend | **None.** All state lives in `localStorage` (the product is local-first by design) |
| 3D / visuals | Hand-written 3D projection renderer on 2D canvas (no WebGL dependency) |

---

## Run it

```bash
bun install
bun run dev        # dev server on 0.0.0.0
bun run typecheck  # tsc -b --noEmit
```

---

## Routes

| Route | Experience |
| --- | --- |
| `/` | Cinematic landing page (hero, scroll story, features, privacy, use cases, devices, CTA) |
| `/auth` | Local profile gate — name only, no account, no password, explains what is stored |
| `/app/boot` | Boot sequence: pairs Pocket Brain and Deep Brain with real progress |
| `/app` | Home dashboard (mobile) / Overview workspace (desktop) |
| `/app/ask` | Ask NeoBrain — voice, camera, file, screen and text input modes |
| `/app/brain` | Live console: listening state, capture pipeline, candidate review |
| `/app/voice` | Immersive voice mode: idle → listening → processing → response |
| `/app/answer/:id` | Structured answer with sources, retrieval trace and follow-ups |
| `/app/activity`, `/app/timeline` | Live activity feed and day-grouped timeline |
| `/app/memory` | Memory management: tabs, search, edit, retention, archive, delete |
| `/app/projects`, `/app/projects/:id` | Project list and full project workspace |
| `/app/knowledge` | Interactive knowledge graph + file index |
| `/app/devices` | Device pairing, sync states, capability discovery |
| `/app/privacy` | Privacy dashboard: data inventory, capability report, export, wipe |
| `/app/settings` | Awareness, memory, audio, appearance, profile, build info |
| `/app/more` | Mobile hub for secondary destinations |

---

## Architecture

```
src/
  lib/
    types.ts      Shared data models (Memory, Source, Project, Task, Device, Conversation, …)
    seed.ts       Development seed data + default settings
    store.tsx     Local-first reactive store (localStorage, full CRUD, export, wipe)
    engine.ts     Replaceable providers: inference, embeddings, retrieval, speech, classifier
    useAsk.ts     Shared question → answer flow
    format.ts     Date / size / greeting helpers
    hooks.ts      Media queries, live clock, mic meter, reduced motion
  components/
    BrainCore.tsx     Signature 3D canvas core (7 states) + framed stage
    Ambient.tsx       Aura gradients, technical grid, drifting particle field
    Chrome.tsx        Mobile top bar, bottom nav, desktop rail, workspace top bar
    DeviceFrame.tsx   Phone/laptop frames with real miniature screen previews
    ActivityFeed.tsx  Flowing activity timeline
    ui.tsx            Panels, buttons, switches, tabs, metrics, state blocks, sheets
  routes/           One file per screen
```

### Local-first engine (`src/lib/engine.ts`)

Every capability is an interface with several implementations, so a real model can
be dropped in without touching the UI:

- **Inference** — `LocalInferenceProvider` (reports *unavailable* until a local
  endpoint is configured), `DevelopmentMockInferenceProvider` (deterministic
  extractive summariser, clearly labelled), `OptionalRemoteInferenceProvider`
  (refuses to run unless the user explicitly enables cloud services).
- **Retrieval** — keyword, hashed-embedding vector, and hybrid fusion. All local.
- **Speech** — real browser speech recognition when present, otherwise a labelled
  simulated transcript. Microphone level comes from a real `getUserMedia` +
  `AnalyserNode` stream, falling back to a simulated signal.
- **Memory classifier** — deterministic rules that return category, importance,
  retention, the matched project, a confidence value and **the rule that fired**.

The Memory pipeline is: *input → extraction → context → importance → decision →
storage → retrieval*, and the decision step is always visible in the UI before
anything is stored.

---

## What actually works

- Local persistence of every entity, with reactive updates across screens
- Full memory lifecycle: create, edit, re-classify, re-scope, re-retain, archive,
  restore, purge, plus candidate accept/reject
- Projects with real derived counts; tasks togglable; timeline built from activity
- Hybrid local retrieval producing structured answers with source references
- Answer view with sources, retrieval trace, follow-ups, save-to-memory, project linking
- Knowledge graph: deterministic force layout, pan, zoom, search, project filters,
  node selection with related files and memories
- File index: real file picker, metadata extraction, indexing states, permission
  states, re-index, forget
- Voice mode: real microphone handling, live waveform, pause/stop/hands-free,
  transcription (real or simulated), processing stages, response actions
- Devices: explicit pairing flow, connecting/syncing/connected/disconnected states,
  real sync progress, capability listing
- Privacy: data inventory, capability report generated from the running code,
  JSON export, delete-all, restore seed data
- Appearance overrides that genuinely change rendering (reduced motion, density)
- Reduced-motion support and a static SVG fallback if a canvas context is unavailable

## Honest limitations

- **No language model runs on this device.** Answers are composed by a
  deterministic extractive summariser that is labelled "development fallback"
  everywhere it appears. Configure `VITE_LOCAL_MODEL_URL` to point at a real local
  model and `LocalInferenceProvider` reports itself as available instead.
- **No cloud path is active.** Remote inference refuses to run; enabling the switch
  surfaces an explanation rather than silently sending data anywhere.
- **No cross-device transport.** The pairing model, connection states and sync
  progress are real UI state, but moving data between a phone and laptop needs the
  native device agent (Kotlin/CameraX on the Android side).
- **Camera and screen capture** need the Android build; the web prototype says so
  and offers the working alternative (attach a file) instead of a dead button.
- **PDF/content extraction is metadata-only** in this build; the indexing pipeline,
  states and error handling are real.
- Raw audio is never stored, and the microphone stream is torn down the moment you
  stop or leave the screen.

---

## Design system

Tokens live in `src/index.css` (CSS variables) and `tailwind.config.js`:
deep graphite surfaces (`#04090E → #102A37`), cyan `#00D9FF` for active
intelligence, electric blue `#247BFF`, violet `#8D6CFF`, a restrained warm
`#FF9A57` rim light, and green/amber/red strictly for status.

- **Radii**: 10 / 14 / 18 / 22 / 26 / 32 / 38 px, applied by prominence
- **Typography**: Space Grotesk for display, Inter for UI, wide-tracked wordmark
- **Surfaces**: matte graphite panels, translucent glass only for chrome and overlays
- **Motion**: calm, intentional, and fully disabled under reduced motion
