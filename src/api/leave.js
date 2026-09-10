import { apiClient } from './client.js';

export async function submitLeave(employeeId, startDate, endDate) {
  const result = await apiClient.post('/leave-request', {
    employee_id: employeeId,
    start_date: startDate,
    end_date: endDate,
  });
  return result.data;
}

export async function cancelLeave(id) {
  const result = await apiClient.delete('/leave-request', { id });
  return result.data;
}

export async function getLeaveStatus(employeeId) {
  const result = await apiClient.get(`/leave-request/status/${employeeId}`);
  return result.data ?? [];
}

export async function getTotalDays(employeeId) {
  const result = await apiClient.get(`/leave-request/total-days/${employeeId}`);
  return result.data;
}

export async function approveLeave(id) {
  const result = await apiClient.patch('/leave-request/approve', { id });
  return result.data;
}

export async function declineLeave(id) {
  const result = await apiClient.patch('/leave-request/decline', { id });
  return result.data;
}

export async function getTeamPendingLeaves(filters = {}) {
  const params = new URLSearchParams();
  if (filters.start_date) params.set('start_date', filters.start_date);
  if (filters.end_date) params.set('end_date', filters.end_date);
  const query = params.toString() ? `?${params}` : '';
  const result = await apiClient.get(`/team/pending-leaves${query}`);
  return result.data ?? [];
}

export async function getTeamLeaveBalance(employeeId) {
  const result = await apiClient.get(`/team/leave-balance/${employeeId}`);
  return result.data;
}

export async function getAllLeaves(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employee_id) params.set('employee_id', filters.employee_id);
  if (filters.manager_id) params.set('manager_id', filters.manager_id);
  if (filters.status) params.set('status', filters.status);
  const query = params.toString() ? `?${params}` : '';
  const result = await apiClient.get(`/admin/all-leaves${query}`);
  return result.data ?? [];
}
