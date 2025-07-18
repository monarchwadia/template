/**
 * Retries the given async function with exponential backoff, up to a maximum duration.
 * @param fn The async function to retry
 * @param options Configuration options for retry behavior
 */
export interface RetryWithExponentialBackoffOptions {
  maxHours?: number; // Maximum total retry window in hours (default: 72)
  initialDelayMs?: number; // Initial delay in ms (default: 1000)
  maxDelayMs?: number; // Maximum delay between retries in ms (default: 1 hour)
}

export async function retryWithExponentialBackoff(
  fn: () => Promise<void>,
  options: RetryWithExponentialBackoffOptions = {}
): Promise<void> {
  const {
    maxHours = 72,
    initialDelayMs = 1000,
    maxDelayMs = 60 * 60 * 1000,
  } = options;
  const maxMs = maxHours * 60 * 60 * 1000;
  let attempt = 0;
  let delay = initialDelayMs;
  const start = Date.now();
  while (true) {
    try {
      await fn();
      break;
    } catch (err) {
      attempt++;
      const elapsed = Date.now() - start;
      if (elapsed + delay > maxMs) {
        throw new Error(
          `[retryWithExponentialBackoff] Max retry window (${maxHours}h) exceeded. Giving up. Last error: ${err}`
        );
      }
      // Optionally log here or let caller handle logging
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, maxDelayMs);
    }
  }
}
