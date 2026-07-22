import { useGetAuthUser, getGetAuthUserQueryKey } from "@workspace/api-client-react";

export type { AuthUser } from "@workspace/api-client-react";

export function useAuth() {
  const { data: user, isLoading } = useGetAuthUser({
    query: { queryKey: getGetAuthUserQueryKey(), retry: false },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}
