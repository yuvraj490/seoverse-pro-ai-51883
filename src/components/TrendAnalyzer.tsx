import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TrendAnalyzer = () => {
  const [niche, setNiche] = useState("");
  const [trends, setTrends] = useState<Array<{ topic: string; score: string; insights: string }>>([]);
  const [loading, setLoading] = useState(false);

  const analyzeTrends = async () => {
    if (!niche.trim()) {
      toast.error("Please enter a niche or topic");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: {
          topic: niche.trim(),
          type: "trends",
        },
      });

      if (error) throw error;

      if (data?.trends) {
        setTrends(data.trends);
        toast.success(`Trend analysis complete! 5 credits used.`);
      }
    } catch (error: any) {
      console.error("Error analyzing trends:", error);
      toast.error(error.message || "Failed to analyze trends");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-primary/30 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Trend Analyzer</h3>
        </div>

        <Input
          placeholder="Enter your niche or industry..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="bg-background/50 border-primary/30"
        />

        <Button
          onClick={analyzeTrends}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Trends
            </>
          )}
        </Button>

        {trends.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Trending Topics:</h4>
            <div className="space-y-3">
              {trends.map((trend, index) => (
                <div
                  key={index}
                  className="p-4 bg-background/30 border border-primary/20 rounded-lg hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="font-semibold text-sm">{trend.topic}</h5>
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-semibold">
                      {trend.score}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{trend.insights}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TrendAnalyzer;
