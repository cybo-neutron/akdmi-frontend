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
import heroImage from '../../../../public/6ba0a2037bb29603e16d1eba79f3e7a580aa600b31bdb0669151f329a30c6a84.png'
import { Separator } from "@/components/ui/separator";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden  pt-20 ">
        {/* Left-to-right gradient overlay covering the background */}
        {/* <div className="absolute inset-0 bg-linear-to-tr from-background via-background/80 to-transparent z-0 pointer-events-none" /> */}

        <div className="relative z-10 w-full  flex gap-8  p-8 md:p-16 ">
          {/* Left: Text Content */}
          <div className="space-y-6 text-left max-w-lg">
            <Badge
              variant="outline"
              className="px-4 py-1 border-primary/20 bg-primary/5 text-primary animate-pulse uppercase tracking-wider text-xs font-semibold"
            >
              New: AI-Powered Course Builder
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
              Create Your Course Empire Under Your Own Brand
            </h1>
            <p className="text-muted-foreground text-md leading-relaxed">
              The all-in-one platform to build a professional course catalog,
              connect your own domain, and sell directly to your students.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                className="h-11 px-6 text-sm font-bold tracking-wider uppercase cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-sm font-bold tracking-wider uppercase cursor-pointer"
                onClick={() => navigate("/courses")}
              >
                Browse Courses
              </Button>
            </div>
          </div>


          <img
            src={heroImage}
            alt="Course Platform Live Dashboard Mockup"
            className="absolute -right-[130px] -bottom-[20px] h-auto w-[700px] group-hover:scale-105 transition-transform duration-500 "
          />
          {/* Right: Placeholder Image with Container */}
          {/* <div className="relative w-full h-full  overflow-hidden group bg-background">
          </div> */}
        </div>
      </section>

      {/* Features Section */}



    </div>
  );
};

export default MainPage;

// <section className="bg-muted/30 py-20">
//   <div className="max-w-6xl mx-auto px-4">
//     <div className="text-center mb-16">
//       <h2 className="text-3xl font-bold mb-4">
//         Everything You Need to Succeed
//       </h2>
//       <p className="text-muted-foreground max-w-xl mx-auto">
//         From white-labeling to rich content delivery, we provide the tools
//         you need to build a premium educational brand.
//       </p>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
//         <CardHeader>
//           <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
//             <Globe className="w-6 h-6" />
//           </div>
//           <CardTitle>Custom Subdomains</CardTitle>
//         </CardHeader>
//         <CardContent className="text-muted-foreground">
//           Connect your own domain or use one of ours. Your students see
//           your brand, not ours.
//         </CardContent>
//       </Card>

//       <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
//         <CardHeader>
//           <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
//             <Layers className="w-6 h-6" />
//           </div>
//           <CardTitle>Rich Multimedia</CardTitle>
//         </CardHeader>
//         <CardContent className="text-muted-foreground">
//           Upload videos, PDFs, interactive documents, and rich text
//           articles for a complete learning experience.
//         </CardContent>
//       </Card>

//       <Card className="border-primary/10 hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm">
//         <CardHeader>
//           <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
//             <Layout className="w-6 h-6" />
//           </div>
//           <CardTitle>Dynamic Catalog</CardTitle>
//         </CardHeader>
//         <CardContent className="text-muted-foreground">
//           Automatically generate a beautiful storefront sharing all your
//           available courses at once.
//         </CardContent>
//       </Card>
//     </div>
//   </div>
// </section>