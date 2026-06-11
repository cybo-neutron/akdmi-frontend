import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "@/services/course.service";
import { CourseCard } from "@/components/course/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Course } from "@/components/course/AddCourseDialog";
import { AlertCircle } from "lucide-react";

interface CourseListProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

function CourseCardSkeleton() {
  return (
    <Card>
      {/* Placeholder Image Skeleton */}
      <Skeleton className="aspect-video w-full" />

      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>

      <CardContent className="pt-0">
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export function CourseList({
  canEdit = true,
  canDelete = true,
}: CourseListProps) {
  const {
    data: coursesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourses,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to load courses</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  const courses: Course[] = coursesResponse?.data || coursesResponse || [];

  // Handle empty state
  if (!courses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No courses yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Get started by creating your first course.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-5 mt-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
