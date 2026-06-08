import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, Smartphone } from 'lucide-react';
import { adminFetchProduct, adminUpdateProduct, adminUploadFile } from '../../services/adminApi';
import { fetchCommentsByProduct, deleteComment } from '../../services/api';
import type { ProductComment } from '../../types/product';
import { ProductBasicInfoForm, type ProductFormData } from '../../components/admin/product/ProductBasicInfoForm';
import { ProductDescriptionTable, type DescriptionItem } from '../../components/admin/product/ProductDescriptionTable';
import { VariantCard, type Variant } from '../../components/admin/product/VariantCard';
import { ProductCommentsPanel } from '../../components/admin/product/ProductCommentsPanel';

export const AdminProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', category: '', brand: '', imageURL: '',
  });
  const [descriptionList, setDescriptionList] = useState<DescriptionItem[]>([{ key: '', value: '' }]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [commentPage, setCommentPage] = useState(0);
  const [commentPageSize, setCommentPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadComments = async (productId: number) => {
    const data = await fetchCommentsByProduct(productId);
    setComments(data);
  };

  useEffect(() => {
    if (!id) return;
    adminFetchProduct(Number(id))
      .then(p => {
        setFormData({
          name: p.name ?? '',
          description: p.description ?? '',
          category: p.category?.name ?? p.category ?? '',
          brand: p.brand?.name ?? p.brand ?? '',
          imageURL: p.imageURL ?? '',
        });

        // Parse description JSON
        if (p.description) {
          try {
            const parsed = JSON.parse(p.description);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              const list = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
              setDescriptionList(list.length > 0 ? list : [{ key: '', value: '' }]);
            } else {
              setDescriptionList([{ key: 'Chi tiết', value: p.description }]);
            }
          } catch {
            setDescriptionList([{ key: 'Chi tiết', value: p.description }]);
          }
        }

        // Flatten variants
        if (p.variants) {
          const flat: Variant[] = [];
          p.variants.forEach((v: any) => {
            if (v.variantColors?.length > 0) {
              v.variantColors.forEach((vc: any) => {
                flat.push({
                  id: v.id, colorId: vc.id,
                  sku: v.sku ?? '', color: vc.color ?? '', storage: v.storage ?? '',
                  originalPrice: v.originalPrice ?? 0, discountedPrice: null,
                  stockQuantity: vc.stockQuantity ?? 0, imageURL: vc.imageUrl ?? vc.imageURL ?? '',
                });
              });
            } else {
              flat.push({
                id: v.id, sku: v.sku ?? '', color: '', storage: v.storage ?? '',
                originalPrice: v.originalPrice ?? 0, discountedPrice: null,
                stockQuantity: v.stockQuantity ?? 0, imageURL: v.thumbnailUrl ?? '',
              });
            }
          });
          setVariants(flat);
        }

        loadComments(Number(id));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    const success = await deleteComment(commentId);
    if (success) loadComments(Number(id));
    else alert('Xóa thất bại.');
  };

  const generateSKU = (name: string, color: string, storage: string) => {
    const clean = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '-');
    return [clean(name || 'PROD'), ...(color ? [clean(color)] : []), ...(storage ? [clean(storage)] : [])].join('-');
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    if (!next[index].id && (field === 'color' || field === 'storage')) {
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

      // Group by SKU + Storage
      const groupedMap = new Map<string, any>();
      finalVariants.forEach(v => {
        const key = `${v.sku}-${v.storage}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: v.id, sku: v.sku, storage: v.storage,
            originalPrice: isNaN(Number(v.originalPrice)) ? 0 : Number(v.originalPrice),
            discountedPrice: null,
            stockQuantity: 0, variantColors: [],
          });
        }
        const group = groupedMap.get(key);
        group.variantColors.push({ id: v.colorId, color: v.color || 'Default', stockQuantity: isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity), imageUrl: v.imageURL });
        group.stockQuantity += isNaN(Number(v.stockQuantity)) ? 0 : Number(v.stockQuantity);
      });

      // Build description
      const validDesc = descriptionList.filter(s => s.key.trim() !== '' || s.value.trim() !== '');
      const descObject: Record<string, string> = {};
      validDesc.forEach(item => { if (item.key.trim()) descObject[item.key.trim()] = item.value.trim(); });

      const mainImageUrl = finalVariants.find(v => v.imageURL)?.imageURL || formData.imageURL;

      await adminUpdateProduct(Number(id), {
        ...formData,
        description: Object.keys(descObject).length > 0 ? JSON.stringify(descObject) : '',
        imageURL: mainImageUrl,
        category: { name: formData.category },
        brand: { name: formData.brand },
        variants: Array.from(groupedMap.values()),
      });
      navigate('/admin/products');
    } catch (e: any) {
      setError('Cập nhật thất bại: ' + e.message);
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chỉnh sửa Sản phẩm & Biến thể</h1>
          <p className="text-sm text-gray-500 font-medium">Cập nhật thông tin cho sản phẩm #{id}</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Form thông tin cơ bản */}
        <ProductBasicInfoForm formData={formData} setFormData={setFormData} />

        {/* Bảng mô tả */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <ProductDescriptionTable descriptionList={descriptionList} setDescriptionList={setDescriptionList} />
        </div>

        {/* Biến thể */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Smartphone size={18} /> Quản lý biến thể
            </h3>
            <button
              type="button"
              onClick={() => setVariants([...variants, { sku: '', color: '', storage: '', originalPrice: 0, discountedPrice: 0, stockQuantity: 0, imageURL: '' }])}
              className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Thêm biến thể mới
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {variants.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm italic">
                Sản phẩm này hiện chưa có biến thể nào.
              </div>
            )}
            {variants.map((variant, index) => (
              <VariantCard
                key={index}
                variant={variant}
                index={index}
                productName={formData.name}
                categoryName={formData.category}
                isEdit
                canRemove
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
            Lưu thay đổi
          </button>
        </div>
      </form>

      {/* Panel bình luận */}
      <ProductCommentsPanel
        comments={comments}
        commentPage={commentPage}
        commentPageSize={commentPageSize}
        setCommentPage={setCommentPage}
        setCommentPageSize={setCommentPageSize}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
};
