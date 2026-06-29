import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  FileIcon,
  GripVertical,
  Plus,
  CheckCircle2,
  ImagePlay,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Content } from "@/services/content.service";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { Resource } from "@/types/resource.types";
import { Action } from "@/types/permission.type";
import { reorderContents } from "@/services/content.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Chapter extends Content {
  topics: Content[];
}

interface CourseCurriculumProps {
  chapters: Chapter[];
  onSelectTopic?: (topic: Content) => void;
  /** Called with the new chapter order after a chapter drag-and-drop reorder. */
  onReorderChapters?: (newOrder: Chapter[]) => void;
  /** Called with the chapter id and the new topic order after a topic reorder. */
  onReorderTopics?: (chapterId: number, newTopics: Content[]) => void;
  /** Called when the user clicks 'Add topic' inside a chapter row. */
  onAddTopic?: (chapterId: number) => void;
  completedTopicIds?: Set<number>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TopicIcon({ type }: { type: string }) {
  switch (type) {
    case "media":
      return <ImagePlay className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
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
    default:
      return "Read";
  }
}

// ─── Sortable topic row ───────────────────────────────────────────────────────

interface SortableTopicRowProps {
  topic: Content;
  canEdit: boolean;
  onSelect?: (topic: Content) => void;
  isCompleted?: boolean;
}

function SortableTopicRow({ topic, canEdit, onSelect, isCompleted }: SortableTopicRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center w-full",
        isDragging && "opacity-50 bg-muted/20 z-10",
      )}
    >
      {/* Topic drag handle — only rendered for editors */}
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="pl-4 py-2.5 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0 touch-none"
          aria-label="Drag to reorder topic"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Topic button */}
      <button
        onClick={() => onSelect?.(topic)}
        className={cn(
          "flex-1 flex items-center justify-between py-2.5 hover:bg-muted/30 transition-colors text-left min-w-0",
          canEdit ? "px-3" : "px-6",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <TopicIcon type={topic.type} />
          )}
          <span className="text-sm truncate">{topic.title}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 ml-3">
          {topicTypeLabel(topic.type)}
        </span>
      </button>
    </div>
  );
}

// ─── Sortable chapter row ─────────────────────────────────────────────────────

interface SortableChapterRowProps {
  chapter: Chapter;
  index: number;
  isExpanded: boolean;
  canEdit: boolean;
  onToggle: () => void;
  onSelectTopic?: (topic: Content) => void;
  onReorderTopics?: (newTopics: Content[]) => void;
  onAddTopic?: (chapterId: number) => void;
  completedTopicIds?: Set<number>;
}

function SortableChapterRow({
  chapter,
  index,
  isExpanded,
  canEdit,
  onToggle,
  onSelectTopic,
  onReorderTopics,
  onAddTopic,
  completedTopicIds,
}: SortableChapterRowProps) {
  // ── Chapter sortable (outer DndContext) ──
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // ── Local topic order state (optimistic) ──
  const [localTopics, setLocalTopics] = useState<Content[]>(chapter.topics);

  const [prevTopicsProp, setPrevTopicsProp] = useState(chapter.topics);
  if (chapter.topics !== prevTopicsProp) {
    setPrevTopicsProp(chapter.topics);
    setLocalTopics(chapter.topics);
  }

  // ── Inner DnD sensors for topics ──
  const topicSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleTopicDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLocalTopics((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        onReorderTopics?.(reordered);
        return reordered;
      });
    },
    [onReorderTopics],
  );

  // ── Derived ──
  const chapterNum = String(index + 1).padStart(2, "0");
  const lessonCount = chapter.topics.length;
  const topicIds = localTopics.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-md overflow-hidden",
        isDragging && "opacity-50 ring-2 ring-primary/40 z-10",
      )}
    >
      {/* Chapter header */}
      <div className="flex items-center bg-muted/40 hover:bg-muted/70 transition-colors">
        {/* Chapter drag handle */}
        {canEdit && (
          <div
            {...attributes}
            {...listeners}
            className="pl-3 py-3.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
            aria-label="Drag to reorder chapter"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Accordion toggle */}
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-4 py-3.5 text-left min-w-0"
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
      </div>

      {/* Topics list */}
      {isExpanded && (
        <div className="divide-y border-t">
          {localTopics.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">
              No topics added yet.
            </p>
          ) : canEdit ? (
            /* ── Sortable topics (editors only) ── */
            <DndContext
              sensors={topicSensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleTopicDragEnd}
            >
              <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
                {localTopics.map((topic) => (
                  <SortableTopicRow
                    key={topic.id}
                    topic={topic}
                    canEdit={canEdit}
                    onSelect={onSelectTopic}
                    isCompleted={completedTopicIds?.has(topic.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            /* ── Read-only topic list ── */
            localTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic?.(topic)}
                className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {completedTopicIds?.has(topic.id) ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <TopicIcon type={topic.type} />
                  )}
                  <span className="text-sm truncate">{topic.title}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">
                  {topicTypeLabel(topic.type)}
                </span>
              </button>
            ))
          )}
          {/* Add topic button (editors only) */}
          {canEdit && onAddTopic && (
            <button
              onClick={() => onAddTopic(chapter.id)}
              className="w-full flex items-center gap-2 px-6 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t"
            >
              <Plus className="h-3.5 w-3.5" />
              Add topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CourseCurriculum({
  chapters: initialChapters,
  onSelectTopic,
  onReorderChapters,
  onReorderTopics,
  onAddTopic,
  completedTopicIds,
}: CourseCurriculumProps) {
  // ── Permission check ──
  const userDetails = useAuthStore((s) => s.userDetails);
  const hasPermission = usePermissionStore((s) => s.hasPermission);

  const canEdit =
    !!userDetails?.role &&
    hasPermission(
      userDetails.role as Parameters<typeof hasPermission>[0],
      Resource.COURSE,
      Action.update,
    );

  // ── Local chapter order state (optimistic) ──
  const [localChapters, setLocalChapters] = useState<Chapter[]>(initialChapters);

  const [prevProp, setPrevProp] = useState(initialChapters);
  if (initialChapters !== prevProp) {
    setPrevProp(initialChapters);
    setLocalChapters(initialChapters);
  }

  // ── Expanded state ──
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(localChapters.length > 0 ? [localChapters[0].id] : []),
  );

  const toggleChapter = useCallback((chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }, []);

  // ── Sequence reorder mutation ──
  const reorderMutation = useMutation({
    mutationFn: reorderContents,
    onSuccess: () => {
      toast.success("Order saved");
    },
    onError: () => {
      toast.error("Failed to save order. Please try again.");
    },
  });

  // ── Chapter DnD sensors ──
  const chapterSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleChapterDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLocalChapters((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id);
        const newIndex = prev.findIndex((c) => c.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        onReorderChapters?.(reordered);

        // Persist new sequence numbers — chapters only (parentId is null)
        reorderMutation.mutate(
          reordered.map((c, i) => ({ id: c.id, sequence: i + 1 }))
        );

        return reordered;
      });
    },
    [onReorderChapters, reorderMutation],
  );

  // ── Topic reorder bubbled up from each chapter row ──
  const handleTopicReorder = useCallback(
    (chapterId: number, newTopics: Content[]) => {
      setLocalChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, topics: newTopics } : c,
        ),
      );
      onReorderTopics?.(chapterId, newTopics);

      // Persist new sequence numbers — topics of this chapter only
      reorderMutation.mutate(
        newTopics.map((t, i) => ({ id: t.id, sequence: i + 1 }))
      );
    },
    [onReorderTopics, reorderMutation],
  );

  // ── Empty state ──
  if (localChapters.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground text-sm">
        No curriculum available yet.
      </p>
    );
  }

  // ── Render ──
  const chapterIds = localChapters.map((c) => c.id);

  const list = (
    <SortableContext items={chapterIds} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">
        {localChapters.map((chapter, index) => (
          <SortableChapterRow
            key={chapter.id}
            chapter={chapter}
            index={index}
            isExpanded={expandedChapters.has(chapter.id)}
            canEdit={canEdit}
            onToggle={() => toggleChapter(chapter.id)}
            onSelectTopic={onSelectTopic}
            onReorderTopics={(newTopics) =>
              handleTopicReorder(chapter.id, newTopics)
            }
            onAddTopic={onAddTopic}
            completedTopicIds={completedTopicIds}
          />
        ))}
      </div>
    </SortableContext>
  );

  if (!canEdit) {
    return list;
  }

  return (
    <DndContext
      sensors={chapterSensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleChapterDragEnd}
    >
      {list}
    </DndContext>
  );
}
