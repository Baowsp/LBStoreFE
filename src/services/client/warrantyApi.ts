import { API_BASE_URL, fetchWithAuth } from '../core/apiClient';

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
