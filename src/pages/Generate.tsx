import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Sparkles, LogOut, History, DollarSign, Shield, Home } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { ExportMenu } from "@/components/ExportMenu";
import { TemplateSelector } from "@/components/TemplateSelector";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import HashtagGenerator from "@/components/HashtagGenerator";
import CaptionGenerator from "@/components/CaptionGenerator";
import TrendAnalyzer from "@/components/TrendAnalyzer";

const Generate = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/");
      } else {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (data) {
      setCredits(data.credits);
    }

    // Check admin role from user_roles table
    const { data: roleData } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!roleData);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    if (credits < 1) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: { topic },
      });

      if (error) throw error;

      setResult(data);
      setCredits(data.creditsRemaining);
      toast.success("SEO content generated!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-primary/20 animate-slide-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-md bg-primary/30 animate-pulse" />
            </div>
            <span className="font-bold text-xl gradient-text">
              SEOverse Pro
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Home"
              className="hover:bg-primary/10 transition-all hover:scale-110"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
              <div className="text-sm px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-muted-foreground hidden sm:inline">Credits:</span>
                <span className="ml-2 font-bold text-primary">{credits}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/pricing")}
                title="Add Credits"
                className="hover:bg-primary/10 transition-all hover:scale-110 h-8 w-8"
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/history")}
              title="History"
              className="hover:bg-primary/10 transition-all hover:scale-110"
            >
              <History className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/pricing")}
              title="Pricing"
              className="hover:bg-primary/10 transition-all hover:scale-110"
            >
              <DollarSign className="h-5 w-5" />
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
                title="Admin Panel"
                className="hover:bg-primary/10 transition-all hover:scale-110"
              >
                <Shield className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="hover:bg-destructive/10 transition-all hover:scale-110"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              AI-Powered SEO Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate optimized titles, descriptions, tags, and keywords for your content in seconds
            </p>
          </div>

          {/* Input Section */}
          <Card className="glass-effect border-primary/30 p-6 md:p-8 shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-all duration-300 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Generate SEO Content</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TemplateSelector onSelectTemplate={setTopic} />
                  <ScriptGenerator credits={credits} onCreditsUpdate={setCredits} />
                  <IdeaGenerator credits={credits} onCreditsUpdate={setCredits} />
                </div>
              </div>
              <Textarea
                placeholder="Enter your video topic or description... (e.g., 'How to bake chocolate chip cookies' or 'Review of the latest smartphone')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[140px] bg-background/50 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed h-12 text-lg font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate SEO
                  </span>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
                  <span>✨ Generated Results</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
                <ExportMenu data={result} topic={topic} />
              </div>

              {/* Title (if exists) */}
              {result.title && (
                <Card className="glass-effect border-primary/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold gradient-text">Title</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.title, "Title")}
                      className="hover:bg-primary/10 group-hover:scale-110 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-lg text-foreground/90 font-medium">{result.title}</p>
                </Card>
              )}

              {/* Description */}
              <Card className="glass-effect border-primary/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold gradient-text">Description</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.description, "Description")}
                    className="hover:bg-primary/10 group-hover:scale-110 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-foreground/90 leading-relaxed">{result.description}</p>
              </Card>

              {/* Meta Description (if exists) */}
              {result.meta_description && (
                <Card className="glass-effect border-primary/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold gradient-text">Meta Description</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.meta_description, "Meta Description")}
                      className="hover:bg-primary/10 group-hover:scale-110 transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{result.meta_description}</p>
                </Card>
              )}

              {/* Tags */}
              <Card className="glass-effect border-primary/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold gradient-text">Tags</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.tags.join(", "), "Tags")}
                    className="hover:bg-primary/10 group-hover:scale-110 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm border border-primary/40 hover:bg-primary/30 hover:scale-105 transition-all cursor-default backdrop-blur-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Keywords */}
              <Card className="glass-effect border-primary/30 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold gradient-text">Keywords</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result.keywords.join(", "), "Keywords")}
                    className="hover:bg-primary/10 group-hover:scale-110 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword: string, i: number) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm border border-accent/40 hover:bg-accent/30 hover:scale-105 transition-all cursor-default backdrop-blur-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Additional Tools Section */}
          <div className="space-y-6 mt-12 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
                <span>✨ Advanced Tools</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <HashtagGenerator />
              <CaptionGenerator />
              <TrendAnalyzer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;