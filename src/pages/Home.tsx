import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, History, TrendingUp, Video, FileText, Lightbulb } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "AI-Powered SEO",
      description: "Generate optimized titles, descriptions, tags, and keywords instantly using advanced AI"
    },
    {
      icon: <Video className="h-8 w-8 text-accent" />,
      title: "Video Scripts",
      description: "Create engaging video scripts (5-15 mins) tailored to your content with variable credit pricing"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Content Ideas",
      description: "Never run out of ideas with AI-generated video topic suggestions for any niche"
    },
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: "Templates",
      description: "Choose from pre-made templates for reviews, tutorials, comparisons, and more"
    },
    {
      icon: <History className="h-8 w-8 text-primary" />,
      title: "History Tracking",
      description: "Access all your past generations anytime, anywhere"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-accent" />,
      title: "Trend Analysis",
      description: "Discover trending topics in your niche with AI-powered analysis"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Hashtag Generator",
      description: "Generate 30 trending hashtags to boost your social media reach"
    },
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: "Caption Writer",
      description: "Create engaging captions for Instagram, Twitter, LinkedIn, YouTube, and Facebook"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">AI-Powered Content Creation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
            SEOverse Pro
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your content creation with AI-powered SEO generation, video scripts, and creative ideas
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] h-14 px-8 text-lg font-semibold"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              onClick={() => navigate("/pricing")}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 h-14 px-8 text-lg"
            >
              View Pricing
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            🎁 Get 5 free credits on signup • No credit card required
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 max-w-4xl mx-auto">
          <Card className="glass-effect border-primary/30 p-6 text-center hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all">
            <p className="text-4xl font-bold text-primary mb-2">5</p>
            <p className="text-sm text-muted-foreground">Free Credits</p>
          </Card>
          <Card className="glass-effect border-accent/30 p-6 text-center hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all">
            <p className="text-4xl font-bold text-accent mb-2">8+</p>
            <p className="text-sm text-muted-foreground">AI Tools</p>
          </Card>
          <Card className="glass-effect border-primary/30 p-6 text-center hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all">
            <p className="text-4xl font-bold text-primary mb-2">∞</p>
            <p className="text-sm text-muted-foreground">History Access</p>
          </Card>
          <Card className="glass-effect border-accent/30 p-6 text-center hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all">
            <p className="text-4xl font-bold text-accent mb-2">AI</p>
            <p className="text-sm text-muted-foreground">Powered</p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text">
            Ready to Transform Your Content?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join creators who are already generating optimized content with SEOverse Pro
          </p>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] h-14 px-8 text-lg font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Start Creating Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
