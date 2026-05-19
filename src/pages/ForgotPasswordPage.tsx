import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // Chuyển sang bước nhập mã
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Chuyển sang bước đặt mật khẩu mới
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đổi mật khẩu thành công!");
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f4f4f4] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-gray-100">
        
        {/* BƯỚC 1: NHẬP EMAIL */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 border border-red-100">
                <Mail size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Quên mật khẩu</h1>
              <p className="text-gray-400 text-sm mt-2 font-medium">Nhập email để nhận mã xác thực (OTP)</p>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-6">
              <input 
                type="email" required placeholder="example@gmail.com"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-100">Gửi mã xác nhận</button>
            </form>
          </div>
        )}

        {/* BƯỚC 2: NHẬP MÃ OTP */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 border border-blue-100">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Xác thực OTP</h1>
              <p className="text-gray-400 text-sm mt-2 font-medium">Mã 6 số đã được gửi đến <b className="text-gray-800">{email}</b></p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-6 text-center">
              <input 
                type="text" required maxLength={6} placeholder=""
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-center text-3xl font-black tracking-[1rem] placeholder:tracking-normal"
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-100">Xác thực mã</button>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 hover:text-red-600">Gửi lại mã khác</button>
            </form>
          </div>
        )}

        {/* BƯỚC 3: ĐẶT LẠI MẬT KHẨU MỚI */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600 border border-green-100">
                <KeyRound size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Mật khẩu mới</h1>
              <p className="text-gray-400 text-sm mt-2 font-medium">Vui lòng thiết lập mật khẩu bảo mật hơn</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="Mật khẩu mới"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-100">Cập nhật mật khẩu</button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-red-600 transition-colors">
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};