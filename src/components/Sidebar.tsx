import { Smartphone, Laptop, Tablet, Watch, Headphones, Speaker, Cpu } from 'lucide-react';

const categories = [
  { icon: <Smartphone size={18} />, name: "Điện thoại" },
  { icon: <Laptop size={18} />, name: "Laptop" },
  { icon: <Tablet size={18} />, name: "Máy tính bảng" },
  { icon: <Watch size={18} />, name: "Đồng hồ" },
  { icon: <Headphones size={18} />, name: "Âm thanh" },
  { icon: <Cpu size={18} />, name: "Linh kiện máy tính" },
];

export const Sidebar = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 h-full">
      {categories.map((cat, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-600 group-hover:text-cps">{cat.icon}</span>
            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
          </div>
          <span className="text-gray-400 text-xs">›</span>
        </div>
      ))}
    </div>
  );
};