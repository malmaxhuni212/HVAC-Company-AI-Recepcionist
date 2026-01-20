import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Jennifer M.",
    location: "Westside Metro",
    text: "Our AC died on the hottest day of summer. Called at 10am and they had it running by 2pm. Incredible service and fair pricing. These guys are the real deal.",
    rating: 5,
  },
  {
    name: "Robert & Lisa T.",
    location: "Downtown Metro",
    text: "We've used Metro Heating & Cooling for 8 years now. Always professional, always on time, always honest. They've earned our trust completely.",
    rating: 5,
  },
  {
    name: "Marcus D.",
    location: "East Metro",
    text: "The technician explained everything clearly and even showed me how to maintain my system. No pressure to buy anything extra. Refreshingly honest company.",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-cta text-cta" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cta/10 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 fill-cta text-cta" />
            <span className="text-sm font-medium text-foreground">
              4.9 Average Rating on Google
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real reviews from real homeowners in the Metro area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-cta/30 mb-4" />
                <StarRating rating={testimonial.rating} />
                <p className="text-foreground mt-4 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">15,000+</p>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">15+</p>
            <p className="text-sm text-muted-foreground">Years in Business</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">A+</p>
            <p className="text-sm text-muted-foreground">BBB Rating</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">24/7</p>
            <p className="text-sm text-muted-foreground">Emergency Service</p>
          </div>
        </div>
      </div>
    </section>
  );
}
