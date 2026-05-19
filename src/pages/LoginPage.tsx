import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { loginUser } from '../services/api';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth, logout } = useAuthStore();

  // YÊU CẦU: Khi vào trang login thì xóa jwt 
  useEffect(() => {
    logout();
  }, [logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ Email và Mật khẩu.");
      return;
    }

    // Kiểm tra định dạng Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Email không đúng định dạng hợp lệ!");
      return;
    }

    // Kiểm tra độ dài mật khẩu (tối thiểu 6 kí tự)
    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      
      // YÊU CẦU: Trang login chỉ đăng nhập customer, Admin phải qua admin-login
      if (data.user?.role === 'ADMIN') {
        logout();
        throw new Error("Tài khoản Quản trị vui lòng đăng nhập tại cổng Admin.");
      }

      // Save info to auth store
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sai Email hoặc Mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f4f4f4] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">

        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <LogIn className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Đăng nhập tài khoản</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2">Email của bạn</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-xs font-black text-gray-500 uppercase">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs font-bold text-red-600 hover:underline">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang kết nối...
              </>
            ) : "Đăng nhập ngay"}
          </button>
        </form>


        {/* Link đăng ký */}
        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="text-red-600 font-black hover:underline">Đăng ký thành viên</Link>
        </p>
      </div>
    </div>
  );
};