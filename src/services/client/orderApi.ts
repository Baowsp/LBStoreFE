import { API_BASE_URL, fetchWithAuth, handleResponse } from '../core/apiClient';

export const createOnlineOrder = async (orderPayload: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/online-orders`, {
            method: 'POST',
            body: JSON.stringify(orderPayload)
        });
        if (!response.ok) throw new Error("Tạo đơn hàng thất bại");
        return await handleResponse(response);
    } catch (error) {
        console.error("Lỗi tạo đơn hàng", error);
        throw error;
    }
};

export const fetchOnlineOrdersByCustomer = async (customerId: number): Promise<any[]> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/online-orders/customer/${customerId}`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Lỗi lấy lịch sử mua hàng", error);
        return [];
    }
};

/**
 * Khách hàng xác nhận đã nhận hàng (chỉ khi đơn ở trạng thái SHIPPING)
 */
export const confirmOrderDelivered = async (orderId: string): Promise<any> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/online-orders/${orderId}/confirm-delivered`, {
        method: 'POST',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Xác nhận nhận hàng thất bại');
    }
    return await response.json();
};

export const createPayOSLink = async (payload: {
    orderCode: number;
    amount: number;
    description: string;
    items: { name: string; quantity: number; price: number }[];
}): Promise<{ checkoutUrl: string; qrCode: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/create-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể tạo link thanh toán PayOS");
    }
    return await response.json();
};

