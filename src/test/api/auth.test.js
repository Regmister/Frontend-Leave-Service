/**
 * Tests for src/api/auth.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { login, changePassword } from '../../api/auth.js';

const BASE = 'http://localhost:8080/leave-service';

beforeEach(() => localStorage.clear());

describe('login', () => {
  it('returns the jwt from a successful login', async () => {
    const data = await login(1001, 'secret');
    expect(data).toHaveProperty('jwt');
    expect(typeof data.jwt).toBe('string');
  });

  it('sends employee_id as a number in the request body', async () => {
    let body;
    server.use(
      http.post(`${BASE}/login`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { jwt: 'tok' } });
      }),
    );

    await login('1001', 'secret');
    expect(typeof body.employee_id).toBe('number');
    expect(body.employee_id).toBe(1001);
  });

  it('sends a hash field (not the raw password)', async () => {
    let body;
    server.use(
      http.post(`${BASE}/login`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { jwt: 'tok' } });
      }),
    );

    await login(1001, 'mypassword');
    expect(body).toHaveProperty('hash');
    expect(body.hash).not.toBe('mypassword');
    // SHA-256 hex is always 64 chars
    expect(body.hash).toHaveLength(64);
  });

  it('makes the request without an Authorization header (auth: false)', async () => {
    localStorage.setItem('jwt', 'existing-token');
    let authHeader;
    server.use(
      http.post(`${BASE}/login`, ({ request }) => {
        authHeader = request.headers.get('Authorisation');
        return HttpResponse.json({ data: { jwt: 'tok' } });
      }),
    );

    await login(1001, 'secret');
    expect(authHeader).toBeNull();
  });

  it('throws on a 400 response (invalid credentials)', async () => {
    await expect(login(9999, 'wrong')).rejects.toMatchObject({ status: 400 });
  });

  it('throws on a 429 response (rate-limited)', async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );

    await expect(login(1001, 'secret')).rejects.toMatchObject({ status: 429 });
  });
});

describe('changePassword', () => {
  it('resolves without throwing on a successful response', async () => {
    localStorage.setItem('jwt', 'valid-token');
    await expect(changePassword('newSecret')).resolves.not.toThrow();
  });

  it('sends a hash field (not the raw password)', async () => {
    localStorage.setItem('jwt', 'valid-token');
    let body;
    server.use(
      http.patch(`${BASE}/change-password`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: null });
      }),
    );

    await changePassword('mynewpassword');
    expect(body).toHaveProperty('hash');
    expect(body.hash).not.toBe('mynewpassword');
    expect(body.hash).toHaveLength(64);
  });

  it('includes the Authorisation header', async () => {
    localStorage.setItem('jwt', 'auth-token-xyz');
    let authHeader;
    server.use(
      http.patch(`${BASE}/change-password`, ({ request }) => {
        authHeader = request.headers.get('Authorisation');
        return HttpResponse.json({ data: null });
      }),
    );

    await changePassword('pass');
    expect(authHeader).toBe('auth-token-xyz');
  });

  it('throws when the server returns an error', async () => {
    server.use(
      http.patch(`${BASE}/change-password`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    await expect(changePassword('pass')).rejects.toMatchObject({ status: 401 });
  });
});
