import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

const EmailConfirmed = () => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated (email confirmed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setVerified(true);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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
        <div className="glass-effect border border-primary/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {verified ? (
                <>
                  <CheckCircle className="h-20 w-20 text-primary animate-pulse" />
                  <div className="absolute inset-0 blur-md bg-primary/30 animate-pulse" />
                </>
              ) : (
                <>
                  <Sparkles className="h-20 w-20 text-primary animate-pulse" />
                  <div className="absolute inset-0 blur-md bg-primary/30 animate-pulse" />
                </>
              )}
            </div>
          </div>

          {verified ? (
            <>
              <h1 className="text-3xl font-bold gradient-text mb-4">
                Email Verified! ✅
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Your email has been successfully verified.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                You can now go back to the website and start using all features.
              </p>
              <Button
                onClick={() => navigate("/generate")}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] h-11 text-base font-semibold"
              >
                Go to Website
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold gradient-text mb-4">
                Verification Link Expired
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                This verification link may have expired or is invalid.
              </p>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                Back to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmed;
