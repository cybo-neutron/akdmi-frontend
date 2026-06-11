import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CourseDialog, type Course } from "@/components/course/AddCourseDialog";
import { deleteCourse } from "@/services/course.service";
import { Pencil, Trash2, Loader2, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function CourseCard({
  course,
  canEdit = true,
  canDelete = true,
}: CourseCardProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCourseMutation = useMutation({
    mutationFn: () => deleteCourse(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    deleteCourseMutation.mutate();
  };

  return (
    <>
      <Card className="group hover:ring-foreground/20 transition-all duration-200 p-0">
        {/* Placeholder Image */}
        <div className="relative aspect-video bg-linear-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center overflow-hidden">
          <BookOpen className="size-12 text-primary/40" />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
          {(canEdit || canDelete) && (
            <CardAction>
              <div className="flex gap-1">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditDialogOpen(true)}
                    aria-label="Edit course"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    aria-label="Delete course"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardAction>
          )}
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardFooter className="mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate(`/dashboard/courses/${course.id}`)}
          >
            View Course
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <CourseDialog
        mode="edit"
        course={course}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourseMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCourseMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCourseMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
