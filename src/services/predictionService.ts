/**
 * ─────────────────────────────────────────────────────────────
 *  predictionService.ts — MOCK AI BACKEND
 * ─────────────────────────────────────────────────────────────
 *
 * Simulates a real ML pipeline:
 *   1. Preprocess raw form input (normalize, encode categoricals)
 *   2. Run a (mocked) regression-style model
 *   3. Compute SHAP-like feature contributions
 *   4. Find similar cars from a small in-memory catalog
 *   5. Generate a natural-language explanation
 *
 *  When you have a real backend, replace the body of `predictPrice`
 *  and `findCarForBudget` with `fetch()` calls — the response shapes
 *  below ARE the API contract.
 * ─────────────────────────────────────────────────────────────
 */

export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "LPG";
export type Transmission = "Manual" | "Automatic" | "CVT" | "DCT";

export interface CarInput {
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  horsepower: number;
  doors: number;
  conditionScore: number; // 0..10
  fuelType: FuelType;
  transmission: Transmission;
  country: string;
  city: string;
  color: string;
}

export interface FeatureContribution {
  feature: string;
  /** Importance weight 0..1 (how much the model relies on it overall) */
  importance: number;
  /** Currency contribution to THIS prediction (signed) */
  contribution: number;
}

export interface SimilarCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  price: number;
  fuelType: FuelType;
  transmission: Transmission;
  similarity: number; // 0..1
}

export interface PredictionResult {
  predictedPrice: number;
  currency: "USD";
  confidence: number; // 0..1
  priceRange: { low: number; high: number };
  featureContributions: FeatureContribution[];
  similarCars: SimilarCar[];
  explanation: string;
  /** Echo of the preprocessed payload for debugging / UI */
  preprocessed: Record<string, number | string>;
}

export interface BudgetMatch {
  budget: number;
  car: {
    brand: string;
    model: string;
    year: number;
    mileageKm: number;
    horsepower: number;
    fuelType: FuelType;
    transmission: Transmission;
    conditionScore: number;
    color: string;
    estimatedPrice: number;
  };
  reasoning: string;
  alternatives: Array<{ brand: string; model: string; year: number; price: number }>;
}

export interface PriceRangeCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  horsepower: number;
  doors: number;
  conditionScore: number;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  price: number;
  /** Bullet highlights of why this car stands out */
  highlights: string[];
  /** Composite "best features" score 0..1 (only meaningful inside its bucket) */
  featureScore: number;
}

export interface PriceRangeMatches {
  /** The center predicted price */
  predictedPrice: number;
  /** ± dollar delta around the predicted price */
  delta: number;
  /** Cars within [predictedPrice - delta, predictedPrice + delta], sorted by best features */
  inRange: PriceRangeCar[];
  /** Cars strictly cheaper than (predictedPrice - delta), sorted by best features */
  belowRange: PriceRangeCar[];
}

const BRAND_VALUE: Record<string, number> = {
  Toyota: 1.0, Honda: 1.0, Ford: 0.9, Chevrolet: 0.85, Hyundai: 0.85, Kia: 0.85,
  Nissan: 0.9, Mazda: 0.95, Volkswagen: 1.05, BMW: 1.45, "Mercedes-Benz": 1.5,
  Audi: 1.4, Lexus: 1.35, Porsche: 2.0, Tesla: 1.6, Volvo: 1.15, Subaru: 1.0,
  Jeep: 1.05, Dodge: 0.95, Other: 0.8,
};

const FUEL_VALUE: Record<FuelType, number> = {
  Petrol: 1.0, Diesel: 1.05, Hybrid: 1.15, Electric: 1.25, LPG: 0.9,
};

const TRANSMISSION_VALUE: Record<Transmission, number> = {
  Manual: 0.92, Automatic: 1.05, CVT: 1.0, DCT: 1.1,
};

const COUNTRY_VALUE: Record<string, number> = {
  USA: 1.0, Germany: 1.1, Japan: 1.05, UK: 1.05, France: 0.95,
  Italy: 1.0, Canada: 0.98, Australia: 1.02, India: 0.7, Other: 0.85,
};

/* ───────────────────── core "model" ───────────────────── */

function preprocess(input: CarInput) {
  const currentYear = new Date().getFullYear();
  return {
    age: currentYear - input.year,
    mileage_norm: input.mileageKm / 10000,
    hp_norm: input.horsepower / 100,
    doors: input.doors,
    condition: input.conditionScore,
    brand_value: BRAND_VALUE[input.brand] ?? BRAND_VALUE.Other,
    fuel_value: FUEL_VALUE[input.fuelType] ?? 1,
    transmission_value: TRANSMISSION_VALUE[input.transmission] ?? 1,
    country_value: COUNTRY_VALUE[input.country] ?? COUNTRY_VALUE.Other,
  };
}

function runModel(p: ReturnType<typeof preprocess>) {
  // Deterministic-ish "regression": base price * multipliers - depreciation
  const base = 28000;
  const ageDepr = Math.max(0.25, 1 - p.age * 0.07);
  const mileageDepr = Math.max(0.3, 1 - p.mileage_norm * 0.018);
  const hpBoost = 0.6 + p.hp_norm * 0.18;
  const conditionBoost = 0.5 + p.condition * 0.08;
  const doorAdj = 0.95 + (p.doors - 4) * 0.02;

  const price =
    base *
    p.brand_value *
    p.fuel_value *
    p.transmission_value *
    p.country_value *
    ageDepr *
    mileageDepr *
    hpBoost *
    conditionBoost *
    doorAdj;

  return Math.max(800, Math.round(price / 50) * 50);
}

function computeContributions(input: CarInput, p: ReturnType<typeof preprocess>, price: number): FeatureContribution[] {
  // Mock SHAP-style contributions that sum (loosely) to price - baseline
  const baseline = 18000;
  const delta = price - baseline;

  const raw = [
    { feature: "Brand",        importance: 0.18, signal: (p.brand_value - 1) * 1.2 },
    { feature: "Year",         importance: 0.16, signal: (1 - p.age / 15) },
    { feature: "Mileage",      importance: 0.15, signal: (1 - p.mileage_norm / 25) - 0.2 },
    { feature: "Condition",    importance: 0.13, signal: (p.condition - 5) / 5 },
    { feature: "Horsepower",   importance: 0.11, signal: (p.hp_norm - 1.5) / 2 },
    { feature: "Fuel Type",    importance: 0.08, signal: p.fuel_value - 1 },
    { feature: "Transmission", importance: 0.07, signal: p.transmission_value - 1 },
    { feature: "Country",      importance: 0.06, signal: p.country_value - 1 },
    { feature: "Doors",        importance: 0.04, signal: (p.doors - 4) * 0.1 },
    { feature: "Color",        importance: 0.02, signal: input.color.toLowerCase() === "black" || input.color.toLowerCase() === "white" ? 0.05 : -0.02 },
  ];

  const totalSignal = raw.reduce((s, r) => s + Math.abs(r.signal * r.importance), 0) || 1;

  return raw.map((r) => ({
    feature: r.feature,
    importance: r.importance,
    contribution: Math.round(((r.signal * r.importance) / totalSignal) * delta),
  }));
}

function generateSimilarCars(input: CarInput, price: number): SimilarCar[] {
  const variants = [
    { brand: input.brand, modelSuffix: "Sport", yearOffset: -1, mileageMul: 1.1, priceMul: 0.94 },
    { brand: input.brand, modelSuffix: "Comfort", yearOffset: 1, mileageMul: 0.85, priceMul: 1.05 },
    { brand: BRAND_VALUE[input.brand] ? Object.keys(BRAND_VALUE)[(Object.keys(BRAND_VALUE).indexOf(input.brand) + 1) % 19] : "Honda",
      modelSuffix: "LX", yearOffset: 0, mileageMul: 1.0, priceMul: 0.98 },
  ];

  return variants.map((v, i) => ({
    id: `sim-${i}`,
    brand: v.brand,
    model: `${input.model} ${v.modelSuffix}`,
    year: input.year + v.yearOffset,
    mileageKm: Math.round(input.mileageKm * v.mileageMul),
    price: Math.round((price * v.priceMul) / 50) * 50,
    fuelType: input.fuelType,
    transmission: input.transmission,
    similarity: 0.95 - i * 0.07,
  }));
}

function generateExplanation(input: CarInput, price: number, contribs: FeatureContribution[]): string {
  const top = [...contribs].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 3);
  const positives = top.filter((c) => c.contribution > 0);
  const negatives = top.filter((c) => c.contribution < 0);
  const age = new Date().getFullYear() - input.year;

  const parts: string[] = [];
  parts.push(
    `Your ${input.year} ${input.brand} ${input.model} is estimated at $${price.toLocaleString()}.`
  );

  if (positives.length) {
    parts.push(
      `Value is supported by ${positives.map((p) => p.feature.toLowerCase()).join(", ")} — these add roughly $${positives
        .reduce((s, p) => s + p.contribution, 0)
        .toLocaleString()} above the baseline.`
    );
  }
  if (negatives.length) {
    parts.push(
      `On the other hand, ${negatives.map((n) => n.feature.toLowerCase()).join(", ")} pull the price down by about $${Math.abs(
        negatives.reduce((s, n) => s + n.contribution, 0)
      ).toLocaleString()}.`
    );
  }

  if (age > 8) parts.push(`At ${age} years old, age depreciation is the dominant factor.`);
  else if (input.mileageKm > 150000) parts.push(`High mileage (${input.mileageKm.toLocaleString()} km) reduces the estimate.`);
  else if (input.conditionScore >= 8) parts.push(`Excellent condition (${input.conditionScore}/10) keeps the value strong.`);

  parts.push(`Confidence is moderate-to-high based on ${contribs.length} weighted features.`);
  return parts.join(" ");
}

/* ───────────────────── public API ───────────────────── */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function predictPrice(input: CarInput): Promise<PredictionResult> {
  // Simulate network + inference latency
  await delay(700 + Math.random() * 600);

  const pre = preprocess(input);
  const price = runModel(pre);
  const contributions = computeContributions(input, pre, price);
  const similarCars = generateSimilarCars(input, price);
  const explanation = generateExplanation(input, price, contributions);

  return {
    predictedPrice: price,
    currency: "USD",
    confidence: 0.78 + Math.random() * 0.15,
    priceRange: { low: Math.round((price * 0.92) / 50) * 50, high: Math.round((price * 1.08) / 50) * 50 },
    featureContributions: contributions,
    similarCars,
    explanation,
    preprocessed: pre,
  };
}

export async function findCarForBudget(budget: number): Promise<BudgetMatch> {
  await delay(600 + Math.random() * 400);

  // Pick a sensible car class for the budget
  const tiers = [
    { max: 5000,  brand: "Honda",        model: "Civic",      year: 2008, hp: 140, fuel: "Petrol" as FuelType,   trans: "Manual" as Transmission },
    { max: 12000, brand: "Toyota",       model: "Corolla",    year: 2014, hp: 132, fuel: "Petrol" as FuelType,   trans: "Automatic" as Transmission },
    { max: 22000, brand: "Mazda",        model: "CX-5",       year: 2018, hp: 187, fuel: "Petrol" as FuelType,   trans: "Automatic" as Transmission },
    { max: 35000, brand: "Volkswagen",   model: "Golf GTI",   year: 2020, hp: 241, fuel: "Petrol" as FuelType,   trans: "DCT" as Transmission },
    { max: 55000, brand: "BMW",          model: "3 Series",   year: 2022, hp: 255, fuel: "Petrol" as FuelType,   trans: "Automatic" as Transmission },
    { max: 90000, brand: "Tesla",        model: "Model 3 Performance", year: 2023, hp: 450, fuel: "Electric" as FuelType, trans: "Automatic" as Transmission },
    { max: Infinity, brand: "Porsche",   model: "911 Carrera",year: 2023, hp: 379, fuel: "Petrol" as FuelType,   trans: "DCT" as Transmission },
  ];
  const tier = tiers.find((t) => budget <= t.max)!;
  const condition = Math.min(10, 5 + Math.floor((budget / Math.max(tier.max, budget)) * 5));
  const mileage = Math.max(5000, Math.round(220000 - (budget / 100) * 12));

  return {
    budget,
    car: {
      brand: tier.brand,
      model: tier.model,
      year: tier.year,
      mileageKm: mileage,
      horsepower: tier.hp,
      fuelType: tier.fuel,
      transmission: tier.trans,
      conditionScore: condition,
      color: ["Black", "White", "Silver", "Blue", "Red"][Math.floor(Math.random() * 5)],
      estimatedPrice: Math.round((budget * (0.93 + Math.random() * 0.06)) / 100) * 100,
    },
    reasoning:
      `For a budget of $${budget.toLocaleString()}, the ${tier.brand} ${tier.model} hits the sweet spot. ` +
      `It balances brand value, expected mileage (${mileage.toLocaleString()} km), and a condition score of ${condition}/10. ` +
      `${tier.fuel === "Electric" ? "Electric powertrain adds long-term savings." : `The ${tier.fuel.toLowerCase()} engine and ${tier.trans.toLowerCase()} transmission match what most buyers in this price range prefer.`}`,
    alternatives: [
      { brand: "Hyundai", model: "Elantra", year: tier.year, price: Math.round(budget * 0.88) },
      { brand: "Kia",     model: "Forte",   year: tier.year, price: Math.round(budget * 0.85) },
      { brand: "Nissan",  model: "Sentra",  year: tier.year - 1, price: Math.round(budget * 0.82) },
    ],
  };
}

/* ───────────────────── option lists for the UI ───────────────────── */

export const BRAND_OPTIONS = Object.keys(BRAND_VALUE);
export const FUEL_OPTIONS: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
export const TRANSMISSION_OPTIONS: Transmission[] = ["Manual", "Automatic", "CVT", "DCT"];
export const COUNTRY_OPTIONS = Object.keys(COUNTRY_VALUE);
export const COLOR_OPTIONS = ["Black", "White", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Brown"];
