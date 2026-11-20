import axios from "axios";

import type { AppUser } from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const TOKEN_KEY = "gearloop_token";
export const USER_KEY = "gearloop_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function loadStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: AppUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearApiSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!API_URL) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_API_URL is not set. Add your backend URL to .env.local.")
    );
  }
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const pendingTokenRequests = new Map<string, Promise<AppUser>>();

export async function fetchApiToken(email: string, role?: string): Promise<AppUser> {
  const key = email.toLowerCase();
  const pending = pendingTokenRequests.get(key);
  if (pending) return pending;

  const request = api
    .post<{ token?: string; data?: AppUser }>("/auth/jwt", { email, role })
    .then((res) => {
      const token = res.data?.token;
      const user = res.data?.data;
      if (!token || !user) {
        throw new Error("Backend did not return a token.");
      }
      saveToken(token);
      saveUser(user);
      return user;
    })
    .finally(() => {
      pendingTokenRequests.delete(key);
    });

  pendingTokenRequests.set(key, request);
  return request;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
