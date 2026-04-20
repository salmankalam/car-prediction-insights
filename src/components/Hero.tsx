import { motion } from "framer-motion";
import { ArrowDown, Cpu, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCar from "@/assets/hero-car.jpg";

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-glow-pulse [animation-delay:1.5s]" />
      </div>

      <div className="container grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 space-y-7"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-glow-pulse" />
            AI model · 92% R² on 200k listings
          </span>

          <h1 className="font-display font-bold leading-[1.05] tracking-tight text-[clamp(2.25rem,6vw,4.5rem)]">
            <span className="block whitespace-nowrap">Know what your car</span>
            <span className="block whitespace-nowrap">is <span className="text-gradient">truly worth.</span></span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Enter a few details and our AI returns an instant valuation, the
            exact features driving the price, three comparable listings, and a
            plain-English explanation of <em>why</em>.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-accent shadow-glow hover:shadow-glow hover:-translate-y-0.5 transition-all">
              <a href="#predict">
                Predict a price <ArrowDown className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="#budget">Find a car for my budget</a>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg">
            {[
              { icon: Cpu, label: "12 features", sub: "preprocessed" },
              { icon: LineChart, label: "SHAP-style", sub: "explanations" },
              { icon: Sparkles, label: "<1s", sub: "inference" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="rounded-2xl glass p-3"
              >
                <s.icon className="h-4 w-4 text-primary mb-2" />
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-glow animate-float">
            <img
              src={heroCar}
              alt="AI-powered car valuation visualization"
              width={1600}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>
          {/* floating price chip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -bottom-6 -left-4 md:left-6 glass rounded-2xl p-4 shadow-elegant"
          >
            <div className="text-xs text-muted-foreground">Estimated value</div>
            <div className="text-2xl font-display font-bold text-gradient">$24,750</div>
            <div className="text-[10px] text-success mt-0.5">±$1,200 confidence</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
