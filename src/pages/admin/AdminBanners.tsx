import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchBanners, deleteBanner } from '../../services/api';

export const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBanners(currentPage, pageSize);
      setBanners(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch banners", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [currentPage, pageSize]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này khỏi thư viện? (Lưu ý: Nếu đang dùng hiển thị sẽ bị lỗi)')) {
      const success = await deleteBanner(id);
      if (success) {
        loadBanners();
      } else {
        alert("Xóa banner thất bại!");
      }
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Thư viện Banner</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ hình ảnh quảng cáo để có thể tái sử dụng cho giao diện</p>
        </div>
        <Link 
          to="/admin/banners/add" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Thêm ảnh mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-bold">Đang tải dữ liệu thư viện...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Vị trí dự kiến</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="h-16 w-32 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{banner.title || 'Không có tiêu đề'}</div>
                        <div className="text-xs text-blue-500 max-w-[200px] truncate">{banner.targetUrl}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                          {banner.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${banner.active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {banner.active ? 'Kích hoạt' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/banners/edit/${banner.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {banners.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Chưa có banner nào trong thư viện.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {totalElements} banner
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Hiển thị:</span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => goToPage(currentPage - 1)}
                      className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const p = totalPages <= 7 ? i : currentPage < 4 ? i : currentPage > totalPages - 4 ? totalPages - 7 + i : currentPage - 3 + i;
                      return (
                        <button key={p} onClick={() => goToPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          {p + 1}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages - 1}
                      onClick={() => goToPage(currentPage + 1)}
                      className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <div className="flex items-center gap-2 ml-0 md:ml-4 pl-0 md:pl-4 md:border-l border-gray-200">
                      <span className="text-sm text-gray-500 font-medium">Đến trang:</span>
                      <input 
                        key={currentPage}
                        type="number" 
                        min={1} 
                        max={totalPages} 
                        defaultValue={currentPage + 1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                              goToPage(val - 1);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= totalPages && val - 1 !== currentPage) {
                            goToPage(val - 1);
                          } else {
                            e.target.value = String(currentPage + 1);
                          }
                        }}
                        className="w-12 h-9 text-center text-sm font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};