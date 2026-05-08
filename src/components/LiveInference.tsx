import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Loader2, CheckCircle2, Activity, Waves, Layers, Beaker, Sparkles } from "lucide-react";
import {
  fetchShap, fetchFeatureImportance, fetchAle, fetchPermutationImportance, fetchLime,
  type CarInput, type ShapResult, type FeatureImportanceResult, type AleResult,
  type PermutationImportanceResult, type LimeResult,
} from "@/services/api";

type TaskKey = "shap" | "fi" | "ale" | "perm" | "lime";

interface Task {
  key: TaskKey;
  label: string;
  endpoint: string;
  icon: typeof Sparkles;
  description: string;
}

const TASKS: Task[] = [
  { key: "shap", label: "SHAP",                   endpoint: "POST /explain/shap",                   icon: Sparkles, description: "Per-feature contributions for this car" },
  { key: "fi",   label: "Feature Importance",      endpoint: "POST /explain/feature-importance",     icon: Activity, description: "Global feature ranking from the model" },
  { key: "ale",  label: "ALE",                    endpoint: "POST /explain/ale",                    icon: Waves,    description: "Accumulated local effects across mileage" },
  { key: "perm", label: "Permutation Importance", endpoint: "POST /explain/permutation-importance", icon: Layers,   description: "Drop in R² when feature is shuffled" },
  { key: "lime", label: "LIME",                   endpoint: "POST /explain/lime",                   icon: Beaker,   description: "Local linear surrogate explanation" },
];

interface ResultMap {
  shap?: ShapResult;
  fi?: FeatureImportanceResult;
  ale?: AleResult;
  perm?: PermutationImportanceResult;
  lime?: LimeResult;
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};
const tooltipItem = { color: "hsl(var(--popover-foreground))" };
const tooltipLabel = { color: "hsl(var(--popover-foreground))", fontWeight: 600 };

export const LiveInference = ({ input }: { input: CarInput }) => {
  const [results, setResults] = useState<ResultMap>({});
  const [running, setRunning] = useState<TaskKey[]>(TASKS.map((t) => t.key));

  useEffect(() => {
    let cancelled = false;
    setResults({});
    setRunning(TASKS.map((t) => t.key));

    // Fire all 5 LIVE explainer requests in parallel and stream them in.
    const launchers: Array<[TaskKey, Promise<unknown>]> = [
      // 🔴 LIVE REQUEST — SHAP
      ["shap", fetchShap(input).then((r) => !cancelled && complete("shap", r))],
      // 🔴 LIVE REQUEST — Feature Importance
      ["fi", fetchFeatureImportance(input).then((r) => !cancelled && complete("fi", r))],
      // 🔴 LIVE REQUEST — ALE
      ["ale", fetchAle(input).then((r) => !cancelled && complete("ale", r))],
      // 🔴 LIVE REQUEST — Permutation Importance
      ["perm", fetchPermutationImportance(input).then((r) => !cancelled && complete("perm", r))],
      // 🔴 LIVE REQUEST — LIME
      ["lime", fetchLime(input).then((r) => !cancelled && complete("lime", r))],
    ];

    function complete<K extends TaskKey>(k: K, value: ResultMap[K]) {
      setResults((s) => ({ ...s, [k]: value }));
      setRunning((r) => r.filter((x) => x !== k));
    }

    void Promise.all(launchers.map(([, p]) => p));
    return () => { cancelled = true; };
  }, [input]);

  const pending = TASKS.filter((t) => running.includes(t.key));
  const done = TASKS.filter((t) => !running.includes(t.key));

  return (
    <Card className="p-6 md:p-8 bg-gradient-card backdrop-blur-xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full ${pending.length ? "bg-success animate-ping" : "bg-success/40"}`} />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          Live model insights
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          {done.length}/{TASKS.length} responses received
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Streaming explainability calls in real time from the model server.
      </p>

      {/* Pending requests — animate up & out as they resolve */}
      <div className="space-y-2 mb-5">
        <AnimatePresence>
          {pending.map((t) => (
            <motion.div
              key={t.key}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border"
            >
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  <t.icon className="h-3.5 w-3.5 text-primary" />
                  {t.label}
                  <code className="text-[10px] text-muted-foreground font-mono">{t.endpoint}</code>
                </div>
                <div className="text-xs text-muted-foreground truncate">{t.description}</div>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">running</Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Completed results — render below as they arrive */}
      <div className="space-y-4">
        <AnimatePresence>
          {done.map((t) => (
            <motion.div
              key={t.key}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-success/30 bg-background/40 p-4 md:p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-display font-semibold">{t.label}</span>
                  <code className="text-[10px] text-muted-foreground font-mono">{t.endpoint}</code>
                </div>
                <Badge className="bg-success/15 text-success border-0 text-[10px]">200 OK</Badge>
              </div>
              <ResultBody taskKey={t.key} results={results} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};

const ResultBody = ({ taskKey, results }: { taskKey: TaskKey; results: ResultMap }) => {
  if (taskKey === "shap" && results.shap) {
    const data = results.shap.values
      .slice()
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 8)
      .map((v) => ({ name: v.feature, value: Math.round(v.value) }));
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tooltipItem} labelStyle={tooltipLabel} formatter={(v: number) => [`${v >= 0 ? "+" : ""}$${v.toLocaleString()}`, "SHAP"]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
            {data.map((d, i) => <Cell key={i} fill={d.value >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (taskKey === "fi" && results.fi) {
    const data = results.fi.values
      .map((v) => ({ name: v.feature, value: +(v.importance * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tooltipItem} labelStyle={tooltipLabel} formatter={(v: number) => [`${v}%`, "Importance"]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (taskKey === "ale" && results.ale) {
    const data = results.ale.bins.map((b) => ({ x: typeof b.x === "number" ? `${(b.x / 1000).toFixed(0)}k` : b.x, effect: b.effect }));
    return (
      <>
        <div className="text-xs text-muted-foreground mb-2">Effect of <span className="text-foreground font-medium">{results.ale.feature}</span> on price</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tooltipItem} labelStyle={tooltipLabel} formatter={(v: number) => [`$${v.toLocaleString()}`, "Effect"]} />
            <Line type="monotone" dataKey="effect" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  }
  if (taskKey === "perm" && results.perm) {
    const data = results.perm.values
      .map((v) => ({ name: v.feature, value: v.deltaR2 }))
      .sort((a, b) => b.value - a.value);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tooltipItem} labelStyle={tooltipLabel} formatter={(v: number) => [v.toFixed(3), "Δ R²"]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700} fill="hsl(var(--accent))" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (taskKey === "lime" && results.lime) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Local intercept: <span className="text-foreground font-medium">${results.lime.intercept.toLocaleString()}</span></div>
        {results.lime.weights.slice(0, 6).map((w) => {
          const pct = Math.min(100, Math.abs(w.weight) / 80);
          const positive = w.weight >= 0;
          return (
            <div key={w.feature} className="flex items-center gap-3">
              <div className="w-24 text-xs text-muted-foreground truncate">{w.feature}</div>
              <div className="flex-1 h-2 rounded-full bg-background relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${positive ? "bg-success" : "bg-destructive"}`}
                />
              </div>
              <div className={`text-xs tabular-nums w-20 text-right font-mono ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? "+" : ""}${Math.round(w.weight).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};
