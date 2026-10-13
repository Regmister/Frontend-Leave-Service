import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { createUser, amendEmployee } from '../../api/users.js';

const BASE = 'http://localhost:8080/leave-service';

beforeEach(() => {
  localStorage.setItem('jwt', 'test-token');
});

describe('createUser', () => {
  it('POSTs to /create-user with the payload', async () => {
    let body;
    server.use(
      http.post(`${BASE}/create-user`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { employee_id: 1010 } }, { status: 201 });
      }),
    );

    const payload = {
      employee_id: 1010,
      role: 'USER',
      first_name: 'Jane',
      last_name: 'Doe',
      leave_refresh_date: '2027-01-01',
      annual_entitlement: 25,
    };

    await createUser(payload);
    expect(body).toMatchObject(payload);
  });

  it('returns the full response object (not just data)', async () => {
    const result = await createUser({ employee_id: 1010, role: 'USER' });
    // createUser returns the raw apiClient response (data + message + status)
    expect(result).toHaveProperty('status');
  });

  it('throws when the server returns an error', async () => {
    server.use(
      http.post(`${BASE}/create-user`, () =>
        HttpResponse.json({ message: 'Employee ID already exists' }, { status: 409 }),
      ),
    );
    await expect(createUser({ employee_id: 1010 })).rejects.toMatchObject({ status: 409 });
  });

  it('includes the Authorisation header', async () => {
    let authHeader;
    server.use(
      http.post(`${BASE}/create-user`, ({ request }) => {
        authHeader = request.headers.get('Authorisation');
        return HttpResponse.json({ data: {} }, { status: 201 });
      }),
    );
    await createUser({});
    expect(authHeader).toBe('test-token');
  });
});

describe('amendEmployee', () => {
  it('PATCHes to /amend-employee with the payload', async () => {
    let body;
    server.use(
      http.patch(`${BASE}/amend-employee`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { employee_id: 1010 } });
      }),
    );

    await amendEmployee({ employee_id: 1010, role: 'MANAGER' });
    expect(body).toMatchObject({ employee_id: 1010, role: 'MANAGER' });
  });

  it('returns only data from the response', async () => {
    const result = await amendEmployee({ employee_id: 1010 });
    expect(result).toMatchObject({ employee_id: 1010 });
  });

  it('throws when the server returns an error', async () => {
    server.use(
      http.patch(`${BASE}/amend-employee`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );
    await expect(amendEmployee({ employee_id: 9999 })).rejects.toMatchObject({ status: 404 });
  });
});
