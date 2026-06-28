import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe,
  Layout,
  ArrowRight,
  Layers,
  User,
  BookOpen,
  Zap,
  Mail,
  Twitter,
  Github,
  Youtube,
  Rocket,
  Coffee,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router";
import heroImage from "../../../../public/6ba0a2037bb29603e16d1eba79f3e7a580aa600b31bdb0669151f329a30c6a84.png";
import { useQuery } from "@tanstack/react-query";
import { getPublicCourses } from "@/services/course.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseData {
  id: number;
  title: string;
  description: string;
  coverArt?: string | null;
  author?: string | null;
  createdAt: string;
}

// ─── Placeholder images ───────────────────────────────────────────────────────
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1434031215662-8a48c44c4427?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
];
function getPlaceholderImage(index: number) {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}

// ─── Features Section ─────────────────────────────────────────────────────────
const features = [
  {
    icon: BookOpen,
    title: "Structured Course Catalog",
    description:
      "Explore and discover a wide variety of courses curated and structured specifically for learning.",
  },
  {
    icon: Layers,
    title: "Rich Text & Video Lessons",
    description:
      "Learn effectively with structured text-based guides, reading materials, and high-quality video lessons.",
  },
  {
    icon: User,
    title: "Vetted Mentors",
    description:
      "All mentors are carefully onboarded and verified by administrators to ensure top-tier educational quality.",
  },
  {
    icon: Zap,
    title: "Track Your Progress",
    description:
      "Easily track your progress per course, knowing exactly which lessons you have completed and where to pick up.",
  },
  {
    icon: Layout,
    title: "Dedicated Student Portal",
    description:
      "Sign up as a student to enroll in courses, view active classes, and access all your study materials in one place.",
  },
  {
    icon: Globe,
    title: "Seamless Web Access",
    description:
      "Log in from any device to access your courses, watch lectures, and read resources whenever you want.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-24 px-8 md:px-16 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Designed for Guided Learning
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From admin-approved mentors to detailed lesson tracking, our platform provides all the essential tools for a premium educational experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Courses Preview Section ──────────────────────────────────────────────────
function CoursesPreviewSection() {
  const navigate = useNavigate();

  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery<CourseData[]>({
    queryKey: ["public-courses"],
    queryFn: getPublicCourses,
  });

  const preview = courses?.slice(0, 4);

  return (
    <section className="py-24 px-8 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">
              Explore Courses
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Start Learning Today
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Browse our catalog of professional courses crafted by verified mentors.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 h-10 px-5 font-semibold uppercase tracking-wider text-xs cursor-pointer"
            onClick={() => navigate("/courses")}
          >
            View All Courses <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-destructive opacity-50" />
            </div>
            <p className="text-muted-foreground">Could not load courses. Please try again later.</p>
          </div>
        ) : preview && preview.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {preview.map((course, index) => (
              <Card
                key={course.id}
                className="group border-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:shadow-lg"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  <img
                    src={course.coverArt || getPlaceholderImage(index)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent" />
                </div>
                <CardHeader className="space-y-2 flex-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3 text-primary" />
                    <span>{course.author || "Instructor"}</span>
                  </div>
                  <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-xs">
                    {course.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-lg font-medium">No courses available yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              Check back soon as we build and launch new exciting courses.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const footerLinks = {
  Platform: [
    { label: "Browse Courses", href: "/courses" },
    { label: "Sign Up", href: "/signup" },
    { label: "Log In", href: "/login" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "/blogs" },
    // { label: "Pricing", href: "/pricing" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Mail, label: "Email", href: "#" },
];

function FooterSection() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/20 px-8 md:px-16 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-black text-lg tracking-tight">AKDMI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A premium learning platform providing high-quality video and text-based courses to help you grow your skills.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {year} Akdmi. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex justify-center items-center gap-2">
            <span>
              Built with 
            </span>
            <span>
              <Heart size={20} className="text-red-500" />
            </span>
            <span>and</span>
            <span><Coffee size={20} className="text-amber-800" /> </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="relative z-10 w-full flex gap-8 px-6 py-10 md:p-16">
          {/* Text Content */}
          <div className="space-y-6 text-left w-full md:max-w-lg">
            <Badge
              variant="outline"
              className="px-4 py-1 border-primary/20 bg-primary/5 text-primary uppercase tracking-wider text-xs font-semibold"
            >
              Interactive Online Academy
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
              Learn From Vetted Mentors and Industry Experts
            </h1>
            <p className="text-muted-foreground text-sm md:text-md leading-relaxed">
              A unified platform offering structured text and video courses. Sign up as a student, enroll in courses, track your progress, and elevate your skills.
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

          {/* Hero image — only visible on large screens */}
          <img
            src={heroImage}
            alt="Course Platform Live Dashboard Mockup"
            className="hidden lg:block absolute -right-[130px] -bottom-[20px] h-auto w-[700px] transition-transform duration-500"
          />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Courses Preview Section */}
      <CoursesPreviewSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default MainPage;