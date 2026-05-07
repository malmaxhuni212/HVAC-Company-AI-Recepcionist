import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444"];

export default function AdminReports() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; bookings: number; revenue: number }[]>([]);
  const [serviceData, setServiceData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: bookings } = await supabase.from("bookings").select("*, services(name, price)");
      if (!bookings) return;

      const monthly: Record<string, { bookings: number; revenue: number }> = {};
      const serviceCount: Record<string, number> = {};

      bookings.forEach((b) => {
        const m = new Date(b.appointment_time).toLocaleString("default", { month: "short" });
        if (!monthly[m]) monthly[m] = { bookings: 0, revenue: 0 };
        monthly[m].bookings++;
        monthly[m].revenue += b.services?.price || 0;

        const sName = b.services?.name || "Unknown";
        serviceCount[sName] = (serviceCount[sName] || 0) + 1;
      });

      setMonthlyData(Object.entries(monthly).map(([month, d]) => ({ month, ...d })));
      setServiceData(Object.entries(serviceCount).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  const handleExport = () => {
    toast.success("📊 Report exported! (Mock — Excel download would trigger here)");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <Button onClick={handleExport} className="bg-cta hover:bg-cta/90 text-accent-foreground"><Download className="w-4 h-4 mr-2" /> Export to Excel</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-primary-foreground/5 border-border/30">
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-foreground/5 border-border/30">
          <CardHeader><CardTitle>Bookings by Service</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
