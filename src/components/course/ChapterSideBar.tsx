import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, FileIcon, FileText, Video, X, CheckCircle2, ImagePlay } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { type Content, type Chapter } from "@/services/content.service";

function getContentIcon(type: string) {
  switch (type) {
    case "text":
      return <FileText className="h-4 w-4" />;
    case "media":
      return <ImagePlay  className="h-4 w-4" />;
    case "document":
      return <FileIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

// Chapter List Sidebar Component
export function ChapterSidebar({
  chapters,
  currentContentId,
  onSelectContent,
  isOpen,
  onClose,
  completedTopicIds,
}: {
  chapters: Chapter[];
  currentContentId: number | null;
  onSelectContent: (content: Content) => void;
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds?: Set<number>;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(chapters.map((c) => c.id)),
  );

  const allTopics = chapters.flatMap((chapter) => chapter.topics);
  const totalTopicsCount = allTopics.length;
  const completedTopicsCount = allTopics.filter((t) => completedTopicIds?.has(t.id)).length;
  const progressPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background border-l z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Chapter List</h3>
        <div className="flex items-center gap-2">
          {/* {onAddChapter && (
            <Button size="sm" onClick={onAddChapter}>
              <Plus className="h-4 w-4 mr-1" />
              Add Chapter
            </Button>
          )} */}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {completedTopicIds && totalTopicsCount > 0 && (
        <div className="px-4 py-3 border-b bg-muted/20 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Course Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 rounded-full" />
        </div>
      )}
      <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-2">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium text-sm">{chapter.title}</span>
              {expandedChapters.has(chapter.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedChapters.has(chapter.id) && (
              <div className="border-t">
                {chapter.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onSelectContent(topic)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-left",
                      currentContentId === topic.id &&
                      "bg-primary/10 text-primary",
                    )}
                  >
                    {completedTopicIds?.has(topic.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      getContentIcon(topic.type)
                    )}
                    <span className="truncate">- {topic.title}</span>
                  </button>
                ))}
                {/* {onAddTopic && (
                  <button
                    onClick={() => onAddTopic(chapter.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t"
                  >
                    <Plus className="h-3 w-3" />
                    Add topic
                  </button>
                )} */}
              </div>
            )}
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No chapters yet</p>
            <p className="text-sm">Click "Add Chapter" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}