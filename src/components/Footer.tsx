import { ThermometerSun, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-cta rounded-lg flex items-center justify-center">
                <ThermometerSun className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-primary-foreground leading-tight">
                  Metro Heating
                </p>
                <p className="text-xs text-primary-foreground/70 -mt-0.5">
                  & Cooling
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 max-w-md leading-relaxed">
              Serving the Metro area since 2008. Licensed, insured, and committed 
              to your comfort. We treat every home like our own.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                <span>info@metrohvac.com</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Main Street<br />Metro City, MC 12345</span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>AC Repair & Installation</li>
              <li>Heating Systems</li>
              <li>Duct Cleaning</li>
              <li>Maintenance Plans</li>
              <li>Emergency Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Metro Heating & Cooling. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Licenses
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
