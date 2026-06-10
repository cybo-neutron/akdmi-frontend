import {
  saveContentMedia,
  type Content,
  type ContentMediaData,
} from "@/services/content.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X, FileWarning, CircleCheck } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

type MediaType = "video" | "audio" | "image";

function detectMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

export function MediaContentForm({
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

  const existingMedia = content.typeData as ContentMediaData | undefined;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingMedia?.url || null,
  );
  const [detectedType, setDetectedType] = useState<MediaType>(
    existingMedia?.type || "image",
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    setFileError(null);

    const isMedia =
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") ||
      file.type.startsWith("image/");

    if (!isMedia) {
      setFileError("Please upload a video, audio, or image file.");
      return;
    }

    setSelectedFile(file);
    setDetectedType(detectMediaType(file));
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
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveContentMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contents", String(courseId)],
      });
      onSuccess();
    },
  });

  const handleSubmit = async () => {
    if (!previewUrl) {
      setFileError("Please select a media file.");
      return;
    }

    mutation.mutate({
      contentId: content.id,
      file: selectedFile,
      onProgress: (progress) => {
        setProgress(progress);
      },
    });
  };

  const hasFile = !!previewUrl;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drop zone / Preview */}
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
            <p className="font-medium">Drag and drop to upload media file</p>
            <p className="text-sm text-muted-foreground/60 font-medium">OR</p>
            <p className="text-sm font-medium text-primary">
              Click to select file
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg border overflow-hidden min-h-80">
          {detectedType === "image" && previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-56 min-h-40 object-contain bg-muted/30"
            />
          )}
          {detectedType === "video" && previewUrl && (
            <video
              src={previewUrl}
              className="w-full max-h-56 min-h-40 bg-black"
              controls
            />
          )}
          {detectedType === "audio" && previewUrl && (
            <div className="flex items-center justify-center p-8 min-h-40 bg-muted/30">
              <audio src={previewUrl} controls className="w-full" />
            </div>
          )}

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
          Failed to save media content. Please try again.
        </div>
      )}

      {(progress > 0 || mutation.isPending) && (
        <div className="mt-1">
          {progress === 100 ? (
            <div className="flex items-center justify-center">
              <CircleCheck size={20} className="text-green-600" />
            </div>
          ) : (
            <Progress value={progress} />
          )}
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
