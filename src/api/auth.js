import { apiClient } from './client.js';
import { sha256 } from '../utils/crypto.js';

export async function login(employeeId, rawPassword) {
  
  const hash = await sha256(rawPassword);
  const result = await apiClient.post(
    '/login',
    { employee_id: Number(employeeId), hash },
    { auth: false },
  );
  return result.data;
}

export async function changePassword(rawPassword) {
  const hash = await sha256(rawPassword);
  const result = await apiClient.patch('/change-password', { hash });
  return result.data;
}
