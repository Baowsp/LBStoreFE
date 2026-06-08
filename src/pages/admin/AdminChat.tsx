import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService, type ChatRoom } from '../../services/chatService';
import { UserCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminChat = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRooms = async (pageNumber = 0) => {
        if (!user) return;
        try {
            const data = await chatService.getAdminRooms(user.id, pageNumber);
            setRooms(data.content);
            setTotalPages(data.totalPages);
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        }
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(() => {
            fetchRooms(page);
        }, 10000);
        return () => clearInterval(interval);
    }, [user, page]);

    const handleSelectRoom = async (room: ChatRoom) => {
        if (!user) return;

        if (room.employeeId !== user.id) {
            try {
                await chatService.assignAdminToRoom(room.id, user.id);
                navigate(`/admin/chat/${room.id}`);
            } catch (error: any) {
                let displayMessage = 'Phòng chat này đã có nhân viên hỗ trợ.';
                try {
                    const errorObj = JSON.parse(error.message);
                    if (errorObj.message) {
                        displayMessage = errorObj.message;
                    }
                } catch (e) {
                    // Ignore JSON parse error
                }
                alert(displayMessage);
                return;
            }
        } else {
            navigate(`/admin/chat/${room.id}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách phòng hỗ trợ</h2>
            
            <div className="flex flex-col gap-4">
                {rooms.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        Không có phòng chat nào đang mở.
                    </div>
                ) : (
                    rooms.map(room => (
                        <div 
                            key={room.id}
                            onClick={() => handleSelectRoom(room)}
                            className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:shadow-md hover:border-blue-300 transition-all bg-white relative flex items-center justify-between"
                        >
                            {!room.readByEmployee && (
                                <span className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                            
                            <div className="flex items-center gap-4 flex-1 ml-4">
                                <UserCircle className="text-gray-400" size={40} />
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-800 text-base">{room.customerName}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${room.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                            {room.status === 'WAITING' ? 'Đang chờ' : `Hỗ trợ: ${room.employeeName}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 truncate max-w-xl">
                                        {room.lastMessage ? room.lastMessage : "Chưa có tin nhắn nào"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                                <span className="text-xs text-gray-400 font-medium">
                                    {new Date(room.lastMessageTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button 
                        disabled={page === 0} 
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 text-sm bg-gray-100 rounded-md text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                    >
                        Trang trước
                    </button>
                    <span className="text-sm font-medium text-gray-700">{page + 1} / {totalPages}</span>
                    <button 
                        disabled={page >= totalPages - 1} 
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 text-sm bg-gray-100 rounded-md text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};
