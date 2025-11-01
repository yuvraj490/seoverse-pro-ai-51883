import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScriptGeneratorProps {
  credits: number;
  onCreditsUpdate: (newCredits: number) => void;
}

export const ScriptGenerator = ({ credits, onCreditsUpdate }: ScriptGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("5");
  const [tone, setTone] = useState("engaging");
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    const creditCost = parseInt(duration);
    if (credits < creditCost) {
      toast.error(`Insufficient credits. You need ${creditCost} credits for a ${duration}-minute script.`);
      return;
    }

    setGenerating(true);
    setScript("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: { 
          topic: `Write a ${duration}-minute video script about "${topic}" in a ${tone} tone. Include: opening hook, main points with timing, smooth transitions, and a strong closing CTA. Make it engaging and natural for a ${duration}-minute video.`,
          type: 'script',
          duration
        },
      });

      if (error) throw error;

      setScript(data.description);
      if (data.creditsRemaining !== undefined) {
        onCreditsUpdate(data.creditsRemaining);
      }
      toast.success("Video script generated!");
    } catch (error: any) {
      console.error("Script generation error:", error);
      toast.error(error.message || "Failed to generate script");
    } finally {
      setGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    toast.success("Script copied!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-primary/10 border-primary/30 hover:bg-primary/20">
          <FileText className="h-4 w-4 mr-2" />
          Video Script
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect bg-card/95 border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">AI Video Script Generator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script-topic">Video Topic</Label>
            <Textarea
              id="script-topic"
              placeholder="E.g., 'How to start a YouTube channel in 2025'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[80px] bg-background/50 border-primary/30 focus:border-primary"
              disabled={generating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Video Duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={generating}>
                <SelectTrigger className="bg-background/50 border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect bg-card/95 border-primary/30">
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone} disabled={generating}>
                <SelectTrigger className="bg-background/50 border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect bg-card/95 border-primary/30">
                  <SelectItem value="engaging">Engaging</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertaining">Entertaining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {generating ? "Generating Script..." : `Generate Script (${duration} Credits)`}
          </Button>

          {script && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Script</Label>
                <Button size="sm" variant="ghost" onClick={copyScript}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={script}
                readOnly
                className="min-h-[300px] bg-background/50 border-primary/30 font-mono text-sm"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
