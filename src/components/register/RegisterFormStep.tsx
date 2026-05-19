import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface RegisterFormStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSendOtp: (e: React.FormEvent) => void;
  isLoading: boolean;
  errorMsg: string;
}

export const RegisterFormStep = ({ 
  formData, setFormData, showPassword, setShowPassword, 
  handleSendOtp, isLoading, errorMsg 
}: RegisterFormStepProps) => {
  return (
    <>
      <div className="text-center mb-8">
        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <UserPlus className="text-red-600" size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Đăng ký thành viên</h1>
        <p className="text-gray-400 text-sm mt-2 font-medium">Trở thành một phần của LBStore ngay hôm nay!</p>
      </div>

      <form onSubmit={handleSendOtp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {errorMsg && (
          <div className="md:col-span-2 bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="text" required placeholder="Nguyễn Văn A" value={formData.fullName}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Số điện thoại</label>
          <div className="relative">
            <Phone className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="tel" required placeholder="0987xxxxxx" value={formData.phone}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="email" required placeholder="name@gmail.com" value={formData.email}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={formData.password}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Xác nhận lại</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={formData.confirmPassword}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-bold"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit" disabled={isLoading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi mã...</>
            ) : (
              <><Mail size={18} /> Gửi mã xác nhận</>
            )}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">Mã OTP sẽ được gửi đến email của bạn</p>
        </div>
      </form>

      <p className="text-center mt-8 text-sm font-medium text-gray-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-red-600 font-black hover:underline tracking-tight">Đăng nhập tại đây</Link>
      </p>
    </>
  );
};
