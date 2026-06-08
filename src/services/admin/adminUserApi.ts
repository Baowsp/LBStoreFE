import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

export const adminFetchUsers = (page = 0, size = 10) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/users?page=${page}&size=${size}`)
    .then(r => handleAdminResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchUser = (id: string) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/users/${id}`).then(r => handleAdminResponse<any>(r));

export const adminCreateUser = (data: { fullName: string; email: string; phoneNumber: string; password: string; role?: string }) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminUpdateUser = (id: string, data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminDeleteUser = (id: string) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/users/${id}`, { method: 'DELETE' })
    .then(r => handleAdminResponse<void>(r));
