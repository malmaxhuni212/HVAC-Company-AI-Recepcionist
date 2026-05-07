import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, DollarSign, Users, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, revenue: 0, activeUsers: 0, completedJobs: 0 });
  const [chartData, setChartData] = useState<{ month: string; bookings: number; revenue: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: bookings } = await supabase.from("bookings").select("*, services(price)");
      const { data: profiles } = await supabase.from("profiles").select("id");

      if (bookings) {
        const revenue = bookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const completed = bookings.filter((b) => b.status === "completed").length;
        setStats({ totalBookings: bookings.length, revenue, activeUsers: profiles?.length || 0, completedJobs: completed });

        // Build monthly chart data
        const monthly: Record<string, { bookings: number; revenue: number }> = {};
        bookings.forEach((b) => {
          const m = new Date(b.appointment_time).toLocaleString("default", { month: "short", year: "2-digit" });
          if (!monthly[m]) monthly[m] = { bookings: 0, revenue: 0 };
          monthly[m].bookings++;
          monthly[m].revenue += b.services?.price || 0;
        });
        setChartData(Object.entries(monthly).map(([month, d]) => ({ month, ...d })));
      }
    })();
  }, []);

  const statCards = [
    { title: "Total Bookings", value: stats.totalBookings, icon: CalendarCheck, color: "text-blue-400" },
    { title: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
    { title: "Users", value: stats.activeUsers, icon: Users, color: "text-purple-400" },
    { title: "Completed Jobs", value: stats.completedJobs, icon: TrendingUp, color: "text-cta" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="bg-primary-foreground/5 border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-primary-foreground/5 border-border/30">
        <CardHeader><CardTitle>Monthly Bookings & Revenue</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
