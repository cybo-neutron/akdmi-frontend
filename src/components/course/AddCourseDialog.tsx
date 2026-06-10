import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { createCourse, updateCourse } from "@/services/course.service";
import { Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface CourseFormData {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseDialogProps {
  trigger?: React.ReactNode;
  mode?: "create" | "edit";
  course?: Course;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CourseDialog({
  trigger,
  mode = "create",
  course,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CourseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Support both controlled and uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
    },
  });

  // Reset form when course data changes (for edit mode)
  useEffect(() => {
    if (course && mode === "edit") {
      reset({
        title: course.title,
        description: course.description,
      });
    }
  }, [course, mode, reset]);

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      reset();
      setOpen(false);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) =>
      updateCourse({ id: course!.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
    },
  });

  const mutation =
    mode === "edit" ? updateCourseMutation : createCourseMutation;

  const onSubmit = (data: CourseFormData) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (mode === "create") {
        reset({ title: "", description: "" });
      } else if (course) {
        reset({ title: course.title, description: course.description });
      }
      mutation.reset();
    }
  };

  const isEdit = mode === "edit";
  const dialogTitle = isEdit ? "Edit Course" : "Add New Course";
  const dialogDescription = isEdit
    ? "Update the course title and description."
    : "Create a new course by providing a title and description.";
  const submitButtonText = isEdit
    ? mutation.isPending
      ? "Saving..."
      : "Save Changes"
    : mutation.isPending
      ? "Creating..."
      : "Create Course";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Add New Course
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              placeholder="Enter course title"
              aria-invalid={!!errors.title}
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Enter course description"
              aria-invalid={!!errors.description}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
              })}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          {mutation.isError && (
            <div className="text-destructive text-sm">
              Failed to {isEdit ? "update" : "create"} course. Please try again.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Backward compatible export
export function AddCourseDialog(
  props: Omit<CourseDialogProps, "mode" | "course">,
) {
  return <CourseDialog {...props} mode="create" />;
}
