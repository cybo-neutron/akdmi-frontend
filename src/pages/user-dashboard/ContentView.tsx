import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseById } from "@/services/course.service";
import {
  getContentsByCourse,
  deleteContent,
  type Content,
  type Chapter
} from "@/services/content.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  FileIcon,
  Video,
  X,
  MoveRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentDialog } from "@/components/content/ContentDialog";
import { ContentTypeDialog } from "@/components/content/ContentTypeDialog";
import { cn } from "@/lib/utils";
import { ContentViewer } from "@/components/content/ContentViewer";
import { Separator } from "@/components/ui/separator";
import { ChapterSidebar } from "@/components/course/ChapterSideBar";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { getCourseProgress, upsertProgress } from "@/services/progress.service";
import { Resource } from "@/types/resource.types";
import { Action } from "@/types/permission.type";


function organizeContent(contents: Content[]): Chapter[] {
  const chapters: Chapter[] = [];
  const contentMap = new Map<number, Content>();

  // First pass: create map and identify chapters
  contents.forEach((content) => {
    contentMap.set(content.id, content);
    if (!content.parentId) {
      chapters.push({ ...content, topics: [] });
    }
  });

  // Second pass: assign topics to chapters
  contents.forEach((content) => {
    if (content.parentId) {
      const chapter = chapters.find((c) => c.id === content.parentId);
      if (chapter) {
        chapter.topics.push(content);
      }
    }
  });

  // Sort chapters and topics by sequence
  chapters.sort((a, b) => a.sequence - b.sequence);
  chapters.forEach((chapter) => {
    chapter.topics.sort((a, b) => a.sequence - b.sequence);
  });

  return chapters;
}

function getContentIcon(type: string) {
  switch (type) {
    case "text":
      return <FileText className="h-4 w-4" />;
    case "media":
      return <Video className="h-4 w-4" />;
    case "document":
      return <FileIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}


// ─── Chapter Overview ─────────────────────────────────────────────────────────

function ChapterOverview({
  chapter,
  topics,
  onSelectTopic,
  completedTopicIds,
}: {
  chapter: Content;
  topics: Content[];
  onSelectTopic: (topic: Content) => void;
  completedTopicIds?: Set<number>;
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Chapter label + title */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Chapter
        </p>
        <h1 className="text-3xl font-bold leading-tight">{chapter.title}</h1>
      </div>

      {/* Description */}
      {chapter.description && (
        <p className="text-muted-foreground leading-relaxed text-sm">
          {chapter.description}
        </p>
      )}

      <Separator />

      {/* Topics list */}
      {topics.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {topics.length} {topics.length === 1 ? "Lesson" : "Lessons"}
          </p>

          <div className="rounded-md border divide-y overflow-hidden">
            {topics.map((topic, idx) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
              >
                <span className="text-xs text-muted-foreground font-mono shrink-0 w-5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {completedTopicIds?.has(topic.id) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    getContentIcon(topic.type)
                  )}
                </span>
                <span className="flex-1 text-sm font-medium truncate">
                  {topic.title}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full mt-2"
            onClick={() => onSelectTopic(topics[0])}
          >
            Start Chapter
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No lessons in this chapter yet.
        </p>
      )}
    </div>
  );
}

export default function ContentView() {
  const { id: courseId, contentId } = useParams<{ id: string; contentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Remove stale comment
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);

  // Dialog states
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [parentChapterId, setParentChapterId] = useState<number | null>(null);

  // Type-specific dialog (Dialog 2)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeDialogContent, setTypeDialogContent] = useState<Content | null>(
    null,
  );

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  // Fetch contents
  const { data: contentsData, isLoading: contentsLoading } = useQuery({
    queryKey: ["contents", courseId],
    queryFn: () => getContentsByCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch progress
  const { data: progressData } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => getCourseProgress(courseId!),
    enabled: !!courseId,
  });

  console.log(progressData)

  const completedTopicIds = useMemo(() => {
    return new Set(
      progressData?.logs
        ?.filter((log) => log.completionStatus === "completed")
        ?.map((log) => log.contentId) || []
    );
  }, [progressData]);

  const contents: Content[] = contentsData?.data || contentsData || [];
  const chapters = organizeContent(contents);

  // Find current content
  const currentContent = contentId
    ? contents.find((c) => c.id === Number(contentId)) || null
    : null;

  // Find current chapter (for displaying chapter title)
  const currentChapter = currentContent?.parentId
    ? chapters.find((c) => c.id === currentContent.parentId)
    : chapters.find((c) => c.id === currentContent?.id);

  // Get all topics in order for navigation
  const allTopics = chapters.flatMap((chapter) => chapter.topics);
  const currentTopicIndex = allTopics.findIndex(
    (t) => t.id === Number(contentId),
  );

  const isLastTopic = currentTopicIndex === allTopics.length - 1;
  const buttonText = isLastTopic ? "Finish Course" : "Mark Complete & Continue";

  const isCurrentTopicCompleted = currentContent ? completedTopicIds.has(currentContent.id) : false;

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ contentId, status }: { contentId: number; status: "completed" | "in_progress" }) =>
      upsertProgress(contentId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
      if (variables.status === "completed") {
        if (isLastTopic) {
          toast.success("Congratulations! You have finished the course!");
          navigate(`/dashboard/courses/${courseId}`);
        } else {
          const nextTopic = allTopics[currentTopicIndex + 1];
          navigate(`/dashboard/courses/${courseId}/${nextTopic.id}`);
        }
      } else {
        toast.success("Marked as incomplete.");
      }
    },
    onError: () => {
      toast.error("Failed to update completion status.");
    },
  });

  const handleToggleComplete = () => {
    if (!currentContent) return;
    toggleCompleteMutation.mutate({
      contentId: currentContent.id,
      status: isCurrentTopicCompleted ? "in_progress" : "completed",
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents", courseId] });
      setDeleteDialogOpen(false);
      setContentToDelete(null);
      // Clear content selection if deleted content was selected
      // if (contentId && contentToDelete?.id === Number(contentId)) {
      //   setSearchParams({});
      // }
    },
  });

  const handleSelectContent = (content: Content) => {
    navigate(`/dashboard/courses/${courseId}/${content.id}`);
  };

  const handlePrevTopic = () => {
    if (currentTopicIndex > 0) {
      const prevTopic = allTopics[currentTopicIndex - 1];
      navigate(`/dashboard/courses/${courseId}/${prevTopic.id}`);
    }
  };

  const handleNextTopic = () => {
    if (currentTopicIndex < allTopics.length - 1) {
      const nextTopic = allTopics[currentTopicIndex + 1];
      navigate(`/dashboard/courses/${courseId}/${nextTopic.id}`);
    }
  };

  const handleAddChapter = () => {
    setParentChapterId(null);
    setChapterDialogOpen(true);
  };

  const handleAddTopic = (chapterId: number) => {
    setParentChapterId(chapterId);
    setTopicDialogOpen(true);
  };

  const handleChapterCreated = (newChapter: Content) => {
    navigate(`/dashboard/courses/${courseId}/${newChapter.id}`);
  };

  const handleEditContent = () => {
    if (currentContent) {
      setEditDialogOpen(true);
    }
  };

  const handleEditTypeData = () => {
    if (currentContent) {
      setTypeDialogContent(currentContent);
      setTypeDialogOpen(true);
    }
  };

  // Called after Dialog 1 creates a new topic — opens Dialog 2 for type-specific data
  const handleContentCreated = (newContent: Content) => {
    setTypeDialogContent(newContent);
    setTypeDialogOpen(true);
  };

  const handleDeleteContent = () => {
    if (currentContent) {
      setContentToDelete(currentContent);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (contentToDelete) {
      deleteMutation.mutate(contentToDelete.id);
    }
  };

  // Loading state
  if (courseLoading || contentsLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col transition-[padding-right] duration-300 ease-in-out", sidebarOpen && "pr-80")}>
      {/* Header */}
      <div className="">
        <div className="flex items-start justify-between">

          <div className="border p-1 bg-primary/20">
            {currentChapter && (
              <h2 className="text-sm font-semibold">{currentChapter.title}</h2>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentContent && currentContent.parentId === null ? (
          /* Chapter selected — show overview with topic list */
          <ChapterOverview
            chapter={currentContent}
            topics={
              chapters.find((c) => c.id === currentContent.id)?.topics ?? []
            }
            onSelectTopic={(topic) =>
              navigate(`/dashboard/courses/${courseId}/${topic.id}`)
            }
            completedTopicIds={completedTopicIds}
          />
        ) : (
          /* Topic selected — show full content viewer */
          <ContentViewer contentId={contentId ? Number(contentId) : null} />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevTopic}
            disabled={currentTopicIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextTopic}
            disabled={
              currentTopicIndex >= allTopics.length - 1 ||
              currentTopicIndex === -1
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {currentContent && currentContent.parentId !== null && (
            <Button
              variant={isCurrentTopicCompleted ? "outline" : "default"}
              onClick={handleToggleComplete}
              disabled={toggleCompleteMutation.isPending}
            >
              {toggleCompleteMutation.isPending ? "Saving..." : (
                isCurrentTopicCompleted ? (
                  "Mark Incomplete"
                ) : (
                  <>
                    {buttonText} <MoveRight className="ml-2 h-4 w-4" />
                  </>
                )
              )}
            </Button>
          )}


          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleEditContent}
              disabled={!currentContent}
              title="Edit details"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canEdit && currentContent && currentContent.parentId && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleEditTypeData}
              title="Edit content data"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDeleteContent}
              disabled={!currentContent}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chapter Sidebar */}
      <ChapterSidebar
        chapters={chapters}
        currentContentId={contentId ? Number(contentId) : null}
        onSelectContent={handleSelectContent}
        onAddChapter={canEdit ? handleAddChapter : undefined}
        onAddTopic={canEdit ? handleAddTopic : undefined}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        completedTopicIds={completedTopicIds}
      />

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Chapter Dialog */}
      <ContentDialog
        mode="create"
        courseId={Number(courseId)}
        isChapter={true}
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        onContentCreated={handleChapterCreated}
      />

      {/* Add Topic Dialog (Step 1) */}
      <ContentDialog
        mode="create"
        courseId={Number(courseId)}
        parentId={parentChapterId}
        isChapter={false}
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        onContentCreated={handleContentCreated}
      />

      {/* Edit Content Dialog */}
      {currentContent && (
        <ContentDialog
          mode="edit"
          courseId={Number(courseId)}
          content={currentContent}
          isChapter={!currentContent.parentId}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contentToDelete?.title}"?
              {!contentToDelete?.parentId &&
                " This will also delete all topics in this chapter."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Type-Specific Content Dialog (Step 2) */}
      {typeDialogContent && (
        <ContentTypeDialog
          content={typeDialogContent}
          courseId={Number(courseId)}
          open={typeDialogOpen}
          onOpenChange={setTypeDialogOpen}
        />
      )}
    </div>
  );
}
