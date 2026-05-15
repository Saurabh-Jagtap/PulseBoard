import axios from "axios";
import { useAuth } from "@clerk/react";
import { useMemo } from "react";

export const useAuthFetch = () => {
  const { getToken } = useAuth();

  const authFetch = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
    });

    // interceptor runs before every request
    instance.interceptors.request.use(async (config) => {
      const token = await getToken(); // gets Clerk JWT
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return authFetch;
};
