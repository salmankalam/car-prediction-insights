# 📚 Valua.AI — Documentation

A premium landing page for an AI-powered used-car price prediction model. Built with React + Vite + Tailwind + Framer Motion + Recharts.

---

## 🗂️ Project structure

```
src/
├── App.tsx                      ← imports the active theme (one line)
├── pages/Index.tsx              ← composes all sections
├── theme/ThemeProvider.tsx      ← dark/light toggle context
├── themes/                      ← 5 plug-and-play visual themes
│   ├── midnight.css             ← default · dark luxury
│   ├── porcelain.css            ← Apple-style minimal light
│   ├── neo-brutalist.css        ← bold, high-contrast
│   ├── glassmorphic.css         ← frosted glass + gradients
│   ├── carbon-sport.css         ← racing red / carbon black
│   └── README.md
├── services/
│   └── predictionService.ts     ← MOCK BACKEND · swap for real API
├── components/
│   ├── Navbar.tsx               ← logo + nav + theme toggle
│   ├── Hero.tsx                 ← landing hero
│   ├── PredictSection.tsx       ← the 12-input form
│   ├── PredictionResults.tsx    ← price card + charts + similar cars
│   ├── BudgetSection.tsx        ← reverse search by budget
│   ├── HowItWorks.tsx           ← 4-step explainer
│   ├── Footer.tsx
│   └── AnimatedNumber.tsx       ← counts up smoothly
└── assets/hero-car.jpg          ← AI-generated hero image
```

---

## 🎨 Switching themes (plug & play)

Open `src/App.tsx` and change ONE line:

```tsx
import "@/themes/midnight.css";       // ← swap the filename
// import "@/themes/porcelain.css";
// import "@/themes/neo-brutalist.css";
// import "@/themes/glassmorphic.css";
// import "@/themes/carbon-sport.css";
```

Each theme defines the same set of HSL CSS variables (`--background`, `--foreground`, `--primary`, `--accent`, gradients, shadows, fonts), so all components re-skin automatically. Both **light & dark** modes work in every theme — toggle from the navbar.

To create your own: copy any theme file → tweak the values → import it.

---

## 🤖 Mock backend → real backend

The file `src/services/predictionService.ts` simulates the entire ML pipeline client-side:

1. **`predictPrice(input)`** — preprocess → run model → return price + feature contributions + similar cars + explanation
2. **`findCarForBudget(budget)`** — return best-fit car + reasoning + alternatives

Both functions add realistic latency (`setTimeout`) so the loading states feel real.

### When you have a real backend

Replace the body of each function with a `fetch()` call. The **TypeScript interfaces are the API contract** — your backend just needs to return the same shape.

Example replacement:

```ts
export async function predictPrice(input: CarInput): Promise<PredictionResult> {
  const res = await fetch("https://your-api.example.com/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}
```

Your backend should:
1. Accept the JSON body matching `CarInput`
2. Preprocess (encode categoricals, normalize ranges, compute age, etc.)
3. Feed into your trained model
4. Return JSON matching `PredictionResult`

The frontend will display everything dynamically — no other changes required.

### When you connect Lovable Cloud

If you later enable Lovable Cloud, move the heavy logic into an edge function (`supabase/functions/predict/index.ts`) and call it via `supabase.functions.invoke("predict", { body: input })`. The same response shape flows through.

---

## 🧠 What the model "sees"

Inputs (12 features):

| Feature | Type | Notes |
|---|---|---|
| `brand` | enum | 19 brands + "Other" |
| `model` | string | free text |
| `year` | int | used to compute `age` |
| `mileageKm` | int | normalized to /10000 |
| `horsepower` | int | normalized to /100 |
| `doors` | int | 2 / 3 / 4 / 5 |
| `conditionScore` | 0..10 | self-reported |
| `fuelType` | enum | Petrol / Diesel / Hybrid / Electric / LPG |
| `transmission` | enum | Manual / Automatic / CVT / DCT |
| `country` | enum | affects market value |
| `city` | string | passed through (placeholder) |
| `color` | enum | small effect |

Outputs:

- `predictedPrice` + `priceRange` (low/high) + `confidence`
- `featureContributions[]` — per-feature `importance` (global) and `contribution` (signed $ for THIS car, SHAP-style)
- `similarCars[]` — 3 nearest matches with `similarity`
- `explanation` — natural-language summary

---

## 🎬 Animations

Powered by **Framer Motion** + **CSS keyframes** (`animate-float`, `animate-glow-pulse`, etc.). Charts animate on mount via Recharts. Numbers count up smoothly via `AnimatedNumber`.

---

## ✅ Quick test checklist

1. Page loads with hero, forms scroll smoothly
2. Theme toggle (sun/moon) flips dark↔light without flicker
3. Submit predict form → loading spinner → animated price + charts + 3 cars + explanation
4. Slide budget → search → recommended car + alternatives
5. Swap `App.tsx` import to another theme → entire site re-skins, both modes still work
