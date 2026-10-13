/**
 * Tests for src/api/client.js
 * Uses MSW to intercept fetch calls at the network level.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { apiClient } from '../../api/client.js';

const BASE = 'http://localhost:8080/leave-service';

beforeEach(() => {
  localStorage.clear();
});

describe('apiClient.get', () => {
  it('fetches data from the correct URL and returns body.data', async () => {
    server.use(
      http.get(`${BASE}/test`, () =>
        HttpResponse.json({ data: { value: 42 } }),
      ),
    );
    const result = await apiClient.get('/test');
    expect(result.data).toEqual({ value: 42 });
  });

  it('attaches the Authorisation header when auth=true (default)', async () => {
    localStorage.setItem('jwt', 'test-token-123');
    let capturedHeader;

    server.use(
      http.get(`${BASE}/secured`, ({ request }) => {
        capturedHeader = request.headers.get('Authorisation');
        return HttpResponse.json({ data: null });
      }),
    );

    await apiClient.get('/secured');
    expect(capturedHeader).toBe('test-token-123');
  });

  it('does NOT attach Authorisation header when auth=false', async () => {
    localStorage.setItem('jwt', 'test-token-123');
    let capturedHeader;

    server.use(
      http.get(`${BASE}/public`, ({ request }) => {
        capturedHeader = request.headers.get('Authorisation');
        return HttpResponse.json({ data: null });
      }),
    );

    await apiClient.get('/public', { auth: false });
    expect(capturedHeader).toBeNull();
  });

  it('returns null data when body has no data field', async () => {
    server.use(
      http.get(`${BASE}/no-data`, () =>
        HttpResponse.json({ message: 'ok' }),
      ),
    );
    const result = await apiClient.get('/no-data');
    expect(result.data).toBeNull();
  });

  it('returns the message field from the response', async () => {
    server.use(
      http.get(`${BASE}/msg`, () =>
        HttpResponse.json({ data: null, message: 'hello' }),
      ),
    );
    const result = await apiClient.get('/msg');
    expect(result.message).toBe('hello');
  });
});

describe('apiClient.post', () => {
  it('sends the body as JSON and returns data', async () => {
    let capturedBody;
    server.use(
      http.post(`${BASE}/create`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ data: { id: 1 } }, { status: 201 });
      }),
    );

    const result = await apiClient.post('/create', { name: 'test' });
    expect(capturedBody).toEqual({ name: 'test' });
    expect(result.data).toEqual({ id: 1 });
  });

  it('sets Content-Type to application/json', async () => {
    let contentType;
    server.use(
      http.post(`${BASE}/ct`, ({ request }) => {
        contentType = request.headers.get('Content-Type');
        return HttpResponse.json({ data: null });
      }),
    );

    await apiClient.post('/ct', {});
    expect(contentType).toBe('application/json');
  });
});

describe('apiClient.patch', () => {
  it('sends a PATCH request with the correct body', async () => {
    let capturedBody;
    server.use(
      http.patch(`${BASE}/update`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ data: { updated: true } });
      }),
    );

    const result = await apiClient.patch('/update', { field: 'value' });
    expect(capturedBody).toEqual({ field: 'value' });
    expect(result.data).toEqual({ updated: true });
  });
});

describe('apiClient.delete', () => {
  it('sends a DELETE request with a JSON body', async () => {
    let capturedBody;
    server.use(
      http.delete(`${BASE}/resource`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ data: null });
      }),
    );

    await apiClient.delete('/resource', { id: 5 });
    expect(capturedBody).toEqual({ id: 5 });
  });
});

describe('error handling', () => {
  it('throws an error with .status on a non-ok response', async () => {
    server.use(
      http.get(`${BASE}/fail`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );

    await expect(apiClient.get('/fail')).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
    });
  });

  it('falls back to "HTTP <status>" message when body has no message', async () => {
    server.use(
      http.get(`${BASE}/no-msg-error`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(apiClient.get('/no-msg-error')).rejects.toMatchObject({
      message: 'HTTP 500',
      status: 500,
    });
  });

  it('attaches the parsed body to the thrown error', async () => {
    server.use(
      http.get(`${BASE}/body-error`, () =>
        HttpResponse.json({ message: 'Bad request', code: 'ERR_42' }, { status: 400 }),
      ),
    );

    let caught;
    try {
      await apiClient.get('/body-error');
    } catch (e) {
      caught = e;
    }

    expect(caught.body).toMatchObject({ message: 'Bad request', code: 'ERR_42' });
  });

  it('throws a 429 error correctly', async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );

    await expect(apiClient.post('/login', {}, { auth: false })).rejects.toMatchObject({
      status: 429,
    });
  });
});
