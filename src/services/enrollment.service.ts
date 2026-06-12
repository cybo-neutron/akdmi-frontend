import { axiosInterceptor } from "@/lib/axiosInterceptor";

export interface EnrolledUser {
  enrollment: {
    id: number;
    userId: number;
    courseId: number;
    enrolledAt: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedEnrollmentsResponse {
  enrollments: EnrolledUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnrollUserData {
  userId: number;
  courseId: number;
}

export async function getEnrolledUsers(
  courseId: number,
  params: { page?: number; limit?: number } = {},
) {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());

  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/enrollments/course/${courseId}?${queryParams.toString()}`,
  });

  return data as PaginatedEnrollmentsResponse;
}

export async function enrollUser(enrollData: EnrollUserData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/enrollments/enroll`,
    data: enrollData,
  });

  return data;
}

export async function unenrollUser(enrollData: EnrollUserData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/enrollments/unenroll`,
    data: enrollData,
  });

  return data;
}

export interface MyEnrollment {
  enrollment: {
    id: number;
    userId: number;
    courseId: number;
    enrolledAt: string;
    createdAt: string;
    updatedAt: string;
  };
  course: {
    id: number;
    title: string;
    description: string;
    isActive: boolean;
    createdBy: number;
    lastUpdatedBy: number;
    createdAt: string;
    updatedAt: string;
  };
}

export async function getMyEnrollments() {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/enrollments/my`,
  });

  return data as MyEnrollment[];
}

export interface EnrollmentStatus {
  isEnrolled: boolean;
  enrollment: MyEnrollment["enrollment"] | null;
}

/** Check whether the current user is enrolled in a given course. */
export async function checkMyEnrollment(
  courseId: number | string,
): Promise<EnrollmentStatus> {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/enrollments/check/${courseId}`,
  });
  return data as EnrollmentStatus;
}

/** Self-enroll the current user; userId is read from the JWT on the server. */
export async function selfEnroll(courseId: number | string) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/enrollments/self-enroll`,
    data: { courseId: Number(courseId) },
  });
  return data;
}
