import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts";
import { Sparkles, Gauge, Car as CarIcon } from "lucide-react";
import type { CarInput, PredictionResult } from "@/services/predictionService";
import { AnimatedNumber } from "./AnimatedNumber";
import { PriceRangeExplorer } from "./PriceRangeExplorer";

export const PredictionResults = ({ result, input }: { result: PredictionResult; input: CarInput }) => {
  const importanceData = [...result.featureContributions]
    .sort((a, b) => b.importance - a.importance)
    .map((c) => ({ name: c.feature, value: +(c.importance * 100).toFixed(1) }));

  const contribData = [...result.featureContributions]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .map((c) => ({ name: c.feature, value: c.contribution }));

  return (
    <motion.div
      id="results"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 space-y-6"
    >
      {/* Headline price card */}
      <Card className="relative p-8 md:p-12 overflow-hidden bg-gradient-card backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/15 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-accent/15 blur-3xl rounded-full" />

        <div className="relative grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Predicted value</div>
            <div className="text-6xl md:text-7xl font-display font-bold text-gradient leading-none">
              <AnimatedNumber value={result.predictedPrice} prefix="$" />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Range: <span className="text-foreground font-medium">${result.priceRange.low.toLocaleString()}</span> –
              <span className="text-foreground font-medium"> ${result.priceRange.high.toLocaleString()}</span>
              <span className="mx-2">·</span>
              Confidence: <span className="text-success font-medium">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <Stat icon={CarIcon} label="Vehicle" value={`${input.year} ${input.brand}`} />
            <Stat icon={Gauge} label="Mileage" value={`${input.mileageKm.toLocaleString()} km`} />
            <Stat icon={Sparkles} label="Condition" value={`${input.conditionScore}/10`} />
          </div>
        </div>
      </Card>

      {/* AI Explanation */}
      <Card className="p-6 md:p-8 bg-gradient-card backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center shrink-0 shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">AI explanation</div>
            <p className="text-base leading-relaxed text-foreground/90">{result.explanation}</p>
          </div>
        </div>
      </Card>

      {/* Two charts side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-lg">Feature importance</h3>
            <Badge variant="secondary" className="text-[10px]">global model</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">How much each feature matters across all predictions.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={importanceData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Importance"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={900}>
                {importanceData.map((_, i) => (
                  <Cell key={i} fill={`hsl(var(--primary) / ${0.4 + (importanceData.length - i) / importanceData.length * 0.6})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-lg">Price contribution</h3>
            <Badge variant="secondary" className="text-[10px]">this car · SHAP-style</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">How each feature pushes the price up or down for your car.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={contribData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v >= 0 ? "+" : ""}$${v.toLocaleString()}`, "Contribution"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={900}>
                {contribData.map((d, i) => (
                  <Cell key={i} fill={d.value >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Similar cars */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h3 className="font-display font-semibold text-2xl">Similar cars at similar prices</h3>
          <span className="text-xs text-muted-foreground">3 closest matches</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {result.similarCars.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
            >
              <Card className="p-5 bg-gradient-card backdrop-blur-xl hover:shadow-glow hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-primary/15 text-primary border-0">{(c.similarity * 100).toFixed(0)}% match</Badge>
                  {c.price >= result.predictedPrice
                    ? <TrendingUp className="h-4 w-4 text-success" />
                    : <TrendingDown className="h-4 w-4 text-destructive" />}
                </div>
                <div className="text-sm text-muted-foreground">{c.year}</div>
                <div className="font-display font-semibold text-lg leading-tight">{c.brand} {c.model}</div>
                <div className="mt-2 text-2xl font-bold text-gradient">${c.price.toLocaleString()}</div>
                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Mileage</span><span className="text-foreground">{c.mileageKm.toLocaleString()} km</span></div>
                  <div className="flex justify-between"><span>Fuel</span><span className="text-foreground">{c.fuelType}</span></div>
                  <div className="flex justify-between"><span>Transmission</span><span className="text-foreground">{c.transmission}</span></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
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
