import { API_BASE_URL, fetchWithAuth, getCleanImageUrl } from '../core/apiClient';

export const fetchBanners = async (page?: number, size?: number): Promise<any> => {
    try {
        const p = page !== undefined ? page : 0;
        const s = size !== undefined ? size : 9999;
        const url = `${API_BASE_URL}/v1/banners?page=${p}&size=${s}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch banners: ${response.status}`);
        }
        const data = await response.json();

        const cleanBanner = (b: any) => ({
            ...b,
            imageUrl: getCleanImageUrl(b.imageUrl)
        });

        if (page !== undefined && size !== undefined) {
            return {
                ...data,
                content: (data.content || []).map(cleanBanner)
            };
        }

        return (data.content || []).map(cleanBanner);
    } catch (error) {
        console.error('[fetchBanners] Lỗi:', error);
        if (page !== undefined && size !== undefined) {
            return { content: [], totalPages: 0, totalElements: 0, size: size, number: page };
        }
        return [];
    }
};

export const createBanner = async (bannerData: FormData): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/banners`, {
            method: 'POST',
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
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/banners/${id}`, {
            method: 'PUT',
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
        const data = await response.json();
        return (data || []).map((db: any) => ({
            ...db,
            banner: db.banner ? { ...db.banner, imageUrl: getCleanImageUrl(db.banner.imageUrl) } : null
        }));
    } catch (error) {
        console.error("Error fetching display banners:", error);
        return [];
    }
};

export const createDisplayBanner = async (bannerId: number, data: any): Promise<any> => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/v1/display-banners?bannerId=${bannerId}`, {
            method: 'POST',
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
        const url = bannerId
            ? `${API_BASE_URL}/v1/display-banners/${id}?bannerId=${bannerId}`
            : `${API_BASE_URL}/v1/display-banners/${id}`;

        const response = await fetchWithAuth(url, {
            method: 'PUT',
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
