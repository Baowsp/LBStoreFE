import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminFetchProducts, adminDeleteProduct } from '../../services/adminApi';

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [error, setError] = useState('');

  const loadProducts = useCallback((page: number, size: number, search: string) => {
    setLoading(true);
    setError('');
    adminFetchProducts(page, size, search)
      .then(({ content, totalElements, totalPages }) => {
        setProducts(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProducts(0, pageSize, activeSearchTerm); }, [loadProducts, pageSize, activeSearchTerm]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      loadProducts(currentPage, pageSize, activeSearchTerm);
    } catch (e: any) {
      alert('Xóa thất bại: ' + e.message);
    }
  };

  const displayedProducts = products;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, pageSize, activeSearchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Đang tải...' : `Tổng ${totalElements} sản phẩm`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            setSearchTerm('');
            setActiveSearchTerm('');
            setCurrentPage(0);
            loadProducts(0, pageSize, '');
          }} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all" title="Làm mới">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
          ⚠ {error}. Vui lòng đảm bảo backend đang chạy.
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setCurrentPage(0);
                  setActiveSearchTerm(searchTerm);
                }
              }}
              placeholder="Tìm kiếm sản phẩm trên máy chủ..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-l-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => {
              setCurrentPage(0);
              setActiveSearchTerm(searchTerm);
            }}
            className="bg-gray-100 border border-gray-100 border-l-0 px-4 rounded-r-xl hover:bg-gray-200 transition-colors font-bold text-gray-600"
          >
            Tìm
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Hiển thị:</span>
          <select 
            value={pageSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value);
              setPageSize(newSize);
              setCurrentPage(0);
            }}
            className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-2 outline-none font-medium"
          >
            <option value="5">5 dòng</option>
            <option value="10">10 dòng</option>
            <option value="20">20 dòng</option>
            <option value="50">50 dòng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Hãng</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : displayedProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">Không tìm thấy sản phẩm nào.</td></tr>
              ) : displayedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">#{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border-2 border-gray-100 p-1 bg-white flex items-center justify-center flex-shrink-0 group-hover:border-red-100 transition-colors overflow-hidden">
                        {(product.imageURL || product.image_url) ? (
                          <img
                            src={(product.imageURL || product.image_url).startsWith('http') ? (product.imageURL || product.image_url) : `http://localhost:8080${product.imageURL || product.image_url}`}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <span className="text-gray-300 text-2xl">📦</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">{product.category?.name ?? 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{product.brand?.name ?? product.brand ?? 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{product.stockQuantity ?? product.stock_quantity ?? 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {totalElements} sản phẩm
            </span>
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
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === currentPage ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
                  className="w-16 h-9 text-center text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};