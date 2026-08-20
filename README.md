# Car Price Prediction Insights

An explainable AI web app that predicts used-car prices and **shows you why**. Enter 12 details about a car, get a predicted price, and then explore the model's reasoning through live XAI (eXplainable AI) endpoints — SHAP, LIME, permutation & model importance, partial dependence plots, XAI quality metrics, and DiCE counterfactual budget matching.

The frontend is a **React + Vite + TypeScript** SPA deployed on **Vercel**, talking to a FastAPI + machine-learning backend hosted on **Render**.

---

## ✨ Features

- **Price prediction** — POST `/api/predict` returns the estimated USD price, confidence, price range, and derived features (age, mileage/year, luxury-brand flag).
- **Live inference panel** — a streaming checklist that fires 7 real backend calls in parallel and renders each result as it arrives:
  - Feature engineering
  - Local SHAP contributions (per-feature $ impact)
  - LIME (local linear surrogate)
  - Permutation importance (global)
  - LightGBM model importance (feature gain)
  - Partial dependence plots (average effect of each feature on price)
  - XAI metrics (fidelity, consistency, sparsity, robustness)
- **Budget match** — pick a budget, get real DiCE counterfactuals showing what a car would need to look like at that price, with match scores and plain-English reasoning.
- **Plain-English explanations** — the prediction result is broken into "what pushed the price up/down and why".
- **5 plug-and-play themes** — swap one import line in `src/App.tsx` to switch between Midnight, Porcelain, Neo-Brutalist, Glassmorphic, and Carbon-Sport. See `src/themes/README.md`.

## 🧠 Backend

This repo is the **frontend only**. It talks to a separate FastAPI service:

```
https://car-prediction-backend.onrender.com
```

The backend implements the ML pipeline (feature engineering → LightGBM regression → SHAP/LIME/PDP/DiCE explainability). The API contract is typed in [`src/services/api.ts`](src/services/api.ts).

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (http://localhost:8080)
npm run dev
```

### Pointing at the backend

The API base URL is read from `VITE_API_BASE_URL`, defaulting to the Render backend.

| File | Purpose |
|------|---------|
| `.env.local` | Local dev overrides (gitignored) |
| `.env.production` | Used by Vercel builds via `vite build` |

To target a local backend during development, uncomment this line in `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
```

> Note: `vercel.json` also contains an `env` block, but that only injects into serverless functions at runtime — it is **not** available during the Vite build. The committed `.env.production` file is what the Vercel build actually reads.

## 📦 Scripts

```bash
npm run dev        # start Vite dev server (port 8080)
npm run build      # production build to dist/
npm run build:dev  # build with development mode
npm run preview    # preview the production build locally
npm run lint       # ESLint
npm run test       # run Vitest tests
npm run test:watch # watch mode
```

## 🏗️ Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **TanStack Query**, **React Router**, **Recharts**, **Framer Motion**, **Zod**, **React Hook Form**
- **Vitest** + **Testing Library**

## 📁 Project structure

```
src/
├── components/     # UI sections (Hero, PredictSection, LiveInference, BudgetSection, …)
│   └── ui/         # shadcn/ui primitives
├── pages/          # Index, NotFound
├── services/
│   ├── api.ts              # live backend client + response types
│   ├── predictionService.ts # form options & input types (mock model, replaced by live calls)
│   └── lastCarInput.ts     # remembers the last predicted car across sections
├── themes/         # 5 swappable CSS themes
└── theme/          # light/dark ThemeProvider
```

## ☁️ Deployment

- **Frontend:** Vercel — build command `npm run build`, output `dist/`. Backend URL is baked in at build time via `.env.production`.
- **Backend:** Render — the FastAPI/ML service (separate repo).

## 🧪 Tests

```bash
npm run test
```

## 📄 License

Private project — no license specified.