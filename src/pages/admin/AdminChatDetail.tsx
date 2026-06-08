import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService, type ChatRoom, type ChatMessage } from '../../services/chatService';
import { Send, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export const AdminChatDetail = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            if (!user || !roomId) return;
            
            try {
                // Fetch initial room info (could be done via API, here we just get history and assume room is valid)
                // To get room details, we'd ideally have a getRoomById API, but we can just use the history to populate basics
                // Let's get history directly:
                const history = await chatService.getChatHistory(roomId);
                setMessages(history);
                await chatService.markRoomAsRead(roomId, user.id, false);
                
                chatService.connect(roomId, (msg) => {
                    setMessages((prev) => [...prev, msg]);
                    chatService.markRoomAsRead(roomId, user.id, false);
                });
            } catch (error) {
                console.error("Failed to init chat detail:", error);
                alert("Lỗi tải lịch sử phòng chat");
                navigate('/admin/chat');
            }
        };

        initChat();

        return () => {
            chatService.disconnect();
        };
    }, [roomId, user, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !roomId || !user) return;
        chatService.sendMessage(roomId, user.id, newMessage);
        setNewMessage('');
    };

    const handleCloseRoom = async () => {
        if (!roomId || !user) return;
        if (window.confirm('Bạn có chắc chắn muốn kết thúc hỗ trợ phòng này?')) {
            try {
                await chatService.closeRoom(roomId, user.id);
                navigate('/admin/chat');
            } catch (error: any) {
                alert(error.message || 'Có lỗi xảy ra');
            }
        }
    };

    const handleBack = async () => {
        if (roomId && user) {
            try {
                await chatService.releaseRoom(roomId, user.id);
            } catch (error) {
                console.error(error);
            }
        }
        navigate('/admin/chat');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Phòng hỗ trợ #{roomId?.split('-')[0]}</h3>
                    </div>
                </div>
                <button
                    onClick={handleCloseRoom}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                    Kết thúc hỗ trợ
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Chưa có tin nhắn nào.</div>
                ) : (
                    messages.map((msg, index) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                            <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-gray-500 mb-1">{isMine ? 'Bạn' : msg.senderName}</span>
                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">
                                    {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
