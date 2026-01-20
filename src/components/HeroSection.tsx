import { VoiceCallButton, VoiceCallButtonHandle } from "./VoiceCallButton";
import { Shield, Clock, CheckCircle } from "lucide-react";
import heroBackground from "@/assets/hero-hvac-bg.jpg";

interface HeroSectionProps {
  micRef?: React.RefObject<VoiceCallButtonHandle>;
}

export function HeroSection({ micRef }: HeroSectionProps) {
  return (
    <section id="services" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden scroll-mt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-primary-foreground/20">
            <Shield className="w-4 h-4 text-cta" />
            <span className="text-sm font-medium text-primary-foreground">
              Licensed & Insured • A+ BBB Rating
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
            Fast, Reliable{" "}
            <span className="text-cta">HVAC Repair</span>
            <br />
            in the Metro Area
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            24/7 Emergency Service. No hidden fees.
            <br />
            <span className="text-primary-foreground font-medium">
              Speak directly with our dispatch team.
            </span>
          </p>

          {/* Voice Call CTA */}
          <div className="mb-12">
            <VoiceCallButton ref={micRef} />
          </div>

          {/* Quick Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cta" />
              <span>Free Estimates</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cta" />
              <span>Same Day Service</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cta" />
              <span>100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--secondary))"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
}
