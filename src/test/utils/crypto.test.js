/**
 * Tests for src/utils/crypto.js
 *
 * These run in Vitest's default node environment so real crypto.subtle is
 * available (the jsdom stub in setup.js only applies to browser-env tests).
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { sha256 } from '../../utils/crypto.js';

describe('sha256', () => {
  it('returns a 64-character lowercase hex string', async () => {
    const result = await sha256('hello');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('matches the known SHA-256 hash of "hello"', async () => {
    const result = await sha256('hello');
    expect(result).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('matches the known SHA-256 hash of "password"', async () => {
    const result = await sha256('password');
    expect(result).toBe(
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    );
  });

  it('produces different hashes for different inputs', async () => {
    const a = await sha256('foo');
    const b = await sha256('bar');
    expect(a).not.toBe(b);
  });

  it('is deterministic – same input always gives same output', async () => {
    const first = await sha256('deterministic');
    const second = await sha256('deterministic');
    expect(first).toBe(second);
  });

  it('handles an empty string', async () => {
    const result = await sha256('');
    // SHA-256 of empty string is a well-known value
    expect(result).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('handles unicode characters', async () => {
    const result = await sha256('こんにちは');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });
});
