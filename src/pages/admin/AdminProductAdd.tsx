import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, Smartphone } from 'lucide-react';
import { adminCreateProduct, adminUploadFile } from '../../services/adminApi';
import { ProductBasicInfoForm, type ProductFormData } from '../../components/admin/product/ProductBasicInfoForm';
import { ProductDescriptionTable, type DescriptionItem } from '../../components/admin/product/ProductDescriptionTable';
import { VariantCard, type Variant } from '../../components/admin/product/VariantCard';

const EMPTY_VARIANT: Variant = {
  sku: '', color: '', storage: '', originalPrice: 0, stockQuantity: 0, imageURL: '',
};

export const AdminProductAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', category: '', brand: '', imageURL: '',
  });
  const [descriptionList, setDescriptionList] = useState<DescriptionItem[]>([{ key: '', value: '' }]);
  const [variants, setVariants] = useState<Variant[]>([{ ...EMPTY_VARIANT }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // SKU tự động
  const generateSKU = (name: string, color: string, storage: string) => {
    const clean = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '-');
    return [clean(name || 'PROD'), ...(color ? [clean(color)] : []), ...(storage ? [clean(storage)] : [])].join('-');
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    if (field === 'color' || field === 'storage') {
      next[index].sku = generateSKU(formData.name, next[index].color, next[index].storage);
    }
    setVariants(next);
  };

  const handleVariantImageSelect = (file: File, index: number) => {
    const next = [...variants];
    if (next[index].previewURL) URL.revokeObjectURL(next[index].previewURL!);
    next[index] = { ...next[index], imageFile: file, previewURL: URL.createObjectURL(file) };
    setVariants(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Validate
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (/\d/.test(v.color)) { setError(`Mẫu #${i + 1}: Màu sắc không được chứa chữ số.`); setSaving(false); return; }
        const storageVal = parseInt(v.storage);
        
        const isPhoneOrLaptop = formData.category.toLowerCase().includes('điện thoại') || 
                                formData.category.toLowerCase().includes('laptop') || 
                                formData.category.toLowerCase().includes('máy tính');
                                
        if (isPhoneOrLaptop && (!v.storage.trim() || isNaN(storageVal) || storageVal <= 0)) { setError(`Mẫu #${i + 1}: Dung lượng phải lớn hơn 0.`); setSaving(false); return; }
        if (Number(v.originalPrice) <= 0) { setError(`Mẫu #${i + 1}: Giá gốc phải lớn hơn 0.`); setSaving(false); return; }
        if (Number(v.stockQuantity) <= 0) { setError(`Mẫu #${i + 1}: Tồn kho phải lớn hơn 0.`); setSaving(false); return; }
      }

      // Upload ảnh
      const finalVariants = [...variants];
      for (let i = 0; i < finalVariants.length; i++) {
        if (finalVariants[i].imageFile) {
          const res = await adminUploadFile(finalVariants[i].imageFile!);
          finalVariants[i].imageURL = res.url;
        }
      }

      // Group variants by SKU + Storage
      const groupedMap = new Map<string, any>();
      finalVariants.forEach(v => {
        const key = `${v.sku}-${v.storage}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            sku: v.sku, storage: v.storage,
            originalPrice: isNaN(Number(v.originalPrice)) ? 0 : Number(v.originalPrice),
            discountedPrice: null, // Mặc định là null vì không còn cho nhập thủ công
            stockQuantity: 0, variantColors: [],
          });
        }
        const group = groupedMap.get(key);
        group.variantColors.push({ color: v.color || 'Default', stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity), imageUrl: v.imageURL });
        group.stockQuantity += isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity);
      });

      // Build description
      const validDesc = descriptionList.filter(s => s.key.trim() !== '' || s.value.trim() !== '');
      const descObject: Record<string, string> = {};
      validDesc.forEach(item => { if (item.key.trim()) descObject[item.key.trim()] = item.value.trim(); });

      const mainImageUrl = finalVariants.find(v => v.imageURL)?.imageURL || formData.imageURL;

      await adminCreateProduct({
        ...formData,
        description: Object.keys(descObject).length > 0 ? JSON.stringify(descObject) : '',
        imageURL: mainImageUrl,
        category: { name: formData.category },
        brand: { name: formData.brand },
        variants: Array.from(groupedMap.values()),
      });
      navigate('/admin/products');
    } catch (e: any) {
      setError('Thêm thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = variants.some(v => {
    const storageVal = parseInt(v.storage);
    const isPhoneOrLaptop = formData.category.toLowerCase().includes('điện thoại') || 
                            formData.category.toLowerCase().includes('laptop') || 
                            formData.category.toLowerCase().includes('máy tính');
                            
    return /\d/.test(v.color)
      || (isPhoneOrLaptop && (!v.storage || isNaN(storageVal) || storageVal <= 0))
      || isNaN(Number(v.originalPrice)) || Number(v.originalPrice) <= 0 || String(v.originalPrice).includes('-')
      || isNaN(Number(v.stockQuantity)) || Number(v.stockQuantity) <= 0 || String(v.stockQuantity).includes('-');
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
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
        {/* Form thông tin cơ bản */}
        <ProductBasicInfoForm formData={formData} setFormData={setFormData} />

        {/* Bảng mô tả — nhúng trong card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <ProductDescriptionTable descriptionList={descriptionList} setDescriptionList={setDescriptionList} />
        </div>

        {/* Biến thể sản phẩm */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Smartphone size={18} /> Các biến thể sản phẩm
            </h3>
            <button
              type="button"
              onClick={() => setVariants([...variants, { ...EMPTY_VARIANT }])}
              className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Thêm biến thể
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {variants.map((variant, index) => (
              <VariantCard
                key={index}
                variant={variant}
                index={index}
                productName={formData.name}
                categoryName={formData.category}
                canRemove={variants.length > 1}
                onChange={handleVariantChange}
                onRemove={i => setVariants(variants.filter((_, idx) => idx !== i))}
                onImageSelect={handleVariantImageSelect}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-lg flex justify-end gap-4 sticky bottom-6 z-10">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saving || hasErrors}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu sản phẩm & Biến thể
          </button>
        </div>
      </form>
    </div>
  );
};
