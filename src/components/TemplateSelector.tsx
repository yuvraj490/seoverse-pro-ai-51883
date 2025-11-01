import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

interface Template {
  name: string;
  icon: string;
  prompt: string;
}

const templates: Template[] = [
  {
    name: "Product Review",
    icon: "📦",
    prompt: "Review of [product name] - features, pros, cons, and verdict"
  },
  {
    name: "How-To Tutorial",
    icon: "📚",
    prompt: "How to [task] - step-by-step guide for beginners"
  },
  {
    name: "Tech Comparison",
    icon: "⚔️",
    prompt: "[Product A] vs [Product B] - detailed comparison and which to buy"
  },
  {
    name: "Listicle",
    icon: "📝",
    prompt: "Top 10 [items] - ranked list with explanations"
  },
  {
    name: "News/Update",
    icon: "📰",
    prompt: "Latest update about [topic] - what you need to know"
  },
  {
    name: "Gaming",
    icon: "🎮",
    prompt: "[Game name] gameplay - tips, tricks, and walkthrough"
  },
  {
    name: "Vlog/Daily",
    icon: "📹",
    prompt: "A day in my life as [profession/activity]"
  },
  {
    name: "Recipe/Cooking",
    icon: "🍳",
    prompt: "How to make [dish name] - easy recipe tutorial"
  }
];

interface TemplateSelectorProps {
  onSelectTemplate: (prompt: string) => void;
}

export const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-accent/10 border-accent/30 hover:bg-accent/20"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass-effect bg-card/95 border-accent/30 max-h-[400px] overflow-y-auto">
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onClick={() => onSelectTemplate(template.prompt)}
            className="hover:bg-accent/10 cursor-pointer py-3"
          >
            <span className="text-lg mr-2">{template.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground">{template.prompt}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
