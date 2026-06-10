import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Content } from "@/services/content.service";
import { TextContentForm } from "./TextContentForm";
import { MediaContentForm } from "./MediaContentForm";
import { DocumentContentForm } from "./DocumentContentForm";
import { cn } from "@/lib/utils";

// ─── Props ───────────────────────────────────────────────────────────

interface ContentTypeDialogProps {
  /** The content record this type data belongs to */
  content: Content;
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Main ContentTypeDialog ──────────────────────────────────────────

export function ContentTypeDialog({
  content,
  courseId,
  open,
  onOpenChange,
}: ContentTypeDialogProps) {
  const typeLabel =
    content.type === "text"
      ? "Text"
      : content.type === "media"
        ? "Media"
        : "Document";

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          `overflow-y-auto ${content.type === "text" ? "max-w-2xl" : "max-w-lg"}`,
          content.type === "text"
            ? "min-h-[90vh] max-h-[90vh] min-w-[80vw] max-w-[80vw] flex flex-col"
            : "max-h-[90vh] max-w-[40vw]",
        )}
      >
        <DialogHeader>
          <DialogTitle>Add {typeLabel} Content</DialogTitle>
          <DialogDescription>
            Add the {typeLabel.toLowerCase()} content for this topic. You can
            also skip and add it later.
          </DialogDescription>
        </DialogHeader>

        {content.type === "text" && (
          <TextContentForm
            content={content}
            courseId={courseId}
            onSuccess={handleSuccess}
            onCancel={handleSkip}
          />
        )}

        {content.type === "media" && (
          <MediaContentForm
            content={content}
            courseId={courseId}
            onSuccess={handleSuccess}
            onCancel={handleSkip}
          />
        )}

        {content.type === "document" && (
          <DocumentContentForm
            content={content}
            courseId={courseId}
            onSuccess={handleSuccess}
            onCancel={handleSkip}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
