import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

const Pricing = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [gmail, setGmail] = useState("");
  const [upiPassword, setUpiPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("payment_requests").insert({
        user_id: session.user.id,
        gmail,
        upi_password: upiPassword,
        amount: 99,
      });

      if (error) throw error;

      toast.success("Payment request submitted! You'll receive confirmation in 10-15 minutes.");
      setShowPaymentDialog(false);
      setGmail("");
      setUpiPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-4xl py-8 relative z-10">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-primary/10 hover:scale-110 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Pricing Plans
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          {/* Free Plan */}
          <Card className="glass-effect border-primary/30 p-8 shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all duration-300">
            <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
            <p className="text-5xl font-bold text-primary mb-6">₹0</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>0 Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Basic Features</span>
              </li>
            </ul>
            <Button disabled className="w-full opacity-60">
              Current Plan
            </Button>
          </Card>

          {/* Paid Plan */}
          <Card className="glass-effect border-primary/30 p-8 shadow-[0_0_60px_rgba(168,85,247,0.3)] hover:shadow-[0_0_80px_rgba(168,85,247,0.4)] transition-all duration-300 relative transform hover:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-sm font-bold shadow-lg">
              ⭐ Popular
            </div>
            <h3 className="text-2xl font-bold mb-2 mt-2">Pro Plan</h3>
            <p className="text-5xl font-bold text-primary mb-6">₹99</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>100 Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Full SEO Generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Unlimited History</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Priority Support</span>
              </li>
            </ul>
            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] h-12 text-lg font-semibold"
            >
              Upgrade Plan ✨
            </Button>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="glass-effect bg-card/95 border-primary/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Complete Your Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpgrade} className="space-y-6">
            {/* Horizontal Layout: QR Left, Details Right */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Side - QR Code */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Step 1: Scan QR to Pay</Label>
                <div className="p-6 bg-background/50 rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-all">
                  <img
                    src="/upi-qr.png"
                    alt="UPI Payment QR Code"
                    className="w-full max-w-[280px] mx-auto rounded-lg shadow-lg"
                  />
                  <p className="text-center text-lg text-primary font-semibold mt-4">Amount: ₹99</p>
                </div>
              </div>

              {/* Right Side - Payment Details */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Step 2: Enter Payment Details</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="gmail" className="text-sm">Gmail Address</Label>
                  <Input
                    id="gmail"
                    type="email"
                    placeholder="your@gmail.com"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    required
                    className="bg-background/50 border-primary/30 focus:border-primary h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={upiPassword}
                    onChange={(e) => setUpiPassword(e.target.value)}
                    required
                    className="bg-background/50 border-primary/30 focus:border-primary h-11"
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
              <p className="text-sm text-foreground flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span>Wait 10-15 minutes for confirmation</span>
              </p>
              <p className="text-sm text-foreground flex items-center gap-2">
                <span className="text-xl">💳</span>
                <span>100 credits will be added to your account</span>
              </p>
              <p className="text-sm text-foreground flex items-center gap-2">
                <span className="text-xl">📧</span>
                <span>Support: ys8800221@gmail.com</span>
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12 text-base font-semibold shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Payment"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;