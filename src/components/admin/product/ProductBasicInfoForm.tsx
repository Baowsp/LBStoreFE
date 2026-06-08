import { Box } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCategories, type BackendCategory } from '../../../services/api';

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand: string;
  imageURL: string;
}

interface Props {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
}

export const ProductBasicInfoForm = ({ formData, setFormData }: Props) => {
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
    });
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Box size={18} /> Thông tin cơ bản
        </h3>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên sản phẩm</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="Ví dụ: iPhone 15 Pro Max"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Danh mục</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 transition-all"
            >
              <option value="">Chọn danh mục...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hãng sản xuất</label>
            <input
              type="text"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 transition-all"
              placeholder="Apple, Samsung..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
