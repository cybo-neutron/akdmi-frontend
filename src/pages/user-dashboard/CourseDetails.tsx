import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCourseById } from "@/services/course.service";
import { getContentsByCourse, type Content } from "@/services/content.service";
import {
  checkMyEnrollment,
  selfEnroll,
} from "@/services/enrollment.service";
import { CourseHero } from "@/components/course/CourseHero";
import {
  CourseCurriculum,
  type Chapter,
} from "@/components/course/CourseCurriculum";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  User,
  Clock,
  BarChart2,
  LayoutList,
  BookOpen,
  MoveRight,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { Resource } from "@/types/resource.types";
import { Action } from "@/types/permission.type";
import { ContentDialog } from "@/components/content/ContentDialog";
import { ContentTypeDialog } from "@/components/content/ContentTypeDialog";
import type { UserRoleType } from "@/types/auth.types";
import { MetaBadge } from "@/components/course/MetaBadge";
import { getCourseProgress } from "@/services/progress.service";
import { Progress } from "@/components/ui/progress";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function organizeContent(contents: Content[]): Chapter[] {
  const chapters: Chapter[] = [];

  contents.forEach((content) => {
    if (!content.parentId) {
      chapters.push({ ...content, topics: [] });
    }
  });

  contents.forEach((content) => {
    if (content.parentId) {
      const chapter = chapters.find((c) => c.id === content.parentId);
      if (chapter) chapter.topics.push(content);
    }
  });

  chapters.sort((a, b) => a.sequence - b.sequence);
  chapters.forEach((chapter) => {
    chapter.topics.sort((a, b) => a.sequence - b.sequence);
  });

  return chapters;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseDetailsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Skeleton className="h-10 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-sm" />
        <Skeleton className="h-6 w-24 rounded-sm" />
        <Skeleton className="h-6 w-24 rounded-sm" />
      </div>
      <Skeleton className="aspect-video w-full rounded-sm" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetails() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [parentChapterId, setParentChapterId] = useState<number | null>(null);

  // Type-specific dialog (Dialog 2)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeDialogContent, setTypeDialogContent] = useState<Content | null>(null);

  const handleAddTopic = (chapterId: number) => {
    setParentChapterId(chapterId);
    setTopicDialogOpen(true);
  };

  const handleTopicCreated = (newContent: Content) => {
    setTypeDialogContent(newContent);
    setTypeDialogOpen(true);
  };

  // ── Permission check ──
  const userDetails = useAuthStore((s) => s.userDetails);
  const hasPermission = usePermissionStore((s) => s.hasPermission);

  const canEdit =
    !!userDetails?.role &&
    hasPermission(
      userDetails.role as UserRoleType,
      Resource.COURSE,
      Action.update,
    );

  // ── Data queries ──
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });


  const { data: contentsData, isLoading: contentsLoading } = useQuery({
    queryKey: ["contents", courseId],
    queryFn: () => getContentsByCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment-check", courseId],
    queryFn: () => checkMyEnrollment(courseId!),
    enabled: !!courseId,
  });

  // Fetch progress
  const { data: progressData } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => getCourseProgress(courseId!),
    enabled: !!courseId,
  });

  const completedTopicIds = useMemo(() => {
    return new Set(
      progressData?.logs
        ?.filter((log) => log.completionStatus === "completed")
        ?.map((log) => log.contentId) || []
    );
  }, [progressData]);

  const contents: Content[] = useMemo(() => {
    return contentsData?.data ?? contentsData ?? [];
  }, [contentsData]);

  const chapters = useMemo(() => organizeContent(contents), [contents]);
  const totalLessons = useMemo(() => chapters.reduce((acc, ch) => acc + ch.topics.length, 0), [chapters]);
  const completedLessons = useMemo(() => {
    return chapters.reduce(
      (acc, ch) => acc + ch.topics.filter((t) => completedTopicIds.has(t.id)).length,
      0
    );
  }, [chapters, completedTopicIds]);
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // ── Enroll mutation ──
  const enrollMutation = useMutation({
    mutationFn: () => selfEnroll(courseId!),
    onSuccess: () => {
      toast.success("You're enrolled! Let's start learning.");
      // Invalidate so the button switches to "Continue Learning"
      queryClient.invalidateQueries({ queryKey: ["enrollment-check", courseId] });
      // Navigate to first topic
      const firstTopic = chapters[0]?.topics[0];
      if (firstTopic) {
        navigate(`/dashboard/courses/${courseId}/${firstTopic.id}`);
      }
    },
    onError: (error: any) => {
      // 409 = already enrolled — just navigate
      if (error?.response?.status === 409) {
        const firstTopic = chapters[0]?.topics[0];
        if (firstTopic) {
          navigate(`/dashboard/courses/${courseId}/${firstTopic.id}`);
        }
        return;
      }
      toast.error("Enrollment failed. Please try again.");
    },
  });

  if (courseLoading || contentsLoading) {
    return <CourseDetailsSkeleton />;
  }

  const course = courseData?.data ?? courseData;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Course not found</h2>
        <p className="text-muted-foreground text-sm mt-2">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => navigate("/dashboard/courses")}>
          Browse Courses
        </Button>
      </div>
    );
  }

  const isEnrolled = enrollmentData?.isEnrolled ?? false;
  const isEnrollmentKnown = !enrollmentLoading;

  const handleTopicSelect = (topic: Content) => {
    navigate(`/dashboard/courses/${courseId}/${topic.id}`);
  };

  const handleCTAClick = () => {
    if (isEnrolled) {
      // Already enrolled — jump straight to first topic
      const firstChapter = chapters[0];
      if (firstChapter) {
        navigate(`/dashboard/courses/${courseId}/${firstChapter.id}`);
      }
    } else {
      enrollMutation.mutate();
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 space-y-8">
      {/* ── Title & Meta badges ── */}
      <div className="space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-tight leading-tight">
          {course.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <MetaBadge icon={<User className="h-3.5 w-3.5" />} label={course.author ?? "Instructor"} />
          <MetaBadge
            icon={<Clock className="h-3.5 w-3.5" />}
            label={`${totalLessons} ${totalLessons === 1 ? "Lesson" : "Lessons"}`}
          />
          <MetaBadge
            icon={<BarChart2 className="h-3.5 w-3.5" />}
            label={course.level ?? "All Levels"}
          />
          {isEnrolled && (
            <MetaBadge
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
              label="Enrolled"
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isEnrolled && totalLessons > 0 && (
        <div className="bg-card border rounded-2xl p-5 shadow-xs transition-all duration-300 hover:shadow-md animate-in fade-in-50 slide-in-from-top-4 space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-widest text-[10px]">
                Course Progress
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-primary">
                  {progressPercentage}%
                </span>
                <span className="text-muted-foreground text-xs font-normal">
                  Completed
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full uppercase tracking-wider">
                {completedLessons} / {totalLessons} Lessons
              </span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2 rounded-full" />
        </div>
      )}

      {/* ── Hero ── */}
      <CourseHero
        introductionVideo={course.introductionVideo}
        coverArt={course.coverArt}
        title={course.title}
      />

      {/* ── Enroll / Continue CTA ── */}
      {totalLessons > 0 && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleCTAClick}
          disabled={enrollMutation.isPending || !isEnrollmentKnown}
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling…
            </>
          ) : isEnrolled ? (
            <>
              Continue Learning <MoveRight />
            </>
          ) : (
            <>
              ENROLL NOW <MoveRight />
            </>
          )}
        </Button>
      )}

      {/* ── Overview ── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest">
            Overview
          </h2>
          <Separator className="mt-1.5" />
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {course.description}
        </p>
      </section>

      {/* ── Curriculum ── */}
      <section className="space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            <h2 className="text-sm font-black uppercase tracking-widest">
              Curriculum
            </h2>
          </div>
          {canEdit && (
            <Button onClick={() => setChapterDialogOpen(true)}>
              <Plus /> Add chapter
            </Button>
          )}
        </div>
        <CourseCurriculum
          chapters={chapters}
          onSelectTopic={handleTopicSelect}
          onAddTopic={canEdit ? handleAddTopic : undefined}
          completedTopicIds={completedTopicIds}
        />
      </section>

      {/* Add Chapter Dialog */}
      <ContentDialog
        mode="create"
        courseId={Number(courseId)}
        isChapter={true}
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
      />

      {/* Add Topic Dialog (Step 1) */}
      <ContentDialog
        mode="create"
        courseId={Number(courseId)}
        parentId={parentChapterId}
        isChapter={false}
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        onContentCreated={handleTopicCreated}
      />

      {/* Add Topic Content Dialog (Step 2) */}
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
