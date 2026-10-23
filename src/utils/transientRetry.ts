type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  wait?: (milliseconds: number) => Promise<void>;
};

const TRANSIENT_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "EPIPE",
  "UND_ERR_CONNECT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function getErrorChain(error: unknown): unknown[] {
  const chain: unknown[] = [];
  const seen = new Set<unknown>();
  let current = error;

  while (current && !seen.has(current)) {
    chain.push(current);
    seen.add(current);
    current =
      typeof current === "object" && current !== null && "cause" in current
        ? current.cause
        : undefined;
  }

  return chain;
}

export function isRetryableGeminiError(error: unknown): boolean {
  const chain = getErrorChain(error);

  const httpError = chain.find(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      (("status" in item && typeof item.status === "number") ||
        ("statusCode" in item && typeof item.statusCode === "number") ||
        ("code" in item && typeof item.code === "number")),
  );

  if (httpError && typeof httpError === "object") {
    const status =
      ("status" in httpError && typeof httpError.status === "number"
        ? httpError.status
        : undefined) ??
      ("statusCode" in httpError && typeof httpError.statusCode === "number"
        ? httpError.statusCode
        : undefined) ??
      ("code" in httpError && typeof httpError.code === "number"
        ? httpError.code
        : undefined);
    if (status !== 503) return false;

    const details = chain
      .filter((item): item is Error => item instanceof Error)
      .map((item) => item.message)
      .join(" ")
      .toLowerCase();
    return /unavailable|high demand|spikes in demand/.test(details);
  }

  return chain.some((item) => {
    if (!(item instanceof Error)) return false;

    const code = "code" in item ? String(item.code) : "";
    if (TRANSIENT_CODES.has(code)) return true;

    const message = item.message.toLowerCase();
    return [
      "failed to fetch",
      "fetch failed",
      "network request failed",
      "socket hang up",
      "connection reset",
      "connection refused",
      "timed out",
    ].some((phrase) => message.includes(phrase));
  });
}

export async function withTransientRetries<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const wait =
    options.wait ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));

  for (let retry = 0; ; retry += 1) {
    try {
      return await operation();
    } catch (error) {
      if (retry >= maxRetries || !isRetryableGeminiError(error)) {
        throw error;
      }

      await wait(baseDelayMs * 2 ** retry);
    }
  }
}
