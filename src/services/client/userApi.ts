import { API_BASE_URL, fetchWithAuth, handleResponse } from '../core/apiClient';

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
