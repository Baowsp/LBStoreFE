import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, sendOtp, verifyOtp } from '../services/api';

import { RegisterFormStep } from '../components/register/RegisterFormStep';
import { RegisterOtpStep } from '../components/register/RegisterOtpStep';

type Step = 'form' | 'otp';

export const RegisterPage = () => {
  const [step, setStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.fullName.trim().length < 2) {
      setErrorMsg('Họ và tên quá ngắn. Vui lòng nhập tên thật của bạn.');
      return;
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMsg('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số đầu mạng VN.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Email không đúng định dạng hợp lệ!');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(formData.email);
      setStep('otp');
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMsg('');
    setIsLoading(true);
    try {
      await sendOtp(formData.email);
      setOtpDigits(['', '', '', '', '', '']);
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setErrorMsg('Vui lòng nhập đầy đủ 6 chữ số của mã xác nhận.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(formData.email, otp);

      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        email: formData.email,
        password: formData.password
      };
      await registerUser(payload);

      setSuccessMsg('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xác nhận không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
        {step === 'form' && (
          <RegisterFormStep 
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSendOtp={handleSendOtp}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        )}

        {step === 'otp' && (
          <RegisterOtpStep 
            email={formData.email}
            otpDigits={otpDigits}
            setOtpDigits={setOtpDigits}
            handleVerifyAndRegister={handleVerifyAndRegister}
            handleResendOtp={handleResendOtp}
            isLoading={isLoading}
            errorMsg={errorMsg}
            successMsg={successMsg}
            countdown={countdown}
            onBack={() => {
              setStep('form');
              setErrorMsg('');
              setOtpDigits(['','','','','','']);
            }}
          />
        )}
      </div>
    </div>
  );
};