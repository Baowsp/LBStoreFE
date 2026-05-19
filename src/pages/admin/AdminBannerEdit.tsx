import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Type, Layout } from 'lucide-react';
import { updateBanner } from '../../services/api';

export const AdminBannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    position: 'HOME_MAIN_SLIDER',
    active: true,
    imageFile: null as File | null,
    imagePreview: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/banners/${id}`);
        if (!response.ok) throw new Error("Failed to fetch banner");
        const data = await response.json();
        setFormData({
          title: data.title || '',
          imageUrl: data.imageUrl || '',
          targetUrl: data.targetUrl || '',
          position: data.position || 'HOME_MAIN_SLIDER',
          active: data.active ?? true,
          imageFile: null,
          imagePreview: ''
        });
      } catch (error) {
        console.error("Error loading banner:", error);
        alert("Lỗi khi tải thông tin banner.");
        navigate('/admin/banners');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchBanner();
    }
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('targetUrl', formData.targetUrl);
      data.append('position', formData.position);
      data.append('active', formData.active ? 'true' : 'false');
      
      if (formData.imageFile) {
        data.append('imageFile', formData.imageFile);
      } else {
        data.append('imageUrl', formData.imageUrl);
      }

      await updateBanner(Number(id), data);
      alert("Cập nhật banner thành công!");
      navigate('/admin/banners');
    } catch (error) {
      console.error(error);
      alert("Cập nhật banner thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/banners')}
          className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chỉnh sửa Banner</h1>
          <p className="text-sm text-gray-500 font-medium">Cập nhật thông tin quảng cáo #{id}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Tiêu đề & Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tiêu đề Banner (Alt Text)</label>
              <div className="relative">
                <Type className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Đường dẫn (Link)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" required
                  value={formData.targetUrl}
                  onChange={e => setFormData({...formData, targetUrl: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vị trí hiển thị</label>
              <div className="relative">
                <Layout className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <select 
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all appearance-none"
                >
                  <option value="HOME_MAIN_SLIDER">Slider chính (Trang chủ)</option>
                  <option value="HOME_SUB_BANNER">Banner phụ (Bên phải Slider)</option>
                  <option value="PHONE">Danh mục: Điện thoại (Phone)</option>
                  <option value="LAPTOP">Danh mục: Laptop</option>
                  <option value="HEADPHONE">Danh mục: Tai nghe (HeadPhone)</option>
                  <option value="LOUDSPEAKER">Danh mục: Loa (LoudSpeaker)</option>
                  <option value="CAMERA">Danh mục: Camera</option>
                  <option value="SMARTWATCH">Danh mục: Đồng hồ (Smartwatch)</option>
                  <option value="BATTERY">Danh mục: Pin (Battery)</option>
                  <option value="ACCESSORY">Danh mục: Phụ kiện (Accessory)</option>
                  <option value="CATEGORY_HEADER">Banner danh mục chung (Category)</option>
                  <option value="POPUP_PROMO">Popup khuyến mãi</option>
                  <option value="CHECKOUT_PAGE">Banner trang thanh toán</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái</label>
              <div className="relative">
                <select 
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({...formData, active: e.target.value === 'true'})}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </div>
            </div>
          </div>

          {/* URL Hình ảnh */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hình ảnh Banner</label>
            <div className="relative">
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData({...formData, imageFile: file, imagePreview: URL.createObjectURL(file)});
                  }
                }}
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            {formData.imagePreview && (
              <div className="mt-4 p-2 border border-gray-200 rounded-xl bg-gray-50">
                <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
              </div>
            )}
            {!formData.imagePreview && formData.imageUrl && (
              <div className="mt-4 p-2 border border-gray-200 rounded-xl bg-gray-50">
                <img src={formData.imageUrl} alt="Current" className="w-full h-48 object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/banners')} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50">
            <Save size={18} /> {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};