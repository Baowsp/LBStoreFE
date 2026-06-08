import { API_BASE_URL } from '../core/apiClient';

export const loginUser = async (email: string, password: string): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Xác thực thất bại');
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || 'Lỗi hệ thống');
    }
};

export const registerUser = async (userData: any): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Đăng ký thất bại');
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message || 'Lỗi hệ thống');
    }
};

export const sendOtp = async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể gửi mã OTP');
    }
};

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Mã xác nhận không đúng hoặc đã hết hạn');
    }
    return true;
};
