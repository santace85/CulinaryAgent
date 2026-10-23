import test from "node:test";
import assert from "node:assert/strict";
import { isRetryableGeminiError, withTransientRetries } from "./transientRetry";

test("retries transient connection failures with bounded backoff", async () => {
  let attempts = 0;
  const delays: number[] = [];
  const result = await withTransientRetries(
    async () => {
      attempts += 1;
      if (attempts < 3) throw new TypeError("fetch failed");
      return "ok";
    },
    { wait: async (milliseconds) => void delays.push(milliseconds) },
  );

  assert.equal(result, "ok");
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [250, 500]);
});

test("does not retry unrelated HTTP status errors", async () => {
  let attempts = 0;
  const error = Object.assign(new Error("invalid request"), {
    status: 503,
  });

  await assert.rejects(
    withTransientRetries(
      async () => {
        attempts += 1;
        throw error;
      },
      { wait: async () => undefined },
    ),
    error,
  );
  assert.equal(attempts, 1);
});

test("retries Gemini 503 UNAVAILABLE overload errors", async () => {
  let attempts = 0;
  const error = Object.assign(
    new Error(
      '{"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}',
    ),
    { status: 503 },
  );

  const result = await withTransientRetries(
    async () => {
      attempts += 1;
      if (attempts < 2) throw error;
      return "recovered";
    },
    { wait: async () => undefined },
  );

  assert.equal(result, "recovered");
  assert.equal(attempts, 2);
});

test("recognizes nested transport failures but not unrelated errors", () => {
  const wrappedError = new Error("request failed", {
    cause: Object.assign(new Error("socket reset"), { code: "ECONNRESET" }),
  });

  assert.equal(isRetryableGeminiError(wrappedError), true);
  assert.equal(isRetryableGeminiError(new Error("invalid request")), false);
});

test("stops after the configured retry limit", async () => {
  let attempts = 0;
  await assert.rejects(
    withTransientRetries(
      async () => {
        attempts += 1;
        throw new TypeError("Failed to fetch");
      },
      { maxRetries: 1, wait: async () => undefined },
    ),
    /Failed to fetch/,
  );
  assert.equal(attempts, 2);
});
