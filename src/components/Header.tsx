import { Phone, ThermometerSun, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cta rounded-lg flex items-center justify-center">
              <ThermometerSun className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-foreground leading-tight">Metro Heating</p>
              <p className="text-xs text-muted-foreground -mt-0.5">& Cooling</p>
            </div>
          </Link>

          {/* Navigation + CTA + Auth (right-aligned) */}
          <div className="flex items-center gap-8 ml-auto">
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About Us</a>
              <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/book")} className="hidden sm:flex bg-cta text-accent-foreground hover:bg-cta-hover border-none">
                  Book Now
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  if (hasRole("admin")) navigate("/admin");
                  else if (hasRole("technician")) navigate("/technician");
                  else navigate("/profile");
                }}>
                  <User className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">My Account</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")} className="bg-cta text-accent-foreground hover:bg-cta-hover">
                  Sign Up
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
