import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { mode, toggle } = useTheme();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="container flex items-center justify-between py-4">
        <a href="#hero" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Valua<span className="text-gradient">.AI</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#predict" className="hover:text-foreground transition-colors">Predict</a>
          <a href="#budget" className="hover:text-foreground transition-colors">Budget Match</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </nav>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-full">
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </motion.header>
  );
};
