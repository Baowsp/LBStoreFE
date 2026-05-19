import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, Trash2, Image as ImageIcon, UploadCloud, Smartphone, DollarSign, Box } from 'lucide-react';
import { adminCreateProduct, adminUploadFile } from '../../services/adminApi';

interface Variant {
  sku: string;
  color: string;
  storage: string;
  originalPrice: number;
  discountedPrice: number;
  stockQuantity: number;
  imageURL: string;
  imageFile?: File;
  previewURL?: string;
}

export const AdminProductAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    imageURL: '',
  });

  const [descriptionList, setDescriptionList] = useState<{ key: string, value: string }[]>([
    { key: '', value: '' }
  ]);

  const [variants, setVariants] = useState<Variant[]>([
    { sku: '', color: '', storage: '', originalPrice: 0, discountedPrice: 0, stockQuantity: 0, imageURL: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Helper: Tạo SKU tự động
  const generateSKU = (name: string, color: string, storage: string) => {
    const clean = (str: string) => str.trim().toUpperCase().replace(/\s+/g, '-');
    const parts = [clean(name || 'PROD')];
    if (color) parts.push(clean(color));
    if (storage) parts.push(clean(storage));
    return parts.join('-');
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // Nếu đổi color/storage mà SKU trống hoặc đang khớp với pattern cũ, thì gợi ý SKU mới
    if (field === 'color' || field === 'storage') {
      newVariants[index].sku = generateSKU(formData.name, newVariants[index].color, newVariants[index].storage);
    }

    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', color: '', storage: '', originalPrice: 0, discountedPrice: 0, stockQuantity: 0, imageURL: '' }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const addDesc = () => {
    setDescriptionList([...descriptionList, { key: '', value: '' }]);
  };

  const removeDesc = (index: number) => {
    setDescriptionList(descriptionList.filter((_, i) => i !== index));
  };

  const handleDescChange = (index: number, field: 'key' | 'value', value: string) => {
    const newList = [...descriptionList];
    newList[index][field] = value;
    setDescriptionList(newList);
  };

  const handleVariantImageSelect = (file: File, index: number) => {
    const newVariants = [...variants];
    newVariants[index].imageFile = file;
    if (newVariants[index].previewURL) {
      URL.revokeObjectURL(newVariants[index].previewURL!);
    }
    newVariants[index].previewURL = URL.createObjectURL(file);
    setVariants(newVariants);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Validate variants
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (/\d/.test(v.color)) {
          setError(`Mẫu #${i + 1}: Màu sắc không được chứa chữ số.`);
          setSaving(false);
          return;
        }
        const storageVal = parseInt(v.storage);
        if (!v.storage.trim() || isNaN(storageVal) || storageVal <= 0) {
          setError(`Mẫu #${i + 1}: Dung lượng phải lớn hơn 0.`);
          setSaving(false);
          return;
        }
        if (Number(v.originalPrice) <= 0) {
          setError(`Mẫu #${i + 1}: Giá gốc phải lớn hơn 0.`);
          setSaving(false);
          return;
        }
        if (Number(v.discountedPrice) <= 0) {
          setError(`Mẫu #${i + 1}: Giá khuyến mãi phải lớn hơn 0.`);
          setSaving(false);
          return;
        }
        if (Number(v.discountedPrice) >= Number(v.originalPrice)) {
          setError(`Mẫu #${i + 1}: Giá khuyến mãi phải nhỏ hơn Giá gốc.`);
          setSaving(false);
          return;
        }
        if (Number(v.stockQuantity) <= 0) {
          setError(`Mẫu #${i + 1}: Tồn kho phải lớn hơn 0.`);
          setSaving(false);
          return;
        }
      }

      // 1. Upload ảnh của các biến thể trước
      const finalVariants = [...variants];
      for (let i = 0; i < finalVariants.length; i++) {
        if (finalVariants[i].imageFile) {
          const res = await adminUploadFile(finalVariants[i].imageFile!);
          finalVariants[i].imageURL = res.url;
        }
      }

      // Group variants by SKU and Storage to avoid model mismatch
      const groupedMap = new Map<string, any>();

      finalVariants.forEach(v => {
        const key = `${v.sku}-${v.storage}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            sku: v.sku,
            storage: v.storage,
            originalPrice: isNaN(Number(v.originalPrice)) ? 0 : Number(v.originalPrice),
            discountedPrice: isNaN(Number(v.discountedPrice)) ? 0 : Number(v.discountedPrice),
            stockQuantity: 0,
            variantColors: []
          });
        }

        const group = groupedMap.get(key);
        group.variantColors.push({
          color: v.color || 'Default',
          stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity),
          imageUrl: v.imageURL
        });
        group.stockQuantity += isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity);
      });

      const firstVariantWithImage = finalVariants.find(v => v.imageURL);
      const mainImageUrl = firstVariantWithImage ? firstVariantWithImage.imageURL : formData.imageURL;

      const validDesc = descriptionList.filter(s => s.key.trim() !== '' || s.value.trim() !== '');
      const descObject: Record<string, string> = {};
      validDesc.forEach(item => {
        if (item.key.trim()) {
          descObject[item.key.trim()] = item.value.trim();
        }
      });

      await adminCreateProduct({
        ...formData,
        description: Object.keys(descObject).length > 0 ? JSON.stringify(descObject) : '',
        imageURL: mainImageUrl,
        category: { name: formData.category },
        brand: { name: formData.brand },
        variants: Array.from(groupedMap.values())
      });
      navigate('/admin/products');
    } catch (e: any) {
      setError('Thêm thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = variants.some(v => {
    const isColorInvalid = /\d/.test(v.color);
    const storageVal = parseInt(v.storage);
    const isStorageInvalid = !v.storage || isNaN(storageVal) || storageVal <= 0;
    const isOrigPriceInvalid = isNaN(Number(v.originalPrice)) || Number(v.originalPrice) <= 0 || String(v.originalPrice).includes('-');
    const isDiscPriceInvalid = isNaN(Number(v.discountedPrice)) || Number(v.discountedPrice) <= 0 || String(v.discountedPrice).includes('-') || Number(v.discountedPrice) >= Number(v.originalPrice);
    const isStockInvalid = isNaN(Number(v.stockQuantity)) || Number(v.stockQuantity) <= 0 || String(v.stockQuantity).includes('-');
    return isColorInvalid || isStorageInvalid || isOrigPriceInvalid || isDiscPriceInvalid || isStockInvalid;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Thêm sản phẩm & Biến thể</h1>
          <p className="text-sm text-gray-500 font-medium">Tạo sản phẩm mới với nhiều tùy chọn màu sắc, cấu hình</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        {/* THÔNG TIN CHUNG */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide"><Box size={18} /> Thông tin cơ bản</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên sản phẩm</label>
                <input type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Ví dụ: iPhone 15 Pro Max"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Danh mục</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 transition-all">
                  <option value="">Chọn danh mục...</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Âm thanh">Âm thanh</option>
                  <option value="Đồng hồ">Đồng hồ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hãng sản xuất</label>
                <input type="text" value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 transition-all"
                  placeholder="Apple, Samsung..."
                />
              </div>
            </div>



            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Mô tả sản phẩm</label>
                <button type="button" onClick={addDesc} className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1">
                  <Plus size={14} /> Thêm mô tả
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200 w-1/3">Tên mô tả</th>
                      <th className="px-4 py-3 border-b border-gray-200">Thông tin / Giá trị</th>
                      <th className="px-4 py-3 border-b border-gray-200 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {descriptionList.map((desc, index) => (
                      <tr key={index}>
                        <td className="p-2 border-r border-gray-100">
                          <input type="text" value={desc.key} onChange={e => handleDescChange(index, 'key', e.target.value)} placeholder="VD: Tính năng nổi bật" className="w-full p-2 outline-none font-medium text-gray-700 bg-transparent" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={desc.value} onChange={e => handleDescChange(index, 'value', e.target.value)} placeholder="VD: Khung viền titan cao cấp..." className="w-full p-2 outline-none text-gray-600 bg-transparent" />
                        </td>
                        <td className="p-2 text-center border-l border-gray-100">
                          <button type="button" onClick={() => removeDesc(index)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {descriptionList.length === 0 && <div className="p-4 text-center text-xs text-gray-400 italic bg-white">Chưa có thông tin mô tả nào</div>}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN BIẾN THỂ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide"><Smartphone size={18} /> Các biến thể sản phẩm</h3>
            <button type="button" onClick={addVariant} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Thêm biến thể
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {variants.map((variant, index) => (
              <div key={index} className="p-8 group relative bg-white hover:bg-gray-50/30 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase">Mẫu #{index + 1}</span>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left: Image Upload for Variant */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center relative">
                      {variant.previewURL || variant.imageURL ? (
                        <img src={variant.previewURL || (variant.imageURL.startsWith('http') ? variant.imageURL : `http://localhost:8080${variant.imageURL}`)} alt="Variant" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-200" size={24} />
                      )}
                    </div>
                    <label className="text-[10px] font-bold text-blue-600 cursor-pointer uppercase hover:underline">
                      Chọn ảnh
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleVariantImageSelect(e.target.files[0], index)} />
                    </label>
                  </div>

                  {/* Mid: Fields */}
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Màu sắc</label>
                      <input type="text" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${/\d/.test(variant.color) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Titan" />
                      {/\d/.test(variant.color) && <p className="text-[10px] text-red-500 mt-1 font-bold">Không được chứa số</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Dung lượng</label>
                      <input type="text" value={variant.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${variant.storage && (isNaN(parseInt(variant.storage)) || parseInt(variant.storage) <= 0) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="256GB" />
                      {variant.storage && (isNaN(parseInt(variant.storage)) || parseInt(variant.storage) <= 0) && <p className="text-[10px] text-red-500 mt-1 font-bold">Phải lớn hơn 0</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mã SKU (Auto)</label>
                      <input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 text-sm font-bold outline-none focus:border-blue-500 bg-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Giá gốc (VNĐ)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="number" min="1" value={variant.originalPrice} onChange={e => handleVariantChange(index, 'originalPrice', e.target.value)}
                          className={`w-full pl-8 pr-3 py-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.originalPrice)) || Number(variant.originalPrice) <= 0 || String(variant.originalPrice).includes('-')) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      </div>
                      {(isNaN(Number(variant.originalPrice)) || Number(variant.originalPrice) <= 0 || String(variant.originalPrice).includes('-')) && <p className="text-[10px] text-red-500 mt-1 font-bold">Lỗi định dạng hoặc phải lớn hơn 0</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Giá khuyến mãi (VNĐ)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="number" min="1" value={variant.discountedPrice} onChange={e => handleVariantChange(index, 'discountedPrice', e.target.value)}
                          className={`w-full pl-8 pr-3 py-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.discountedPrice)) || Number(variant.discountedPrice) <= 0 || String(variant.discountedPrice).includes('-') || Number(variant.discountedPrice) >= Number(variant.originalPrice)) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      </div>
                      {(isNaN(Number(variant.discountedPrice)) || Number(variant.discountedPrice) <= 0 || String(variant.discountedPrice).includes('-')) ? <p className="text-[10px] text-red-500 mt-1 font-bold">Lỗi định dạng hoặc phải lớn hơn 0</p> :
                        Number(variant.discountedPrice) > Number(variant.originalPrice) ? <p className="text-[10px] text-red-500 mt-1 font-bold">Phải nhỏ hơn Giá gốc</p> : null}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tồn kho ban đầu</label>
                      <input type="number" min="1" value={variant.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.stockQuantity)) || Number(variant.stockQuantity) <= 0 || String(variant.stockQuantity).includes('-')) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      {(isNaN(Number(variant.stockQuantity)) || Number(variant.stockQuantity) <= 0 || String(variant.stockQuantity).includes('-')) && <p className="text-[10px] text-red-500 mt-1 font-bold">Lỗi định dạng hoặc phải lớn hơn 0</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-lg flex justify-end gap-4 sticky bottom-6 z-10 mx-auto">
          <button type="button" onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button type="submit" disabled={saving || hasErrors}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />} Lưu sản phẩm & Biến thể
          </button>
        </div>
      </form>
    </div>
  );
};
