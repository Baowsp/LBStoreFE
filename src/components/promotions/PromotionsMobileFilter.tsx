import { SlidersHorizontal } from 'lucide-react';
import { getCatIcon } from './PromotionsSidebar';

interface PromotionsMobileFilterProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    selectedCats: Set<string>;
    availableCategories: { slug: string; name: string; count: number }[];
    isAllCats: boolean;
    clearCats: () => void;
    toggleCat: (slug: string) => void;
    typeFilter: 'all' | 'PERCENT' | 'FIXED';
    setTypeFilter: (type: 'all' | 'PERCENT' | 'FIXED') => void;
    cols: number;
    setCols: (cols: number) => void;
}

export const PromotionsMobileFilter = ({
    showFilters,
    setShowFilters,
    selectedCats,
    availableCategories,
    isAllCats,
    clearCats,
    toggleCat,
    typeFilter,
    setTypeFilter,
    cols,
    setCols,
}: PromotionsMobileFilterProps) => {
    return (
        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-4 space-y-3">
            <div className="flex items-center justify-between">
                <button onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <SlidersHorizontal size={16} /> Bộ lọc
                </button>
                {selectedCats.size > 0 && (
                    <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                        {selectedCats.size} danh mục
                    </span>
                )}
            </div>
            {showFilters && (
                <>
                    {/* Danh mục mobile — scroll ngang */}
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 pb-1">
                            <button onClick={clearCats}
                                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${isAllCats ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                Tất cả
                            </button>
                            {availableCategories.map(cat => {
                                const Icon = getCatIcon(cat.slug);
                                const active = selectedCats.has(cat.slug);
                                return (
                                    <button key={cat.slug} onClick={() => toggleCat(cat.slug)}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                        <Icon size={12} /> {cat.name}
                                        <span className={`text-[9px] font-black ${active ? 'text-white/70' : 'text-gray-400'}`}>{cat.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Loại giảm mobile */}
                    <div className="flex gap-2">
                        {([['all', 'Tất cả'], ['PERCENT', '📉 Giảm %'], ['FIXED', '💰 Giảm cứng']] as const).map(([val, label]) => (
                            <button key={val} onClick={() => setTypeFilter(val)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${typeFilter === val ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {label}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-1">
                            <span className="text-xs text-gray-400">Cột:</span>
                            {[3, 4, 5].map(n => (
                                <button key={n} onClick={() => setCols(n)}
                                    className={`w-7 h-7 rounded text-xs font-black ${cols === n ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
