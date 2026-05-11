import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import {
  CheckCircle2, Loader2, ChevronDown, Activity, Sparkles, Beaker,
  Layers, Cog, Waves, Gauge, BadgeCheck,
} from "lucide-react";
// 🔴 LIVE backend — real explainability endpoints
import {
  fetchFeatureEngineering, fetchLocalShap, fetchLime, fetchPermutation,
  fetchModelImportance, fetchPartialDependence, fetchXaiMetrics,
  type CarInput, type FeatureEngineeringResponse, type ShapResponse,
  type LimeResponse, type ImportanceResponse, type ModelImportanceResponse,
  type PdpResponse, type XaiMetricsResponse,
} from "@/services/api";

type TaskKey = "fe" | "shap" | "lime" | "perm" | "model" | "pdp" | "xai";

interface Task {
  key: TaskKey;
  label: string;
  endpoint: string;
  method: "GET" | "POST";
  icon: typeof Sparkles;
  description: string;
}

const TASKS: Task[] = [
  { key: "fe",    label: "Feature engineering",     method: "POST", endpoint: "/api/feature-engineering",       icon: Cog,        description: "Encode raw inputs into model features" },
  { key: "shap",  label: "Local SHAP",              method: "POST", endpoint: "/api/explain/shap",              icon: Sparkles,   description: "Per-feature contributions for this car" },
  { key: "lime",  label: "LIME",                    method: "POST", endpoint: "/api/explain/lime",              icon: Beaker,     description: "Local linear surrogate explanation" },
  { key: "perm",  label: "Permutation importance",  method: "GET",  endpoint: "/api/explain/permutation",       icon: Layers,     description: "Global drop in score when shuffled" },
  { key: "model", label: "Model importance",        method: "GET",  endpoint: "/api/explain/model-importance",  icon: Activity,   description: "LightGBM built-in feature gain" },
  { key: "pdp",   label: "Partial dependence",      method: "GET",  endpoint: "/api/explain/partial-dependence",icon: Waves,      description: "Average effect of each feature on price" },
  { key: "xai",   label: "XAI metrics",             method: "GET",  endpoint: "/api/explain/xai-metrics",       icon: BadgeCheck, description: "Fidelity, consistency, sparsity, robustness" },
];

interface ResultMap {
  fe?: FeatureEngineeringResponse;
  shap?: ShapResponse;
  lime?: LimeResponse;
  perm?: ImportanceResponse;
  model?: ModelImportanceResponse;
  pdp?: PdpResponse;
  xai?: XaiMetricsResponse;
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};
const tipItem = { color: "hsl(var(--popover-foreground))" };
const tipLabel = { color: "hsl(var(--popover-foreground))", fontWeight: 600 };

export const LiveInference = ({ input }: { input: CarInput }) => {
  const [results, setResults] = useState<ResultMap>({});
  const [order, setOrder] = useState<TaskKey[]>([]);
  const [errors, setErrors] = useState<Partial<Record<TaskKey, string>>>({});
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setResults({});
    setOrder([]);
    setErrors({});

    const launchers: Array<[TaskKey, Promise<unknown>]> = [
      // 🔴 LIVE REQUEST — feature engineering
      ["fe",    fetchFeatureEngineering(input)],
      // 🔴 LIVE REQUEST — local SHAP
      ["shap",  fetchLocalShap(input)],
      // 🔴 LIVE REQUEST — LIME
      ["lime",  fetchLime(input)],
      // 🔴 LIVE REQUEST — permutation importance (GET)
      ["perm",  fetchPermutation()],
      // 🔴 LIVE REQUEST — LightGBM model importance (GET)
      ["model", fetchModelImportance()],
      // 🔴 LIVE REQUEST — partial dependence (GET)
      ["pdp",   fetchPartialDependence()],
      // 🔴 LIVE REQUEST — XAI metrics (GET)
      ["xai",   fetchXaiMetrics()],
    ];

    launchers.forEach(([key, p]) => {
      p.then((value) => {
        if (cancelled) return;
        setResults((s) => ({ ...s, [key]: value as never }));
        setOrder((o) => (o.includes(key) ? o : [...o, key]));
      }).catch((err: Error) => {
        if (cancelled) return;
        setErrors((e) => ({ ...e, [key]: err.message }));
        setOrder((o) => (o.includes(key) ? o : [...o, key]));
      });
    });

    return () => { cancelled = true; };
  }, [input]);

  const doneSet = useMemo(() => new Set(order), [order]);
  const total = TASKS.length;
  const done = order.length;

  return (
    <div className="space-y-5">
      {/* Streaming results — appear above the checklist as they arrive */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {order.map((k) => {
            const t = TASKS.find((x) => x.key === k)!;
            return (
              <motion.div
                key={k}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="p-5 md:p-6 bg-gradient-card backdrop-blur-xl border border-success/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <t.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="font-display font-semibold">{t.label}</span>
                      <code className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        {t.method} {t.endpoint}
                      </code>
                    </div>
                    {errors[k] ? (
                      <Badge variant="destructive" className="text-[10px]">error</Badge>
                    ) : (
                      <Badge className="bg-success/15 text-success border-0 text-[10px]">200 OK</Badge>
                    )}
                  </div>
                  {errors[k] ? (
                    <p className="text-xs text-destructive">{errors[k]}</p>
                  ) : (
                    <ResultBody k={k} results={results} />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Toggleable checklist — pushed down as results land above */}
      <Card className="p-5 bg-gradient-card backdrop-blur-xl">
        <button
          type="button"
          className="w-full flex items-center justify-between"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full ${done < total ? "bg-success animate-ping" : "bg-success/40"}`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <div className="text-left">
              <div className="font-display font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" /> Live API checklist
              </div>
              <div className="text-xs text-muted-foreground">
                {done}/{total} backend calls complete
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-mono">
              {done}/{total}
            </Badge>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {TASKS.map((t) => {
                const isDone = doneSet.has(t.key);
                const isError = !!errors[t.key];
                return (
                  <li
                    key={t.key}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border"
                  >
                    {isDone ? (
                      isError ? (
                        <span className="h-4 w-4 rounded-full bg-destructive/20 grid place-items-center text-destructive text-[10px] shrink-0">!</span>
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      )
                    ) : (
                      <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <t.icon className="h-3.5 w-3.5 text-primary" />
                        {t.label}
                        <code className="text-[10px] text-muted-foreground font-mono hidden md:inline">
                          {t.method} {t.endpoint}
                        </code>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                    </div>
                    <Badge
                      variant={isDone ? "secondary" : "outline"}
                      className={`text-[10px] uppercase tracking-wider ${isDone && !isError ? "bg-success/15 text-success border-0" : ""}`}
                    >
                      {isDone ? (isError ? "failed" : "done") : "running"}
                    </Badge>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

/* ───────────────────── per-task chart bodies ───────────────────── */

const horiz = (data: { name: string; value: number }[], colorFn: (v: number) => string, fmt: (v: number) => string, label: string) => (
  <ResponsiveContainer width="100%" height={Math.max(180, 28 * data.length + 30)}>
    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={fmt} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tipItem} labelStyle={tipLabel} formatter={(v: number) => [fmt(v), label]} />
      <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
        {data.map((d, i) => <Cell key={i} fill={colorFn(d.value)} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const ResultBody = ({ k, results }: { k: TaskKey; results: ResultMap }) => {
  if (k === "fe" && results.fe) {
    const d = results.fe.derived;
    const eng = Object.entries(results.fe.engineered_features).slice(0, 12);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(d).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-background/50 border border-border p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{key.replace(/_/g, " ")}</div>
              <div className="text-sm font-medium tabular-nums">{String(val)}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground">First {eng.length} engineered features:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px] font-mono">
          {eng.map(([key, val]) => (
            <div key={key} className="flex justify-between gap-2 px-2 py-1 rounded bg-background/50 border border-border">
              <span className="text-muted-foreground truncate">{key}</span>
              <span className="tabular-nums">{Number(val).toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (k === "shap" && results.shap) {
    const data = results.shap.contributions
      .slice()
      .sort((a, b) => Math.abs(b.contribution_usd) - Math.abs(a.contribution_usd))
      .slice(0, 10)
      .map((c) => ({ name: c.label, value: Math.round(c.contribution_usd) }));
    return horiz(
      data,
      (v) => (v >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"),
      (v) => `${v >= 0 ? "+" : "-"}$${Math.abs(v).toLocaleString()}`,
      "SHAP $",
    );
  }
  if (k === "lime" && results.lime) {
    const data = results.lime.contributions
      .slice(0, 10)
      .map((c) => ({ name: c.label, value: Math.round(c.contribution_usd) }));
    return (
      <>
        <div className="text-xs text-muted-foreground mb-2">
          Method: <span className="text-foreground font-medium">{results.lime.method}</span>
          {" · "}intercept: <span className="text-foreground font-medium">{results.lime.intercept.toFixed(3)}</span>
        </div>
        {horiz(
          data,
          (v) => (v >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"),
          (v) => `${v >= 0 ? "+" : "-"}$${Math.abs(v).toLocaleString()}`,
          "LIME $",
        )}
      </>
    );
  }
  if (k === "perm" && results.perm) {
    const data = results.perm.importances
      .slice(0, 10)
      .map((r) => ({ name: r.label, value: +(r.importance).toFixed(4) }));
    return horiz(data, () => "hsl(var(--accent))", (v) => v.toFixed(3), "Δ score");
  }
  if (k === "model" && results.model) {
    const data = results.model.importances
      .slice(0, 10)
      .map((r) => ({ name: r.label, value: +(r.normalized_importance * 100).toFixed(1) }));
    return horiz(data, () => "hsl(var(--primary))", (v) => `${v}%`, "Importance");
  }
  if (k === "pdp" && results.pdp) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {results.pdp.features.slice(0, 4).map((f) => (
          <div key={f.feature} className="rounded-xl bg-background/40 border border-border p-3">
            <div className="text-xs font-medium mb-2">{f.label}</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={f.points} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="feature_value" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={42} />
                <Tooltip cursor={{ fill: "hsl(var(--primary) / 0.12)" }} contentStyle={tooltipStyle} itemStyle={tipItem} labelStyle={tipLabel} formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Price"]} />
                <Line type="monotone" dataKey="predicted_price_usd" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} animationDuration={700} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    );
  }
  if (k === "xai" && results.xai) {
    const metricSource = results.xai.metrics ?? results.xai;
    const entries = Object.entries(metricSource).filter(([, v]) => typeof v === "number") as [string, number][];
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {entries.map(([key, val]) => (
          <div key={key} className="rounded-xl bg-background/40 border border-border p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{key}</div>
            <div className="text-2xl font-display font-bold text-gradient mt-1">
              {val < 1 ? (val * 100).toFixed(0) + "%" : val.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
