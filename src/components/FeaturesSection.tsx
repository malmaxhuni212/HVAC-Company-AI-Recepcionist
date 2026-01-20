import { Clock, DollarSign, Award, Wrench, ThermometerSnowflake, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Clock,
    title: "Same Day Service",
    description: "We arrive within hours, not days. Your comfort can't wait, and neither do we.",
  },
  {
    icon: DollarSign,
    title: "Upfront Pricing",
    description: "Know exactly what you'll pay before we start. No surprises, no hidden fees.",
  },
  {
    icon: Award,
    title: "Certified Technicians",
    description: "EPA certified, background-checked professionals with 10+ years average experience.",
  },
  {
    icon: ThermometerSnowflake,
    title: "All HVAC Systems",
    description: "Heating, cooling, ventilation — we service all major brands and models.",
  },
  {
    icon: Wrench,
    title: "Repairs & Installation",
    description: "From quick fixes to full system replacements, we handle it all.",
  },
  {
    icon: Shield,
    title: "Warranty Protection",
    description: "All work backed by our 2-year labor warranty. Parts warranties honored.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Metro Homeowners Trust Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Over 15,000 satisfied customers since 2008. Here's what sets us apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-cta/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cta" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
