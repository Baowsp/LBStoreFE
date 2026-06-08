import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

const BASE = `${ADMIN_API_BASE_URL}/v1/delivery-employees`;

export const adminFetchDeliveryEmployees = (status?: string) => {
  const url = status ? `${BASE}?status=${status}` : BASE;
  return fetchAdminWithAuth(url).then(r => handleAdminResponse<any[]>(r));
};

export const adminFetchDeliveryEmployee = (id: number) =>
  fetchAdminWithAuth(`${BASE}/${id}`).then(r => handleAdminResponse<any>(r));

export const adminCreateDeliveryEmployee = (data: any) =>
  fetchAdminWithAuth(BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminUpdateDeliveryEmployee = (id: number, data: any) =>
  fetchAdminWithAuth(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));

export const adminDeleteDeliveryEmployee = (id: number) =>
  fetchAdminWithAuth(`${BASE}/${id}`, { method: 'DELETE' }).then(r => handleAdminResponse<void>(r));

export const adminUpdateDeliveryStatus = (id: number, status: string) =>
  fetchAdminWithAuth(`${BASE}/${id}/status?status=${status}`, {
    method: 'PATCH',
  }).then(r => handleAdminResponse<any>(r));

/**
 * Tạo mới nhân viên giao hàng từ form nhập tay.
 * Backend tự tạo User -> Employee -> DeliveryEmployee trong 1 transaction.
 */
export const adminCreateDeliveryEmployeeWithInfo = (data: {
  fullName: string;
  phoneNumber: string;
  email?: string;
  vehicleType: string;
  licensePlate: string;
  drivingLicense: string;
  status?: string;
}) =>
  fetchAdminWithAuth(`${BASE}/create-with-info`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleAdminResponse<any>(r));
