import type { Product } from '../../types/product';
import { API_BASE_URL, getCleanImageUrl } from '../core/apiClient';

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
    number: number;
}

export interface BackendPromotion {
    id: number;
    discountPercentage?: number;
    fixedDiscountAmount?: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
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
    promotion?: BackendPromotion;
}

export const mapBackendProductToFrontend = (bp: BackendProduct): Product => {
    const firstVariant = bp.variants?.[0] ?? null;
    const firstColor = firstVariant?.variantColors?.[0] ?? null;

    const rawImage =
        firstColor?.imageUrl ||
        firstVariant?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';

    const image = getCleanImageUrl(rawImage);

    // Áp dụng khuyến mãi động nếu có
    if (bp.promotion && bp.promotion.isActive) {
        const now = new Date();
        const start = bp.promotion.startDate ? new Date(bp.promotion.startDate) : null;
        const end = bp.promotion.endDate ? new Date(bp.promotion.endDate) : null;
        const isStarted = !start || start <= now;
        const isNotEnded = !end || end > now;

        if (isStarted && isNotEnded) {
            const pct = bp.promotion.discountPercentage || 0;
            const fixed = bp.promotion.fixedDiscountAmount || 0;
            
            bp.variants.forEach(v => {
                if (fixed > 0) {
                    v.discountedPrice = Math.max(0, v.originalPrice - fixed);
                } else if (pct > 0) {
                    v.discountedPrice = Math.max(0, Math.round(v.originalPrice * (1 - pct / 100)));
                }
            });
        }
    }

    const price = firstVariant
        ? (firstVariant.discountedPrice ?? firstVariant.originalPrice)
        : 0;

    const originalPrice = firstVariant?.originalPrice ?? 0;

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
            thumbnailUrl: getCleanImageUrl(v.thumbnailUrl),
            variantColors: (v.variantColors ?? []).map(c => ({
                id: c.id,
                color: c.color,
                stockQuantity: c.stockQuantity,
                imageUrl: getCleanImageUrl(c.imageUrl),
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
        const response = await fetch(`${API_BASE_URL}/products?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
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
