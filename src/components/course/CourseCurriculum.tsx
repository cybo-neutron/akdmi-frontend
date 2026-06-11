import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Video, FileIcon } from "lucide-react";
import type { Content } from "@/services/content.service";

export interface Chapter extends Content {
  topics: Content[];
}

interface CourseCurriculumProps {
  chapters: Chapter[];
  onSelectTopic?: (topic: Content) => void;
}

function TopicIcon({ type }: { type: string }) {
  switch (type) {
    case "media":
      return <Video className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
    case "document":
      return <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
    default:
      return <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
  }
}

function topicTypeLabel(type: string): string {
  switch (type) {
    case "media":
      return "Watch";
    case "document":
      return "Read";
    default:
      return "Read";
  }
}

export function CourseCurriculum({
  chapters,
  onSelectTopic,
}: CourseCurriculumProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(chapters.length > 0 ? [chapters[0].id] : []),
  );

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

  if (chapters.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground text-sm">
        No curriculum available yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const chapterNum = String(index + 1).padStart(2, "0");
        const lessonCount = chapter.topics.length;

        return (
          <div
            key={chapter.id}
            className="border rounded-md overflow-hidden"
          >
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  {chapterNum}
                </span>
                <span className="font-semibold text-sm uppercase tracking-wide truncate">
                  {chapter.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Topics list */}
            {isExpanded && (
              <div className="divide-y border-t">
                {chapter.topics.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">
                    No topics added yet.
                  </p>
                ) : (
                  chapter.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic?.(topic)}
                      className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <TopicIcon type={topic.type} />
                        <span className="text-sm truncate">{topic.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-3">
                        {topicTypeLabel(topic.type)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
