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
import {
  createCourse,
  updateCourse,
  getCourseMediaPresignedUrl,
} from "@/services/course.service";
import { uploadFileWithPreSignedUrl } from "@/services/file.service";
import {
  Plus,
  Loader2,
  ImageIcon,
  Video,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { capitalize } from "@/lib/capitalize";
import { MediaUploadField } from "./MediaUploadFile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseFormData {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverArt?: string | null;
  introductionVideo?: string | null;
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

// ─── CourseDialog ─────────────────────────────────────────────────────────────

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

  // ── File states ──
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);

  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Cleanup object URLs on unmount ──
  useEffect(() => {
    return () => {
      if (coverArtPreview) URL.revokeObjectURL(coverArtPreview);
    };
  }, [coverArtPreview]);

  // ── File change handlers ──
  const handleCoverArtChange = useCallback((file: File | null) => {
    if (coverArtPreview) URL.revokeObjectURL(coverArtPreview);
    setCoverArtFile(file);
    setCoverArtPreview(file ? URL.createObjectURL(file) : null);
  }, [coverArtPreview]);

  const handleIntroVideoChange = useCallback((file: File | null) => {
    setIntroVideoFile(file);
  }, []);

  // ── Form ──
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
    },
  });

  useEffect(() => {
    if (course && mode === "edit") {
      reset({ title: course.title, description: course.description });
    }
  }, [course, mode, reset]);

  // ── Mutations ──
  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      reset();
      setOpen(false);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: CourseFormData & { coverArt?: string; introductionVideo?: string }) =>
      updateCourse({ id: course!.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
    },
  });

  const mutation = mode === "edit" ? updateCourseMutation : createCourseMutation;

  // ── Upload helper ──
  async function uploadIfSelected(
    file: File | null,
    category: "cover_art" | "introduction_video",
  ): Promise<string | undefined> {
    if (!file) return undefined;
    const { signedUrl, objectKey, bucketName } = await getCourseMediaPresignedUrl({
      fileName: file.name,
      contentType: file.type,
      category,
    });
    await uploadFileWithPreSignedUrl(signedUrl, file);
    return `${bucketName}::${objectKey}`;
  }

  // ── Submit ──
  const onSubmit = async (data: CourseFormData) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const [coverArtUrl, introVideoUrl] = await Promise.all([
        uploadIfSelected(coverArtFile, "cover_art"),
        uploadIfSelected(introVideoFile, "introduction_video"),
      ]);
      setIsUploading(false);

      mutation.mutate({
        ...data,
        ...(coverArtUrl !== undefined && { coverArt: coverArtUrl }),
        ...(introVideoUrl !== undefined && { introductionVideo: introVideoUrl }),
      });
    } catch {
      setIsUploading(false);
      setUploadError("File upload failed. Please try again.");
    }
  };

  // ── Dialog open/close ──
  const resetFiles = () => {
    if (coverArtPreview) URL.revokeObjectURL(coverArtPreview);
    setCoverArtFile(null);
    setCoverArtPreview(null);
    setIntroVideoFile(null);
    setUploadError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (mode === "create") {
        reset({ title: "", description: "" });
      } else if (course) {
        reset({ title: course.title, description: course.description });
      }
      resetFiles();
      mutation.reset();
    }
  };

  // ── Labels ──
  const isEdit = mode === "edit";
  const dialogTitle = isEdit ? "Edit Course" : "Add New Course";
  const dialogDescription = isEdit
    ? "Update course details, cover art, or introduction video."
    : "Create a new course with a title, description, and optional media.";

  const isPending = isUploading || mutation.isPending;
  const submitLabel = isEdit
    ? isPending ? "Saving..." : "Save Changes"
    : isPending ? "Creating..." : "Create Course";

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

      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="">{capitalize(dialogTitle)}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full min-w-0">
          {/* Title */}
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title" className="">TITLE</FieldLabel>
            <Input
              id="title"
              placeholder="Enter course title"
              aria-invalid={!!errors.title}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
              })}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          {/* Description */}
          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description" className="">DESCRIPTION</FieldLabel>
            <Textarea
              id="description"
              placeholder="Enter course description"
              aria-invalid={!!errors.description}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
              className="min-h-50"
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          {/* Cover Art */}
          <MediaUploadField
            id="cover-art"
            label="Cover Art"
            accept="image/*"
            icon={<ImageIcon size={20} />}
            hint="JPG, PNG or WebP recommended. Displayed as the course thumbnail."
            file={coverArtFile}
            previewUrl={coverArtPreview}
            existingUrl={course?.coverArt}
            onFileChange={handleCoverArtChange}
          />

          {/* Introduction Video */}
          <MediaUploadField
            id="intro-video"
            label="Introduction Video"
            accept="video/*"
            icon={<Video className="h-4 w-4" />}
            hint="MP4 recommended. Shown as a preview trailer on the course page."
            file={introVideoFile}
            previewUrl={null}
            existingUrl={course?.introductionVideo}
            onFileChange={handleIntroVideoChange}
          />

          {/* Errors */}
          {uploadError && (
            <p className="text-destructive text-sm">{uploadError}</p>
          )}
          {mutation.isError && (
            <p className="text-destructive text-sm">
              Failed to {isEdit ? "update" : "create"} course. Please try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {submitLabel}
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
