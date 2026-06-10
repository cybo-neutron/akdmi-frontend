import {
  saveContentDocument,
  type Content,
  type ContentDocumentData,
} from "@/services/content.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Upload,
  X,
  FileWarning,
  FileText,
  Presentation,
  File,
} from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, type DragEvent } from "react";
import { cn } from "@/lib/utils";

type DocumentType = "pdf" | "doc" | "ppt" | "other";

const ACCEPTED_EXTENSIONS =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.odt,.odp,.ods,.rtf";

function detectDocumentType(file: File): DocumentType {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "ppt";
  return "other";
}

function getDocIcon(type: DocumentType) {
  switch (type) {
    case "pdf":
      return <FileText className="h-8 w-8 text-red-500" />;
    case "doc":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "ppt":
      return <Presentation className="h-8 w-8 text-orange-500" />;
    default:
      return <File className="h-8 w-8 text-muted-foreground" />;
  }
}

function getDocLabel(type: DocumentType): string {
  switch (type) {
    case "pdf":
      return "PDF";
    case "doc":
      return "Word Document";
    case "ppt":
      return "Presentation";
    default:
      return "Document";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentContentForm({
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingDoc = content.typeData as ContentDocumentData | undefined;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingDoc?.url || null,
  );
  const [detectedType, setDetectedType] = useState<DocumentType>(
    existingDoc?.type || "pdf",
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setFileError(null);
    setSelectedFile(file);
    setDetectedType(detectDocumentType(file));
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClickZone = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveContentDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contents", String(courseId)],
      });
      onSuccess();
    },
  });

  const handleSubmit = () => {
    if (!previewUrl) {
      setFileError("Please select a document file.");
      return;
    }

    mutation.mutate({
      contentId: content.id,
      url: previewUrl,
      documentType: detectedType,
    });
  };

  const hasFile = !!selectedFile || !!existingDoc?.url;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drop zone / File info */}
      {!hasFile ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClickZone}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClickZone();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-16 cursor-pointer transition-all duration-200",
            "text-muted-foreground hover:border-primary/50 hover:bg-primary/5",
            isDragOver &&
              "border-primary bg-primary/10 text-primary scale-[1.01]",
            fileError && "border-destructive/50",
          )}
        >
          <Upload
            className={cn(
              "h-10 w-10 transition-colors",
              isDragOver && "text-primary",
            )}
          />
          <div className="text-center space-y-1.5">
            <p className="font-medium">Drag and drop to upload document</p>
            <p className="text-sm text-muted-foreground/60 font-medium">OR</p>
            <p className="text-sm font-medium text-primary">
              Click to select file
            </p>
          </div>
          <p className="text-xs text-muted-foreground/60">
            PDF, DOC, DOCX, PPT, PPTX, and more
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg border overflow-hidden">
          {/* Document info */}
          <div className="flex items-center gap-4 p-6 bg-muted/20">
            {getDocIcon(detectedType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedFile?.name || "Existing document"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} • ${getDocLabel(detectedType)}`
                  : getDocLabel(detectedType)}
              </p>
            </div>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Errors */}
      {fileError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <FileWarning className="h-4 w-4 shrink-0" />
          {fileError}
        </div>
      )}

      {mutation.isError && (
        <div className="text-destructive text-sm">
          Failed to save document content. Please try again.
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Skip
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={mutation.isPending || !hasFile}
        >
          {mutation.isPending && <Loader2 className="animate-spin mr-2" />}
          {mutation.isPending ? "Saving..." : "Create Content"}
        </Button>
      </DialogFooter>
    </div>
  );
}
