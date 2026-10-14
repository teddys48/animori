import { describe, it, expect } from "bun:test";
import { KitsuError, toKitsuError, describeError } from "../../src/lib/api/errors";

describe("Kitsu Error Model", () => {
  describe("KitsuError instantiation & retryable", () => {
    it("marks rate-limit, network, timeout, and server errors as retryable", () => {
      expect(new KitsuError("rate-limit", "rate limit").retryable).toBe(true);
      expect(new KitsuError("network", "offline").retryable).toBe(true);
      expect(new KitsuError("timeout", "slow").retryable).toBe(true);
      expect(new KitsuError("server", "server error").retryable).toBe(true);
    });

    it("marks not-found and bad-request errors as non-retryable", () => {
      expect(new KitsuError("not-found", "404").retryable).toBe(false);
      expect(new KitsuError("bad-request", "400").retryable).toBe(false);
    });

    it("preserves status and retryAfterMs options", () => {
      const err = new KitsuError("rate-limit", "Too many requests", {
        status: 429,
        retryAfterMs: 3000
      });
      expect(err.status).toBe(429);
      expect(err.retryAfterMs).toBe(3000);
      expect(err.name).toBe("KitsuError");
    });
  });

  describe("toKitsuError coercion", () => {
    it("returns existing KitsuError unchanged", () => {
      const existing = new KitsuError("timeout", "too slow");
      expect(toKitsuError(existing)).toBe(existing);
    });

    it("converts standard Error or unknown to malformed KitsuError", () => {
      const standard = new Error("Generic failure");
      const converted = toKitsuError(standard);
      expect(converted).toBeInstanceOf(KitsuError);
      expect(converted.kind).toBe("malformed");
      expect(converted.message).toBe("Unexpected error while loading data.");
    });
  });

  describe("describeError user-facing descriptions", () => {
    it("describes rate-limit error gracefully", () => {
      const desc = describeError(new KitsuError("rate-limit", "Limit hit"));
      expect(desc.title).toBe("Slow down a little");
      expect(desc.retryable).toBe(true);
      expect(desc.message).toContain("too many requests");
    });

    it("describes network error gracefully", () => {
      const desc = describeError(new KitsuError("network", "Failed to fetch"));
      expect(desc.title).toBe("Connection problem");
      expect(desc.retryable).toBe(true);
      expect(desc.message).toContain("internet connection");
    });

    it("describes not-found error as non-retryable", () => {
      const desc = describeError(new KitsuError("not-found", "Not found"));
      expect(desc.title).toBe("Not found");
      expect(desc.retryable).toBe(false);
    });

    it("describes server error as retryable", () => {
      const desc = describeError(new KitsuError("server", "500"));
      expect(desc.title).toBe("Unable to load anime");
      expect(desc.retryable).toBe(true);
    });
  });
});
