// src/components/SpecTable.tsx
interface SpecItem {
  label: string;
  value: string;
}

interface SpecTableProps {
  specs: SpecItem[] | string | undefined; // Hỗ trợ cả mảng và string
}

export const SpecTable = ({ specs }: SpecTableProps) => {
  let displaySpecs: SpecItem[] = [];
  let isPlainString = false;

  if (Array.isArray(specs)) {
    displaySpecs = specs;
  } else if (typeof specs === 'string' && specs.trim()) {
    try {
      const parsed = JSON.parse(specs);
      if (Array.isArray(parsed)) {
        displaySpecs = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        displaySpecs = Object.entries(parsed).map(([label, value]) => ({
          label,
          value: String(value)
        }));
      } else {
        isPlainString = true;
      }
    } catch (e) {
      isPlainString = true;
    }
  }

  const isEmpty = !specs || (displaySpecs.length === 0 && !isPlainString);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-black mb-4 uppercase text-gray-800 tracking-tight">Thông số kỹ thuật</h2>
      <div className="rounded-2xl border border-gray-50 overflow-hidden">
        {isEmpty ? (
          <div className="p-8 text-center text-gray-400 italic text-sm bg-gray-50">
            Chưa có thông số kỹ thuật cho sản phẩm này.
          </div>
        ) : !isPlainString ? (
          displaySpecs.map((item, index) => (
            <div 
              key={index} 
              className={`flex justify-between p-3.5 text-[13px] ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <span className="text-gray-500 w-1/3 font-medium">{item.label}</span>
              <span className="text-gray-800 font-bold w-2/3 text-right">{item.value}</span>
            </div>
          ))
        ) : (
          <div className="p-4 text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50">
            {typeof specs === 'string' ? specs : ''}
          </div>
        )}
      </div>
      {!isEmpty && displaySpecs.length > 0 && (
        <button className="w-full mt-4 py-3 text-xs text-blue-600 font-black uppercase border border-blue-100 rounded-xl hover:bg-blue-50 transition-all hover:shadow-sm">
          Xem cấu hình chi tiết
        </button>
      )}
    </div>
  );
};