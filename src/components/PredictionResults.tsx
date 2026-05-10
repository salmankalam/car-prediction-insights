import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, Gauge, Car as CarIcon } from "lucide-react";
import type { CarInput } from "@/services/predictionService";
import type { PredictResponse } from "@/services/api";
import { AnimatedNumber } from "./AnimatedNumber";

export const PredictionResults = ({ result, input }: { result: PredictResponse; input: CarInput }) => {
  return (
    <motion.div
      id="results"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative p-8 md:p-12 overflow-hidden bg-gradient-card backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/15 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-accent/15 blur-3xl rounded-full" />

        <div className="relative grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Predicted value · POST /api/predict</div>
            <div className="text-6xl md:text-7xl font-display font-bold text-gradient leading-none">
              <AnimatedNumber value={Math.round(result.price_usd)} prefix="$" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Range:{" "}
              <span className="text-foreground font-medium">${Math.round(result.price_range.low).toLocaleString()}</span> –
              <span className="text-foreground font-medium"> ${Math.round(result.price_range.high).toLocaleString()}</span>
              <span className="mx-2">·</span>
              Confidence: <span className="text-success font-medium">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
            {result.derived && (
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-background/50 border border-border">age {result.derived.age}y</span>
                <span className="px-2 py-1 rounded-full bg-background/50 border border-border">
                  {Math.round(result.derived.mileage_per_year).toLocaleString()} km/year
                </span>
                {result.derived.is_luxury_brand && (
                  <span className="px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">luxury brand</span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Stat icon={CarIcon} label="Vehicle" value={`${input.year} ${input.brand}`} />
            <Stat icon={Gauge} label="Mileage" value={`${input.mileageKm.toLocaleString()} km`} />
            <Stat icon={Sparkles} label="Condition" value={`${input.conditionScore}/10`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-background/40 border border-border">
    <Icon className="h-4 w-4 text-primary" />
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);
