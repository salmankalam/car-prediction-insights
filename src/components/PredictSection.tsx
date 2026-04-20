import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import {
  predictPrice, BRAND_OPTIONS, FUEL_OPTIONS, TRANSMISSION_OPTIONS,
  COUNTRY_OPTIONS, COLOR_OPTIONS, type CarInput, type PredictionResult,
} from "@/services/predictionService";
import { PredictionResults } from "./PredictionResults";

const defaults: CarInput = {
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

export const PredictSection = () => {
  const [input, setInput] = useState<CarInput>(defaults);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const update = <K extends keyof CarInput>(k: K, v: CarInput[K]) => setInput((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setLoading(true);
    const res = await predictPrice(input);
    setResult(res);
    setLoading(false);
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <section id="predict" className="relative py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Step 1 · Valuation
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Tell us about <span className="text-gradient">your car</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            12 inputs. Real-time preprocessing. Sub-second model inference.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <Card className="p-6 md:p-10 bg-gradient-card backdrop-blur-xl border shadow-elegant">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Brand">
                <Select value={input.brand} onValueChange={(v) => update("brand", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BRAND_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Model">
                <Input value={input.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. 3 Series" />
              </Field>

              <Field label="Year">
                <Input type="number" min={1980} max={new Date().getFullYear()} value={input.year}
                  onChange={(e) => update("year", +e.target.value)} />
              </Field>

              <Field label={`Mileage · ${input.mileageKm.toLocaleString()} km`}>
                <Slider value={[input.mileageKm]} min={0} max={400000} step={1000}
                  onValueChange={(v) => update("mileageKm", v[0])} className="py-3" />
              </Field>

              <Field label={`Horsepower · ${input.horsepower} HP`}>
                <Slider value={[input.horsepower]} min={50} max={800} step={5}
                  onValueChange={(v) => update("horsepower", v[0])} className="py-3" />
              </Field>

              <Field label="Doors">
                <Select value={String(input.doors)} onValueChange={(v) => update("doors", +v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[2, 3, 4, 5].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>

              <Field label={`Condition · ${input.conditionScore}/10`}>
                <Slider value={[input.conditionScore]} min={0} max={10} step={1}
                  onValueChange={(v) => update("conditionScore", v[0])} className="py-3" />
              </Field>

              <Field label="Fuel Type">
                <Select value={input.fuelType} onValueChange={(v) => update("fuelType", v as CarInput["fuelType"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>

              <Field label="Transmission">
                <Select value={input.transmission} onValueChange={(v) => update("transmission", v as CarInput["transmission"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSMISSION_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>

              <Field label="Country">
                <Select value={input.country} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>

              <Field label="City">
                <Input value={input.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Munich" />
              </Field>

              <Field label="Color">
                <Select value={input.color} onValueChange={(v) => update("color", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COLOR_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={submit} disabled={loading}
                className="rounded-full bg-gradient-accent shadow-glow min-w-[200px] hover:-translate-y-0.5 transition-all">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Predicting…</>
                  : <>Predict price <Sparkles className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </Card>
        </motion.div>

        {result && <PredictionResults result={result} input={input} />}
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
  </div>
);
