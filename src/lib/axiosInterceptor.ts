import axios from "axios";

export const axiosInterceptor = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // important for cookies
});

axiosInterceptor.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
