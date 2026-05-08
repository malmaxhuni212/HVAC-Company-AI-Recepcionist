import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function TechnicianProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    specialties: "",
    availability_notes: "",
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
    }).eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully!");
      await refreshProfile();
    }
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/technician")} className="text-primary-foreground/70 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="text-2xl font-bold mb-6">Technician Profile</h1>

        <Card className="bg-primary-foreground/5 border-border/30">
          <CardHeader><CardTitle>Work Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-primary-foreground/5 border-border/30 mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-primary-foreground/5 border-border/30 mt-1" />
            </div>
            <div>
              <Label htmlFor="address">Service Area / Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="bg-primary-foreground/5 border-border/30 mt-1" />
            </div>
            <div>
              <Label htmlFor="specialties">Specialties (e.g., AC Repair, Furnace Install)</Label>
              <Input id="specialties" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                placeholder="AC Repair, Heating Installation, Duct Cleaning"
                className="bg-primary-foreground/5 border-border/30 mt-1" />
            </div>
            <div>
              <Label htmlFor="availability">Availability Notes</Label>
              <Textarea id="availability" value={form.availability_notes}
                onChange={(e) => setForm({ ...form, availability_notes: e.target.value })}
                placeholder="Mon-Fri 8am-5pm, available for emergencies on weekends"
                className="bg-primary-foreground/5 border-border/30 mt-1" />
            </div>
            <Button onClick={handleSave} className="bg-cta hover:bg-cta/90 text-accent-foreground w-full">
              <Save className="w-4 h-4 mr-2" /> Save Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
