import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Box, ShoppingCart, Users, Settings, LogOut,
  Bell, PackagePlus, Truck, ShieldCheck, Image, UserCircle, Package, ChevronDown, Tag, Layout
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState } from 'react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/admin' },
    { icon: <Box size={20} />, label: 'Sản phẩm', path: '/admin/products' },
    { icon: <ShoppingCart size={20} />, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: <ShieldCheck size={20} />, label: 'Bảo hành', path: '/admin/warranties' },
    { icon: <Users size={20} />, label: 'Khách hàng', path: '/admin/users' },
    { icon: <Image size={20} />, label: 'Thư viện Banner', path: '/admin/banners' },
    { icon: <Layout size={20} />, label: 'Bố cục Website', path: '/admin/display-banners' },
    { icon: <Tag size={20} />, label: 'Quản lý Voucher', path: '/admin/vouchers' },
    { icon: <Settings size={20} />, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-red-500 italic uppercase">CPS Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-sm font-medium text-slate-300 hover:text-white"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="font-bold text-gray-700">Chào Admin, buổi sáng tốt lành!</h2>
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* USER MENU DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-2xl transition-all border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-100 uppercase">
                  {user?.fullName ? user.fullName.charAt(0) : 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-gray-400 text-[10px] leading-none uppercase font-black tracking-widest">Admin</p>
                  <p className="font-black text-gray-800 text-xs truncate max-w-[100px]">{user?.fullName || 'Administrator'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180 text-red-600' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 py-3 overflow-hidden animate-in fade-in zoom-in duration-200">

                    <div className="px-5 py-3 border-b border-gray-50 mb-2">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Đang đăng nhập với</p>
                      <p className="text-sm font-black text-gray-800 truncate">{user?.email || 'admin@example.com'}</p>
                    </div>

                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all">
                      <UserCircle size={18} /> Tài khoản cá nhân
                    </Link>



                    <div className="border-t border-gray-50 mt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-4 text-sm font-black text-gray-400 hover:text-red-600 hover:bg-red-50 w-full text-left transition-all uppercase tracking-widest"
                      >
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};