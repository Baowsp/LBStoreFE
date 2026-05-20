import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FieldErrors {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormStepProps {
  formData: any;
  onFieldChange: (name: string, value: string) => void;
  fieldErrors: FieldErrors;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSendOtp: (e: React.FormEvent) => void;
  isLoading: boolean;
  errorMsg: string;
}

// Component hiển thị lỗi / thành công realtime dưới input
const FieldMessage = ({ error, value }: { error: string; value: string }) => {
  if (error) {
    return (
      <p className="flex items-center gap-1 text-[11px] text-red-500 font-semibold ml-2 mt-1 animate-fade-in">
        <AlertCircle size={11} />
        {error}
      </p>
    );
  }
  if (value) {
    return (
      <p className="flex items-center gap-1 text-[11px] text-green-500 font-semibold ml-2 mt-1 animate-fade-in">
        <CheckCircle2 size={11} />
        Hợp lệ
      </p>
    );
  }
  return null;
};

// Helper: border class theo trạng thái field
const inputClass = (error: string, value: string) => {
  const base = 'w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl outline-none transition-all text-sm font-bold';
  if (error) return `${base} border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30`;
  if (value) return `${base} border-green-400 focus:ring-2 focus:ring-green-400 focus:bg-white`;
  return `${base} border-gray-100 focus:ring-2 focus:ring-red-500 focus:bg-white`;
};

export const RegisterFormStep = ({
  formData, onFieldChange, fieldErrors,
  showPassword, setShowPassword,
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

        {/* Họ và tên */}
        <div className="md:col-span-2 space-y-0.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Họ và tên</label>
          <div className="relative">
            <User
              className={`absolute left-4 top-3 transition-colors ${fieldErrors.fullName ? 'text-red-400' : formData.fullName ? 'text-green-400' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="text" required placeholder="Nguyễn Văn A" value={formData.fullName}
              className={inputClass(fieldErrors.fullName, formData.fullName)}
              onChange={(e) => onFieldChange('fullName', e.target.value)}
            />
          </div>
          <FieldMessage error={fieldErrors.fullName} value={formData.fullName} />
        </div>

        {/* Số điện thoại */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Số điện thoại</label>
          <div className="relative">
            <Phone
              className={`absolute left-4 top-3 transition-colors ${fieldErrors.phone ? 'text-red-400' : formData.phone ? 'text-green-400' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="tel" required placeholder="0987xxxxxx" value={formData.phone}
              className={inputClass(fieldErrors.phone, formData.phone)}
              onChange={(e) => onFieldChange('phone', e.target.value)}
            />
          </div>
          <FieldMessage error={fieldErrors.phone} value={formData.phone} />
        </div>

        {/* Email */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Email</label>
          <div className="relative">
            <Mail
              className={`absolute left-4 top-3 transition-colors ${fieldErrors.email ? 'text-red-400' : formData.email ? 'text-green-400' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="email" required placeholder="name@gmail.com" value={formData.email}
              className={inputClass(fieldErrors.email, formData.email)}
              onChange={(e) => onFieldChange('email', e.target.value)}
            />
          </div>
          <FieldMessage error={fieldErrors.email} value={formData.email} />
        </div>

        {/* Mật khẩu */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mật khẩu</label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-3 transition-colors ${fieldErrors.password ? 'text-red-400' : formData.password ? 'text-green-400' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={formData.password}
              className={inputClass(fieldErrors.password, formData.password)}
              onChange={(e) => onFieldChange('password', e.target.value)}
            />
          </div>
          <FieldMessage error={fieldErrors.password} value={formData.password} />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Xác nhận lại</label>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-3 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : formData.confirmPassword ? 'text-green-400' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={formData.confirmPassword}
              className={`${inputClass(fieldErrors.confirmPassword, formData.confirmPassword)} pr-10`}
              onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <FieldMessage error={fieldErrors.confirmPassword} value={formData.confirmPassword} />
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
