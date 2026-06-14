import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCourseById } from "@/services/course.service";
import { getContentsByCoursePublic, type Content } from "@/services/content.service";
import { checkMyEnrollment, selfEnroll } from "@/services/enrollment.service";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseCurriculum, type Chapter } from "@/components/course/CourseCurriculum";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Clock, BarChart2, LayoutList, BookOpen, MoveRight, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { MetaBadge } from "@/components/course/MetaBadge";

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

function PublicCourseViewSkeleton() {
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

export default function PublicCourseView() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isUserLoggedIn } = useAuthStore();

  // ── Data queries ──
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: contentsData, isLoading: contentsLoading } = useQuery({
    queryKey: ["contents-public", courseId],
    queryFn: () => getContentsByCoursePublic(courseId!),
    enabled: !!courseId,
  });

  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment-check", courseId],
    queryFn: () => checkMyEnrollment(courseId!),
    enabled: !!courseId && isUserLoggedIn,
  });

  // ── Enroll mutation ──
  const enrollMutation = useMutation({
    mutationFn: () => selfEnroll(courseId!),
    onSuccess: () => {
      toast.success("You're enrolled! Let's start learning.");
      queryClient.invalidateQueries({ queryKey: ["enrollment-check", courseId] });
      const firstTopic = chapters[0]?.topics[0];
      if (firstTopic) {
        navigate(`/dashboard/courses/${courseId}/${firstTopic.id}`);
      } else {
        navigate(`/dashboard/courses/${courseId}`);
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 409) {
        const firstTopic = chapters[0]?.topics[0];
        if (firstTopic) {
          navigate(`/dashboard/courses/${courseId}/${firstTopic.id}`);
        }
        return;
      }
      toast.error("Enrollment failed. Please try again.");
    },
  });

  const course = courseData?.data ?? courseData;
  const contents: Content[] = contentsData?.data ?? contentsData ?? [];
  const chapters = organizeContent(contents);
  const totalLessons = chapters.reduce((acc, ch) => acc + ch.topics.length, 0);

  if (courseLoading || contentsLoading || (isUserLoggedIn && enrollmentLoading)) {
    return <PublicCourseViewSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Course not found</h2>
        <p className="text-muted-foreground text-sm mt-2">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => navigate("/courses")}>
          Browse Courses
        </Button>
      </div>
    );
  }

  const isEnrolled = enrollmentData?.isEnrolled ?? false;

  const handleTopicSelect = (topic: Content) => {
    if (isUserLoggedIn) {
      navigate(`/dashboard/courses/${courseId}/${topic.id}`);
    } else {
      navigate("/login");
    }
  };

  const handleCTAClick = () => {
    if (!isUserLoggedIn) {
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      const firstChapter = chapters[0];
      if (firstChapter) {
        navigate(`/dashboard/courses/${courseId}/${firstChapter.id}`);
      } else {
        navigate(`/dashboard/courses/${courseId}`);
      }
    } else {
      enrollMutation.mutate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
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
        </div>
      </div>

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
          className="w-full h-12 text-md font-bold animate-in fade-in duration-300"
          onClick={handleCTAClick}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling…
            </>
          ) : !isUserLoggedIn ? (
            <>
              ENROLL IN COURSE <MoveRight className="ml-2 h-4 w-4" />
            </>
          ) : isEnrolled ? (
            <>
              CONTINUE LEARNING <MoveRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              ENROLL NOW <MoveRight className="ml-2 h-4 w-4" />
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
        <div className="flex items-center gap-2">
          <LayoutList className="h-4 w-4" />
          <h2 className="text-sm font-black uppercase tracking-widest">
            Curriculum
          </h2>
        </div>
        <CourseCurriculum
          chapters={chapters}
          onSelectTopic={handleTopicSelect}
        />
      </section>
    </div>
  );
}
