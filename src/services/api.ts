import type { Product, ProductComment } from '../types/product';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Kiểm tra JWT token đã hết hạn chưa bằng cách decode payload
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
 */
const forceLogout = () => {
    useAuthStore.getState().logout();
    // Tránh redirect loop nếu đã ở trang login
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
};

/**
 * Helper: Tự động đính kèm JWT Token vào header Authorization.
 * Nếu token hết hạn → tự động đăng xuất.
 * Nếu server trả 401/403 → tự động đăng xuất.
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = useAuthStore.getState().token;

    // Kiểm tra token hết hạn trước khi gọi API
    if (token && isTokenExpired(token)) {
        forceLogout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    // Xử lý token bị từ chối bởi server
    if (response.status === 401 || response.status === 403) {
        forceLogout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
};

/**
 * Helper: Xử lý phản hồi chung, kiểm tra Body trước khi parse JSON
 */
async function handleResponse<T>(res: Response): Promise<T> {
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

// ── Backend interfaces (khớp với Java models) ─────────────────────────────

export interface BackendProductVariantColor {
    id: number;
    color: string;
    stockQuantity: number;
    imageUrl: string;
}

export interface BackendProductVariant {
    id: number;
    sku: string;
    storage: string;
    originalPrice: number;
    discountedPrice: number | null;
    stockQuantity: number;
    thumbnailUrl: string;
    variantColors: BackendProductVariantColor[];
}

export interface BackendCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Current page index (0-based)
}

export interface BackendProduct {
    id: number;
    name: string;
    description: string;
    brand: { id: number; name: string };
    category: BackendCategory;
    slug: string;
    specs?: string;
    createdAt?: string;
    variants: BackendProductVariant[];
}

/**
 * Maps a backend Product (3-level) to the frontend Product interface
 */
export const mapBackendProductToFrontend = (bp: BackendProduct): Product => {
    const firstVariant = bp.variants?.[0] ?? null;
    const firstColor = firstVariant?.variantColors?.[0] ?? null;

    // Ưu tiên: image từ màu đầu tiên → thumbnail variant → placeholder
    const image =
        firstColor?.imageUrl ||
        firstVariant?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';

    // Giá bán thực tế (discounted nếu có, fallback original)
    const price = firstVariant
        ? (firstVariant.discountedPrice ?? firstVariant.originalPrice)
        : 0;

    const originalPrice = firstVariant?.originalPrice ?? 0;

    // Tính % giảm giá nếu có
    const discount =
        firstVariant?.discountedPrice && firstVariant.discountedPrice < firstVariant.originalPrice
            ? `-${Math.round((1 - firstVariant.discountedPrice / firstVariant.originalPrice) * 100)}%`
            : '';

    return {
        id: bp.id,
        name: bp.name,
        slug: bp.slug || '',
        brand: bp.brand?.name ?? 'Unknown',
        category: bp.category?.name ?? 'Unknown',
        categorySlug: bp.category?.slug ?? '',
        description: bp.description ?? '',
        specs: bp.specs || '',
        createdAt: bp.createdAt,
        price,
        originalPrice,
        discount,
        image,
        variants: (bp.variants ?? []).map(v => ({
            id: v.id,
            storage: v.storage,
            originalPrice: v.originalPrice,
            discountedPrice: v.discountedPrice ?? null,
            stockQuantity: v.stockQuantity,
            thumbnailUrl: v.thumbnailUrl ?? '',
            variantColors: (v.variantColors ?? []).map(c => ({
                id: c.id,
                color: c.color,
                stockQuantity: c.stockQuantity,
                imageUrl: c.imageUrl ?? '',
            })),
        })),
        specDetails: [],
        comments: [],
        warrantyOptions: [
            { id: 1, name: 'Bảo hành tiêu chuẩn (12 tháng)', price: 0 },
            { id: 2, name: 'Bảo hành VIP (Rơi vỡ, rớt nước)', price: 890000 },
        ],
    };
};

export const fetchProductById = async (id: string | number): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.status}`);
        }
        const data = await response.json();
        return mapBackendProductToFrontend(data);
    } catch (error) {
        console.error("Error fetching product details:", error);
        return null;
    }
};

export const searchProductsByQuery = async (query: string, page = 0, size = 50): Promise<PagedResponse<Product>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`Failed to search products: ${response.status}`);
        }
        const data = await response.json();
        const backendProducts: BackendProduct[] = data.content || [];
        return {
            ...data,
            content: backendProducts.map(mapBackendProductToFrontend)
        };
    } catch (error) {
        console.error("Error searching products:", error);
        return { content: [], totalPages: 0, totalElements: 0, size: size, number: page };
    }
};

export const fetchProductsByCategory = async (slug: string, page = 0, size = 10): Promise<PagedResponse<Product>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${slug}?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category ${slug}: ${response.status}`);
        }
        const data = await response.json();
        const backendProducts: BackendProduct[] = data.content || [];
        return {
            ...data,
            content: backendProducts.map(mapBackendProductToFrontend)
        };
    } catch (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return { content: [], totalPages: 0, totalElements: 0, size, number: page };
    }
};

export const fetchProductsByCategoryName = async (name: string, size = 10): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category-name/${encodeURIComponent(name)}?page=0&size=${size}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category name ${name}: ${response.status}`);
        }
        const data = await response.json();
        const backendProducts: BackendProduct[] = data.content || [];
        return backendProducts.map(mapBackendProductToFrontend);
    } catch (error) {
        console.error(`Error fetching category name ${name}:`, error);
        return [];
    }
};

export const fetchProducts = async (page = 0, size = 10): Promise<PagedResponse<Product>> => {
    try {
        // Backend pagination endpoint (returns Page<Product>)
        const response = await fetch(`${API_BASE_URL}/products?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
        // Extract content from Pageable response
        const backendProducts: BackendProduct[] = data.content || [];
        return {
            ...data,
            content: backendProducts.map(mapBackendProductToFrontend)
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { content: [], totalPages: 0, totalElements: 0, size, number: page };
    }
};

export const fetchBanners = async (page?: number, size?: number): Promise<any> => {
    try {
        const p = page !== undefined ? page : 0;
        const s = size !== undefined ? size : 9999;
        const response = await fetch(`${API_BASE_URL}/v1/banners?page=${p}&size=${s}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch banners: ${response.status}`);
        }
        const data = await response.json();
        if (page !== undefined && size !== undefined) {
            return data;
        }
        return data.content || [];
    } catch (error) {
        console.error("Error fetching banners:", error);
        if (page !== undefined && size !== undefined) {
            return { content: [], totalPages: 0, totalElements: 0, size: size, number: page };
        }
        return [];
    }
};

export const createBanner = async (bannerData: FormData): Promise<any> => {
    try {
        const token = useAuthStore.getState().token;
        const response = await fetch(`${API_BASE_URL}/v1/banners`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: bannerData
        });
        if (!response.ok) throw new Error("Failed to create banner");
        return await response.json();
    } catch (error) {
        console.error("Error creating banner", error);
        throw error;
    }
};

export const updateBanner = async (id: number, bannerData: FormData): Promise<any> => {
    try {
        const token = useAuthStore.getState().token;
        const response = await fetch(`${API_BASE_URL}/v1/banners/${id}`, {
            method: 'PUT',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: bannerData
        });
        if (!response.ok) throw new Error("Failed to update banner");
        return await response.json();
    } catch (error) {
        console.error("Error updating banner", error);
        throw error;
    }
};

export const deleteBanner = async (id: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/banners/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting banner", error);
        return false;
    }
};

export const fetchDisplayBanners = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/display-banners`);
        if (!response.ok) throw new Error("Failed to fetch display banners");
        return await response.json();
    } catch (error) {
        console.error("Error fetching display banners:", error);
        return [];
    }
};

export const createDisplayBanner = async (bannerId: number, data: any): Promise<any> => {
    try {
        const token = useAuthStore.getState().token;
        const response = await fetch(`${API_BASE_URL}/v1/display-banners?bannerId=${bannerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to create display banner");
        return await response.json();
    } catch (error) {
        console.error("Error creating display banner", error);
        throw error;
    }
};

export const updateDisplayBanner = async (id: number, bannerId: number | null, data: any): Promise<any> => {
    try {
        const token = useAuthStore.getState().token;
        const url = bannerId 
            ? `${API_BASE_URL}/v1/display-banners/${id}?bannerId=${bannerId}`
            : `${API_BASE_URL}/v1/display-banners/${id}`;
            
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update display banner");
        return await response.json();
    } catch (error) {
        console.error("Error updating display banner", error);
        throw error;
    }
};

export const deleteDisplayBanner = async (id: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/display-banners/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting display banner", error);
        return false;
    }
};

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

        return await response.json(); // { token: "...", user: {...} }
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

export const fetchCommentsByProduct = async (productId: number): Promise<ProductComment[]> => {
    const mapOneComment = (c: any): ProductComment => ({
        id: c.id,
        user: c.userName || 'Ẩn danh',
        userId: c.userId,
        content: c.content,
        stars: c.stars || 5,
        date: new Date(c.createdAt).toLocaleDateString('vi-VN'),
        replies: (c.replies || []).map(mapOneComment)
    });

    try {
        const response = await fetch(`${API_BASE_URL}/v1/comments/product/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json(); // List<CommentResponse>
        return data.map(mapOneComment);
    } catch (error) {
        console.error("Error fetching comments", error);
        return [];
    }
};

export const checkUserCanComment = async (userId: string, productId: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/comments/can-comment?userId=${userId}&productId=${productId}`);
        if (!response.ok) return false;
        return await response.json();
    } catch {
        return false;
    }
};

export const createComment = async (commentData: {
    content: string,
    stars: number,
    productId: number,
    userId: string,
    parentId?: number | null
}): Promise<ProductComment> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
        if (!response.ok) throw new Error("Failed to post comment");
        const c = await response.json();
        return {
            id: c.id,
            user: c.userName || 'Ẩn danh',
            userId: c.userId,
            content: c.content,
            stars: c.stars || 5,
            date: new Date(c.createdAt).toLocaleDateString('vi-VN'),
            parentId: c.parentId,
            replies: []
        };
    } catch (error) {
        console.error("Error posting comment", error);
        throw error;
    }
};

export const deleteComment = async (id: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/comments/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting comment", error);
        return false;
    }
};

export const fetchCustomerByUserId = async (userId: string): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/customers/user/${userId}`);
        if (!response.ok) throw new Error("Customer not found");
        return await response.json();
    } catch (error) {
        console.error("Error fetching customer", error);
        return null;
    }
};

export const fetchAddressesByCustomerId = async (customerId: number): Promise<any[]> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/addresses/customer/${customerId}`);
        if (!response.ok) throw new Error("Addresses not found");
        return await response.json();
    } catch (error) {
        console.error("Error fetching addresses", error);
        return [];
    }
};

export const createAddress = async (addressData: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/addresses`, {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
        if (!response.ok) throw new Error("Failed to create address");
        return await response.json();
    } catch (error) {
        console.error("Error creating address", error);
        throw error;
    }
};

export const deleteAddress = async (id: number): Promise<boolean> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/addresses/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting address", error);
        return false;
    }
};

export const fetchWarrantyByCustomerId = async (customerId: number): Promise<any[]> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/warranty-tickets?customerId=${customerId}&page=0&size=50`);
        if (!response.ok) throw new Error("Warranty not found");
        const data = await response.json();
        return data.content || [];
    } catch (error) {
        console.error("Error fetching warranty tickets", error);
        return [];
    }
};

export const updateUserProfile = async (userId: string, data: { fullName: string, phoneNumber: string, email: string }): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update profile");
        return await response.json();
    } catch (error) {
        console.error("Error updating profile", error);
        throw error;
    }
};

export const changeUserPassword = async (userId: string, oldPassword: string, newPassword: string): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ oldPassword, newPassword })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Lỗi mật khẩu", error);
        throw error;
    }
};

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

export const fetchUserById = async (userId: string): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) throw new Error("User not found");
        return await response.json();
    } catch (error) {
        console.error("Error fetching user", error);
        return null;
    }
};
export const fetchCategories = async (): Promise<BackendCategory[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
};

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
