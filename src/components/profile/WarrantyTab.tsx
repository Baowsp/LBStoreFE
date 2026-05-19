import { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WarrantyTabProps {
  warrantyItems: any[];
}

export const WarrantyTab = ({ warrantyItems }: WarrantyTabProps) => {
  const WARRANTY_STAGES = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "RETURNED"];
  const [activeWarrantyStage, setActiveWarrantyStage] = useState("IN_PROGRESS");

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
      <h2 className="text-xl font-black text-gray-800 uppercase italic mb-6">Tiến độ bảo hành</h2>

      {/* Tabs trạng thái bảo hành */}
      <div className="flex flex-wrap gap-2 mb-6">
        {WARRANTY_STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveWarrantyStage(stage)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeWarrantyStage === stage
                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {warrantyItems.filter(item => item.status === activeWarrantyStage).length > 0 ? (
          warrantyItems.filter(item => item.status === activeWarrantyStage).map(item => {
            const currentStageIndex = WARRANTY_STAGES.indexOf(item.status);

            return (
              <div key={item.id} className="p-6 border rounded-3xl border-gray-100 bg-gray-50/50">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <img src={item.productItem?.productVariant?.imageURL || 'https://via.placeholder.com/150'} className="w-20 h-20 object-contain mix-blend-multiply" alt="product" />
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-gray-800">{item.productItem?.productVariant?.product?.name || `Phiếu BH ${item.ticketNumber}`}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Serial/IMEI: {item.productItem?.serialNumber || item.productItem?.imei || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">Ngày tiếp nhận: {new Date(item.receiveDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-xs text-gray-500 mt-1 text-red-600 italic">{item.issueDescription}</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase block text-center mb-1">Trạng thái</span>
                    <span className="text-sm font-black text-red-600 block text-center">{item.status}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative px-2 md:px-4">
                  <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                  <div
                    className="absolute top-4 left-0 h-1 bg-red-600 rounded-full z-0 transition-all duration-1000"
                    style={{ width: `${(currentStageIndex / (WARRANTY_STAGES.length - 1)) * 100}%` }}
                  ></div>

                  <div className="relative z-10 flex justify-between">
                    {WARRANTY_STAGES.map((stage, index) => {
                      const isCompleted = index <= currentStageIndex;
                      const isCurrent = index === currentStageIndex;

                      return (
                        <div key={index} className="flex flex-col items-center gap-3 w-1/4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all bg-white ${
                            isCompleted ? 'border-red-600 text-red-600' : 'border-gray-300 text-gray-300'
                          }`}>
                            {isCompleted ? <CheckCircle2 size={16} fill="#fee2e2" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase text-center ${
                            isCurrent ? 'text-red-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Không có thiết bị nào ở trạng thái này.</p>
          </div>
        )}
      </div>
    </div>
  );
};
