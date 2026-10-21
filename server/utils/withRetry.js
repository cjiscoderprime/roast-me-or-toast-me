
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry(operation, maxAttempts = 2) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const code = Number(
        error.status ??
        error.code ??
        error.error?.code
      );

      // Retry temporary server failures only.
      const retryable = [500, 502, 503, 504].includes(code);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);

      console.log(
        `Gemini error ${code}. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }
}
