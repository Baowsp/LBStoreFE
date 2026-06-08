import { ADMIN_API_BASE_URL, fetchAdminWithAuth, handleAdminResponse } from '../core/adminClient';

export const adminFetchOrders = (page = 0, size = 10) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/online-orders?page=${page}&size=${size}`)
    .then(r => handleAdminResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchOrder = (id: string) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/online-orders/${id}`).then(r => handleAdminResponse<any>(r));

export const adminUpdateOrderStatus = (id: string, status: string) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/online-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(status),
  }).then(r => handleAdminResponse<any>(r));

export const adminFetchAvailableShippers = () =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/v1/delivery-employees`)
    .then(r => handleAdminResponse<any[]>(r));

export const adminAssignShipper = (orderId: string, shipperId: number) =>
  fetchAdminWithAuth(`${ADMIN_API_BASE_URL}/online-orders/${orderId}/assign-shipper?shipperId=${shipperId}`, {
    method: 'POST',
  }).then(r => handleAdminResponse<any>(r));
