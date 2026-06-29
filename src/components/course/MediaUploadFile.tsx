import { useRef } from "react";
import { Field, FieldLabel } from "../ui/field";
import { capitalize } from "@/lib/capitalize";
import { Upload, X } from "lucide-react";

interface MediaUploadFieldProps {
    id: string;
    label: string;
    accept: string;
    icon: React.ReactNode;
    hint?: string;
    file: File | null;
    previewUrl: string | null;   // object URL of picked file
    existingUrl?: string | null; // URL already stored (edit mode)
    onFileChange: (file: File | null) => void;
}

export function MediaUploadField({
    id,
    label,
    accept,
    icon,
    hint,
    file,
    previewUrl,
    existingUrl,
    onFileChange,
}: MediaUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const hasContent = !!file || !!existingUrl;
    const displayName = file?.name ?? (existingUrl ? "Current file" : null);
    const isImage = accept.startsWith("image");

    return (
        <>
            <Field>
                <FieldLabel htmlFor={id}>{capitalize(label)}</FieldLabel>

                <div className="w-full min-w-0 overflow-hidden">
                    {/* Image preview */}
                    {isImage && (previewUrl || existingUrl) ? (
                        <div className="mb-2 rounded-md overflow-hidden border aspect-video bg-muted relative">
                            <img
                                src={previewUrl ?? existingUrl ?? ""}
                                alt="Cover art preview"
                                className="w-full h-full object-cover"
                            />
                            {/* Clear button */}
                            {hasContent && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onFileChange(null);
                                        if (inputRef.current) inputRef.current.value = "";
                                    }}
                                    className="absolute top-1 right-1 rounded-full bg-red-500/80 p-0.5 text-foreground hover:bg-red-500 transition-colors"
                                    aria-label={`Remove ${label}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ) :
                        < div
                            // type="button"
                            id={id}
                            onClick={() => inputRef.current?.click()}
                            className="w-full flex items-center gap-3 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                        >
                            <span className="shrink-0 text-muted-foreground">{icon}</span>
                            <span className="truncate flex-1 text-left">
                                {displayName ?? hint}
                            </span>
                            <Upload size={20} />
                        </div>


                    }



                    {/* Hidden file input */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={(e) => {
                            const picked = e.target.files?.[0] ?? null;
                            onFileChange(picked);
                        }}
                    />
                </div>

                {!!hint && (
                    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                )}

            </Field >

        </>

    );
}
