import { Phone, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cta rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-trust-light rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Get Comfortable?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Don't wait until your system fails completely. Schedule your service today 
            and enjoy peace of mind knowing your home is in good hands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg" 
              className="bg-cta text-accent-foreground hover:bg-cta-hover gap-2 text-lg px-8"
            >
              <Phone className="w-5 h-5" />
              Call (555) 123-4567
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 text-lg px-8"
            >
              Schedule Online
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Response within 2 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% satisfaction guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
