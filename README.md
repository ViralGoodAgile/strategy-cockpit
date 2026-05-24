# Strategy.Cockpit

An **inspector for a strategic feedback loop** — a single-screen, dark "glass cockpit" that
mixes quantitative signals with qualitative evidence so a sponsor can see whether the
organisation's strategic feedback loop is actually closing.

**Live:** https://strategy-cockpit.pages.dev

> Prototype. Synthetic data, client-side only — state persists in your browser's `localStorage`.
> No backend, no accounts, no secrets.

## What it shows

- **Strategy authoring** across the ten strategic qualities, plus a **strategy-triad** self-inspection (the cockpit turning its lens on the strategy itself).
- **The feedback loop** with **evidence-driven Loop.Closure**: the return arrow (Reality → Intent) lights green only when Intent was revised *after* a real outcome shifted — otherwise it stays red (the loop is open).
- **Sensors:** Mandate Levels · Cynefin triads (with human interpretations) · Flow.Constraint (a Theory-of-Constraints "movie" you can play at 0.5–4×) · DORA + DataDog · Weak signals · Radar (impediments ranged by scope) · System model (five switchable seed CLDs) · Production outcomes (product metrics + telemetry).
- **Detail on demand:** click any instrument to expand it full-screen.

First load opens **offline** — click **Author strategy** and save a v0.1 (or **load example**) to bring the sensors and challenge online.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-checks (tsc --noEmit) + builds to dist/
npm run preview    # serve the production build locally
```

## Deploy

Pushes to `main` auto-deploy to Cloudflare Pages via GitHub Actions
(`.github/workflows/deploy.yml`). It needs one repo secret, `CLOUDFLARE_API_TOKEN`
(Cloudflare ▸ My Profile ▸ API Tokens ▸ *Edit Cloudflare Pages*).

## Stack

Vite · React · TypeScript · plain CSS with design tokens · React Flow · Zustand.
