import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { auth } from "@/lib/firebase";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private authReady: Promise<void>;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Waiting for auth to be ready. Causes error in the interceptor otherwise.
    this.authReady = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });

    // Request interceptor - Attach token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Waiting for auth initialization
        await this.authReady;

        const user = auth.currentUser;
        if (user) {
          try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("Error getting token:", error);
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            document.cookie =
              "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            if (!window.location.pathname.startsWith("/auth")) {
              window.location.href = "/auth";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getInstance();
