import { axiosInterceptor } from "@/lib/axiosInterceptor";

export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: "admin" | "mentor" | "student";
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role?: "admin" | "mentor" | "student";
  avatarUrl?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getAllUsers(params: GetAllUsersParams = {}) {
  const { page = 1, limit = 10, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }

  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/users?${queryParams.toString()}`,
  });

  return data as PaginatedUsersResponse;
}

export async function getUserById(id: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/users/${id}`,
  });

  return data as User;
}

export async function createUser(userData: CreateUserData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/users/create`,
    data: userData,
  });

  return data as User;
}

export async function updateUser(userData: Partial<User> & { id: number }) {
  const { id, ...rest } = userData;
  const { data } = await axiosInterceptor.request({
    method: "patch",
    url: `/v1/users/${id}`,
    data: rest,
  });

  return data as User;
}

export async function deleteUser(id: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "delete",
    url: `/v1/users/${id}`,
  });

  return data;
}
