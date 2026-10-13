import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server.js';

// Start the MSW server before all tests, reset handlers between each test,
// and close it after the suite finishes.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// ─── Stub crypto.subtle (jsdom doesn't implement it) ────────────────────────
// Only apply the stub inside jsdom environments. Node tests (e.g. crypto.test.js
// with @vitest-environment node) already have real crypto.subtle available and
// must NOT be overwritten, otherwise the known-hash assertions will fail.
if (typeof window !== 'undefined') {
  const mockDigest = vi.fn(async (_algo, data) => {
    // Return a fixed 32-byte buffer so callers get a valid hex string.
    return new Uint8Array(32).fill(data?.length ?? 0).buffer;
  });

  Object.defineProperty(globalThis, 'crypto', {
    value: {
      subtle: { digest: mockDigest },
      getRandomValues: (arr) => arr,
    },
    writable: true,
  });
}

// ─── Suppress noisy React act() warnings in older RTL + React 19 ─────────────
const originalError = console.error.bind(console.error);
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return;
  originalError(...args);
};
