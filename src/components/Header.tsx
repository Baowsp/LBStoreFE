import { Search, ShoppingCart, MapPin, Phone, User, LogOut, ShieldCheck, ChevronDown, UserCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isTokenExpired } from '../services/api';

export const Header = () => {
  const totalItems = useCartStore((state) => state.totalItems());
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- LOGIC ĐĂNG NHẬP THỰC TẾ ---
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (isTokenExpired(token)) {
        logout();
      }
    }
  }, [isAuthenticated, token, logout]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="bg-cps text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">

        {/* 1. Logo */}
        <Link to="/" className="text-2xl font-black italic tracking-tighter flex-shrink-0">
          LB<span className="not-italic">Store</span>
        </Link>

        {/* 2. Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Bạn cần tìm gì?"
            className="w-full py-2.5 px-4 pr-10 rounded-xl text-black text-sm outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
            <Search size={20} />
          </button>
        </form>

        {/* 3. Menus */}
        <div className="flex items-center gap-3 lg:gap-5 text-[12px]">

          {/* Gọi mua hàng & Cửa hàng (Ẩn trên mobile nhỏ) */}
          <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors">
            <Phone size={20} />
            <div className="leading-tight">
              <p>Gọi mua hàng</p>
              <p className="font-bold">1800.2097</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors">
            <MapPin size={20} />
            <div className="leading-tight">
              <p>Cửa hàng</p>
              <p className="font-bold">Gần bạn</p>
            </div>
          </div>

          {/* GIỎ HÀNG */}
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 p-2.5 rounded-xl font-bold relative transition-all"
          >
            <ShoppingCart size={22} />
            <span className="hidden sm:block">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-cps animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* --- PHẦN USER: THAY ĐỔI THEO TRẠNG THÁI ĐĂNG NHẬP --- */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-1.5 pr-3 rounded-xl border border-white/20 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white text-cps flex items-center justify-center font-black text-sm shadow-inner uppercase">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="opacity-70 text-[10px] leading-none">Xin chào,</p>
                  <p className="font-bold text-[11px] leading-tight truncate max-w-[80px]">{user?.fullName || 'Khách hàng'}</p>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">

                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-b border-gray-50">
                        <ShieldCheck size={18} /> Trang quản trị
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <UserCircle size={18} /> Tài khoản của tôi
                    </Link>



                    <div className="border-t border-gray-50 mt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* KHI CHƯA ĐĂNG NHẬP */
            <Link to="/login" className="flex flex-col items-center gap-0.5 hover:bg-white/10 p-2 rounded-xl transition-all">
              <User size={22} />
              <span className="text-[10px] font-bold uppercase">Đăng nhập</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};