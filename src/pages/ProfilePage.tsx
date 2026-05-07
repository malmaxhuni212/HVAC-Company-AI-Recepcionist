import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      supabase.from("bookings").select("*, services(name, price)").eq("user_id", user.id).order("appointment_time", { ascending: false })
        .then(({ data }) => { if (data) setBookings(data); });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, address }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); refreshProfile(); }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-primary-foreground/70"><ArrowLeft className="w-4 h-4 mr-2" /> Home</Button>
          <div className="flex gap-2">
            {hasRole("admin") && <Button variant="outline" onClick={() => navigate("/admin")}>Admin Dashboard</Button>}
            {hasRole("technician") && <Button variant="outline" onClick={() => navigate("/technician")}>Tech Dashboard</Button>}
            <Button variant="ghost" onClick={handleSignOut} className="text-red-400"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled className="bg-muted/10" /></div>
              <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-cta hover:bg-cta/90 text-accent-foreground">
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Bookings</CardTitle>
              <Button onClick={() => navigate("/book")} className="bg-cta hover:bg-cta/90 text-accent-foreground"><Calendar className="w-4 h-4 mr-2" /> New Booking</Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bookings yet. Book your first service!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Service</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.services?.name || "—"}</TableCell>
                        <TableCell>{format(new Date(b.appointment_time), "MMM d, yyyy h:mm a")}</TableCell>
                        <TableCell><Badge className={statusColors[b.status] || ""}>{b.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell>${b.services?.price?.toFixed(2) || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
