import { apiClient } from './client.js';

export async function createUser(payload) {
  return apiClient.post('/create-user', payload);
}

export async function amendEmployee(payload) {
  const result = await apiClient.patch('/amend-employee', payload);
  return result.data;
}
