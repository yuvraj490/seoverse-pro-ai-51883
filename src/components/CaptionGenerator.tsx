import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, Sparkles, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CaptionGenerator = () => {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateCaptions = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: {
          topic: topic.trim(),
          type: "captions",
          platform,
        },
      });

      if (error) throw error;

      if (data?.captions) {
        setCaptions(data.captions);
        toast.success("Captions generated!");
      }
    } catch (error: any) {
      console.error("Error generating captions:", error);
      toast.error(error.message || "Failed to generate captions");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast.success("Caption copied!");
  };

  return (
    <Card className="glass-effect border-primary/30 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Social Media Caption Generator</h3>
        </div>

        <div className="space-y-3">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="bg-background/50 border-primary/30">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Enter your content topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[100px] bg-background/50 border-primary/30"
          />
        </div>

        <Button
          onClick={generateCaptions}
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
              Generate Captions
            </>
          )}
        </Button>

        {captions.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Generated Captions:</h4>
            <div className="space-y-3">
              {captions.map((caption, index) => (
                <div
                  key={index}
                  className="p-4 bg-background/30 border border-primary/20 rounded-lg hover:border-primary/40 transition-all group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm flex-1">{caption}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCaption(caption)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CaptionGenerator;
