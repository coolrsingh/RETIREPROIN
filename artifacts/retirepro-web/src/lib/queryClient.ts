import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { customFetch, ApiError } from "@workspace/api-client-react";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    // Read body once for the error message
    let errorMessage = res.statusText;
    try {
      const errorBody = await res.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      try {
        errorMessage = await res.text() || errorMessage;
      } catch {
        // body unreadable, use statusText
      }
    }
    const err = new Error(errorMessage) as any;
    err.status = res.status;
    throw err;
  }

  // Success — parse and return JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;
  return async ({ queryKey }) => {
    try {
      return await customFetch<T>(queryKey.join("/") as string);
    } catch (error) {
      if (
        unauthorizedBehavior === "returnNull" &&
        error instanceof ApiError &&
        error.status === 401
      ) {
        return null as unknown as T;
      }
      throw error;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
