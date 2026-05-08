/**
 * ─────────────────────────────────────────────────────────────
 *  api.ts — REAL BACKEND CLIENT
 * ─────────────────────────────────────────────────────────────
 *  All live model endpoints are called from here. Each helper
 *  is clearly marked with a `// 🔴 LIVE REQUEST` comment so the
 *  call sites are easy to find.
 *
 *  Configure the backend host via VITE_API_BASE_URL or change
 *  the fallback DNS below.
 *
 *  When the live backend is unreachable we transparently fall
 *  back to the in-browser mock from `predictionService.ts` so
 *  the UI keeps working in dev / preview.
 * ─────────────────────────────────────────────────────────────
 */

import {
  predictPrice as mockPredictPrice,
  findCarForBudget as mockFindCarForBudget,
  type CarInput,
  type PredictionResult,
  type BudgetMatch,
  type FeatureContribution,
} from "./predictionService";

// 🌐 Backend DNS — change me / set VITE_API_BASE_URL in env
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://api.car-price-ai.live";

const DEFAULT_TIMEOUT_MS = 8000;

async function postJSON<T>(path: string, body: unknown, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* ───────────────────── explainability shapes ───────────────────── */

export interface ShapResult {
  baseline: number;
  values: Array<{ feature: string; value: number }>;
}
export interface FeatureImportanceResult {
  values: Array<{ feature: string; importance: number }>;
}
export interface AleResult {
  feature: string;
  bins: Array<{ x: number | string; effect: number }>;
}
export interface PermutationImportanceResult {
  values: Array<{ feature: string; deltaR2: number }>;
}
export interface LimeResult {
  intercept: number;
  weights: Array<{ feature: string; weight: number }>;
}

export interface DiceSuggestion {
  brand: string;
  model: string;
  year: number;
  price: number;
  changes: string[]; // counterfactual changes
}
export interface DiceResult {
  budget: number;
  suggestions: DiceSuggestion[];
}

/* ───────────────────── public live calls ───────────────────── */

// 🔴 LIVE REQUEST — POST /predict  (main price prediction)
export async function fetchPrediction(input: CarInput): Promise<PredictionResult> {
  try {
    return await postJSON<PredictionResult>("/predict", input);
  } catch {
    return mockPredictPrice(input);
  }
}

// 🔴 LIVE REQUEST — POST /explain/shap
export async function fetchShap(input: CarInput): Promise<ShapResult> {
  try {
    return await postJSON<ShapResult>("/explain/shap", input);
  } catch {
    const r = await mockPredictPrice(input);
    return {
      baseline: 18000,
      values: r.featureContributions.map((c) => ({ feature: c.feature, value: c.contribution })),
    };
  }
}

// 🔴 LIVE REQUEST — POST /explain/feature-importance
export async function fetchFeatureImportance(input: CarInput): Promise<FeatureImportanceResult> {
  try {
    return await postJSON<FeatureImportanceResult>("/explain/feature-importance", input);
  } catch {
    const r = await mockPredictPrice(input);
    return { values: r.featureContributions.map((c) => ({ feature: c.feature, importance: c.importance })) };
  }
}

// 🔴 LIVE REQUEST — POST /explain/ale
export async function fetchAle(input: CarInput): Promise<AleResult> {
  try {
    return await postJSON<AleResult>("/explain/ale", input);
  } catch {
    // Mock: ALE for mileage
    const bins = Array.from({ length: 8 }, (_, i) => {
      const x = i * 50000;
      return { x, effect: Math.round(2500 - x * 0.012 + (Math.sin(i) * 400)) };
    });
    return { feature: "Mileage", bins };
  }
}

// 🔴 LIVE REQUEST — POST /explain/permutation-importance
export async function fetchPermutationImportance(input: CarInput): Promise<PermutationImportanceResult> {
  try {
    return await postJSON<PermutationImportanceResult>("/explain/permutation-importance", input);
  } catch {
    const r = await mockPredictPrice(input);
    return {
      values: r.featureContributions.map((c) => ({
        feature: c.feature,
        deltaR2: +(c.importance * (0.6 + Math.random() * 0.4)).toFixed(3),
      })),
    };
  }
}

// 🔴 LIVE REQUEST — POST /explain/lime
export async function fetchLime(input: CarInput): Promise<LimeResult> {
  try {
    return await postJSON<LimeResult>("/explain/lime", input);
  } catch {
    const r = await mockPredictPrice(input);
    return {
      intercept: 18000,
      weights: r.featureContributions
        .map((c) => ({ feature: c.feature, weight: c.contribution * (0.85 + Math.random() * 0.3) }))
        .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    };
  }
}

// 🔴 LIVE REQUEST — POST /dice  (counterfactual car suggestions for a budget)
export async function fetchDice(budget: number): Promise<DiceResult> {
  try {
    return await postJSON<DiceResult>("/dice", { budget });
  } catch {
    const m = await mockFindCarForBudget(budget);
    return {
      budget,
      suggestions: [
        {
          brand: m.car.brand, model: m.car.model, year: m.car.year, price: m.car.estimatedPrice,
          changes: [`+${(m.car.conditionScore)} cond`, `${m.car.fuelType}`, `${m.car.transmission}`],
        },
        ...m.alternatives.map((a) => ({
          brand: a.brand, model: a.model, year: a.year, price: a.price,
          changes: ["older year", "lower brand tier", "higher mileage"],
        })),
      ],
    };
  }
}

// Re-export budget match helper (still used for the rich match card)
// 🔴 LIVE REQUEST — POST /budget-match
export async function fetchBudgetMatch(budget: number): Promise<BudgetMatch> {
  try {
    return await postJSON<BudgetMatch>("/budget-match", { budget });
  } catch {
    return mockFindCarForBudget(budget);
  }
}

export type { CarInput, PredictionResult, BudgetMatch, FeatureContribution };
