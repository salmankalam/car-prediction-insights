import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Sparkles, Globe, TrendingUp, Loader2 } from "lucide-react";
// 🔴 LIVE backend — final-summary endpoints
import {
  fetchGlobalSummary, fetchPriceEffects,
  type CarInput, type GlobalSummaryResponse, type PriceEffectsResponse,
} from "@/services/api";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};
const tipItem = { color: "hsl(var(--popover-foreground))" };
const tipLabel = { color: "hsl(var(--popover-foreground))", fontWeight: 600 };

export const FinalSummary = ({ input }: { input: CarInput }) => {
  const [summary, setSummary] = useState<GlobalSummaryResponse | null>(null);
  const [effects, setEffects] = useState<PriceEffectsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setEffects(null);
    // 🔴 LIVE REQUEST — global summary (global-shap + combined importance)
    fetchGlobalSummary().then((r) => !cancelled && setSummary(r)).catch(() => {});
    // 🔴 LIVE REQUEST — price effects (PDP what-if for this car)
    fetchPriceEffects(input).then((r) => !cancelled && setEffects(r)).catch(() => {});
    return () => { cancelled = true; };
  }, [input]);

  const globalShap =
    summary?.global_shap_importance.slice(0, 10).map((r) => ({
      name: r.label,
      value: Math.round(r.mean_abs_shap_usd),
    })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Final summary</div>
          <h3 className="font-display font-semibold text-2xl">What drives this price</h3>
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-gradient-card backdrop-blur-xl border-2 border-primary/20 shadow-glow">
        {summary ? (
          <p className="text-base leading-relaxed text-foreground/90">{summary.summary}</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Calling /api/explain/global-summary…
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Global SHAP */}
        <Card className="p-6 bg-gradient-card backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display font-semibold text-lg flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Global SHAP
            </h4>
            <Badge variant="secondary" className="text-[10px] font-mono">/global-summary</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Average absolute SHAP impact across the backend sample (USD).
          </p>
          {globalShap.length ? (
            <ResponsiveContainer width="100%" height={Math.max(220, 28 * globalShap.length + 20)}>
              <BarChart data={globalShap} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tipItem} labelStyle={tipLabel} formatter={(v: number) => [`$${v.toLocaleString()}`, "|SHAP|"]} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
                  {globalShap.map((_, i) => (
                    <Cell key={i} fill={`hsl(var(--primary) / ${0.4 + (globalShap.length - i) / globalShap.length * 0.6})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Loading />
          )}
        </Card>

        {/* Combined importance (consensus) */}
        <Card className="p-6 bg-gradient-card backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Consensus importance
            </h4>
            <Badge variant="secondary" className="text-[10px] font-mono">combined XAI</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Average rank across SHAP, LightGBM, permutation, LIME and PDP.
          </p>
          {summary?.top_combined_importance.length ? (
            <ResponsiveContainer width="100%" height={Math.max(220, 28 * summary.top_combined_importance.length + 20)}>
              <BarChart
                data={summary.top_combined_importance.map((r) => ({ name: r.label, value: +(r.consensus_score * 100).toFixed(1) }))}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--accent) / 0.15)" }} contentStyle={tooltipStyle} itemStyle={tipItem} labelStyle={tipLabel} formatter={(v: number) => [`${v}%`, "Consensus"]} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--accent))" animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Loading />
          )}
        </Card>
      </div>

      {/* Price effects (per-car PDP what-if) */}
      <Card className="p-6 md:p-8 bg-gradient-card backdrop-blur-xl">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-display font-semibold text-lg">Price effects · what-if</h4>
          <Badge variant="secondary" className="text-[10px] font-mono">/explain/price-effects</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {effects?.summary_text ?? "Estimating how nudging each top feature shifts your car's price…"}
        </p>

        {effects ? (
          <div className="grid md:grid-cols-2 gap-4">
            {effects.effects.map((e) => {
              const positive = e.delta_usd >= 0;
              return (
                <div key={e.feature} className="rounded-2xl bg-background/40 border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{e.label}</div>
                      <div className="text-sm font-medium">{e.change}</div>
                    </div>
                    <div className={`text-lg font-bold tabular-nums ${positive ? "text-success" : "text-destructive"}`}>
                      {positive ? "+" : "-"}${Math.abs(Math.round(e.delta_usd)).toLocaleString()}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={e.pdp_points} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                      <XAxis dataKey="feature_value" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={42} />
                      <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tipItem} labelStyle={tipLabel} formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "PDP price"]} />
                      <Line type="monotone" dataKey="predicted_price_usd" stroke={positive ? "hsl(var(--success))" : "hsl(var(--destructive))"} strokeWidth={2} dot={false} animationDuration={700} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-[11px] text-muted-foreground">{e.text}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <Loading />
        )}
      </Card>
    </motion.div>
  );
};

const Loading = () => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading from backend…
  </div>
);
