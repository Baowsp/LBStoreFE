import { useAuthStore } from '../../store/useAuthStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Chuyển đổi URL ảnh từ backend (localhost hoặc IP thật) thành đường dẫn tương đối /uploads/...
 */
export const getCleanImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    const match = url.match(/\/uploads\/(.+)$/);
    if (match) {
        return `/uploads/${match[1]}`;
    }
    return url;
};

/**
 * Kiểm tra JWT token đã hết hạn chưa
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

/**
 * Tự động đăng xuất và redirect về trang đăng nhập
 * Dùng CustomEvent thay vì window.location.href để tránh hard reload gây màn hình trắng
 */
export const forceLogout = () => {
    useAuthStore.getState().logout();
    window.dispatchEvent(new CustomEvent('force-logout'));
};

/**
 * Helper: Tự động đính kèm JWT Token vào header Authorization.
 * Tự động đăng xuất nếu token hết hạn hoặc server trả 401/403.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = useAuthStore.getState().token;

    if (token && isTokenExpired(token)) {
        forceLogout();
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
        forceLogout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
};

/**
 * Xử lý phản hồi chung, kiểm tra Body trước khi parse JSON
 */
export async function handleResponse<T>(res: Response): Promise<T> {
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
