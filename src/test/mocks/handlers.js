import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8080/leave-service';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authHandlers = [
  http.post(`${BASE}/login`, async ({ request }) => {
    const body = await request.json();
    if (body.employee_id === 1001) {
      // A real JWT with payload: { sub: 1001, role: 'USER', exp: 9999999999 }
      const jwt =
        'eyJhbGciOiJIUzI1NiJ9.' +
        btoa(JSON.stringify({ sub: 1001, role: 'USER', exp: 9999999999 })) +
        '.sig';
      return HttpResponse.json({ data: { jwt } });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 400 });
  }),

  http.patch(`${BASE}/change-password`, () =>
    HttpResponse.json({ data: null, message: 'Password changed' }),
  ),
];

// ─── Leave ───────────────────────────────────────────────────────────────────
export const leaveHandlers = [
  http.get(`${BASE}/leave-request/status/:employeeId`, () =>
    HttpResponse.json({
      data: [
        { id: 1, startDate: '2026-09-15', endDate: '2026-09-19', status: 'Pending', reviewedBy: null },
        { id: 2, startDate: '2026-08-01', endDate: '2026-08-05', status: 'Approved', reviewedBy: 2001 },
      ],
    }),
  ),

  http.get(`${BASE}/leave-request/total-days/:employeeId`, () =>
    HttpResponse.json({ data: { daysUsed: 5, remainingBalance: 20 } }),
  ),

  http.post(`${BASE}/leave-request`, () =>
    HttpResponse.json({ data: { id: 99, status: 'Pending' } }, { status: 201 }),
  ),

  http.delete(`${BASE}/leave-request`, () =>
    HttpResponse.json({ data: null, message: 'Cancelled' }),
  ),

  http.patch(`${BASE}/leave-request/approve`, () =>
    HttpResponse.json({ data: null, message: 'Approved' }),
  ),

  http.patch(`${BASE}/leave-request/decline`, () =>
    HttpResponse.json({ data: null, message: 'Declined' }),
  ),

  http.get(`${BASE}/team/pending-leaves`, () =>
    HttpResponse.json({
      data: [
        { id: 3, startDate: '2026-09-20', endDate: '2026-09-21', status: 'Pending', employeed: 1002, reviewedBy: null },
      ],
    }),
  ),

  http.get(`${BASE}/team/leave-balance/:employeeId`, () =>
    HttpResponse.json({
      data: {
        employeeId: 1002,
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'USER',
        department: 'Engineering',
        managerId: 2001,
        currentBalance: 18,
        entitlement: 25,
        refreshDate: '2027-01-01',
      },
    }),
  ),

  http.get(`${BASE}/admin/all-leaves`, () =>
    HttpResponse.json({
      data: [
        { id: 5, startDate: '2026-09-01', endDate: '2026-09-03', status: 'Approved', employeed: 1005, reviewedBy: 2001 },
      ],
    }),
  ),
];

// ─── Users ───────────────────────────────────────────────────────────────────
export const userHandlers = [
  http.post(`${BASE}/create-user`, () =>
    HttpResponse.json({ data: { employee_id: 1010 }, message: 'Created' }, { status: 201 }),
  ),

  http.patch(`${BASE}/amend-employee`, () =>
    HttpResponse.json({ data: { employee_id: 1010 }, message: 'Updated' }),
  ),
];

export const handlers = [...authHandlers, ...leaveHandlers, ...userHandlers];
