import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyEnrollments } from "@/services/enrollment.service";

const UserDashboardHome = () => {
  const {
    data: enrollments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollments,
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-light tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      {/* My Courses Section */}
      <div className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">My Courses</h2>
          <Link
            to="/dashboard/courses"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Course Cards Container */}
        <div className="border border-border/50 bg-card/30 backdrop-blur-sm rounded-lg p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Failed to load your courses.
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {enrollments.map((item) => (
                <Link
                  key={item.enrollment.id}
                  to={`/dashboard/course/${item.course.id}`}
                  className="group relative"
                >
                  <div className="aspect-square rounded-lg border border-border/50 bg-muted/30 flex flex-col items-center justify-center gap-3 p-4 transition-all group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:scale-105 group-hover:shadow-lg active:scale-95">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center line-clamp-2 leading-tight">
                      {item.course.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-base font-medium text-foreground">
                No courses yet
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-[280px]">
                You haven't been enrolled in any courses. Browse available
                courses to get started.
              </p>
              <Link
                to="/dashboard/courses"
                className="text-sm text-primary hover:text-primary/80 mt-3 transition-colors"
              >
                Browse courses →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardHome;
