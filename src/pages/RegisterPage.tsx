import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, sendOtp, verifyOtp } from '../services/api';

import { RegisterFormStep } from '../components/register/RegisterFormStep';
import { RegisterOtpStep } from '../components/register/RegisterOtpStep';

type Step = 'form' | 'otp';

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const [fieldErrors, setFieldErrors] = useState({
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

  // Real-time validation từng field
  const validateField = (name: string, value: string, currentForm?: typeof formData) => {
    const data = currentForm ?? formData;
    let error = '';
    switch (name) {
      case 'fullName':
        if (value.trim().length > 0 && value.trim().length < 2)
          error = 'Họ và tên quá ngắn.';
        break;
      case 'phone':
        if (value.length > 0 && !phoneRegex.test(value))
          error = 'Số điện thoại không hợp lệ (10 chữ số đầu mạng VN).';
        break;
      case 'email':
        if (value.length > 0 && !emailRegex.test(value))
          error = 'Email không đúng định dạng.';
        break;
      case 'password':
        if (value.length > 0 && value.length < 6)
          error = 'Mật khẩu phải có ít nhất 6 ký tự.';
        // Kiểm tra lại confirmPassword nếu đã nhập
        if (data.confirmPassword && value !== data.confirmPassword)
          setFieldErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp.' }));
        else if (data.confirmPassword)
          setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
        break;
      case 'confirmPassword':
        if (value.length > 0 && value !== data.password)
          error = 'Mật khẩu xác nhận không khớp.';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFieldChange = (name: string, value: string) => {
    const newForm = { ...formData, [name]: value };
    setFormData(newForm);
    validateField(name, value, newForm);
  };

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

    // Validate toàn bộ trước khi submit
    const errors = {
      fullName: formData.fullName.trim().length < 2 ? 'Họ và tên quá ngắn. Vui lòng nhập tên thật.' : '',
      phone: !phoneRegex.test(formData.phone) ? 'Số điện thoại không hợp lệ (10 chữ số đầu mạng VN).' : '',
      email: !emailRegex.test(formData.email) ? 'Email không đúng định dạng.' : '',
      password: formData.password.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự.' : '',
      confirmPassword: formData.password !== formData.confirmPassword ? 'Mật khẩu xác nhận không khớp.' : '',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(e => e !== '')) return;

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
            onFieldChange={handleFieldChange}
            fieldErrors={fieldErrors}
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