import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultSettings: NotificationSetting[] = [
  { id: "booking_created", label: "New Booking Created", description: "Send notification when a client creates a new booking.", icon: CalendarCheck, enabled: true },
  { id: "booking_assigned", label: "Technician Assigned", description: "Notify the technician when they are assigned to a booking.", icon: MessageSquare, enabled: true },
  { id: "payment_received", label: "Payment Received", description: "Send confirmation when a payment is successfully processed.", icon: Mail, enabled: true },
  { id: "booking_reminder", label: "Appointment Reminders", description: "Send reminder notifications 24 hours before an appointment.", icon: Bell, enabled: false },
  { id: "status_update", label: "Status Updates", description: "Notify the client when their booking status changes.", icon: Bell, enabled: true },
  { id: "tech_report", label: "Daily Technician Reports", description: "Send daily summary reports to technicians about their upcoming jobs.", icon: Mail, enabled: false },
];

export default function AdminNotifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);

  const toggleSetting = (id: string) => {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const saveSettings = () => {
    toast.success("Notification settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications Management</h2>
        <Button onClick={saveSettings} className="bg-cta hover:bg-cta/90 text-accent-foreground">
          Save Settings
        </Button>
      </div>

      <Card className="bg-primary-foreground/5 border-border/30">
        <CardHeader>
          <CardTitle>Automated Communications</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure which automated notifications are sent to clients, technicians, and admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg bg-primary-foreground/5 border border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-cta/10">
                  <setting.icon className="w-5 h-5 text-cta" />
                </div>
                <div>
                  <Label htmlFor={setting.id} className="text-base font-medium cursor-pointer">{setting.label}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                </div>
              </div>
              <Switch id={setting.id} checked={setting.enabled} onCheckedChange={() => toggleSetting(setting.id)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-primary-foreground/5 border-border/30">
        <CardHeader>
          <CardTitle>Notification Log</CardTitle>
          <CardDescription className="text-muted-foreground">Recent system notifications (mock data).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { msg: "Booking #1042 created — Client notified via email", time: "2 min ago", type: "success" },
              { msg: "Technician John D. assigned to Booking #1041", time: "15 min ago", type: "info" },
              { msg: "Payment of $299 received for Booking #1039", time: "1 hour ago", type: "success" },
              { msg: "Appointment reminder sent for 3 bookings tomorrow", time: "3 hours ago", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-md bg-primary-foreground/3 border border-border/10">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.type === "success" ? "bg-green-400" : "bg-blue-400"}`} />
                  <span className="text-sm">{log.msg}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
