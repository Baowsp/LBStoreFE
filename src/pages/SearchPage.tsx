import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { searchProductsByQuery, fetchProductsByCategory, fetchCategories, type BackendCategory } from '../services/api';
import type { Product } from '../types/product';
import { SearchFilters } from '../components/search/SearchFilters';
import { SearchPagination } from '../components/search/SearchPagination';
import { CategoryTabs } from '../components/search/CategoryTabs';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1') - 1;
  const itemsPerPage = parseInt(searchParams.get('size') || '20');

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ totalPages: 0, totalElements: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [tempCategory, setTempCategory] = useState('Tất cả');
  const [tempBrand, setTempBrand] = useState('Tất cả');
  const [tempPrice, setTempPrice] = useState('Tất cả');

  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(4);

  const [appliedFilters, setAppliedFilters] = useState({
    category: 'Tất cả',
    brand: 'Tất cả',
    price: 'Tất cả'
  });

  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchSearchData = async () => {
      setIsLoading(true);
      let res;
      if (categorySlug) {
        res = await fetchProductsByCategory(categorySlug, currentPage, itemsPerPage);
      } else {
        res = await searchProductsByQuery(query, currentPage, itemsPerPage);
      }
      setProducts(res.content);
      setPagination({ totalPages: res.totalPages, totalElements: res.totalElements });
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchSearchData();
  }, [query, categorySlug, currentPage, itemsPerPage]);

  const activeCategoryName = useMemo(() => {
    if (categorySlug) {
      return categories.find(c => c.slug === categorySlug)?.name || 'Tất cả';
    }
    return 'Tất cả';
  }, [categorySlug, categories]);

  const updateURL = (newParams: Record<string, string | number>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => updated.set(k, v.toString()));
    setSearchParams(updated);
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      category: tempCategory,
      brand: tempBrand,
      price: tempPrice
    });
    updateURL({ page: 1 });
  };

  const handleReset = () => {
    setTempCategory('Tất cả');
    setTempBrand('Tất cả');
    setTempPrice('Tất cả');
    setAppliedFilters({ category: 'Tất cả', brand: 'Tất cả', price: 'Tất cả' });
    updateURL({ page: 1, size: 20 });
  };

  const finalProducts = useMemo(() => {
    let result = [...products];

    if (appliedFilters.category !== 'Tất cả') {
      result = result.filter(p => p.category === appliedFilters.category);
    }
    if (appliedFilters.brand !== 'Tất cả') {
      result = result.filter(p => p.brand === appliedFilters.brand);
    }
    if (appliedFilters.price !== 'Tất cả') {
      if (appliedFilters.price === 'Dưới 5 triệu') result = result.filter(p => p.price < 5000000);
      if (appliedFilters.price === '5 - 10 triệu') result = result.filter(p => p.price >= 5000000 && p.price <= 10000000);
      if (appliedFilters.price === '10 - 20 triệu') result = result.filter(p => p.price >= 10000000 && p.price <= 20000000);
      if (appliedFilters.price === 'Trên 20 triệu') result = result.filter(p => p.price > 20000000);
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, appliedFilters, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">
          {query ? (
            <>Kết quả cho: <span className="text-red-600">"{query}"</span></>
          ) : (
            "Tất cả sản phẩm"
          )}
          <span className="ml-2 text-sm font-normal text-gray-500">({finalProducts.length} sản phẩm)</span>
        </h1>
        <button onClick={handleReset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
          <RotateCcw size={14} /> Làm mới bộ lọc
        </button>
      </div>

      <SearchFilters
        categories={categories}
        tempCategory={tempCategory} setTempCategory={setTempCategory}
        tempBrand={tempBrand} setTempBrand={setTempBrand}
        tempPrice={tempPrice} setTempPrice={setTempPrice}
        handleApplyFilter={handleApplyFilter}
        itemsPerPage={itemsPerPage} updateURL={updateURL}
        sortBy={sortBy} setSortBy={setSortBy}
      />

      <CategoryTabs
        categories={categories}
        appliedCategory={activeCategoryName}
        setTempCategory={(val) => { }}
        setAppliedCategory={(val) => {
          if (val === 'Tất cả') {
            updateURL({ category: '', page: 1 });
          } else {
            const catObj = categories.find(c => c.name === val);
            updateURL({ category: catObj?.slug || '', page: 1, q: '' });
          }
        }}
        updateURL={() => { }}
      />

      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Đang tìm kiếm...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="flex items-center gap-6 mb-6 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Hiển thị:</span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Cột </label>
              <input
                type="number" min="2" max="6"
                value={cols}
                onChange={(e) => {
                  const n = Math.max(2, Math.min(6, parseInt(e.target.value) || 2));
                  setCols(n);
                  updateURL({ size: n * rows, page: 1 });
                }}
                className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
              />
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Hàng </label>
              <input
                type="number" min="1" max="10"
                value={rows}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                  setRows(n);
                  updateURL({ size: cols * n, page: 1 });
                }}
                className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
              />
            </div>
          </div>

          <div className={`grid gap-6 mb-12 ${cols === 2 ? "grid-cols-2" :
              cols === 3 ? "grid-cols-2 md:grid-cols-3" :
                cols === 4 ? "grid-cols-2 md:grid-cols-4" :
                  cols === 5 ? "grid-cols-2 md:grid-cols-5" :
                    "grid-cols-2 md:grid-cols-6"
            }`}>
            {finalProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {pagination.totalPages > 1 && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              updateURL={updateURL}
            />
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <Search size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào khớp với bộ lọc của bạn.</p>
        </div>
      )}
    </div>
  );
};