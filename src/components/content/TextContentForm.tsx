import {
  saveContentText,
  type Content,
  type ContentTextData,
} from "@/services/content.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TextEditor from "../text-editor/TextEditor";

interface TextFormData {
  content: string;
}

export function TextContentForm({
  content,
  courseId,
  onSuccess,
  onCancel,
}: {
  content: Content;
  courseId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const existingText = content.typeData as ContentTextData | undefined;

  const { handleSubmit, control } = useForm<TextFormData>({
    defaultValues: {
      content: existingText?.content || "",
    },
  });

  const mutation = useMutation({
    mutationFn: saveContentText,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contents", String(courseId)],
      });
      onSuccess();
    },
  });

  const onSubmit = (data: TextFormData) => {
    mutation.mutate({
      contentId: content.id,
      content: data.content,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0 gap-3"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30 shrink-0">
        <FileText className="h-4 w-4" />
        <span>
          Adding text content for: <strong>{content.title}</strong>
        </span>
      </div>

      <Field className="flex-1 min-h-0 flex flex-col">
        {/* <FieldLabel>Text Content</FieldLabel> */}
        <Controller
          name="content"
          control={control}
          rules={{ required: "Text content is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 min-h-0">
              {/* <TiptapEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Start writing your content here..."
              /> */}
              <TextEditor
                content={field.value}
                onChange={field.onChange}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </div>
          )}
        />
      </Field>

      {mutation.isError && (
        <div className="text-destructive text-sm shrink-0">
          Failed to save text content. Please try again.
        </div>
      )}

      <DialogFooter className="shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Skip
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin mr-2" />}
          {mutation.isPending ? "Saving..." : "Save Content"}
        </Button>
      </DialogFooter>
    </form>
  );
}
