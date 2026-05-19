import { useAuthStore } from '../store/useAuthStore';

const BASE = 'http://localhost:8080/api';

/**
 * Kiểm tra JWT token đã hết hạn chưa
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Tự động đăng xuất admin và redirect về trang đăng nhập admin
 */
const forceAdminLogout = () => {
  useAuthStore.getState().logout();
  if (!window.location.pathname.includes('/admin-login')) {
    window.location.href = '/admin-login';
  }
};

/**
 * Helper: Tự động đính kèm JWT Token vào header Authorization cho Admin.
 * Nếu token hết hạn → tự động đăng xuất.
 * Nếu server trả 401/403 → tự động đăng xuất.
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;

  // Kiểm tra token hết hạn trước khi gọi API
  if (token && isTokenExpired(token)) {
    forceAdminLogout();
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  // Xử lý token bị từ chối bởi server
  if (response.status === 401 || response.status === 403) {
    forceAdminLogout();
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  return response;
};

// Helper: ném lỗi với text từ server
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  // Kiểm tra xem có nội dung để parse JSON không
  const text = await res.text();
  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text);
  } catch (e) {
    return text as unknown as T;
  }
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

export const adminFetchProducts = (page = 0, size = 10, search = '') => {
  const sort = 'id,desc';
  const url = search 
    ? `${BASE}/products/search?q=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=${sort}`
    : `${BASE}/products?page=${page}&size=${size}&sort=${sort}`;
  return fetchWithAuth(url)
    .then(r => handleResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));
};

export const adminFetchProduct = (id: number) =>
  fetchWithAuth(`${BASE}/products/${id}`).then(r => handleResponse<any>(r));

export const adminCreateProduct = (data: any) =>
  fetchWithAuth(`${BASE}/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminUpdateProduct = (id: number, data: any) =>
  fetchWithAuth(`${BASE}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminDeleteProduct = (id: number) =>
  fetchWithAuth(`${BASE}/products/${id}`, { method: 'DELETE' })
    .then(r => handleResponse<void>(r));

// ── ORDERS ───────────────────────────────────────────────────────────────────

export const adminFetchOrders = (page = 0, size = 10) =>
  fetchWithAuth(`${BASE}/online-orders?page=${page}&size=${size}`)
    .then(r => handleResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchOrder = (id: string) =>
  fetchWithAuth(`${BASE}/online-orders/${id}`).then(r => handleResponse<any>(r));

export const adminUpdateOrderStatus = (id: string, status: string) =>
  fetchWithAuth(`${BASE}/online-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(status),
  }).then(r => handleResponse<any>(r));

// ── SUPPLIERS ────────────────────────────────────────────────────────────────

export const adminFetchSuppliers = () =>
  fetchWithAuth(`${BASE}/v1/suppliers`).then(r => handleResponse<any[]>(r));

export const adminFetchSupplier = (id: number) =>
  fetchWithAuth(`${BASE}/v1/suppliers/${id}`).then(r => handleResponse<any>(r));

export const adminCreateSupplier = (data: any) =>
  fetchWithAuth(`${BASE}/v1/suppliers`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminUpdateSupplier = (id: number, data: any) =>
  fetchWithAuth(`${BASE}/v1/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminDeleteSupplier = (id: number) =>
  fetchWithAuth(`${BASE}/v1/suppliers/${id}`, { method: 'DELETE' })
    .then(r => handleResponse<void>(r));

// ── USERS ────────────────────────────────────────────────────────────────────

export const adminFetchUsers = (page = 0, size = 10) =>
  fetchWithAuth(`${BASE}/users?page=${page}&size=${size}`)
    .then(r => handleResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchUser = (id: string) =>
  fetchWithAuth(`${BASE}/users/${id}`).then(r => handleResponse<any>(r));

export const adminCreateUser = (data: { fullName: string; email: string; phoneNumber: string; password: string; role?: string }) =>
  fetchWithAuth(`${BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminUpdateUser = (id: string, data: any) =>
  fetchWithAuth(`${BASE}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

export const adminDeleteUser = (id: string) =>
  fetchWithAuth(`${BASE}/users/${id}`, { method: 'DELETE' })
    .then(r => handleResponse<void>(r));

// ── WARRANTY TICKETS ─────────────────────────────────────────────────────────

export const adminFetchWarranties = (page = 0, size = 10) =>
  fetchWithAuth(`${BASE}/v1/warranty-tickets?page=${page}&size=${size}`)
    .then(r => handleResponse<any>(r))
    .then(d => ({ content: d.content ?? [], totalElements: d.totalElements ?? 0, totalPages: d.totalPages ?? 1 }));

export const adminFetchWarranty = (id: number) =>
  fetchWithAuth(`${BASE}/v1/warranty-tickets/${id}`).then(r => handleResponse<any>(r));

export const adminUpdateWarrantyStatus = (id: number, status: string, notes?: string) =>
  fetchWithAuth(`${BASE}/v1/warranty-tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes: notes ?? '' }),
  }).then(r => handleResponse<any>(r));

export const adminUpdateWarranty = (id: number, data: any) =>
  fetchWithAuth(`${BASE}/v1/warranty-tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(r => handleResponse<any>(r));

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────

export const adminFetchDashboardStats = async () => {
  const [ordersPage, usersPage, productsPage] = await Promise.all([
    fetchWithAuth(`${BASE}/online-orders?page=0&size=5`).then(r => handleResponse<any>(r)),
    fetchWithAuth(`${BASE}/users?page=0&size=1`).then(r => handleResponse<any>(r)),
    fetchWithAuth(`${BASE}/products?page=0&size=1`).then(r => handleResponse<any>(r)),
  ]);

  const recentOrders = (ordersPage.content ?? []) as any[];
  const totalRevenue = recentOrders.reduce((sum: number, o: any) => sum + (Number(o.finalAmount) || 0), 0);

  return {
    totalOrders: ordersPage.totalElements ?? 0,
    totalUsers: usersPage.totalElements ?? 0,
    totalProducts: productsPage.totalElements ?? 0,
    totalRevenue,
    recentOrders: recentOrders.slice(0, 5),
  };
};

// --- FILE UPLOADS ---
export const adminUploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithAuth(`${BASE}/v1/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorText = 'Upload failed';
    try {
      const errRes = await res.json();
      errorText = errRes.message || errRes.error || JSON.stringify(errRes);
    } catch (e) {
      errorText = await res.text();
    }
    throw new Error(`Server (500): ${errorText}`);
  }
  return res.json();
};
