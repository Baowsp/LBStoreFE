import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { loginUser } from '../services/api';

export const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth, logout } = useAuthStore();

  // YÊU CẦU: Khi vào trang login-admin thì xóa jwt 
  useEffect(() => {
    logout();
  }, [logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ Email và Mật khẩu Quản trị.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      
      // YÊU CẦU: Chỉ đăng nhập ADMIN
      if (data.user?.role !== 'ADMIN') {
        logout(); // Xóa session vừa tạo nếu không phải admin
        throw new Error("Tài khoản của bạn không có quyền truy cập vùng Quản trị.");
      }

      setAuth(data.user, data.token);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sai thông tin đăng nhập Quản trị.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10">

        {/* Admin Header */}
        <div className="text-center mb-10">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">LB Store Admin</h1>
          <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-widest">Hệ thống quản trị nội bộ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2">Email Quản trị</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lbstore.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-bold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? "Đang xác thực..." : "Đăng nhập Quản trị"}
          </button>
        </form>

        <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-black text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors">
              ← Quay lại trang chủ
            </Link>
        </div>
      </div>
    </div>
  );
};
