import { MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShippingAddressSectionProps {
  addresses: any[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
}

export const ShippingAddressSection = ({ addresses, selectedAddressId, setSelectedAddressId }: ShippingAddressSectionProps) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
        <MapPin className="text-red-600" size={22} /> Địa chỉ giao hàng
      </h2>
      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-orange-50 border border-orange-100 rounded-2xl">
          <p className="text-orange-700 font-bold mb-3">Bạn chưa có địa chỉ nào!</p>
          <Link to="/profile" className="inline-block px-5 py-2 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors">
            Thêm địa chỉ mới →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <label key={addr.id} className={`block p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-red-600 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 w-4 h-4 accent-red-600" />
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-black text-gray-800">{addr.receiverName}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600 font-bold text-sm">{addr.receiverPhone}</span>
                    {addr.isDefault && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Mặc định</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {addr.streetAddress}
                    {(addr.ward && addr.ward !== 'Khác') ? `, ${addr.ward}` : ''}
                    {(addr.district && addr.district !== 'Khác' && addr.district !== addr.ward) ? `, ${addr.district}` : ''}
                    {(addr.province && addr.province !== 'Khác') ? `, ${addr.province}` : ''}
                  </p>
                </div>
              </div>
            </label>
          ))}
          <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-red-600 font-bold hover:underline mt-2">
            <ArrowLeft size={14} /> Quản lý địa chỉ
          </Link>
        </div>
      )}
    </div>
  );
};
