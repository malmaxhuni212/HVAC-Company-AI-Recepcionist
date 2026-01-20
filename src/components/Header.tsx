import { Phone, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cta rounded-lg flex items-center justify-center">
              <ThermometerSun className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-foreground leading-tight">
                Metro Heating
              </p>
              <p className="text-xs text-muted-foreground -mt-0.5">& Cooling</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </a>
            <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-xs text-muted-foreground">24/7 Emergency</p>
              <p className="font-semibold text-foreground">(555) 123-4567</p>
            </div>
            <Button className="bg-cta text-accent-foreground hover:bg-cta-hover gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call Now</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
