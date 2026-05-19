import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Plus, Trash2, Image as ImageIcon, UploadCloud, Smartphone, Box, DollarSign, MessageCircle } from 'lucide-react';
import { adminFetchProduct, adminUpdateProduct, adminUploadFile } from '../../services/adminApi';
import { fetchCommentsByProduct, deleteComment } from '../../services/api';
import type { ProductComment } from '../../types/product';

interface Variant {
  id?: number;
  colorId?: number; // Preserve the ProductVariantColor ID
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

export const AdminProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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

        // Parse description from JSON if possible
        if (p.description) {
          try {
            const parsedDesc = JSON.parse(p.description);
            if (typeof parsedDesc === 'object' && parsedDesc !== null && !Array.isArray(parsedDesc)) {
              const list = Object.entries(parsedDesc).map(([key, value]) => ({ key, value: String(value) }));
              setDescriptionList(list.length > 0 ? list : [{ key: '', value: '' }]);
            } else if (Array.isArray(parsedDesc) && parsedDesc.length > 0) {
              setDescriptionList(parsedDesc);
            } else {
              setDescriptionList([{ key: 'Chi tiết', value: p.description }]);
            }
          } catch {
            setDescriptionList([{ key: 'Chi tiết', value: p.description }]);
          }
        }
        // Lấy danh sách biến thể từ product object
        if (p.variants) {
          const flatVariants: Variant[] = [];
          p.variants.forEach((v: any) => {
            if (v.variantColors && v.variantColors.length > 0) {
              v.variantColors.forEach((vc: any) => {
                flatVariants.push({
                  id: v.id,
                  colorId: vc.id, // Lưu lại ID màu sắc gốc
                  sku: v.sku ?? '',
                  color: vc.color ?? '',
                  storage: v.storage ?? '',
                  originalPrice: v.originalPrice ?? 0,
                  discountedPrice: v.discountedPrice ?? 0,
                  stockQuantity: vc.stockQuantity ?? 0,
                  imageURL: vc.imageUrl ?? vc.imageURL ?? '',
                });
              });
            } else {
              flatVariants.push({
                id: v.id,
                sku: v.sku ?? '',
                color: '',
                storage: v.storage ?? '',
                originalPrice: v.originalPrice ?? 0,
                discountedPrice: v.discountedPrice ?? 0,
                stockQuantity: v.stockQuantity ?? 0,
                imageURL: v.thumbnailUrl ?? '',
              });
            }
          });
          setVariants(flatVariants);
        }

        // Fetch comments concurrently or afterwards
        loadComments(Number(id));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    const success = await deleteComment(commentId);
    if (success) {
      loadComments(Number(id));
    } else {
      alert("Xóa thất bại.");
    }
  };

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

    // Gợi ý SKU nếu là biến thể mới (chưa có id) và đổi color/storage
    if (!newVariants[index].id && (field === 'color' || field === 'storage')) {
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
    const newDesc = [...descriptionList];
    newDesc[index][field] = value;
    setDescriptionList(newDesc);
  };

  const handleVariantImageSelect = (file: File, index: number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], imageFile: file };
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

      // Group flat variants back by SKU and Storage to avoid duplicate variant IDs
      const groupedMap = new Map<string, any>();

      finalVariants.forEach(v => {
        const key = `${v.sku}-${v.storage}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: v.id,
            sku: v.sku,
            storage: v.storage,
            originalPrice: isNaN(Number(v.originalPrice)) ? 0 : Number(v.originalPrice),
            discountedPrice: isNaN(Number(v.discountedPrice)) ? 0 : Number(v.discountedPrice),
            stockQuantity: 0, // Will sum up later
            variantColors: []
          });
        }

        const group = groupedMap.get(key);
        group.variantColors.push({
          id: v.colorId, // Provide the existing Color ID
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

      const payload = {
        ...formData,
        description: Object.keys(descObject).length > 0 ? JSON.stringify(descObject) : '',
        imageURL: mainImageUrl,
        category: { name: formData.category },
        brand: { name: formData.brand },
        variants: Array.from(groupedMap.values())
      };

      console.log('Update Product Payload:', JSON.stringify(payload, null, 2));

      await adminUpdateProduct(Number(id), payload);
      navigate('/admin/products');
    } catch (e: any) {
      setError('Cập nhật thất bại: ' + e.message);
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
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
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Danh mục</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-white transition-all">
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
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-white transition-all"
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
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide"><Smartphone size={18} /> Quản lý biến thể</h3>
            <button type="button" onClick={addVariant} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Thêm biến thể mới
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {variants.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm italic">Sản phẩm này hiện chưa có biến thể nào.</div>
            )}
            {variants.map((variant, index) => (
              <div key={index} className="p-8 group relative bg-white hover:bg-gray-50/30 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase">
                    {variant.id ? `Biến thể #${variant.id}` : 'Biến thể mới'}
                  </span>
                  <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center relative">
                      {variant.previewURL || variant.imageURL ? (
                        <img src={variant.previewURL || (variant.imageURL.startsWith('http') ? variant.imageURL : `http://localhost:8080${variant.imageURL}`)} alt="Variant" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-200" size={24} />
                      )}
                    </div>
                    <label className="text-[10px] font-bold text-blue-600 cursor-pointer uppercase">
                      Đổi ảnh
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleVariantImageSelect(e.target.files[0], index)} />
                    </label>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Màu sắc</label>
                      <input type="text" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${/\d/.test(variant.color) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="Titan" />
                      {/\d/.test(variant.color) && <p className="text-[10px] text-red-500 mt-1 font-bold">Màu sắc không được chứa số</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Dung lượng</label>
                      <input type="text" value={variant.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${variant.storage && (isNaN(parseInt(variant.storage)) || parseInt(variant.storage) <= 0) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} placeholder="256GB" />
                      {variant.storage && (isNaN(parseInt(variant.storage)) || parseInt(variant.storage) <= 0) && <p className="text-[10px] text-red-500 mt-1 font-bold">Dung lượng phải lớn hơn 0</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mã SKU</label>
                      <input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 text-sm font-bold outline-none focus:border-blue-500 bg-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Giá gốc</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="number" min="1" value={variant.originalPrice} onChange={e => handleVariantChange(index, 'originalPrice', e.target.value)}
                          className={`w-full pl-8 pr-3 py-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.originalPrice)) || Number(variant.originalPrice) <= 0 || String(variant.originalPrice).includes('-')) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      </div>
                      {(isNaN(Number(variant.originalPrice)) || Number(variant.originalPrice) <= 0 || String(variant.originalPrice).includes('-')) && <p className="text-[10px] text-red-500 mt-1 font-bold">Giá gốc phải lớn hơn 0</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Giá khuyến mãi</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="number" min="1" value={variant.discountedPrice} onChange={e => handleVariantChange(index, 'discountedPrice', e.target.value)}
                          className={`w-full pl-8 pr-3 py-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.discountedPrice)) || Number(variant.discountedPrice) <= 0 || String(variant.discountedPrice).includes('-') || Number(variant.discountedPrice) >= Number(variant.originalPrice)) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      </div>
                      {(isNaN(Number(variant.discountedPrice)) || Number(variant.discountedPrice) <= 0 || String(variant.discountedPrice).includes('-')) ? <p className="text-[10px] text-red-500 mt-1 font-bold">Giá khuyến mãi phải lớn hơn 0</p> :
                        Number(variant.discountedPrice) > Number(variant.originalPrice) ? <p className="text-[10px] text-red-500 mt-1 font-bold">Giá khuyến mãi phải nhỏ hơn Giá gốc</p> : null}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tồn kho</label>
                      <input type="number" min="1" value={variant.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)}
                        className={`w-full p-3 rounded-lg border text-sm font-bold outline-none bg-white ${(isNaN(Number(variant.stockQuantity)) || Number(variant.stockQuantity) <= 0 || String(variant.stockQuantity).includes('-')) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                      {(isNaN(Number(variant.stockQuantity)) || Number(variant.stockQuantity) <= 0 || String(variant.stockQuantity).includes('-')) && <p className="text-[10px] text-red-500 mt-1 font-bold">Tồn kho phải lớn hơn 0</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-lg flex justify-end gap-4 sticky bottom-6 z-10">
          <button type="button" onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            Hủy bỏ
          </button>
          <button type="submit" disabled={saving || hasErrors}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />} Lưu thay đổi
          </button>
        </div>
      </form>

      {/* DANH SÁCH BÌNH LUẬN DÀNH CHO ADMIN */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
            <MessageCircle size={18} /> Danh sách bình luận
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Hiển thị:</span>
            <select
              value={commentPageSize}
              onChange={(e) => {
                setCommentPageSize(parseInt(e.target.value));
                setCommentPage(0);
              }}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 p-2 outline-none font-medium"
            >
              <option value="5">5 dòng</option>
              <option value="10">10 dòng</option>
              <option value="20">20 dòng</option>
              <option value="50">50 dòng</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Sản phẩm này chưa có bình luận nào.
                  </td>
                </tr>
              ) : (
                comments.slice(commentPage * commentPageSize, (commentPage + 1) * commentPageSize).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {c.user} <span className="text-xs text-gray-400 font-normal ml-1">(ID: {c.userId || 'N/A'})</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < c.stars ? "text-yellow-400" : "text-gray-200"}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-sm break-words">{c.content}</p>
                      {c.replies && c.replies.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                          <span className="font-bold text-blue-600">Trả lời ({c.replies.length}):</span>
                          {c.replies.map(r => (
                            <div key={r.id} className="mt-1 flex justify-between">
                              <span><strong className="text-gray-700">{r.user}</strong>: {r.content}</span>
                              <button type="button" onClick={() => handleDeleteComment(r.id)} className="text-red-400 hover:text-red-600 ml-2" title="Xóa trả lời">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{c.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Comment Pagination Controls */}
        {comments.length > 0 && Math.ceil(comments.length / commentPageSize) > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {commentPage + 1} / {Math.ceil(comments.length / commentPageSize)} &nbsp;·&nbsp; Tổng {comments.length} bình luận
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={commentPage === 0}
                onClick={() => setCommentPage(commentPage - 1)}
                className="px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(Math.ceil(comments.length / commentPageSize), 5) }, (_, i) => {
                const totalP = Math.ceil(comments.length / commentPageSize);
                const p = totalP <= 5 ? i : commentPage < 3 ? i : commentPage > totalP - 3 ? totalP - 5 + i : commentPage - 2 + i;
                return (
                  <button key={p} type="button" onClick={() => setCommentPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === commentPage ? 'bg-red-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p + 1}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={commentPage === Math.ceil(comments.length / commentPageSize) - 1}
                onClick={() => setCommentPage(commentPage + 1)}
                className="px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all text-sm font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
