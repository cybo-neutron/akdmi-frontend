import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createContent,
  updateContent,
  type Content,
  type CreateContentData,
} from "@/services/content.service";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ContentFormData {
  title: string;
  description: string;
  type: "text" | "media" | "document";
}

interface ContentDialogProps {
  mode: "create" | "edit";
  courseId: number;
  parentId?: number | null;
  content?: Content;
  isChapter?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful create — passes the newly created content so Dialog 2 can open */
  onContentCreated?: (content: Content) => void;
}

export function ContentDialog({
  mode,
  courseId,
  parentId,
  content,
  isChapter = false,
  open,
  onOpenChange,
  onContentCreated,
}: ContentDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentFormData>({
    defaultValues: {
      title: content?.title || "",
      description: content?.description || "",
      type: content?.type || "text",
    },
  });

  // Reset form when content changes (for edit mode) or dialog opens
  useEffect(() => {
    if (content && mode === "edit") {
      reset({
        title: content.title,
        description: content.description,
        type: content.type,
      });
    } else if (mode === "create") {
      reset({
        title: "",
        description: "",
        type: "text",
      });
    }
  }, [content, mode, reset, open]);

  const createMutation = useMutation({
    mutationFn: createContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["contents", String(courseId)],
      });
      reset();
      onOpenChange(false);

      // If not a chapter and callback exists, open the type-specific dialog
      if (!isChapter && onContentCreated) {
        onContentCreated(data);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateContent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contents", String(courseId)],
      });
      onOpenChange(false);
    },
  });

  const mutation = mode === "edit" ? updateMutation : createMutation;

  const onSubmit = (data: ContentFormData) => {
    if (mode === "create") {
      const createData: CreateContentData = {
        title: data.title,
        description: data.description,
        type: isChapter ? "text" : data.type,
        courseId,
        parentId: parentId || null,
      };
      createMutation.mutate(createData);
    } else if (content) {
      updateMutation.mutate({
        id: content.id,
        title: data.title,
        description: data.description,
        type: isChapter ? content.type : data.type,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      reset();
      mutation.reset();
    }
  };

  const entityLabel = isChapter ? "Chapter" : "Topic";

  const dialogTitle =
    mode === "edit" ? `Edit ${entityLabel}` : `Add New ${entityLabel}`;

  const dialogDescription =
    mode === "edit"
      ? `Update the ${entityLabel.toLowerCase()} details.`
      : `Create a new ${entityLabel.toLowerCase()} for this course.`;

  const submitButtonText =
    mode === "edit"
      ? mutation.isPending
        ? "Saving..."
        : "Save Changes"
      : mutation.isPending
        ? "Creating..."
        : isChapter
          ? `Create ${entityLabel}`
          : "Next: Add Content";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="content-title">Title</FieldLabel>
            <Input
              id="content-title"
              placeholder={`Enter ${entityLabel.toLowerCase()} title`}
              aria-invalid={!!errors.title}
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
              })}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="content-description">Description</FieldLabel>
            <Textarea
              id="content-description"
              placeholder={`Enter ${entityLabel.toLowerCase()} description`}
              aria-invalid={!!errors.description}
              rows={3}
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <FieldError>{errors.description.message}</FieldError>
            )}
          </Field>

          {/* Type selector — only for topics, not chapters */}
          {!isChapter && (
            <Field>
              <FieldLabel htmlFor="content-type">Content Type</FieldLabel>
              <select
                id="content-type"
                className="flex h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                {...register("type")}
              >
                <option value="text">Text</option>
                <option value="media">Media (Image/Video/Audio)</option>
                <option value="document">Document (PDF/DOC/PPT)</option>
              </select>
            </Field>
          )}

          {mutation.isError && (
            <div className="text-destructive text-sm">
              Failed to {mode === "edit" ? "update" : "create"}{" "}
              {entityLabel.toLowerCase()}. Please try again.
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
              {mutation.isPending && <Loader2 className="animate-spin mr-2" />}
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
