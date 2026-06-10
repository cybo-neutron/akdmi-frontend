import { axiosInterceptor } from "@/lib/axiosInterceptor";

export interface BlogAuthor {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogWithAuthor {
  blog: Blog;
  author: BlogAuthor;
}

export interface PaginatedBlogsResponse {
  blogs: BlogWithAuthor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
}

export async function getAllBlogs(params: GetAllBlogsParams = {}) {
  const { page = 1, limit = 10, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }

  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/blogs?${queryParams.toString()}`,
  });

  return data as PaginatedBlogsResponse;
}

export async function getBlogById(id: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/blogs/${id}`,
  });

  return data as BlogWithAuthor;
}

export async function createBlog(blogData: CreateBlogData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/blogs/create`,
    data: blogData,
  });

  return data as Blog;
}

export async function updateBlog(
  blogData: Partial<CreateBlogData> & { id: number },
) {
  const { id, ...rest } = blogData;
  const { data } = await axiosInterceptor.request({
    method: "patch",
    url: `/v1/blogs/${id}`,
    data: rest,
  });

  return data as Blog;
}

export async function deleteBlog(id: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "delete",
    url: `/v1/blogs/${id}`,
  });

  return data;
}
