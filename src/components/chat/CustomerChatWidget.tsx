import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService, ChatMessage, ChatRoom } from '../../services/chatService';

export const CustomerChatWidget = () => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (room && isOpen && user) {
            chatService.connect(room.id, (msg) => {
                setMessages((prev) => [...prev, msg]);
                chatService.markRoomAsRead(room.id, user.id, true);
            });
        }
        return () => {
            chatService.disconnect();
        };
    }, [room, isOpen, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Only render for logged-in users (sau tất cả hooks)
    if (!user) return null;

    const toggleChat = async () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen && !room) {
            try {
                const fetchedRoom = await chatService.getCustomerRoom(user.id);
                setRoom(fetchedRoom);
                const history = await chatService.getChatHistory(fetchedRoom.id);
                setMessages(history);
                await chatService.markRoomAsRead(fetchedRoom.id, user.id, true);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
            }
        }
    };

    const handleSend = () => {
        if (!newMessage.trim() || !room) return;
        chatService.sendMessage(room.id, user.id, newMessage);
        setNewMessage('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col border border-gray-100" style={{ height: '500px', maxHeight: '80vh' }}>
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                        <div>
                            <h3 className="font-semibold text-lg">Hỗ trợ khách hàng</h3>
                            <p className="text-xs text-blue-100">
                                {room?.employeeName ? `Đang chat với ${room.employeeName}` : 'Đang chờ nhân viên...'}
                            </p>
                        </div>
                        <button onClick={toggleChat} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm mt-10">
                                Xin chào! Chúng tôi có thể giúp gì cho bạn?
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMine = msg.senderId === user.id;
                                return (
                                    <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={toggleChat}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center relative"
                >
                    <MessageCircle size={28} />
                    {room && !room.readByCustomer && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </button>
            )}
        </div>
    );
};
