import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/text-editor/TextEditor";
import { createBlog, updateBlog, type Blog } from "@/services/blog.service";
import { Resource } from "@/types/resource.types";
import { useAllowedAccess } from "@/hooks/useAllowedAccess";

interface BlogFormData {
  title: string;
  content: string;
}

interface BlogEditorProps {
  blog?: Blog;
  onBack: () => void;
}

export function BlogEditor({ blog, onBack }: BlogEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!blog;

  const { checkPermission } = useAllowedAccess();
  const canEdit = checkPermission(Resource.BLOG, isEditing ? "update" : "create");


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BlogFormData>({
    defaultValues: {
      title: blog?.title ?? "",
      content: blog?.content ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onBack();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BlogFormData) => updateBlog({ id: blog!.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onBack();
    },
  });

  const mutation = isEditing ? updateMutation : createMutation;

  const onSubmit = (data: BlogFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 gap-5"
      >
        {/* Title Field */}
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input
            placeholder="Enter blog title..."
            {...register("title", {
              required: "Title is required",
              minLength: { value: 1, message: "Title is required" },
            })}
            className="text-lg"
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        {/* Content Editor */}
        <Field className="flex-1 min-h-0 flex flex-col">
          <FieldLabel>Content</FieldLabel>
          <Controller
            name="content"
            control={control}
            rules={{ required: "Content is required" }}
            render={({ field, fieldState }) => (
              <div className="flex-1 min-h-0">
                <TextEditor content={field.value} onChange={field.onChange} />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </div>
            )}
          />
        </Field>

        {mutation.isError && (
          <div className="text-destructive text-sm shrink-0">
            Failed to {isEditing ? "update" : "create"} blog. Please try again.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !canEdit}>
            {mutation.isPending && (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            )}
            {mutation.isPending
              ? "Saving..."
              : isEditing
                ? "Update Blog"
                : "Publish Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
