import React, { useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface RegisterOtpStepProps {
  email: string;
  otpDigits: string[];
  setOtpDigits: (digits: string[]) => void;
  handleVerifyAndRegister: (e: React.FormEvent) => void;
  handleResendOtp: () => void;
  isLoading: boolean;
  errorMsg: string;
  successMsg: string;
  countdown: number;
  onBack: () => void;
}

export const RegisterOtpStep = ({
  email, otpDigits, setOtpDigits, handleVerifyAndRegister, handleResendOtp,
  isLoading, errorMsg, successMsg, countdown, onBack
}: RegisterOtpStepProps) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    const timeout = setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
    setOtpDigits(newDigits);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    otpRefs.current[nextEmpty]?.focus();
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldCheck className="text-red-600" size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Xác nhận email</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Mã xác nhận đã được gửi đến</p>
        <p className="text-red-600 text-sm font-black mt-1">{email}</p>
      </div>

      <form onSubmit={handleVerifyAndRegister}>
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100 mb-6">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-green-100 mb-6">
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              className={`
                w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all cursor-text
                bg-gray-50 text-gray-800
                ${digit ? 'border-red-500 bg-red-50 text-red-700 shadow-md shadow-red-100' : 'border-gray-200'}
                focus:border-red-500 focus:bg-white focus:scale-110 focus:ring-2 focus:ring-red-200
              `}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 font-medium mb-6">
          Mã có hiệu lực trong <span className="text-red-600 font-black">5 phút</span>
        </p>

        <button
          type="submit"
          disabled={isLoading || !!successMsg}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
          ) : (
            <><ShieldCheck size={18} /> Xác nhận & Đăng ký</>
          )}
        </button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={14} /> Sửa thông tin
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={countdown > 0 || isLoading}
            className="flex items-center gap-1.5 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-red-600 hover:text-red-700"
          >
            <RefreshCw size={14} className={countdown > 0 ? '' : 'animate-spin-once'} />
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
          </button>
        </div>
      </form>
    </>
  );
};
