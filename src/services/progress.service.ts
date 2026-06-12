import { axiosInterceptor } from "@/lib/axiosInterceptor";

export interface UserContentLog {
  id: number;
  userId: number;
  contentId: number;
  completionStatus: "not_started" | "in_progress" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressSummary {
  completed: number;
  inProgress: number;
}

export interface CourseProgressResponse {
  logs: UserContentLog[];
  summary: ProgressSummary;
}

export async function upsertProgress(contentId: number, completionStatus: "not_started" | "in_progress" | "completed") {
  const response = await axiosInterceptor({
    method: "POST",
    url: "/v1/progress/upsert",
    data: { contentId, completionStatus },
  });
  return response.data;
}

export async function getCourseProgress(courseId: string) {
  const response = await axiosInterceptor({
    method: "GET",
    url: `/v1/progress/course/${courseId}`,
  });
  return response.data as CourseProgressResponse;
}

export async function getContentProgress(contentId: number) {
  const response = await axiosInterceptor({
    method: "GET",
    url: `/v1/progress/content/${contentId}`,
  });
  return response.data as UserContentLog;
}
