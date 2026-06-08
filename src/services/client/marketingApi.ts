import { API_BASE_URL, fetchWithAuth, handleResponse, getCleanImageUrl } from '../core/apiClient';

// --- Vouchers ---
export const fetchVouchers = async (page = 0, size = 10): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/vouchers?page=${page}&size=${size}`);
        if (!response.ok) throw new Error("Failed to fetch vouchers");
        return await response.json();
    } catch (error) {
        console.error("Error fetching vouchers", error);
        return { content: [] };
    }
};

export const fetchVoucherById = async (id: string): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/${id}`);
        if (!response.ok) throw new Error("Voucher not found");
        return await response.json();
    } catch (error) {
        console.error("Error fetching voucher", error);
        return null;
    }
};

export const createVoucher = async (voucher: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/vouchers`, {
            method: 'POST',
            body: JSON.stringify(voucher)
        });
        if (!response.ok) throw new Error("Failed to create voucher");
        return await response.json();
    } catch (error) {
        console.error("Error creating voucher", error);
        throw error;
    }
};

export const updateVoucher = async (id: string, voucher: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(voucher)
        });
        if (!response.ok) throw new Error("Failed to update voucher");
        return await response.json();
    } catch (error) {
        console.error("Error updating voucher", error);
        throw error;
    }
};

export const deleteVoucher = async (id: string): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting voucher", error);
        return false;
    }
};

export const applyVoucher = async (code: string, orderAmount: number): Promise<any> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/apply`, {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount })
    });
    return await handleResponse(response);
};

// --- Promotions ---
export interface PromotionProductInfo { id: number; name: string; slug: string; }
export interface PromotionCategoryInfo { id: number; name: string; slug: string; }

export interface Promotion {
    id: number;
    name: string;
    description?: string;
    discountPercentage?: number;
    fixedDiscountAmount?: number;
    /** "PERCENT" | "FIXED" */
    discountType: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    showOnHomepage: boolean;
    createdAt?: string;
    updatedAt?: string;
    products: PromotionProductInfo[];
    categories: PromotionCategoryInfo[];
}

export interface PromotedProduct {
    id: number;
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    category?: string;
    categorySlug?: string;
    originalPrice: number;
    promotionalPrice: number;
    discountPercentage?: number;
    fixedDiscountAmount?: number;
    /** "PERCENT" | "FIXED" */
    discountType: string;
    promotionName: string;
    promotionId: number;
    showOnHomepage: boolean;
    variants: {
        id: number;
        storage: string;
        originalPrice: number;
        discountedPrice: number | null;
        promotionalPrice: number;
        stockQuantity: number;
        thumbnailUrl: string;
        variantColors: { id: number; color: string; stockQuantity: number; imageUrl: string }[];
    }[];
}

export const fetchPromotions = async (): Promise<Promotion[]> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/promotions`);
        return await handleResponse<Promotion[]>(response);
    } catch (error) {
        console.error('Error fetching promotions', error);
        return [];
    }
};

export const fetchPromotionById = async (id: number): Promise<Promotion | null> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/promotions/${id}`);
        return await handleResponse<Promotion>(response);
    } catch (error) {
        console.error('Error fetching promotion', error);
        return null;
    }
};

export const fetchActivePromotions = async (): Promise<Promotion[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/promotions/active`);
        if (!response.ok) throw new Error('Failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching active promotions', error);
        return [];
    }
};

export const fetchPromotedProducts = async (): Promise<PromotedProduct[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/promotions/products`);
        if (!response.ok) throw new Error('Failed');
        const data: PromotedProduct[] = await response.json();
        return data.map(p => ({
            ...p,
            variants: p.variants.map(v => ({
                ...v,
                thumbnailUrl: getCleanImageUrl(v.thumbnailUrl),
                variantColors: v.variantColors.map(c => ({
                    ...c,
                    imageUrl: getCleanImageUrl(c.imageUrl),
                })),
            })),
        }));
    } catch (error) {
        console.error('Error fetching promoted products', error);
        return [];
    }
};

export const createPromotion = async (data: {
    name: string;
    description?: string;
    discountPercentage?: number;
    fixedDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    productIds: number[];
    categoryIds: number[];
}): Promise<Promotion> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/promotions`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return await handleResponse<Promotion>(response);
};

export const updatePromotion = async (id: number, data: {
    name: string;
    description?: string;
    discountPercentage?: number;
    fixedDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    productIds: number[];
    categoryIds: number[];
}): Promise<Promotion> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/promotions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return await handleResponse<Promotion>(response);
};

export const deletePromotion = async (id: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/promotions/${id}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting promotion', error);
        return false;
    }
};
