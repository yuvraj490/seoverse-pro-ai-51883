import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

const History = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchGenerations();
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

  const fetchGenerations = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setGenerations(data);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
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
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/generate")}
              className="hover:bg-primary/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generate
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Generation History
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Loading your history...</p>
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">No generations yet</p>
            <p className="text-sm text-muted-foreground mb-6">Start generating SEO content to see your history</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-primary to-accent">
              Generate Content
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {generations.map((gen, index) => (
              <Collapsible key={gen.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
                <Card className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transition-all duration-300">
                  <CollapsibleTrigger className="w-full group">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-lg gradient-text group-hover:scale-105 transition-transform inline-block">{gen.topic}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(gen.created_at).toLocaleDateString()} at{" "}
                          {new Date(gen.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6 space-y-6">
                    {gen.title && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-primary">Title</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(gen.title, "Title")}
                            className="hover:bg-primary/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground/90 font-medium">{gen.title}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary">Description</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(gen.description, "Description")}
                          className="hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{gen.description}</p>
                    </div>

                    {gen.meta_description && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-primary">Meta Description</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(gen.meta_description, "Meta Description")}
                            className="hover:bg-primary/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">{gen.meta_description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary">Tags</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(gen.tags.join(", "), "Tags")}
                          className="hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gen.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs border border-primary/40 hover:bg-primary/30 transition-all cursor-default"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-accent">Keywords</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(gen.keywords.join(", "), "Keywords")}
                          className="hover:bg-accent/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gen.keywords.map((keyword: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-accent/20 text-accent rounded-full text-xs border border-accent/40 hover:bg-accent/30 transition-all cursor-default"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;