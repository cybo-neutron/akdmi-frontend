import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getPublicCourses } from "@/services/course.service";
import { useNavigate } from "react-router";

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

interface CourseData {
  id: number;
  title: string;
  description: string;
  coverArt?: string | null;
  introductionVideo?: string | null;
  author?: string | null;
  createdAt: string;
  updatedAt: string;
}

const Courses = () => {
  const navigate = useNavigate();

  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery<CourseData[]>({
    queryKey: ["public-courses"],
    queryFn: getPublicCourses,
  });

  return (
    <div className="pt-20 px-4 ">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Badge variant="outline" className="mb-4 text-primary">
            Explore Courses
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Courses
          </h1>
          {/* <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Learn From Industry Experts
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse our catalog of professional courses and start expanding your skills today.
          </p> */}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 animate-bounce">
            <BookOpen className="h-10 w-10 text-destructive opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            Failed to load courses
          </h3>
          <p className="text-muted-foreground mt-1">
            There was an error fetching the course list.
          </p>
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in duration-500">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              className="group border-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full hover:shadow-lg duration-300"
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
              <CardHeader className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{course.author || "Instructor"}</span>
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    <span>All Levels</span>
                  </div> */}
                </div>
                <CardTitle className="leading-tight group-hover:text-primary transition-colors line-clamp-2 text-xl font-bold">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {course.description}
                </CardDescription>
              </CardHeader>
              {/* <CardFooter className="pt-0">
                <Button
                  className="w-full group-hover:gap-2 transition-all"
                  variant="outline"
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            No courses available yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-75">
            Check back soon as we build and launch new exciting courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
