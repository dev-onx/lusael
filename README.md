# Lusael — Lusail Property Concierge

A conversational AI property search MVP for Lusail, Qatar. Replaces filter-based search with a natural conversation that produces a curated, scored shortlist.

---

## Setup

### Prerequisites
- Node.js 20+
- npm 10+
- Anthropic API key

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY
```

### Run (development)

```bash
# Terminal 1 — server
npm run dev --workspace=server

# Terminal 2 — client
npm run dev --workspace=client
```

Open [http://localhost:5173](http://localhost:5173)

### Run (production / single service)

```bash
npm run build   # builds client into client/dist, then server
npm run start   # serves everything from Express on port 3001
```

---

## Demo Script — Three Wow Moments

### 1. The Intake Conversation

On the landing page, a full-screen chat opens immediately. No search bar, no dropdowns.

Try this conversation:
> "I'm looking to buy a family apartment, maybe 3 bedrooms. We have two kids and my wife works near West Bay."

The concierge will ask natural follow-up questions — budget, lifestyle, commute — referencing Lusail districts by name. After 4–6 turns it produces a structured brief and transitions automatically to the shortlist.

**Wow factor:** It feels like talking to an agent, not filling out a form.

---

### 2. The Scored Shortlist

Five properties appear, ranked by a dual AI scoring engine:

- **Lifestyle Fit (0-100):** Claude reasons how well each property matches the user's stated life context.
- **Investment Health (0-100):** Deterministic formula (yield × 40%, price trend × 30%, district × 20%, amenities × 10%) with a one-sentence AI explanation.

Each card shows a 3-line "Why this one" rationale generated specifically for this user's brief.

Click **"Show wildcards"** to see properties Claude identifies as worth considering even if they break your stated criteria.

**Wow factor:** The scoring is personalised and the rationale feels like advice, not an algorithm.

---

### 3. Property Q&A

Open any property card to get a side-panel chat scoped to that listing.

Try asking:
- *"What's my monthly payment with 20% down?"* → shows full mortgage calculation
- *"Is this overpriced for the district?"* → references yield and comparables
- *"What are the risks?"* → honest risk assessment tied to your brief
- *"How does Fox Hills compare to this?"* → district-level comparison

**Wow factor:** It answers questions a real agent would, with your personal context already loaded.

---

## Architecture

```
lusael/
├── shared/          # TypeScript types shared across client and server
├── server/          # Node.js + Express API + Claude integration
│   ├── routes/      # /api/chat, /api/recommendations, /api/compare
│   ├── services/    # Anthropic wrapper, scoring engine, JSON cache
│   └── data/        # 20 mock Lusail property listings
└── client/          # React + Vite + Tailwind frontend
    ├── components/  # intake, shortlist, property, compare, ui
    ├── store/       # Zustand state (persisted to localStorage)
    └── lib/         # API client, mortgage calculator
```

See [CLAUDE.md](./CLAUDE.md) for architectural decisions and conventions.

---

## Deploying to Railway (Free)

1. Push this repo to GitHub
2. Create a new Railway project → Deploy from GitHub repo
3. Add environment variable: `ANTHROPIC_API_KEY=your_key`
4. Railway auto-detects `railway.json` and runs build + start

The Express server serves the pre-built React client as static files — single service, no separate frontend deployment needed.

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Required. Your Anthropic API key. |
| `PORT` | Optional. Defaults to 3001. |
| `NODE_ENV` | `development` or `production` |

---

*MVP Demo — property data is illustrative. Not affiliated with any Lusail developer or real estate authority.*
