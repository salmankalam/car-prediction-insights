import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClipboardEdit, Cog, BarChart3, Sparkles } from "lucide-react";

const steps = [
  { icon: ClipboardEdit, title: "1 · You enter details",   text: "12 features about your car — brand, year, mileage, condition and more." },
  { icon: Cog,           title: "2 · Backend preprocesses", text: "Encodes categoricals, normalizes ranges, computes derived features like age." },
  { icon: Sparkles,      title: "3 · Model predicts",       text: "A regression model outputs a price plus per-feature contributions." },
  { icon: BarChart3,     title: "4 · You see why",          text: "Dynamic charts, similar listings, and a plain-English explanation." },
];

export const HowItWorks = () => (
  <section id="how" className="py-24 md:py-32 border-t border-border/60">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center mb-14"
      >
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
          How it <span className="text-gradient">works</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="p-6 h-full bg-gradient-card backdrop-blur-xl hover:shadow-glow transition-all duration-500 hover:-translate-y-1">
              <div className="h-11 w-11 rounded-xl bg-gradient-accent grid place-items-center mb-4 shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
