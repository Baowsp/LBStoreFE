import { User, Phone, Mail } from 'lucide-react';
import { InputGroup } from './InputGroup';

interface AccountTabProps {
  userInfo: { name: string; phone: string; email: string; };
  setUserInfo: (info: any) => void;
  handleUpdateProfile: () => void;
}

export const AccountTab = ({ userInfo, setUserInfo, handleUpdateProfile }: AccountTabProps) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 transition-all">
      <h2 className="text-xl font-black text-gray-800 uppercase italic mb-8">Cập nhật thông tin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Họ và tên" icon={<User size={18} />} value={userInfo.name} onChange={(e: any) => setUserInfo({ ...userInfo, name: e.target.value })} />
        <InputGroup label="Số điện thoại" icon={<Phone size={18} />} value={userInfo.phone} onChange={(e: any) => setUserInfo({ ...userInfo, phone: e.target.value })} />
        <div className="md:col-span-2">
          <InputGroup label="Email" icon={<Mail size={18} />} value={userInfo.email} disabled={true} />
        </div>
        <button onClick={handleUpdateProfile} className="md:col-span-2 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-all">Lưu thay đổi</button>
      </div>
    </div>
  );
};
