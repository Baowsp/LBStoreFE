import { Filter, ArrowUpDown } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { BRANDS, PRICE_RANGES } from '../../data/categories';
import type { BackendCategory } from '../../services/api';

interface SearchFiltersProps {
  categories: BackendCategory[];
  tempCategory: string; setTempCategory: (val: string) => void;
  tempBrand: string; setTempBrand: (val: string) => void;
  tempPrice: string; setTempPrice: (val: string) => void;
  handleApplyFilter: () => void;
  itemsPerPage: number;
  updateURL: (params: any) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export const SearchFilters = ({
  categories, tempCategory, setTempCategory, tempBrand, setTempBrand, tempPrice, setTempPrice,
  handleApplyFilter, itemsPerPage, updateURL, sortBy, setSortBy
}: SearchFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-4">
      <div className="hidden md:flex items-center gap-2 font-bold text-sm text-gray-400 border-r pr-4 uppercase tracking-wider">
        Bộ lọc
      </div>
      <FilterDropdown label="Danh mục" current={tempCategory} options={['Tất cả', ...categories.map(c => c.name)]} onSelect={setTempCategory} />
      <FilterDropdown label="Hãng" current={tempBrand} options={BRANDS} onSelect={setTempBrand} />
      <FilterDropdown label="Giá" current={tempPrice} options={PRICE_RANGES} onSelect={setTempPrice} />
      <button onClick={handleApplyFilter} className="bg-red-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold uppercase hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex items-center gap-2">
        <Filter size={16} /> Áp dụng
      </button>

      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase">Hiển thị</span>
        <select
          value={itemsPerPage}
          onChange={(e) => updateURL({ size: e.target.value, page: 1 })}
          className="bg-transparent outline-none text-sm font-bold text-gray-700 cursor-pointer"
        >
          <option value="10">10 cái</option>
          <option value="20">20 cái</option>
          <option value="50">50 cái</option>
          <option value="100">100 cái</option>
        </select>
      </div>

      <div className="md:ml-auto flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        <ArrowUpDown size={16} className="text-gray-400" />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent outline-none text-sm font-bold text-gray-700 cursor-pointer">
          <option value="featured">Mặc định</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>
    </div>
  );
};
