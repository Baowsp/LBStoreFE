import { User, Package, ShieldCheck, MapPin, Lock, ChevronRight, Camera } from 'lucide-react';

interface ProfileSidebarProps {
  userInfo: { name: string; memberClass: string; };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProfileSidebar = ({ userInfo, activeTab, setActiveTab }: ProfileSidebarProps) => {
  const menuItems = [
    { id: 'account', icon: <User size={20} />, label: "Thông tin tài khoản" },
    { id: 'orders', icon: <Package size={20} />, label: "Lịch sử mua hàng" },
    { id: 'warranty', icon: <ShieldCheck size={20} />, label: "Tra cứu bảo hành" },
    { id: 'address', icon: <MapPin size={20} />, label: "Sổ địa chỉ" },
    { id: 'password', icon: <Lock size={20} />, label: "Đổi mật khẩu" },
  ];

  return (
    <div className="lg:col-span-3 space-y-6">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl font-black">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full border-2 border-white hover:bg-red-600">
            <Camera size={14} />
          </button>
        </div>
        <h3 className="mt-4 font-black text-gray-800">{userInfo.name}</h3>
        <span className="mt-1 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">
          {userInfo.memberClass}
        </span>
      </div>

      <div className="bg-white overflow-hidden rounded-[2rem] shadow-sm border border-gray-100 py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-6 py-4 transition-all ${
              activeTab === item.id ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={activeTab === item.id ? 'text-red-600' : 'text-gray-400'}>{item.icon}</span>
              <span className="text-sm font-bold">{item.label}</span>
            </div>
            <ChevronRight size={16} className="opacity-30" />
          </button>
        ))}
      </div>
    </div>
  );
};
