import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  MoreVertical,
  BookOpen,
  Mail,
  ShieldCheck,
  UserMinus,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeft,
  Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCourses } from "@/services/course.service";
import { getEnrolledUsers } from "@/services/enrollment.service";
import type { EnrolledUser } from "@/services/enrollment.service";
import { AddEnrollmentDialog } from "./AddEnrollmentDialog";
import { UnenrollDialog } from "./UnenrollDialog";
import { useAllowedAccess } from "@/hooks/useAllowedAccess";
import { UserRole } from "@/types/auth.types";
import { useNavigate } from "react-router";

const ITEMS_PER_PAGE = 10;

// ─── Course List View ──────────────────────────────────────────────
function CourseListView() {
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { checkRole } = useAllowedAccess();
  const canView = checkRole([UserRole.ADMIN, UserRole.MANAGER]);

  if (!canView) {
    navigate("/");
  }

  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourses,
  });

  const handleCourseClick = (courseId: number) => {
    setSearchParams({ courseId: courseId.toString() });
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-destructive opacity-50" />
        </div>
        <h3 className="text-xl font-medium text-foreground">
          Failed to load courses
        </h3>
        <p className="text-muted-foreground mt-1">
          There was an error fetching the course list.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-medium pl-8 w-[100px]">
                course-id
              </TableHead>
              <TableHead className="font-medium">course</TableHead>
              <TableHead className="font-medium">created-by</TableHead>
              <TableHead className="text-right font-medium pr-8">
                enrollments
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell className="pl-8">
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Skeleton className="h-6 w-12 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : courses && courses.length > 0 ? (
              courses.map(
                (course: {
                  id: number;
                  title: string;
                  createdBy: number | null;
                }) => (
                  <TableRow
                    key={course.id}
                    className="group border-border/50 hover:bg-primary/2 transition-colors cursor-pointer"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <TableCell className="pl-8">
                      <span className="text-muted-foreground font-mono text-sm">
                        {course.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.createdBy ?? "—"}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge
                        variant="outline"
                        className="rounded-full border-none bg-primary/10 text-primary font-light px-3 py-1"
                      >
                        <Users className="mr-1.5 h-3 w-3" />
                        View
                      </Badge>
                    </TableCell>
                  </TableRow>
                ),
              )
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <BookOpen className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground">
                      No courses found
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Create a course first to manage enrollments.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Enrolled Users View ────────────────────────────────────────────
function EnrolledUsersView({ courseId }: { courseId: number }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();



  const currentPage = Number(searchParams.get("page")) || 1;

  const [addOpen, setAddOpen] = useState(false);
  const [unenrollUser, setUnenrollUser] = useState<EnrolledUser | null>(null);
  const [unenrollOpen, setUnenrollOpen] = useState(false);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleBack = () => {
    setSearchParams({});
  };

  const handleUnenrollClick = (enrolled: EnrolledUser) => {
    setUnenrollUser(enrolled);
    setUnenrollOpen(true);
  };

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["enrollments", courseId, currentPage, ITEMS_PER_PAGE],
    queryFn: () =>
      getEnrolledUsers(courseId, { page: currentPage, limit: ITEMS_PER_PAGE }),
  });

  const enrollments = paginatedData?.enrollments ?? [];
  const totalPages = paginatedData?.totalPages ?? 0;
  const totalUsers = paginatedData?.total ?? 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <UserIcon className="h-10 w-10 text-destructive opacity-50" />
        </div>
        <h3 className="text-xl font-medium text-foreground">
          Failed to load enrollments
        </h3>
        <p className="text-muted-foreground mt-1">
          There was an error fetching enrolled users.
        </p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["enrollments", courseId],
            })
          }
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Back + Add Enrollment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Button>

          <Button
            onClick={() => setAddOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            Add enrollment
          </Button>
        </div>

        {/* Enrolled Users Table */}
        <div className="relative border border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-medium pl-4 sm:pl-8 w-[180px]">
                    user name
                  </TableHead>
                  <TableHead className="font-medium hidden sm:table-cell">user email</TableHead>
                  <TableHead className="font-medium hidden sm:table-cell">user role</TableHead>
                  <TableHead className="text-right font-medium pr-4 sm:pr-8">
                    actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell className="pl-4 sm:pl-8">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-4 sm:pr-8 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : enrollments.length > 0 ? (
                  enrollments.map((enrolled) => (
                    <TableRow
                      key={enrolled.enrollment.id}
                      className="group border-border/50 hover:bg-primary/2 transition-colors"
                    >
                      <TableCell className="pl-4 sm:pl-8">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <Avatar className="h-10 w-10 border-2 border-background transition-transform group-hover:scale-110">
                              <AvatarImage
                                src={enrolled.user.avatarUrl ?? undefined}
                              />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                {enrolled.user.firstName?.[0]}
                                {enrolled.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                            {[enrolled.user.firstName, enrolled.user.lastName]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 opacity-50" />
                          {enrolled.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={`
                                capitalize font-light px-3 py-1 rounded-full border-none
                                ${
                                  enrolled.user.role === "admin"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : enrolled.user.role === "mentor"
                                      ? "bg-indigo-500/10 text-indigo-500"
                                      : "bg-slate-500/10 text-slate-500"
                                }
                              `}
                        >
                          <ShieldCheck className="mr-1.5 h-3 w-3" />
                          {enrolled.user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4 sm:pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 p-2 rounded-xl border-border/50 bg-background/80 backdrop-blur-xl animate-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuItem
                              onClick={() => handleUnenrollClick(enrolled)}
                              className="flex items-center gap-2 rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive py-2.5 text-destructive"
                            >
                              <UserMinus className="h-4 w-4" />
                              <span>Unenroll</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <UserIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">
                          No enrollments yet
                        </h3>
                        <p className="text-muted-foreground mt-1 max-w-[250px]">
                          No users are enrolled in this course yet. Click "Add
                          new enrollment" to get started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && totalUsers > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-4 sm:py-6 gap-3 border-t border-border/50 bg-muted/10">
              <p className="text-sm text-muted-foreground font-light">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalUsers}
                </span>{" "}
                enrolled users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 w-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (totalPages > 5) {
                      if (
                        page !== 1 &&
                        page !== totalPages &&
                        (page < currentPage - 1 || page > currentPage + 1)
                      ) {
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        )
                          return (
                            <span key={page} className="px-1 opacity-50">
                              ...
                            </span>
                          );
                        return null;
                      }
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className={`h-9 w-9 rounded-xl transition-all ${currentPage === page ? " " : "hover:bg-primary/5 hover:text-primary"}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddEnrollmentDialog
        courseId={courseId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <UnenrollDialog
        enrolledUser={unenrollUser}
        courseId={courseId}
        open={unenrollOpen}
        onOpenChange={setUnenrollOpen}
      />
    </>
  );
}

// ─── Main Enrollments Page ──────────────────────────────────────────
const Enrollments = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");


  const { checkRole } = useAllowedAccess();
  const navigate = useNavigate();

  if (!checkRole([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-light tracking-tight text-foreground transition-all">
          Manage Enrollments
        </h1>
        <p className="text-muted-foreground font-light">
          {courseId
            ? "View and manage enrolled users for this course."
            : "Select a course to manage its enrollments."}
        </p>
      </div>

      {/* Content */}
      {courseId ? (
        <EnrolledUsersView courseId={Number(courseId)} />
      ) : (
        <CourseListView />
      )}
    </div>
  );
};

export default Enrollments;
