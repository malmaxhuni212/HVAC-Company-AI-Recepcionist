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
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Calendar, LogOut, CalendarClock, XCircle, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

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

  // Reschedule dialog state
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel dialog state
  const [cancelBooking, setCancelBooking] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const loadBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, services(name, price)")
      .eq("user_id", user.id)
      .order("appointment_time", { ascending: false });
    if (data) setBookings(data);
  };

  useEffect(() => { loadBookings(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone, address }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); refreshProfile(); }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const canModify = (b: any) => {
    if (b.status === "cancelled" || b.status === "completed") return false;
    return new Date(b.appointment_time).getTime() > Date.now();
  };

  const submitReschedule = async () => {
    if (!rescheduleBooking || !newDate || !newTime) return;
    setRescheduling(true);
    const [timePart, ampm] = newTime.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    const hours = ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
    const apptDate = new Date(newDate);
    apptDate.setHours(hours, m, 0, 0);

    const { error } = await supabase
      .from("bookings")
      .update({
        appointment_time: apptDate.toISOString(),
        rescheduled_count: (rescheduleBooking.rescheduled_count || 0) + 1,
      })
      .eq("id", rescheduleBooking.id);

    setRescheduling(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking rescheduled successfully");
    setRescheduleBooking(null);
    setNewDate(undefined);
    setNewTime("");
    loadBookings();
  };

  const submitCancel = async () => {
    if (!cancelBooking) return;
    setCancelling(true);
    const paid = Number(cancelBooking.services?.price || 0);
    const refund = Math.round(paid * 0.8 * 100) / 100;

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        refund_amount: refund,
        payment_status: "refunded",
      })
      .eq("id", cancelBooking.id);

    if (!error) {
      await supabase
        .from("invoices")
        .update({ status: "refunded" })
        .eq("booking_id", cancelBooking.id);
    }

    setCancelling(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking cancelled. Refund of $${refund.toFixed(2)} (80%) will be processed.`);
    setCancelBooking(null);
    loadBookings();
  };

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
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const modifiable = canModify(b);
                      const alreadyRescheduled = (b.rescheduled_count || 0) >= 1;
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.services?.name || "—"}</TableCell>
                          <TableCell>{format(new Date(b.appointment_time), "MMM d, yyyy h:mm a")}</TableCell>
                          <TableCell><Badge className={statusColors[b.status] || ""}>{b.status.replace("_", " ")}</Badge></TableCell>
                          <TableCell>
                            ${b.services?.price?.toFixed(2) || "—"}
                            {b.refund_amount && (
                              <div className="text-xs text-muted-foreground">Refund: ${Number(b.refund_amount).toFixed(2)}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!modifiable || alreadyRescheduled}
                                title={alreadyRescheduled ? "Already rescheduled once" : "Reschedule"}
                                onClick={() => {
                                  setRescheduleBooking(b);
                                  setNewDate(new Date(b.appointment_time));
                                  setNewTime("");
                                }}
                              >
                                <CalendarClock className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!modifiable}
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setCancelBooking(b)}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleBooking} onOpenChange={(o) => !o && setRescheduleBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              You can reschedule a booking once. Pick a new date and time below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !newDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={newTime === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTime(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleBooking(null)}>Back</Button>
            <Button onClick={submitReschedule} disabled={!newDate || !newTime || rescheduling} className="bg-cta hover:bg-cta/90 text-accent-foreground">
              {rescheduling ? "Saving..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelBooking} onOpenChange={(o) => !o && setCancelBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Cancelling refunds <strong>80%</strong> of the paid amount.
              {cancelBooking?.services?.price != null && (
                <>
                  {" "}You paid <strong>${Number(cancelBooking.services.price).toFixed(2)}</strong> and will receive a refund of{" "}
                  <strong>${(Number(cancelBooking.services.price) * 0.8).toFixed(2)}</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={submitCancel} disabled={cancelling} className="bg-red-500 hover:bg-red-600">
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
