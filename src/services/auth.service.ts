import type {
  RegisterUserType,
  LoginUserType,
} from "@/types/auth.types";
import { axiosInterceptor } from "@/lib/axiosInterceptor";

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
}: RegisterUserType) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/auth/register`,
    data: {
      firstName,
      lastName,
      email,
      password,
    },
  });

  return data;
}

export async function loginUser({ email, password }: LoginUserType) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/auth/login`,
    data: {
      email,
      password,
    },
  });

  return data;
}

export function setAccessTokenLocalStorage(token: string) {
  localStorage.setItem("accessToken", token);
}

export function logOutUser() {
  localStorage.removeItem("accessToken");
}

export async function verifyAccessToken() {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/auth/me`,
  });

  return data;
}

export function getLocalStorageAccessToken() {
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken;
  }
  return null;
}

export function removeLocalStorageAccessToken() {
  localStorage.removeItem("accessToken");
}

export async function getAllPermissions() {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/auth/permissions`,
  });

  return data;
}
