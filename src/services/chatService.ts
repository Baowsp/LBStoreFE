import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL, fetchWithAuth, handleResponse } from './core/apiClient';
import { useAuthStore } from '../store/useAuthStore';

const WS_URL = API_BASE_URL.replace('/api', '/ws/chat');

export interface ChatMessage {
    id?: number;
    roomId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
}

export interface ChatRoom {
    id: string;
    customerId: string;
    customerName: string;
    employeeId: string | null;
    employeeName: string | null;
    status: 'WAITING' | 'ACTIVE' | 'CLOSED';
    lastMessageTime: string;
    lastMessage?: string;
    readByCustomer: boolean;
    readByEmployee: boolean;
}

class ChatService {
    private client: Client | null = null;
    private messageCallback: ((msg: ChatMessage) => void) | null = null;
    private currentRoomId: string | null = null;

    connect(roomId: string, onMessageReceived: (msg: ChatMessage) => void) {
        if (this.client?.active && this.currentRoomId === roomId) {
            this.messageCallback = onMessageReceived;
            return;
        }

        this.disconnect();
        this.currentRoomId = roomId;
        this.messageCallback = onMessageReceived;

        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                this.client?.subscribe(`/topic/room/${roomId}`, (message) => {
                    if (message.body && this.messageCallback) {
                        const parsedMessage: ChatMessage = JSON.parse(message.body);
                        this.messageCallback(parsedMessage);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.currentRoomId = null;
        }
    }

    sendMessage(roomId: string, senderId: string, content: string) {
        if (this.client && this.client.active) {
            this.client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify({ roomId, senderId, content }),
            });
        } else {
            console.error('STOMP client is not connected');
        }
    }

    // REST APIs
    async getCustomerRoom(customerId: string): Promise<ChatRoom> {
        return handleResponse(await fetchWithAuth(`${API_BASE_URL}/chat/room?customerId=${customerId}`));
    }

    async getAdminRooms(adminId: string, page = 0, size = 20): Promise<{ content: ChatRoom[]; totalPages: number }> {
        return handleResponse(await fetchWithAuth(`${API_BASE_URL}/admin/chat/rooms?adminId=${adminId}&page=${page}&size=${size}`));
    }

    async assignAdminToRoom(roomId: string, adminId: string): Promise<ChatRoom> {
        return handleResponse(await fetchWithAuth(`${API_BASE_URL}/admin/chat/rooms/${roomId}/assign?adminId=${adminId}`, { method: 'POST' }));
    }

    async closeRoom(roomId: string, adminId: string): Promise<ChatRoom> {
        return handleResponse(await fetchWithAuth(`${API_BASE_URL}/admin/chat/rooms/${roomId}/close?adminId=${adminId}`, { method: 'POST' }));
    }

    async releaseRoom(roomId: string, adminId: string): Promise<void> {
        await fetchWithAuth(`${API_BASE_URL}/admin/chat/rooms/${roomId}/release?adminId=${adminId}`, { method: 'POST' });
    }

    async getChatHistory(roomId: string): Promise<ChatMessage[]> {
        return handleResponse(await fetchWithAuth(`${API_BASE_URL}/chat/rooms/${roomId}/messages`));
    }

    async markRoomAsRead(roomId: string, userId: string, isCustomer: boolean): Promise<void> {
        await fetchWithAuth(`${API_BASE_URL}/chat/rooms/${roomId}/read?userId=${userId}&isCustomer=${isCustomer}`, { method: 'POST' });
    }
}

export const chatService = new ChatService();
