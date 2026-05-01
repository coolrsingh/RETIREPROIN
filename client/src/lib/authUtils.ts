export function isUnauthorizedError(error: Error): boolean {
  return (error as any).status === 401 || /^401:/.test(error.message) || error.message === "Unauthorized";
}