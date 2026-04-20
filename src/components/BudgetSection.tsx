import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Sparkles, Fuel, Gauge, Settings } from "lucide-react";
import { findCarForBudget, type BudgetMatch } from "@/services/predictionService";
import { AnimatedNumber } from "./AnimatedNumber";

export const BudgetSection = () => {
  const [budget, setBudget] = useState(25000);
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<BudgetMatch | null>(null);

  const submit = async () => {
    setLoading(true);
    const res = await findCarForBudget(budget);
    setMatch(res);
    setLoading(false);
  };

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
            <Wallet className="h-3 w-3" /> Step 2 · Reverse search
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Got a budget? <span className="text-gradient">We'll match the car.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us what you can spend. We'll show the car that fits — and explain why.
          </p>
        </motion.div>

        <Card className="p-8 md:p-12 bg-gradient-card backdrop-blur-xl shadow-elegant">
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your budget</div>
            <div className="text-6xl font-display font-bold text-gradient">
              <AnimatedNumber value={budget} prefix="$" />
            </div>
          </div>

          <div className="max-w-xl mx-auto py-4">
            <Slider value={[budget]} min={2000} max={150000} step={500} onValueChange={(v) => setBudget(v[0])} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
              <span>$2k</span><span>$50k</span><span>$100k</span><span>$150k</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button size="lg" onClick={submit} disabled={loading}
              className="rounded-full bg-gradient-accent shadow-glow min-w-[220px] hover:-translate-y-0.5 transition-all">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…</>
                : <>Find my car <Sparkles className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </Card>

        {match && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 space-y-6"
          >
            <Card className="p-8 md:p-10 bg-gradient-card backdrop-blur-xl border-2 border-accent/20 shadow-glow overflow-hidden relative">
              <div className="absolute top-0 right-0 h-64 w-64 bg-accent/15 blur-3xl rounded-full" />
              <div className="relative grid md:grid-cols-2 gap-8">
                <div>
                  <Badge className="bg-accent/15 text-accent-foreground border-0 mb-3">Best match</Badge>
                  <div className="text-sm text-muted-foreground">{match.car.year}</div>
                  <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                    {match.car.brand} <span className="text-gradient">{match.car.model}</span>
                  </h3>
                  <div className="mt-4 text-3xl font-bold">
                    ~${match.car.estimatedPrice.toLocaleString()}
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-foreground/90">{match.reasoning}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 self-center">
                  <Spec icon={Gauge}    label="Mileage"      value={`${match.car.mileageKm.toLocaleString()} km`} />
                  <Spec icon={Sparkles} label="Horsepower"   value={`${match.car.horsepower} HP`} />
                  <Spec icon={Fuel}     label="Fuel"         value={match.car.fuelType} />
                  <Spec icon={Settings} label="Transmission" value={match.car.transmission} />
                  <Spec icon={Sparkles} label="Condition"    value={`${match.car.conditionScore}/10`} />
                  <Spec icon={Sparkles} label="Color"        value={match.car.color} />
                </div>
              </div>
            </Card>

            <div>
              <h4 className="font-display font-semibold text-lg mb-3">Other options worth checking</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {match.alternatives.map((a, i) => (
                  <Card key={i} className="p-4 bg-gradient-card backdrop-blur-xl hover:-translate-y-0.5 hover:shadow-elegant transition-all">
                    <div className="text-xs text-muted-foreground">{a.year}</div>
                    <div className="font-semibold">{a.brand} {a.model}</div>
                    <div className="text-lg font-bold text-gradient mt-1">${a.price.toLocaleString()}</div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const Spec = ({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) => (
  <div className="rounded-2xl bg-background/40 border border-border p-3">
    <Icon className="h-4 w-4 text-accent mb-2" />
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="text-sm font-medium mt-0.5">{value}</div>
  </div>
);
