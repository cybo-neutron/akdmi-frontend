import { useQuery } from "@tanstack/react-query";
import {
  getContentById,
  type ContentTextData,
  type ContentMediaData,
  type ContentDocumentData,
} from "@/services/content.service";
import { Image, FileIcon, Music, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { VideoJSComponent } from "../Videojs";

interface ContentViewerProps {
  contentId: number | null;
}

export function ContentViewer({ contentId }: ContentViewerProps) {
  const {
    data: contentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => getContentById(contentId!),
    enabled: !!contentId,
  });

  const content = contentData?.data || contentData;

  if (!contentId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground border border-dashed rounded-2xl min-h-[500px] bg-muted/5">
        <div className="text-center animate-in fade-in zoom-in duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <FileText className="h-16 w-16 mx-auto relative text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Topic Selected</h3>
          <p className="max-w-xs mx-auto text-muted-foreground">
            Select a topic from the sidebar to view its content and start
            learning.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-[450px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-destructive border-2 border-destructive/20 border-dashed rounded-2xl bg-destructive/5">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <FileIcon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to Load Content</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          We encountered an issue while fetching the content details. This might
          be due to a connection problem or an invalid ID.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-destructive/20 hover:bg-destructive/10"
        >
          Try Refreshing
        </Button>
      </div>
    );
  }

  const renderTextContent = () => {
    const textData = content.typeData as ContentTextData | undefined;
    return (
      <div className="prose dark:prose-invert max-w-none">
        {content.description && (
          <div className="flex border-0 border-l-4 border-primary/20 p-2 mb-4">
            <div
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />

          </div>
        )}

        {textData?.content ? (
          <div
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: textData.content }}
          />
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
            <FileText className="h-5 w-5 opacity-50" />
            No detailed text content has been added to this topic yet.
          </div>
        )}
      </div>
    );
  };

  const renderMediaContent = () => {
    const mediaData = content.typeData as ContentMediaData | undefined;

    if (!mediaData?.url) {
      return (
        <div className="">
          {content.description && (
            <div
              className="text-muted-foreground leading-relaxed italic"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />
          )}
          <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-2xl border-2 border-dashed">
            <div className="h-20 w-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <Image className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <span className="text-muted-foreground font-medium text-lg">
              Media resource pending
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {content.description && (
          <div
            className="text-md text-muted-foreground italic"
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
        )}
        <div className="group relative overflow-hidden   ">
          {mediaData.type === "video" && (
            <div className="w-full aspect-video max-h-[600px]">
              <VideoJSComponent
                options={{
                  autoplay: true,
                  controls: true,
                  responsive: true,
                  sources: [
                    { src: mediaData.url, type: "application/x-mpegURL" },
                  ],
                }}
              />
            </div>
          )}
          {mediaData.type === "audio" && (
            <div className="py-12 bg-linear-to-br from-primary/10 via-background to-primary/5">
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <Music className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-2xl tracking-tight">
                    {content.title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary uppercase tracking-widest">
                    <span className="h-px w-4 bg-primary/30" />
                    Audio Experience
                    <span className="h-px w-4 bg-primary/30" />
                  </div>
                </div>
                <audio
                  src={mediaData.url}
                  controls
                  className="w-full max-w-lg drop-shadow-lg"
                />
              </div>
            </div>
          )}
          {mediaData.type === "image" && (
            <div className=" py-2">
              <img
                src={mediaData.url}
                alt={content.title}
                className="w-full h-auto max-h-[800px] object-contain "
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDocumentContent = () => {
    const docData = content.typeData as ContentDocumentData | undefined;

    if (!docData?.url) {
      return (
        <div className="space-y-8">
          {content.description && (
            <div
              className="text-xl text-muted-foreground leading-relaxed italic"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />
          )}
          <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-2xl">
            <div className="h-20 w-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <FileIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <span className="text-muted-foreground font-medium text-lg">
              Document resource pending
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {content.description && (
          <div
            className="text-xl text-muted-foreground leading-relaxed italic"
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
        )}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full w-fit text-sm text-primary font-bold uppercase tracking-wider">
          <FileIcon className="h-4 w-4" />
          <span>{docData.type} Document</span>
        </div>
        <div className="rounded-2xl overflow-hidden bg-background">
          <iframe
            src={docData.url}
            className="w-full h-[750px] bg-muted/5"
            title={content.title}
          />
        </div>
        <div className="flex justify-center sm:justify-end gap-4">
          <Button
            variant="secondary"
            size="lg"
            asChild
            className="rounded-full px-8 shadow-sm"
          >
            <a href={docData.url} target="_blank" rel="noopener noreferrer">
              View External
            </a>
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (content.type) {
      case "text":
        return renderTextContent();
      case "media":
        return renderMediaContent();
      case "document":
        return renderDocumentContent();
      default:
        return (
          <div className="py-2 bg-muted/10 rounded-2xl text-center">
            <p className="text-xl opacity-80 italic">
              {content.description ||
                "No preview available for this content type."}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-4 py-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="">
        {/* <div className="flex items-center gap-3 mb-2">
          <div className="h-1.5 w-12 bg-primary rounded-full" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {content.type} Content
          </span>
        </div> */}
        <h2 className="text-3xl font-semibold text-foreground">
          {content.title}
        </h2>
      </div>

      <div className=" ">{renderContent()}</div>
    </div>
  );
}
