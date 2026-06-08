import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

export const adminFetchSuppliers = () =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/suppliers`).then(r => handleAdminResponse<any[]>(r));

export const adminFetchSupplier = (id: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/suppliers/${id}`).then(r => handleAdminResponse<any>(r));

export const adminCreateSupplier = (data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/suppliers`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminUpdateSupplier = (id: number, data: any) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminDeleteSupplier = (id: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/suppliers/${id}`, { method: 'DELETE' })
    .then(r => handleAdminResponse<void>(r));
