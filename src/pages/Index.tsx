import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PredictSection } from "@/components/PredictSection";
import { BudgetSection } from "@/components/BudgetSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <PredictSection />
      <BudgetSection />
      <HowItWorks />
    </main>
    <Footer />
  </div>
);

export default Index;
