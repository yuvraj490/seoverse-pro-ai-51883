import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Menu, Home, History, Shield, DollarSign, LogOut } from "lucide-react";

interface NavigationProps {
  credits: number;
  isAdmin: boolean;
  onLogout: () => void;
}

export const Navigation = ({ credits, isAdmin, onLogout }: NavigationProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", onClick: () => { navigate("/generate"); setOpen(false); } },
    { icon: History, label: "History", onClick: () => { navigate("/history"); setOpen(false); } },
    { icon: DollarSign, label: "Add Credits", onClick: () => { navigate("/pricing"); setOpen(false); } },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", onClick: () => { navigate("/admin"); setOpen(false); } }] : []),
    { icon: LogOut, label: "Logout", onClick: () => { onLogout(); setOpen(false); }, variant: "destructive" as const },
  ];

  return (
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/generate")}
            className="hover:bg-primary/10 transition-all hover:scale-105"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-sm px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <span className="text-muted-foreground">Credits:</span>
              <span className="ml-2 font-bold text-primary">{credits}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="hover:bg-primary/10 transition-all hover:scale-105"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Credits
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history")}
            className="hover:bg-primary/10 transition-all hover:scale-105"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hover:bg-primary/10 transition-all hover:scale-105"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="hover:bg-destructive/10 transition-all hover:scale-105"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
            <span className="font-bold text-primary">{credits}</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background/95 backdrop-blur-xl border-primary/20">
              <div className="flex flex-col gap-4 mt-8">
                <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <p className="text-2xl font-bold text-primary">{credits}</p>
                </div>
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant={item.variant || "ghost"}
                      className={`w-full justify-start ${
                        item.variant === "destructive"
                          ? "hover:bg-destructive/10"
                          : "hover:bg-primary/10"
                      }`}
                      onClick={item.onClick}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
