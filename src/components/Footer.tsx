export const Footer = () => (
  <footer className="border-t border-border/60 py-10">
    <div className="container flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
      <div>© {new Date().getFullYear()} Valua.AI · Used-car valuations powered by ML</div>
      <div className="flex gap-5">
        <a href="#predict" className="hover:text-foreground transition-colors">Predict</a>
        <a href="#budget" className="hover:text-foreground transition-colors">Budget</a>
        <a href="#how" className="hover:text-foreground transition-colors">How</a>
      </div>
    </div>
  </footer>
);
