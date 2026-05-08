import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminPayments() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, bookings(client_name, client_email, services(name))")
      .order("created_at", { ascending: false });
    if (data) setInvoices(data);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filteredInvoices = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);

  const updateInvoiceStatus = async (id: string, status: string) => {
    await supabase.from("invoices").update({ status } as any).eq("id", id);
    toast.success(`Invoice marked as ${status}`);
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payments Management</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary-foreground/5 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary-foreground/5 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">${pendingAmount.toLocaleString()}</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary-foreground/5 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cta" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary-foreground/5 border-border/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Records</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    {(inv.bookings as any)?.client_name || "—"}
                    <br />
                    <span className="text-xs text-muted-foreground">{(inv.bookings as any)?.client_email}</span>
                  </TableCell>
                  <TableCell>{(inv.bookings as any)?.services?.name || "—"}</TableCell>
                  <TableCell className="font-semibold">${Number(inv.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={
                      inv.status === "paid" ? "bg-green-500/20 text-green-400" :
                      inv.status === "refunded" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(inv.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {inv.status === "pending" && (
                      <Button size="sm" variant="outline" className="text-green-400 border-green-400/30 hover:bg-green-400/10"
                        onClick={() => updateInvoiceStatus(inv.id, "paid")}>
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInvoices.length === 0 && <p className="text-center text-muted-foreground py-8">No invoices found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
