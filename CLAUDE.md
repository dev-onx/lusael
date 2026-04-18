# CLAUDE.md — Lusael Architecture & Conventions

## Project Overview

Lusael is a conversational AI property portal MVP for Lusail, Qatar. Single Express service serves the pre-built React client as static files.

## Repository Structure

```
lusael/
├── shared/src/types.ts      — all shared TypeScript types (Property, UserBrief, ScoreResult, etc.)
├── server/src/
│   ├── index.ts             — Express app, static file serving, all routes mounted
│   ├── routes/
│   │   ├── chat.ts          — POST /api/chat/intake (SSE streaming)
│   │   ├── property-chat.ts — POST /api/chat/property/:id (SSE streaming)
│   │   ├── recommendations.ts — POST /api/recommendations
│   │   ├── compare.ts       — POST /api/compare
│   │   └── properties.ts    — GET /api/properties + exports `properties` array
│   ├── services/
│   │   ├── anthropic.ts     — Claude API wrapper, SSE helpers (sseSetup/sseSend/sseDone/streamToSSE/callClaude)
│   │   ├── scoring.ts       — Lifestyle + Investment scoring (cached)
│   │   └── cache.ts         — JSON file cache at ./score-cache.json
│   └── data/properties.json — 20 mock listings (source of truth)
└── client/src/
    ├── store/appStore.ts    — Zustand store, persisted to localStorage key "lusael-state"
    ├── lib/api.ts           — All fetch calls + SSE stream readers
    ├── lib/mortgage.ts      — Monthly payment formula (4.5%, 25yr)
    └── components/
        ├── intake/          — IntakeChat (full-screen landing) + BriefCard
        ├── shortlist/       — ShortlistView + PropertyCard
        ├── property/        — PropertyPanel (split view) + PropertyChat
        ├── compare/         — ComparePanel (table + AI tradeoff)
        └── ui/              — ChatMessage, ChatInput, ScoreBadge, LoadingDots
```

## Key Architectural Decisions

### Single Service
Express serves `client/dist` as static files. In production, `npm run build` compiles both client and server, then `npm run start` runs the server which handles all routes including `/*` → `index.html` for SPA routing.

### SSE for Streaming
All chat endpoints use Server-Sent Events (SSE). Pattern:
1. `sseSetup(res)` — sets headers, flushes
2. Loop: `sseSend(res, { type: 'delta', content: '...' })`
3. Optionally: `sseSend(res, { type: 'brief', brief: {...} })` for intake
4. `sseDone(res)` — writes `[DONE]` and ends

Client reads SSE via `fetch` + `ReadableStream`, no EventSource (allows POST).

### Brief Detection in Intake
The intake system prompt instructs Claude to output `BRIEF_JSON:{...}` on its own line when it has enough information. The server route regex-extracts this and sends it as a separate SSE event. The display text strips the `BRIEF_JSON:...` fragment.

### Score Caching
Scores cached at `./score-cache.json` (relative to server CWD). Key format: `{briefHash}:{propertyId}`. Brief is hashed with MD5 (8 chars) for stable keys. File is read/written synchronously — acceptable at MVP scale.

### Dual Scoring Formula
- **Lifestyle score (0-100):** Claude, per property+brief pair, returns `{score, justification}`
- **Investment score (0-100):** Deterministic: yield×40% + trend×30% + district×20% + amenities×10%
- **Combined:** lifestyle×60% + investment×40%

District weights: Marina=90, Qetaifan=85, Energy City=70, Fox Hills=65, Al Erkyah=60.

### Wildcards
Mode `'wildcards'` filters properties where price is >20% above/below budget OR bedrooms don't match, but lifestyle score ≥ 60. Claude doesn't explicitly decide — the filter uses the Claude-generated lifestyle score as the gate.

### Client State (Zustand)
The `appStore` manages: `view`, `brief`, `intakeMessages`, `shortlist`, `activeProperty`, `pinnedIds`, `compareResult`. Persisted subset: `brief`, `intakeMessages`, `shortlist`, `pinnedIds`, `view`.

`restartIntake()` clears everything back to intake view.

## Models & Token Limits

All calls use `claude-sonnet-4-5`.
- Chat (intake, property chat): `max_tokens: 1024`
- Scoring (lifestyle, investment explanation, why-this-one): `max_tokens: 256/150/100`
- Compare tradeoff: `max_tokens: 512`

## Conventions

- TypeScript strict mode everywhere
- No `console.log` in production code
- All Claude outputs that need to be parsed: use `try/catch`, extract JSON with regex before `JSON.parse`
- No authentication, no database — JSON file is the data layer
- `dir="auto"` on all text inputs for Arabic compatibility
- Tailwind utility classes only — no CSS modules, no styled-components
- Color tokens: `navy` (#0A1628), `sand` (#D4A574) — defined in tailwind.config.js
- Font: `font-sans` = Inter, `font-serif` = Fraunces

## Running Locally

```bash
# Install
npm install

# Copy and fill env
cp .env.example .env

# Dev (two terminals)
npm run dev --workspace=server   # port 3001
npm run dev --workspace=client   # port 5173 (proxies /api → 3001)

# Production
npm run build && npm run start
```
