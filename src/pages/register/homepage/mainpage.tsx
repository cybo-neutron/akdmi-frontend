import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Layout,
  FileText,
  Video,
  BookOpen,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-10 gap-6 max-w-5xl mx-auto">
        <Badge
          variant="outline"
          className="px-4 py-1 border-primary/20 bg-primary/5 text-primary animate-pulse"
        >
          New: AI-Powered Course Builder
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Create Your Course Empire <br /> Under Your Own Brand
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          The all-in-one platform to build a professional course catalog,
          connect your own domain, and sell directly to your students.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            className="px-8 h-12 text-lg"
            onClick={() => navigate("/signup")}
          >
            Start Building for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-lg"
            onClick={() => navigate("/pricing")}
          >
            View Plans
          </Button>
        </div>
        <div className="mt-10 w-full relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative border bg-card rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-muted px-4 py-2 border-b flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 bg-background px-4 py-0.5 rounded text-xs text-muted-foreground flex items-center gap-2">
                <Globe className="w-3 h-3" /> academy.your-brand.com
              </div>
            </div>
            <div className="p-8 h-64 flex items-center justify-center bg-muted/30">
              <div className="flex flex-col items-center gap-4">
                <BookOpen className="w-16 h-16 text-primary opacity-20" />
                <span className="text-muted-foreground font-medium italic">
                  Course Catalog Live Dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From white-labeling to rich content delivery, we provide the tools
              you need to build a premium educational brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <CardTitle>Custom Subdomains</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Connect your own domain or use one of ours. Your students see
                your brand, not ours.
              </CardContent>
            </Card>

            <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Layers className="w-6 h-6" />
                </div>
                <CardTitle>Rich Multimedia</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Upload videos, PDFs, interactive documents, and rich text
                articles for a complete learning experience.
              </CardContent>
            </Card>

            <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Layout className="w-6 h-6" />
                </div>
                <CardTitle>Dynamic Catalog</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Automatically generate a beautiful storefront sharing all your
                available courses at once.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="font-bold text-2xl text-primary opacity-30">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Choose Your Plan</h3>
                  <p className="text-muted-foreground">
                    Select a subscription that fits your business scale. No
                    hidden fees.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="font-bold text-2xl text-primary opacity-30">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Set Your Domain</h3>
                  <p className="text-muted-foreground">
                    Instantly set up your custom subdomain to host your academy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="font-bold text-2xl text-primary opacity-30">
                  03
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Build Your Catalog</h3>
                  <p className="text-muted-foreground">
                    Upload content in any format. We handle the technical heavy
                    lifting.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="font-bold text-2xl text-primary opacity-30">
                  04
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Sell to Students</h3>
                  <p className="text-muted-foreground">
                    Your customers buy courses directly from your new subdomain.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <Zap className="w-8 h-8 text-primary opacity-20" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-1/3 bg-primary/20 rounded"></div>
              <div className="h-32 w-full bg-card rounded-xl border flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary opacity-40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-card rounded-xl border flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary opacity-40" />
                </div>
                <div className="h-20 bg-card rounded-xl border flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary opacity-40" />
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline" disabled>
                  Purchase Course - $99
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-4 text-center">
        <div className="bg-primary rounded-3xl py-16 px-4 text-primary-foreground max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

          <h2 className="text-4xl font-bold mb-6 relative">
            Ready to start teaching?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto relative">
            Join thousands of creators who are building their legacy on our
            platform.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-14 px-10 text-lg relative"
            onClick={() => navigate("/signup")}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
