/**
 * ─────────────────────────────────────────────────────────────
 *  api.ts — REAL BACKEND CLIENT (FastAPI on localhost)
 * ─────────────────────────────────────────────────────────────
 *  Every helper hits the real backend. Each call site is marked
 *  with `// 🔴 LIVE REQUEST` for easy grepping.
 *
 *  Configure host via VITE_API_BASE_URL. Defaults to localhost.
 * ─────────────────────────────────────────────────────────────
 */

import type { CarInput, FuelType, Transmission } from "./predictionService";

// 🌐 Backend base URL — override with VITE_API_BASE_URL
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://car-prediction-backend.onrender.com";

const TIMEOUT_MS = 180000;

/** snake_case payload expected by FastAPI PredictionRequest */
export interface BackendCarPayload {
  brand: string;
  model: string;
  year: number;
  mileage_km: number;
  horsepower: number;
  doors: number;
  condition_score: number;
  fuel_type: string;
  transmission: string;
  country: string;
  city: string;
  color: string;
}

export function toBackendPayload(input: CarInput): BackendCarPayload {
  return {
    brand: input.brand,
    model: input.model,
    year: input.year,
    mileage_km: input.mileageKm,
    horsepower: input.horsepower,
    doors: input.doors,
    condition_score: input.conditionScore,
    fuel_type: input.fuelType,
    transmission: input.transmission,
    country: input.country,
    city: input.city,
    color: input.color,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const post = <T,>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const get = <T,>(path: string) => request<T>(path, { method: "GET" });

/* ─────────────────── response shapes ─────────────────── */

export interface PredictResponse {
  price_usd: number;
  price_range: { low: number; high: number };
  confidence: number;
  input: Record<string, unknown>;
  derived: { age: number; mileage_per_year: number; is_luxury_brand: boolean };
}

export interface ContributionRow {
  feature: string;
  label: string;
  contribution_usd: number;
  value_log?: number;
  direction?: string;
}

export interface ShapResponse {
  contributions: ContributionRow[];
  base_value_log: number;
  expected_price_usd: number;
  graph: Record<string, string>;
}

export interface LimeResponse {
  contributions: ContributionRow[];
  intercept: number;
  method: string;
  graph: Record<string, string>;
}

export interface ImportanceRow {
  feature: string;
  label: string;
  importance: number;
  normalized_importance: number;
  std?: number;
}

export interface ImportanceResponse {
  importances: ImportanceRow[];
  graph: Record<string, string>;
}

export interface ModelImportanceResponse {
  importances: ImportanceRow[];
  graph?: Record<string, string>;
}

export interface PdpFeatureSeries {
  feature: string;
  label: string;
  points: {
    feature_value: number;
    feature_value_raw: number;
    feature_value_label: string;
    predicted_price_usd: number;
  }[];
}

export interface PdpResponse {
  features: PdpFeatureSeries[];
  graph: Record<string, string>;
}

export interface GlobalShapRow {
  feature: string;
  label: string;
  mean_abs_shap_log: number;
  mean_abs_shap_usd: number;
  normalized_importance: number;
}

export interface CombinedRow {
  feature: string;
  label: string;
  consensus_score: number;
  method_scores: Record<string, number>;
}

export interface GlobalSummaryResponse {
  summary: string;
  global_shap_importance: GlobalShapRow[];
  top_combined_importance: CombinedRow[];
  graphs: Record<string, Record<string, string>>;
}

export interface XaiMetricRow {
  metric: string;
  score: number;
  target: string;
  interpretation: string;
}

export interface XaiMetricsResponse {
  metrics?: XaiMetricRow[] | Record<string, number>;
  overall_score?: number;
  graph?: Record<string, string>;
  fidelity?: number;
  consistency?: number;
  sparsity?: number;
  coverage?: number;
  robustness?: number;
  [k: string]: unknown;
}

export interface PriceEffectRow {
  feature: string;
  label: string;
  change: string;
  current_engineered_value: number;
  changed_engineered_value: number;
  current_display_value: string;
  changed_display_value: string;
  current_pdp_price_usd: number;
  changed_pdp_price_usd: number;
  delta_usd: number;
  pdp_points: {
    feature_value: number;
    feature_value_raw: number;
    feature_value_label: string;
    predicted_price_usd: number;
  }[];
  text: string;
}

export interface PriceEffectsResponse {
  effects: PriceEffectRow[];
  predicted_price_usd: number;
  summary_text: string;
  graph: Record<string, string>;
}

export interface FeatureEngineeringResponse {
  raw_input: Record<string, unknown>;
  derived: Record<string, unknown>;
  engineered_features: Record<string, number>;
  model_features: string[];
}

export interface CounterfactualResponse {
  counterfactuals: Array<{
    car_name?: string;
    brand?: string;
    model?: string;
    year?: number;
    estimated_price_usd?: number;
    distance_from_budget_usd?: number;
    mileage_km?: number;
    horsepower?: number;
    doors?: number;
    condition_score?: number;
    fuel_type?: string;
    transmission?: string;
    country?: string;
    city?: string;
    color?: string;
    match_score?: number;
    reason?: string;
    [key: string]: unknown;
  }>;
  graph: Record<string, string>;
  note: string;
}

/* ─────────────────── live calls ─────────────────── */

// 🔴 LIVE REQUEST — POST /api/predict
export const fetchPredict = (input: CarInput) =>
  post<PredictResponse>("/api/predict", toBackendPayload(input));

// 🔴 LIVE REQUEST — POST /api/feature-engineering
export const fetchFeatureEngineering = (input: CarInput) =>
  post<FeatureEngineeringResponse>("/api/feature-engineering", toBackendPayload(input));

// 🔴 LIVE REQUEST — POST /api/explain/shap (local SHAP)
export const fetchLocalShap = (input: CarInput) =>
  post<ShapResponse>("/api/explain/shap", toBackendPayload(input));

// 🔴 LIVE REQUEST — POST /api/explain/lime
export const fetchLime = (input: CarInput) =>
  post<LimeResponse>("/api/explain/lime", toBackendPayload(input));

// 🔴 LIVE REQUEST — POST /api/explain/price-effects
export const fetchPriceEffects = (input: CarInput) =>
  post<PriceEffectsResponse>("/api/explain/price-effects", toBackendPayload(input));

// 🔴 LIVE REQUEST — GET /api/explain/permutation
export const fetchPermutation = () => get<ImportanceResponse>("/api/explain/permutation");

// 🔴 LIVE REQUEST — GET /api/explain/model-importance
export const fetchModelImportance = () =>
  get<ModelImportanceResponse>("/api/explain/model-importance");

// 🔴 LIVE REQUEST — GET /api/explain/partial-dependence
export const fetchPartialDependence = () => get<PdpResponse>("/api/explain/partial-dependence");

// 🔴 LIVE REQUEST — GET /api/explain/global-summary
export const fetchGlobalSummary = () => get<GlobalSummaryResponse>("/api/explain/global-summary");

// 🔴 LIVE REQUEST — GET /api/explain/xai-metrics
export const fetchXaiMetrics = () => get<XaiMetricsResponse>("/api/explain/xai-metrics");

// 🔴 LIVE REQUEST — POST /api/counterfactual (DiCE — used by Budget Match)
export const fetchCounterfactual = (input: CarInput, budget: number) =>
  post<CounterfactualResponse>("/api/counterfactual", { ...toBackendPayload(input), budget });

// 🔴 LIVE REQUEST — GET /api/health
export const fetchHealth = () => get<{ status: string }>("/api/health");

export type { CarInput, FuelType, Transmission };
