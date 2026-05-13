import { useState } from "react";
import { z } from "zod";
import { Phone, Send, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

export function ContactSection() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please check your input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Message sent!", description: "We'll get back to you shortly." });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-20 bg-primary relative overflow-hidden scroll-mt-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cta rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-trust-light rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Get Comfortable?</h2>
          <p className="text-lg text-primary-foreground/80">
            Send us a message and our team will reach out shortly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-background rounded-xl shadow-xl p-6 md:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required maxLength={255} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} maxLength={30} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} maxLength={1000} />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-cta text-accent-foreground hover:bg-cta-hover gap-2"
            size="lg"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70 mt-10">
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
    </section>
  );
}
