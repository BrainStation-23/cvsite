export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMsg = (error as { message?: unknown }).message;
    if (typeof maybeMsg === 'string') return maybeMsg;
  }
  return 'An unexpected error occurred';
}
