import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_OPTIONS = ["pending", "confirmed", "in_progress", "completed", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<{ user_id: string; full_name: string }[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from("bookings").select("*, services(name, price)").order("appointment_time", { ascending: false });
    if (data) setBookings(data);

    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "technician");
    if (roles && roles.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", roles.map((r) => r.user_id));
      if (profiles) setTechnicians(profiles as any);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    toast.success(`Status updated to ${status}`);
    fetchData();
  };

  const assignTech = async (bookingId: string, techId: string) => {
    await supabase.from("bookings").update({ technician_id: techId }).eq("id", bookingId);
    toast.info("Technician assigned! 📧 Notification sent.");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Bookings</h2>
      <Card className="bg-primary-foreground/5 border-border/30">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead><TableHead>Service</TableHead><TableHead>Date</TableHead>
                <TableHead>Status</TableHead><TableHead>Technician</TableHead><TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.client_name}<br /><span className="text-xs text-muted-foreground">{b.client_email}</span></TableCell>
                  <TableCell>{b.services?.name || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(b.appointment_time), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={b.technician_id || ""} onValueChange={(v) => assignTech(b.id, v)}>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Assign..." /></SelectTrigger>
                      <SelectContent>
                        {technicians.map((t) => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name || "Unnamed"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Badge className={b.payment_status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>{b.payment_status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {bookings.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
