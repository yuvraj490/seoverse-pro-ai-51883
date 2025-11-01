import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lightbulb, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface IdeaGeneratorProps {
  credits: number;
  onCreditsUpdate: (newCredits: number) => void;
}

export const IdeaGenerator = ({ credits, onCreditsUpdate }: IdeaGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!niche.trim()) {
      toast.error("Please enter a niche or topic");
      return;
    }

    if (credits < 1) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setGenerating(true);
    setIdeas([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: { 
          topic: `Generate 10 unique, trending video ideas for the niche: "${niche}". Make each idea specific, actionable, and attention-grabbing.`,
          type: 'ideas'
        },
      });

      if (error) throw error;

      // Parse the ideas from the description
      const ideaList = data.description
        .split('\n')
        .filter((line: string) => line.trim() && (line.match(/^\d+\./) || line.match(/^-/)))
        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .filter((line: string) => line.length > 0);

      setIdeas(ideaList.slice(0, 10));
      if (data.creditsRemaining !== undefined) {
        onCreditsUpdate(data.creditsRemaining);
      }
      toast.success("Video ideas generated!");
    } catch (error: any) {
      console.error("Idea generation error:", error);
      toast.error(error.message || "Failed to generate ideas");
    } finally {
      setGenerating(false);
    }
  };

  const copyIdea = (idea: string) => {
    navigator.clipboard.writeText(idea);
    toast.success("Idea copied!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-accent/10 border-accent/30 hover:bg-accent/20">
          <Lightbulb className="h-4 w-4 mr-2" />
          Video Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect bg-card/95 border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">AI Video Idea Generator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Your Niche or Topic</Label>
            <Input
              id="niche"
              placeholder="E.g., 'tech reviews', 'fitness', 'cooking'"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="bg-background/50 border-primary/30 focus:border-primary"
              disabled={generating}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !niche.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? "Generating Ideas..." : "Generate 10 Ideas (1 Credit)"}
          </Button>

          {ideas.length > 0 && (
            <div className="space-y-3">
              <Label>Generated Ideas</Label>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <Card
                    key={index}
                    className="glass-effect border-primary/30 p-4 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all cursor-pointer"
                    onClick={() => copyIdea(idea)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm flex-1">{idea}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💡 Click any idea to copy it
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
