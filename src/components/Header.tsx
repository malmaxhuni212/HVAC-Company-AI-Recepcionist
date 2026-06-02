import { ThermometerSun, User, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About Us" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cta rounded-lg flex items-center justify-center">
              <ThermometerSun className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="block">
              <p className="font-bold text-foreground leading-tight">Metro Heating</p>
              <p className="text-xs text-muted-foreground -mt-0.5">& Cooling</p>
            </div>
          </Link>

          {/* Centered Navigation (desktop) */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
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
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")} className="bg-cta text-accent-foreground hover:bg-cta-hover">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <a
                        href={l.href}
                        className="px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent transition-colors"
                      >
                        {l.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                  {user ? (
                    <Button onClick={() => { setOpen(false); navigate("/book"); }} className="bg-cta text-accent-foreground hover:bg-cta-hover">
                      Book Now
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => { setOpen(false); navigate("/login"); }}>
                        <LogIn className="w-4 h-4 mr-1" /> Sign In
                      </Button>
                      <Button onClick={() => { setOpen(false); navigate("/signup"); }} className="bg-cta text-accent-foreground hover:bg-cta-hover">
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
