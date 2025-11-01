import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";

interface ExportMenuProps {
  data: {
    title?: string;
    description: string;
    tags: string[];
    keywords: string[];
    meta_description?: string;
  };
  topic: string;
}

export const ExportMenu = ({ data, topic }: ExportMenuProps) => {
  const exportToTxt = () => {
    const content = `
SEO Content for: ${topic}
Generated on: ${new Date().toLocaleString()}

${data.title ? `TITLE:\n${data.title}\n\n` : ''}
DESCRIPTION:
${data.description}

${data.meta_description ? `META DESCRIPTION:\n${data.meta_description}\n\n` : ''}
TAGS:
${data.tags.map(tag => `#${tag}`).join(', ')}

KEYWORDS:
${data.keywords.join(', ')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-${topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as TXT!");
  };

  const exportToCsv = () => {
    const rows = [
      ['Field', 'Content'],
      ['Topic', topic],
      ['Generated', new Date().toLocaleString()],
      ...(data.title ? [['Title', data.title]] : []),
      ['Description', data.description],
      ...(data.meta_description ? [['Meta Description', data.meta_description]] : []),
      ['Tags', data.tags.join(', ')],
      ['Keywords', data.keywords.join(', ')],
    ];

    const csv = rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-${topic.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV!");
  };

  const copyAll = () => {
    const content = `${data.title ? `${data.title}\n\n` : ''}${data.description}\n\n${data.meta_description ? `${data.meta_description}\n\n` : ''}${data.tags.map(t => `#${t}`).join(' ')}\n\n${data.keywords.join(', ')}`;
    navigator.clipboard.writeText(content);
    toast.success("All content copied!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary/10 border-primary/30 hover:bg-primary/20"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass-effect bg-card/95 border-primary/30">
        <DropdownMenuItem onClick={copyAll} className="hover:bg-primary/10 cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Copy All
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToTxt} className="hover:bg-primary/10 cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCsv} className="hover:bg-primary/10 cursor-pointer">
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
