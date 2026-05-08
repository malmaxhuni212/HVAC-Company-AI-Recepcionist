import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Settings } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [schedule, setSchedule] = useState({ mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" });

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles && roles) {
      const merged = profiles.map((p) => ({
        ...p,
        roles: roles.filter((r) => r.user_id === p.user_id).map((r) => r.role),
      }));
      setUsers(merged);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, newRole: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    toast.success(`Role updated to ${newRole}`);
    fetchUsers();
  };

  const saveSchedule = () => {
    toast.success("Technician work schedule saved! (Mock — would persist to database)");
    setEditingSchedule(null);
  };

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const dayLabels = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Users</h2>
      <Card className="bg-primary-foreground/5 border-border/30">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>
                    <Select value={u.roles[0] || "client"} onValueChange={(v) => changeRole(u.user_id, v)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {u.roles.includes("technician") && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-border/30"
                            onClick={() => {
                              setEditingSchedule(u.user_id);
                              setSchedule({ mon: "8am-5pm", tue: "8am-5pm", wed: "8am-5pm", thu: "8am-5pm", fri: "8am-5pm", sat: "", sun: "" });
                            }}>
                            <Settings className="w-3 h-3 mr-1" /> Schedule
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1e293b] border-border/30 text-primary-foreground">
                          <DialogHeader>
                            <DialogTitle>Edit Work Schedule — {u.full_name || "Technician"}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 mt-4">
                            {days.map((day) => (
                              <div key={day} className="flex items-center gap-3">
                                <Label className="w-24 text-sm">{dayLabels[day]}</Label>
                                <Input
                                  value={schedule[day]}
                                  onChange={(e) => setSchedule({ ...schedule, [day]: e.target.value })}
                                  placeholder="e.g. 8am-5pm or Off"
                                  className="bg-primary-foreground/5 border-border/30"
                                />
                              </div>
                            ))}
                            <Button onClick={saveSchedule} className="w-full bg-cta hover:bg-cta/90 text-accent-foreground mt-2">
                              Save Schedule
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && <p className="text-center text-muted-foreground py-8">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
