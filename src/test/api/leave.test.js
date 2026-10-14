/**
 * Tests for src/api/leave.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import {
  submitLeave,
  cancelLeave,
  getLeaveStatus,
  getTotalDays,
  approveLeave,
  declineLeave,
  getTeamPendingLeaves,
  getTeamLeaveBalance,
  getAllLeaves,
} from '../../api/leave.js';

const BASE = 'http://localhost:8080/leave-service';

beforeEach(() => {
  localStorage.setItem('jwt', 'test-token');
});

// ─── submitLeave ─────────────────────────────────────────────────────────────
describe('submitLeave', () => {
  it('POSTs to /leave-request and returns the new leave object', async () => {
    const result = await submitLeave(1001, '2026-10-01', '2026-10-05');
    expect(result).toMatchObject({ id: 99, status: 'Pending' });
  });

  it('sends the correct payload fields', async () => {
    let body;
    server.use(
      http.post(`${BASE}/leave-request`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { id: 1 } }, { status: 201 });
      }),
    );

    await submitLeave(1001, '2026-10-01', '2026-10-05');
    expect(body).toEqual({
      employee_id: 1001,
      start_date: '2026-10-01',
      end_date: '2026-10-05',
    });
  });

  it('throws when the server returns an error', async () => {
    server.use(
      http.post(`${BASE}/leave-request`, () =>
        HttpResponse.json({ message: 'Bad request' }, { status: 400 }),
      ),
    );
    await expect(submitLeave(1001, '2026-10-01', '2026-09-01')).rejects.toMatchObject({
      status: 400,
    });
  });
});

// ─── cancelLeave ─────────────────────────────────────────────────────────────
describe('cancelLeave', () => {
  it('sends a DELETE with the id in the body', async () => {
    let body;
    server.use(
      http.delete(`${BASE}/leave-request`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: null });
      }),
    );
    await cancelLeave(7);
    expect(body).toEqual({ id: 7 });
  });

  it('returns null data on success', async () => {
    const result = await cancelLeave(1);
    expect(result).toBeNull();
  });
});

// ─── getLeaveStatus ───────────────────────────────────────────────────────────
describe('getLeaveStatus', () => {
  it('GETs /leave-request/status/:employeeId and returns an array', async () => {
    const result = await getLeaveStatus(1001);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the employeeId in the URL path', async () => {
    let requestedPath;
    server.use(
      http.get(`${BASE}/leave-request/status/:employeeId`, ({ params }) => {
        requestedPath = params.employeeId;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getLeaveStatus(1234);
    expect(requestedPath).toBe('1234');
  });

  it('returns an empty array when data is null', async () => {
    server.use(
      http.get(`${BASE}/leave-request/status/:employeeId`, () =>
        HttpResponse.json({ data: null }),
      ),
    );
    const result = await getLeaveStatus(1001);
    expect(result).toEqual([]);
  });
});

// ─── getTotalDays ─────────────────────────────────────────────────────────────
describe('getTotalDays', () => {
  it('returns days and remainingBalance', async () => {
    const result = await getTotalDays(1001);
    expect(result).toMatchObject({ days: 5, remainingBalance: 20 });
  });
});

// ─── approveLeave ─────────────────────────────────────────────────────────────
describe('approveLeave', () => {
  it('PATCHes /leave-request/approve with the id', async () => {
    let body;
    server.use(
      http.patch(`${BASE}/leave-request/approve`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: null });
      }),
    );
    await approveLeave(10);
    expect(body).toEqual({ id: 10 });
  });
});

// ─── declineLeave ─────────────────────────────────────────────────────────────
describe('declineLeave', () => {
  it('PATCHes /leave-request/decline with the id', async () => {
    let body;
    server.use(
      http.patch(`${BASE}/leave-request/decline`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: null });
      }),
    );
    await declineLeave(11);
    expect(body).toEqual({ id: 11 });
  });
});

// ─── getTeamPendingLeaves ─────────────────────────────────────────────────────
describe('getTeamPendingLeaves', () => {
  it('GETs /team/pending-leaves with no query string when no filters', async () => {
    let url;
    server.use(
      http.get(`${BASE}/team/pending-leaves`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getTeamPendingLeaves();
    expect(url).toBe(`${BASE}/team/pending-leaves`);
  });

  it('appends start_date and end_date query params when provided', async () => {
    let url;
    server.use(
      http.get(`${BASE}/team/pending-leaves`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getTeamPendingLeaves({ start_date: '2026-09-01', end_date: '2026-09-30' });
    expect(url).toContain('start_date=2026-09-01');
    expect(url).toContain('end_date=2026-09-30');
  });

  it('only appends filters that have values', async () => {
    let url;
    server.use(
      http.get(`${BASE}/team/pending-leaves`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getTeamPendingLeaves({ start_date: '2026-09-01' });
    expect(url).toContain('start_date=2026-09-01');
    expect(url).not.toContain('end_date');
  });

  it('returns an empty array when data is null', async () => {
    server.use(
      http.get(`${BASE}/team/pending-leaves`, () =>
        HttpResponse.json({ data: null }),
      ),
    );
    const result = await getTeamPendingLeaves();
    expect(result).toEqual([]);
  });
});

// ─── getTeamLeaveBalance ──────────────────────────────────────────────────────
describe('getTeamLeaveBalance', () => {
  it('GETs /team/leave-balance/:employeeId and returns the balance object', async () => {
    const result = await getTeamLeaveBalance(1002);
    expect(result).toMatchObject({ employeeId: 1002, currentBalance: 18 });
  });
});

// ─── getAllLeaves ─────────────────────────────────────────────────────────────
describe('getAllLeaves', () => {
  it('GETs /admin/all-leaves with no query string when no filters', async () => {
    let url;
    server.use(
      http.get(`${BASE}/admin/all-leaves`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getAllLeaves();
    expect(url).toBe(`${BASE}/admin/all-leaves`);
  });

  it('appends employee_id, manager_id, and status filters', async () => {
    let url;
    server.use(
      http.get(`${BASE}/admin/all-leaves`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );
    await getAllLeaves({ employee_id: 1001, manager_id: 2001, status: 'Pending' });
    expect(url).toContain('employee_id=1001');
    expect(url).toContain('manager_id=2001');
    expect(url).toContain('status=Pending');
  });

  it('returns an empty array when data is null', async () => {
    server.use(
      http.get(`${BASE}/admin/all-leaves`, () =>
        HttpResponse.json({ data: null }),
      ),
    );
    const result = await getAllLeaves();
    expect(result).toEqual([]);
  });
});
