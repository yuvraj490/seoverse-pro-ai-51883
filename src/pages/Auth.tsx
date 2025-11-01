import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/generate");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast.error("Please confirm your email first. Check your inbox!");
          } else {
            throw error;
          }
          return;
        }
        toast.success("Welcome back!");
        navigate("/generate");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/generate`,
          },
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data?.user && !data.session) {
          setShowConfirmation(true);
          toast.success("Check your email to confirm your account!");
        } else {
          toast.success("Account created! You can now log in.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 blur-md bg-primary/30 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Check Your Email! 📧
            </h1>
            <p className="text-lg text-muted-foreground">
              We've sent a confirmation email to:
            </p>
            <p className="text-xl font-semibold text-primary">{email}</p>
          </div>

          <div className="glass-effect border border-primary/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] space-y-6">
            <div className="space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-foreground">
                  ✉️ Check your inbox (and spam folder)
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-foreground">
                  🔗 Click the confirmation link in the email
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-foreground">
                  🎉 Start using SEOverse Pro!
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowConfirmation(false);
                setIsLogin(true);
                setEmail("");
                setPassword("");
              }}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-md bg-primary/30 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              SEOverse Pro
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {isLogin ? "Welcome back! 👋" : "Start your journey ✨"}
          </p>
        </div>

        <div className="glass-effect border border-primary/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] hover:shadow-[0_0_70px_rgba(168,85,247,0.3)] transition-all duration-300">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-primary/30 focus:border-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] h-11 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? "Logging in..." : "Creating account..."}
                </span>
              ) : (
                isLogin ? "Login" : "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-all hover:scale-105"
            >
              {isLogin ? "Don't have an account? Create one →" : "Already have an account? Login →"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;