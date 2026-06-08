import { useAuthStore } from '../../store/useAuthStore';

export const ADMIN_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Chuyển đổi URL ảnh từ backend thành đường dẫn tương đối
 */
export const getCleanImageUrlAdmin = (url: string | null | undefined): string => {
  if (!url) return '';
  const match = url.match(/\/uploads\/(.+)$/);
  if (match) {
    return `/uploads/${match[1]}`;
  }
  return url;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const forceAdminLogout = () => {
  useAuthStore.getState().logout();
  if (!window.location.pathname.includes('/admin-login')) {
    window.location.href = '/admin-login';
  }
};

export const fetchAdminWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;

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

  if (response.status === 401 || response.status === 403) {
    forceAdminLogout();
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  return response;
};

export async function handleAdminResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text);
  } catch (e) {
    return text as unknown as T;
  }
}
