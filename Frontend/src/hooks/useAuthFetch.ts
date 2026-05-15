import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@clerk/react";
import { useEffect, useRef } from "react";

// Module-level singleton — one instance for the whole app, zero re-creation
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const useAuthFetch = () => {
  const { getToken } = useAuth();

  // Ref keeps the interceptor from ever capturing a stale closure
  const getTokenRef = useRef(getToken);

  // Sync the ref on every render so it always points at the live getToken
  useEffect(() => {
    getTokenRef.current = getToken;
  });

  // Register interceptor once on mount, eject on unmount
  useEffect(() => {
    const interceptorId = apiClient.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Reading from ref = always the current Clerk getToken, never stale
        const token = await getTokenRef.current();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup: remove this interceptor when the component using this hook unmounts
    return () => {
      apiClient.interceptors.request.eject(interceptorId);
    };
  }, []); // ← empty deps: register once, the ref handles freshness

  return apiClient;
};

// import axios from "axios";
// import { useAuth } from "@clerk/react";
// import { useMemo } from "react";

// export const useAuthFetch = () => {
//   const { getToken } = useAuth();

//   const authFetch = useMemo(() => {
//     const instance = axios.create({
//       baseURL: import.meta.env.VITE_API_URL,
//     });

//     // interceptor runs before every request
//     instance.interceptors.request.use(async (config) => {
//       const token = await getToken(); // gets Clerk JWT
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     });

//     return instance;
//   }, [getToken]);

//   return authFetch;
// };

