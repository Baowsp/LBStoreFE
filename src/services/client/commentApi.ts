import type { ProductComment } from '../../types/product';
import { API_BASE_URL, fetchWithAuth } from '../core/apiClient';

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
        const data = await response.json();
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
