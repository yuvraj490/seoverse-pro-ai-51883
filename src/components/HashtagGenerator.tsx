import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Hash, Sparkles, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HashtagGenerator = () => {
  const [topic, setTopic] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateHashtags = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: {
          topic: topic.trim(),
          type: "hashtags",
        },
      });

      if (error) throw error;

      if (data?.hashtags) {
        setHashtags(data.hashtags);
        toast.success("Hashtags generated!");
      }
    } catch (error: any) {
      console.error("Error generating hashtags:", error);
      toast.error(error.message || "Failed to generate hashtags");
    } finally {
      setLoading(false);
    }
  };

  const copyAllHashtags = () => {
    const text = hashtags.join(" ");
    navigator.clipboard.writeText(text);
    toast.success("Hashtags copied to clipboard!");
  };

  return (
    <Card className="glass-effect border-primary/30 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Hashtag Generator</h3>
        </div>

        <Textarea
          placeholder="Enter your content topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-[100px] bg-background/50 border-primary/30"
        />

        <Button
          onClick={generateHashtags}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Hashtags
            </>
          )}
        </Button>

        {hashtags.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-muted-foreground">Generated Hashtags:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllHashtags}
                className="border-primary/30"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy All
              </Button>
            </div>
            <div className="p-4 bg-background/30 border border-primary/20 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HashtagGenerator;
