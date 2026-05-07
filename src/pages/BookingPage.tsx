import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, CreditCard, ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import { toast } from "sonner";

const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

interface Service { id: string; name: string; description: string | null; price: number; duration_minutes: number; }

export default function BookingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    supabase.from("services").select("*").then(({ data }) => { if (data) setServices(data); });
  }, []);

  const handlePayment = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user || !profile) return;
    setLoading(true);

    const [timePart, ampm] = selectedTime.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    const hours = ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, m, 0, 0);

    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      client_name: profile.full_name || profile.email || "",
      client_email: profile.email || user.email || "",
      appointment_time: appointmentDate.toISOString(),
      service_id: selectedService.id,
      status: "confirmed",
      payment_status: "paid",
    }).select().single();

    if (error) {
      toast.error("Booking failed: " + error.message);
      setLoading(false);
      return;
    }

    // Create invoice
    if (booking) {
      await supabase.from("invoices").insert({
        booking_id: booking.id,
        amount: selectedService.price,
        status: "paid",
      });
    }

    setLoading(false);
    setBookingComplete(true);
    toast.success("🎉 Booking confirmed! Payment processed successfully.");
    toast.info("📧 Confirmation email sent to " + (profile.email || user.email));
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
            <p className="text-muted-foreground">Your {selectedService?.name} appointment is scheduled for</p>
            <p className="text-lg font-semibold">{selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTime}</p>
            <p className="text-sm text-muted-foreground">Invoice Total: ${selectedService?.price.toFixed(2)}</p>
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={() => navigate("/profile")} className="bg-cta hover:bg-cta/90 text-accent-foreground">View My Bookings</Button>
              <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-primary-foreground/70 hover:text-primary-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl font-bold mb-2">Book a Service</h1>
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {["Service", "Date & Time", "Review", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-cta text-accent-foreground" : "bg-primary-foreground/20 text-primary-foreground/50")}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:inline", step === i + 1 ? "text-cta font-medium" : "text-primary-foreground/50")}>{label}</span>
              {i < 3 && <div className="w-8 h-px bg-primary-foreground/20" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
              <Card key={s.id} className={cn("cursor-pointer transition-all hover:ring-2 hover:ring-cta", selectedService?.id === s.id && "ring-2 ring-cta")} onClick={() => setSelectedService(s)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Wrench className="w-4 h-4 text-cta" />{s.name}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-cta">${s.price}</span>
                    <span className="text-sm text-muted-foreground">{s.duration_minutes} min</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="col-span-full flex justify-end mt-4">
              <Button onClick={() => setStep(2)} disabled={!selectedService} className="bg-cta hover:bg-cta/90 text-accent-foreground">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Select Date</Label>
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date() || date.getDay() === 0} className="rounded-md border pointer-events-auto" />
                </div>
                <div>
                  <Label className="text-base font-semibold mb-3 block">Select Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <Button key={t} variant={selectedTime === t ? "default" : "outline"} className={selectedTime === t ? "bg-cta text-accent-foreground" : ""} onClick={() => setSelectedTime(t)}>{t}</Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="bg-cta hover:bg-cta/90 text-accent-foreground">Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Review Your Booking</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Service:</span><p className="font-semibold">{selectedService?.name}</p></div>
                <div><span className="text-muted-foreground">Price:</span><p className="font-semibold text-cta">${selectedService?.price.toFixed(2)}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-semibold">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</p></div>
                <div><span className="text-muted-foreground">Time:</span><p className="font-semibold">{selectedTime}</p></div>
                <div><span className="text-muted-foreground">Duration:</span><p className="font-semibold">{selectedService?.duration_minutes} minutes</p></div>
                <div><span className="text-muted-foreground">Customer:</span><p className="font-semibold">{profile?.full_name || "—"}</p></div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={() => setStep(4)} className="bg-cta hover:bg-cta/90 text-accent-foreground">Proceed to Payment <CreditCard className="w-4 h-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</CardTitle>
              <CardDescription>Mock payment gateway — no real charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/10 border rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Expiry</Label><Input placeholder="MM/YY" /></div>
                  <div className="space-y-2"><Label>CVC</Label><Input placeholder="123" /></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Total: <span className="text-cta">${selectedService?.price.toFixed(2)}</span></span>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handlePayment} disabled={loading} className="bg-cta hover:bg-cta/90 text-accent-foreground">
                  {loading ? "Processing..." : `Pay $${selectedService?.price.toFixed(2)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
