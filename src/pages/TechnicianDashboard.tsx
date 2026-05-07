import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, LogOut, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isThisWeek } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TECH_STATUSES = ["pending", "in_progress", "completed"];

export default function TechnicianDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filter, setFilter] = useState<"today" | "week" | "all">("today");

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase.from("bookings").select("*, services(name, price, duration_minutes)")
      .eq("technician_id", user.id).order("appointment_time", { ascending: true });
    if (data) setJobs(data);
  };

  useEffect(() => { fetchJobs(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    toast.success(`Job status updated to ${status.replace("_", " ")}`);
    fetchJobs();
  };

  const filteredJobs = jobs.filter((j) => {
    const d = new Date(j.appointment_time);
    if (filter === "today") return isToday(d);
    if (filter === "week") return isThisWeek(d);
    return true;
  });

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-primary-foreground/70"><ArrowLeft className="w-4 h-4 mr-2" /> Home</Button>
          <Button variant="ghost" onClick={() => { signOut(); navigate("/"); }} className="text-red-400"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <div className="flex gap-2">
            {(["today", "week", "all"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
                className={filter === f ? "bg-cta text-accent-foreground" : ""} onClick={() => setFilter(f)}>
                {f === "today" ? "Today" : f === "week" ? "This Week" : "All"}
              </Button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="bg-primary-foreground/5 border-border/30">
            <CardContent className="py-12 text-center text-muted-foreground">
              No jobs scheduled {filter === "today" ? "for today" : filter === "week" ? "this week" : ""}.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="bg-primary-foreground/5 border-border/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{job.services?.name || "Service"}</h3>
                        <Badge className={statusColors[job.status]}>{job.status.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(job.appointment_time), "MMM d, h:mm a")}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{job.client_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.client_email}</p>
                      {job.services?.duration_minutes && <p className="text-xs text-muted-foreground">Duration: {job.services.duration_minutes} min</p>}
                    </div>
                    <div className="flex items-center">
                      <Select value={job.status} onValueChange={(v) => updateStatus(job.id, v)}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TECH_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
