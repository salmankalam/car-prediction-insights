import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Sparkles, Shuffle, AlertCircle } from "lucide-react";
// 🔴 LIVE backend client — DiCE counterfactual endpoint
import { fetchCounterfactual, type CounterfactualResponse } from "@/services/api";
import { useLastCarInput } from "@/services/lastCarInput";
import { AnimatedNumber } from "./AnimatedNumber";
import type { CarInput } from "@/services/predictionService";

const FALLBACK_INPUT: CarInput = {
  brand: "BMW",
  model: "3 Series",
  year: 2020,
  mileageKm: 45000,
  horsepower: 255,
  doors: 4,
  conditionScore: 8,
  fuelType: "Petrol",
  transmission: "Automatic",
  country: "Germany",
  city: "Munich",
  color: "Black",
};

export const BudgetSection = () => {
  const lastInput = useLastCarInput();
  const carInput = lastInput ?? FALLBACK_INPUT;

  const [budget, setBudget] = useState(25000);
  const [loading, setLoading] = useState(false);
  const [cf, setCf] = useState<CounterfactualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setCf(null);
    try {
      // 🔴 LIVE REQUEST — POST /api/counterfactual (DiCE)
      const res = await fetchCounterfactual(carInput, budget);
      setCf(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Counterfactual call failed");
    } finally {
      setLoading(false);
    }
  };

  const cfRows = useMemo(() => cf?.counterfactuals ?? [], [cf]);

  return (
    <section id="budget" className="relative py-24 md:py-32 border-t border-border/60">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-xs font-medium mb-4">
            <Wallet className="h-3 w-3" /> Budget match · DiCE counterfactuals
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Got a budget? <span className="text-gradient">We'll match the car.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We feed your car spec + budget into the model's DiCE counterfactual engine and show how a real car would need to look at that price.
          </p>
        </motion.div>

        <Card className="p-8 md:p-12 bg-gradient-card backdrop-blur-xl shadow-elegant">
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your budget</div>
            <div className="text-6xl font-display font-bold text-gradient">
              <AnimatedNumber value={budget} prefix="$" />
            </div>
          </div>

          <div className="max-w-xl mx-auto py-4 space-y-4">
            <Slider value={[budget]} min={2000} max={150000} step={500} onValueChange={(v) => setBudget(v[0])} />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>$2k</span><span>$50k</span><span>$100k</span><span>$150k</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">Or type it</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={500}
                  max={500000}
                  step={500}
                  value={budget}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setBudget(Math.max(500, Math.min(500000, v)));
                  }}
                  className="pl-7 text-base font-medium tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-2">
            <Button
              size="lg"
              onClick={submit}
              disabled={loading}
              className="rounded-full bg-gradient-accent shadow-glow min-w-[220px] hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calling DiCE…</>
              ) : (
                <>Find my car <Sparkles className="ml-2 h-4 w-4" /></>
              )}
            </Button>
            <div className="text-[11px] text-muted-foreground">
              Using car spec: <span className="text-foreground font-medium">{carInput.year} {carInput.brand} {carInput.model}</span>
              {!lastInput && " (defaults — predict a car above to use yours)"}
            </div>
          </div>
        </Card>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <Card className="p-4 border-destructive/40 bg-destructive/10 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <div className="text-sm">{error}</div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {cf && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-xl flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-accent" /> DiCE counterfactuals
              </h4>
              <Badge variant="secondary" className="text-[10px] font-mono">POST /api/counterfactual</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{cf.note}</p>

            <div className="grid md:grid-cols-3 gap-4">
              {cfRows.map((row, i) => (
                <Card key={i} className="p-5 bg-gradient-card backdrop-blur-xl border border-accent/20 hover:-translate-y-0.5 hover:shadow-elegant transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-accent/15 text-accent-foreground border-0">option {i + 1}</Badge>
                    {"estimated_price_usd" in row && (
                      <div className="text-lg font-bold text-gradient">
                        ${Number(row.estimated_price_usd).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(row).slice(0, 8).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px] gap-2">
                        <span className="text-muted-foreground truncate">{key.replace(/_/g, " ")}</span>
                        <span className="tabular-nums font-mono text-foreground/90 truncate">
                          {typeof val === "number" ? val.toLocaleString() : typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
