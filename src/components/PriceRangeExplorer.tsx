import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, ArrowDownCircle, Target, Loader2, Gauge, Zap, Calendar } from "lucide-react";
import { findCarsInPriceRange, type PriceRangeMatches, type PriceRangeCar } from "@/services/predictionService";

interface Props {
  predictedPrice: number;
}

export const PriceRangeExplorer = ({ predictedPrice }: Props) => {
  const defaultDelta = Math.max(500, Math.round((predictedPrice * 0.1) / 100) * 100);
  const [delta, setDelta] = useState<number>(defaultDelta);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<PriceRangeMatches | null>(null);

  const maxDelta = Math.max(2000, Math.round((predictedPrice * 0.5) / 100) * 100);

  const handleSearch = async () => {
    setLoading(true);
    const res = await findCarsInPriceRange(predictedPrice, delta);
    setMatches(res);
    setLoading(false);
  };

  const low = Math.max(0, predictedPrice - delta);
  const high = predictedPrice + delta;

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 bg-gradient-card backdrop-blur-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center shrink-0 shadow-glow">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Explore by price range
            </div>
            <h3 className="font-display font-semibold text-xl">
              Pick a ± amount around your predicted price
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              We'll show 3 cars with the best features within that range, and 3 great-value picks below it.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="delta-input" className="text-sm">± Price tolerance</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  id="delta-input"
                  type="number"
                  min={0}
                  max={maxDelta}
                  step={100}
                  value={delta}
                  onChange={(e) => setDelta(Math.max(0, Math.min(maxDelta, Number(e.target.value) || 0)))}
                  className="w-28 h-9 text-right"
                />
              </div>
            </div>
            <Slider
              value={[delta]}
              onValueChange={(v) => setDelta(v[0])}
              min={0}
              max={maxDelta}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Range: <span className="text-foreground font-medium">${low.toLocaleString()}</span></span>
              <span className="text-primary font-medium">${predictedPrice.toLocaleString()} ± ${delta.toLocaleString()}</span>
              <span>to <span className="text-foreground font-medium">${high.toLocaleString()}</span></span>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            size="lg"
            className="rounded-full bg-gradient-accent shadow-glow hover:shadow-glow hover:-translate-y-0.5 transition-all"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding cars…</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Find cars</>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {matches && (
          <motion.div
            key={`${matches.predictedPrice}-${matches.delta}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <CarBucket
              title="Best features in your range"
              subtitle={`${matches.inRange.length} top picks between $${low.toLocaleString()} and $${high.toLocaleString()}`}
              icon={<Target className="h-4 w-4" />}
              tone="primary"
              cars={matches.inRange}
            />
            <CarBucket
              title="Great value · below your range"
              subtitle={`${matches.belowRange.length} cars under $${low.toLocaleString()} with strong specs`}
              icon={<ArrowDownCircle className="h-4 w-4" />}
              tone="success"
              cars={matches.belowRange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CarBucket = ({
  title, subtitle, icon, tone, cars,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "primary" | "success";
  cars: PriceRangeCar[];
}) => {
  if (!cars.length) {
    return (
      <div>
        <BucketHeader title={title} subtitle={subtitle} icon={icon} tone={tone} />
        <Card className="p-6 bg-gradient-card backdrop-blur-xl text-sm text-muted-foreground">
          No matches found in this bucket — try widening your tolerance.
        </Card>
      </div>
    );
  }

  return (
    <div>
      <BucketHeader title={title} subtitle={subtitle} icon={icon} tone={tone} />
      <div className="grid md:grid-cols-3 gap-4">
        {cars.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.08, duration: 0.5 }}
          >
            <Card className="p-5 bg-gradient-card backdrop-blur-xl hover:shadow-glow hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Badge
                  className={
                    tone === "primary"
                      ? "bg-primary/15 text-primary border-0"
                      : "bg-success/15 text-success border-0"
                  }
                >
                  {(c.featureScore * 100).toFixed(0)} feature score
                </Badge>
                <span className="text-xs text-muted-foreground">{c.color}</span>
              </div>
              <div className="text-sm text-muted-foreground">{c.year}</div>
              <div className="font-display font-semibold text-lg leading-tight">
                {c.brand} {c.model}
              </div>
              <div className="mt-2 text-2xl font-bold text-gradient">
                ${c.price.toLocaleString()}
              </div>

              <ul className="mt-3 space-y-1.5">
                {c.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                    <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4 border-t border-border grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <Spec icon={Calendar} label={`${new Date().getFullYear() - c.year}y old`} />
                <Spec icon={Gauge} label={`${(c.mileageKm / 1000).toFixed(0)}k km`} />
                <Spec icon={Zap} label={`${c.horsepower} HP`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BucketHeader = ({
  title, subtitle, icon, tone,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "primary" | "success";
}) => (
  <div className="flex items-end justify-between mb-4">
    <div className="flex items-center gap-3">
      <div
        className={`h-8 w-8 rounded-lg grid place-items-center ${
          tone === "primary" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-display font-semibold text-xl leading-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  </div>
);

const Spec = ({ icon: Icon, label }: { icon: typeof Gauge; label: string }) => (
  <div className="flex items-center gap-1">
    <Icon className="h-3 w-3" />
    <span>{label}</span>
  </div>
);
