import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, Save } from 'lucide-react';
import { fetchDisplayBanners, fetchBanners, deleteDisplayBanner, createDisplayBanner, updateDisplayBanner } from '../../services/api';

export const AdminDisplayBanners = () => {
  const [displayBanners, setDisplayBanners] = useState<any[]>([]);
  const [libraryBanners, setLibraryBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id: null as number | null,
    bannerId: null as number | null,
    position: 'HOME_MAIN_SLIDER',
    categorySlug: '',
    active: true,
  });

  const categories = [
    { slug: 'dien-thoai', name: 'Điện thoại', position: 'PHONE' },
    { slug: 'laptop', name: 'Laptop', position: 'LAPTOP' },
    { slug: 'tai-nghe', name: 'Tai nghe', position: 'HEADPHONE' },
    { slug: 'loa', name: 'Loa âm thanh', position: 'LOUDSPEAKER' },
    { slug: 'camera', name: 'Camera', position: 'CAMERA' },
    { slug: 'dong-ho-thong-minh', name: 'Đồng hồ thông minh', position: 'SMARTWATCH' },
    { slug: 'phu-kien', name: 'Phụ kiện', position: 'ACCESSORY' },
    { slug: 'pin', name: 'Pin & Linh kiện', position: 'BATTERY' }
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [displayData, libraryData] = await Promise.all([
        fetchDisplayBanners(),
        fetchBanners()
      ]);
      setDisplayBanners(displayData);
      setLibraryBanners(libraryData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (position: string, categorySlug: string = '') => {
    setModalMode('add');
    setFormData({
      id: null,
      bannerId: null,
      position,
      categorySlug,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (displayBanner: any) => {
    setModalMode('edit');
    setFormData({
      id: displayBanner.id,
      bannerId: displayBanner.banner.id,
      position: displayBanner.position,
      categorySlug: displayBanner.categorySlug || '',
      active: displayBanner.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khỏi bố cục hiển thị?')) {
      const success = await deleteDisplayBanner(id);
      if (success) {
        setDisplayBanners(displayBanners.filter(b => b.id !== id));
      } else {
        alert("Xóa thất bại!");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bannerId) {
        alert("Vui lòng chọn một hình ảnh từ thư viện!");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        position: formData.position,
        categorySlug: formData.categorySlug,
        active: formData.active,
        displayOrder: 0
      };

      if (modalMode === 'add') {
        await createDisplayBanner(formData.bannerId, payload);
        alert("Thêm vào bố cục thành công!");
      } else {
        await updateDisplayBanner(formData.id!, formData.bannerId, payload);
        alert("Cập nhật bố cục thành công!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Lưu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainSliders = displayBanners.filter(b => b.position === 'HOME_MAIN_SLIDER');
  const subBanners = displayBanners.filter(b => b.position === 'HOME_SUB_BANNER');
  const categoryBanners = displayBanners.filter(b => b.position === 'CATEGORY_HEADER');

  // Lọc banner thư viện theo vị trí hiện tại của Modal
  const availableBanners = libraryBanners.filter(b => b.position === formData.position);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-start gap-2">
        <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản lý Bố cục Website</h1>
        <p className="text-sm text-gray-500 font-medium">Bấm vào các ô để chọn banner hiển thị từ thư viện</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Đang tải cấu trúc giao diện...</div>
      ) : (
        <div className="bg-[#f4f4f4] p-6 rounded-3xl border border-gray-200 shadow-inner">
          {/* SECTION 1: HERO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
            <div className="lg:col-span-8 bg-white p-4 rounded-2xl shadow-sm min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 uppercase">Slider Chính (Trang chủ)</h3>
                <button onClick={() => openAddModal('HOME_MAIN_SLIDER')} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"><Plus size={16}/> Thêm Slider</button>
              </div>
              <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[400px] p-2">
                {mainSliders.map(b => (
                  <div key={b.id} className="relative group rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 transition-all cursor-pointer">
                    <img src={b.banner?.imageUrl} alt="banner" className="w-full h-32 object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button onClick={() => openEditModal(b)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={16}/></button>
                    </div>
                    {!b.active && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Đã ẩn</div>}
                  </div>
                ))}
                {mainSliders.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400 font-bold text-sm">Trống</div>}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 uppercase">Banner Phụ (Phải)</h3>
                <button onClick={() => openAddModal('HOME_SUB_BANNER')} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"><Plus size={16}/> Thêm</button>
              </div>
              <div className="flex flex-col gap-4">
                {subBanners.slice(0, 3).map(b => (
                  <div key={b.id} className="relative group rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 h-24 cursor-pointer">
                    <img src={b.banner?.imageUrl} alt="banner" className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button onClick={() => openEditModal(b)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={16}/></button>
                    </div>
                    {!b.active && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Đã ẩn</div>}
                  </div>
                ))}
                {subBanners.length < 3 && Array.from({length: 3 - subBanners.length}).map((_, i) => (
                  <div key={`empty-${i}`} onClick={() => openAddModal('HOME_SUB_BANNER')} className="border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all">
                     <Plus size={24} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: CATEGORY BANNERS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-gray-800 uppercase mb-4">Banner Các Danh Mục (Category Header)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => {
                const b = displayBanners.find(cb => cb.position === cat.position);
                return (
                  <div key={cat.slug} className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg inline-block text-center">{cat.name}</div>
                    {b ? (
                      <div className="relative group rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 h-32 cursor-pointer">
                        <img src={b.banner?.imageUrl} alt="banner" className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button onClick={() => openEditModal(b)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={16}/></button>
                        </div>
                        {!b.active && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Đã ẩn</div>}
                      </div>
                    ) : (
                      <div onClick={() => openAddModal(cat.position, cat.slug)} className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col gap-2 items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all">
                        <ImageIcon size={24} />
                        <span className="text-xs font-bold">Thêm banner</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-screen flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-black text-gray-800 uppercase">{modalMode === 'add' ? 'Chọn Banner Hiển Thị' : 'Đổi Banner Hiển Thị'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái hiển thị</label>
                  <select value={formData.active ? 'true' : 'false'} onChange={e => setFormData({...formData, active: e.target.value === 'true'})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white appearance-none">
                    <option value="true">Hiển thị (Active)</option>
                    <option value="false">Tạm ẩn (Inactive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                    <span>Chọn hình ảnh từ Thư Viện</span>
                    <span className="text-blue-600">Đang lọc theo: {formData.position}</span>
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2 h-64 overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-xl p-2 bg-gray-50">
                    {availableBanners.map(b => (
                      <div 
                        key={b.id} 
                        onClick={() => setFormData({...formData, bannerId: b.id})}
                        className={`rounded-lg overflow-hidden h-20 cursor-pointer border-2 transition-all relative ${formData.bannerId === b.id ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:border-blue-300'}`}
                      >
                        <img src={b.imageUrl} className="w-full h-full object-cover" alt="gallery" />
                        {formData.bannerId === b.id && <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center"><div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div></div>}
                      </div>
                    ))}
                    {availableBanners.length === 0 && (
                      <div className="col-span-4 text-center py-10 text-gray-400 font-medium text-sm">
                        Chưa có banner nào trong thư viện cho vị trí này.<br/>Vui lòng qua trang "Thư viện Banner" để thêm ảnh.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting || !formData.bannerId} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50">
                  <Save size={16} /> {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
