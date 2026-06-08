import { Trash2, Image as ImageIcon, DollarSign } from 'lucide-react';

// Shared Variant interface — export để cả Add và Edit đều dùng
export interface Variant {
  id?: number;
  colorId?: number;
  sku: string;
  color: string;
  storage: string;
  originalPrice: number;
  stockQuantity: number;
  imageURL: string;
  imageFile?: File;
  previewURL?: string;
}

interface Props {
  variant: Variant;
  index: number;
  productName: string;
  categoryName?: string;
  isEdit?: boolean;
  canRemove: boolean;
  onChange: (index: number, field: keyof Variant, value: any) => void;
  onRemove: (index: number) => void;
  onImageSelect: (file: File, index: number) => void;
}

/** Resolve image URL — handle cả URL tuyệt đối lẫn relative path */
const resolveImageUrl = (imageURL: string): string => {
  if (imageURL.startsWith('http')) return imageURL;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  if (apiBase.startsWith('/')) return imageURL;
  try {
    const url = new URL(apiBase);
    return `${url.protocol}//${url.host}${imageURL}`;
  } catch {
    return `http://localhost:8080${imageURL}`;
  }
};

export const VariantCard = ({
  variant,
  index,
  categoryName = '',
  isEdit = false,
  canRemove,
  onChange,
  onRemove,
  onImageSelect,
}: Props) => {
  const displaySrc = variant.previewURL || (variant.imageURL ? resolveImageUrl(variant.imageURL) : null);

  const isPhoneOrLaptop = categoryName.toLowerCase().includes('điện thoại') || 
                          categoryName.toLowerCase().includes('laptop') || 
                          categoryName.toLowerCase().includes('máy tính');

  const isColorInvalid = /\d/.test(variant.color);
  const storageVal = parseInt(variant.storage);
  const isStorageInvalid = isPhoneOrLaptop && (!variant.storage || isNaN(storageVal) || storageVal <= 0);
  const isOrigPriceInvalid = isNaN(Number(variant.originalPrice)) || Number(variant.originalPrice) <= 0 || String(variant.originalPrice).includes('-');
  const isStockInvalid = isNaN(Number(variant.stockQuantity)) || Number(variant.stockQuantity) <= 0 || String(variant.stockQuantity).includes('-');

  const badgeLabel = isEdit
    ? (variant.id ? `Biến thể #${variant.id}` : 'Biến thể mới')
    : `Mẫu #${index + 1}`;

  const badgeClass = isEdit
    ? 'px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase'
    : 'px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase';

  return (
    <div className="p-8 group relative bg-white hover:bg-gray-50/30 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <span className={badgeClass}>{badgeLabel}</span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 p-1">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Ảnh biến thể */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center relative">
            {displaySrc ? (
              <img src={displaySrc} alt="Variant" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="text-gray-200" size={24} />
            )}
          </div>
          <label className="text-[10px] font-bold text-blue-600 cursor-pointer uppercase hover:underline">
            {isEdit ? 'Đổi ảnh' : 'Chọn ảnh'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={e => e.target.files?.[0] && onImageSelect(e.target.files[0], index)}
            />
          </label>
        </div>

        {/* Các field */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Màu sắc */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Màu sắc</label>
            <input
              type="text"
              value={variant.color}
              onChange={e => onChange(index, 'color', e.target.value)}
              className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${isColorInvalid ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              placeholder="Titan"
            />
            {isColorInvalid && <p className="text-[10px] text-red-500 mt-1 font-bold">Không được chứa số</p>}
          </div>

          {/* Dung lượng */}
          {isPhoneOrLaptop && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Dung lượng</label>
              <input
                type="text"
                value={variant.storage}
                onChange={e => onChange(index, 'storage', e.target.value)}
                className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${variant.storage && isStorageInvalid ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                placeholder="256"
              />
              {variant.storage && isStorageInvalid && <p className="text-[10px] text-red-500 mt-1 font-bold">Phải lớn hơn 0</p>}
            </div>
          )}

          {/* SKU */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mã SKU (Auto)</label>
            <input
              type="text"
              value={variant.sku}
              onChange={e => onChange(index, 'sku', e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 text-sm font-bold outline-none focus:border-blue-500 bg-white font-mono"
            />
          </div>

          {/* Giá gốc */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Giá gốc (VNĐ)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="number"
                min="1"
                value={variant.originalPrice}
                onChange={e => onChange(index, 'originalPrice', e.target.value)}
                className={`w-full pl-8 pr-3 py-3 rounded-lg border text-sm font-bold outline-none bg-white ${isOrigPriceInvalid ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              />
            </div>
            {isOrigPriceInvalid && <p className="text-[10px] text-red-500 mt-1 font-bold">Lỗi định dạng hoặc phải lớn hơn 0</p>}
          </div>



          {/* Tồn kho */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tồn kho</label>
            <input
              type="number"
              min="1"
              value={variant.stockQuantity}
              onChange={e => onChange(index, 'stockQuantity', e.target.value)}
              className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${isStockInvalid ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
            />
            {isStockInvalid && <p className="text-[10px] text-red-500 mt-1 font-bold">Lỗi định dạng hoặc phải lớn hơn 0</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
