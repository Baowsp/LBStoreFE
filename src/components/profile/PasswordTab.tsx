import { Lock } from 'lucide-react';
import { InputGroup } from './InputGroup';

interface PasswordTabProps {
  passwordForm: any;
  setPasswordForm: (form: any) => void;
  handleChangePassword: (e: React.FormEvent) => void;
}

export const PasswordTab = ({ passwordForm, setPasswordForm, handleChangePassword }: PasswordTabProps) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 max-w-xl">
      <h2 className="text-xl font-black text-gray-800 uppercase italic mb-8">Đổi mật khẩu bảo mật</h2>
      <form className="space-y-6" onSubmit={handleChangePassword}>
        <InputGroup label="Mật khẩu hiện tại" icon={<Lock size={18} />} type="password" placeholder="••••••••" value={passwordForm.oldPassword} onChange={(e: any) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
        <InputGroup label="Mật khẩu mới" icon={<Lock size={18} />} type="password" placeholder="••••••••" value={passwordForm.newPassword} onChange={(e: any) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
        <InputGroup label="Xác nhận mật khẩu mới" icon={<Lock size={18} />} type="password" placeholder="••••••••" value={passwordForm.confirmPassword} onChange={(e: any) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
        <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-100 transition-all active:scale-95">
          Xác nhận đổi mật khẩu
        </button>
      </form>
    </div>
  );
};
