import { axiosInterceptor } from "@/lib/axiosInterceptor";

export async function createCourse(courseData: any) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/courses/create`,
    data: courseData,
  });

  return data;
}

export async function getAllCourses() {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/courses`,
  });

  return data;
}

export async function getCourseById(courseId: string) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/courses/${courseId}`,
  });

  return data;
}

export async function updateCourse(courseData: any) {
  const { data } = await axiosInterceptor.request({
    method: "patch",
    url: `/v1/courses/update`,
    data: courseData,
  });

  return data;
}

export async function deleteCourse(courseId: string) {
  const { data } = await axiosInterceptor.request({
    method: "delete",
    url: `/v1/courses/${courseId}`,
  });

  return data;
}

