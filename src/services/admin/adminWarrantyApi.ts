import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

export const adminFetchWarranties = (page = 0, size = 10) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/warranty-tickets?page=${page}&size=${size}`)
    .then(r => handleAdminResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchWarranty = (id: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/warranty-tickets/${id}`).then(r => handleAdminResponse<any>(r));

export const adminUpdateWarrantyStatus = (id: number, status: string, notes?: string) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/warranty-tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes: notes ?? '' }),
  }).then(r => handleAdminResponse<any>(r));

export const adminUpdateWarranty = (id: number, data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/warranty-tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));
