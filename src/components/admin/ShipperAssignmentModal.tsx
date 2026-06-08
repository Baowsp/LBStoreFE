import { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2, RefreshCw } from 'lucide-react';
import { adminFetchAvailableShippers, adminAssignShipper } from '../../services/adminApi';

const VEHICLE_LABEL: Record<string, string> = {
    MOTORBIKE: '🏍️ Xe máy',
    TRUCK: '🚛 Xe tải',
};

interface ShipperAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: Set<string>;
    onAssignFinished: (result: { successCount: number; failCount: number }) => void;
}

export const ShipperAssignmentModal = ({
    isOpen,
    onClose,
    selectedIds,
    onAssignFinished,
}: ShipperAssignmentModalProps) => {
    const [shippers, setShippers] = useState<any[]>([]);
    const [shippersLoading, setShippersLoading] = useState(false);
    const [selectedShipper, setSelectedShipper] = useState<any>(null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedShipper(null);
            setShippersLoading(true);
            adminFetchAvailableShippers()
                .then(data => {
                    setShippers(Array.isArray(data) ? data : []);
                })
                .catch(() => {
                    setShippers([]);
                })
                .finally(() => {
                    setShippersLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirmAssign = async () => {
        if (!selectedShipper) return;
        setAssigning(true);
        let successCount = 0;
        let failCount = 0;
        for (const orderId of Array.from(selectedIds)) {
            try {
                await adminAssignShipper(orderId, selectedShipper.id);
                successCount++;
            } catch {
                failCount++;
            }
        }
        setAssigning(false);
        onAssignFinished({ successCount, failCount });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !assigning && onClose()} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-gray-800">Chọn nhân viên giao hàng</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Phân công cho <span className="font-bold text-amber-600">{selectedIds.size} đơn hàng</span>
                        </p>
                    </div>
                    <button
                        onClick={() => !assigning && onClose()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Shipper List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {shippersLoading ? (
                        <div className="py-10 text-center text-gray-400 text-sm">Đang tải danh sách nhân viên...</div>
                    ) : shippers.length === 0 ? (
                        <div className="py-10 text-center">
                            <Truck size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">Chưa có nhân viên giao hàng nào</p>
                            <p className="text-gray-400 text-xs mt-1">Vào mục "NV Giao hàng" để thêm mới</p>
                        </div>
                    ) : shippers.map((s: any) => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedShipper(s)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4
                                ${selectedShipper?.id === s.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0
                                ${selectedShipper?.id === s.id ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                {s.employee?.user?.fullName?.charAt(0) ?? '?'}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-800 text-sm truncate">
                                    {s.employee?.user?.fullName ?? 'Không rõ tên'}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {VEHICLE_LABEL[s.vehicleType] ?? s.vehicleType}
                                    &nbsp;·&nbsp;
                                    <span className="font-mono font-bold">{s.licensePlate}</span>
                                </p>
                            </div>

                            {selectedShipper?.id === s.id && (
                                <CheckCircle2 size={22} className="text-green-500 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
                    <button
                        onClick={() => !assigning && onClose()}
                        disabled={assigning}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirmAssign}
                        disabled={!selectedShipper || assigning}
                        className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                    >
                        {assigning ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Truck size={16} /> Xác nhận đi giao
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
