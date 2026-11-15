import type { Editor } from "@tiptap/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { uploadEditorImage } from "@/services/file.service";

export const getImageFiles = (files?: FileList | null): File[] =>
  Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : "Image upload failed";
};

// Uploads images to S3 and inserts them at `pos` (or the current selection).
// Only the public url ends up in the editor content, never base64 data.
export const uploadAndInsertImages = async (
  editor: Editor,
  files: File[],
  pos?: number,
) => {
  let insertAt = pos;

  for (const file of files) {
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const url = await uploadEditorImage(file);
      if (editor.isDestroyed) return;

      const image = { type: "image", attrs: { src: url, alt: file.name } };
      const target = insertAt ?? editor.state.selection.from;
      editor.chain().focus().insertContentAt(target, image).run();
      // Keep multiple dropped images in order
      if (insertAt !== undefined) {
        insertAt = editor.state.selection.to;
      }

      toast.success(`Uploaded ${file.name}`, { id: toastId });
    } catch (error) {
      toast.error(`Failed to upload ${file.name}: ${getErrorMessage(error)}`, {
        id: toastId,
      });
    }
  }
};

export const pickAndInsertImages = (editor: Editor) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = () => {
    const files = getImageFiles(input.files);
    if (files.length) uploadAndInsertImages(editor, files);
  };
  input.click();
};
