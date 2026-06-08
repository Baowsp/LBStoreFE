import React from 'react';
import {
    Smartphone, Laptop, Headphones, Speaker, Camera, Watch, Package, Battery, Tablet, Cpu
} from 'lucide-react';

// Map slug → icon
export const CAT_ICONS: Record<string, React.ElementType> = {
    'dien-thoai': Smartphone,
    'smartphone': Smartphone,
    'laptop': Laptop,
    'may-tinh-xach-tay': Laptop,
    'tai-nghe': Headphones,
    'headphone': Headphones,
    'loa': Speaker,
    'camera': Camera,
    'dong-ho': Watch,
    'smartwatch': Watch,
    'may-tinh-bang': Tablet,
    'tablet': Tablet,
    'linh-kien': Cpu,
    'phu-kien': Package,
    'pin': Battery,
};

export const getCatIcon = (slug: string): React.ElementType => {
    const lower = slug.toLowerCase();
    for (const key of Object.keys(CAT_ICONS)) {
        if (lower.includes(key)) return CAT_ICONS[key];
    }
    return Package;
};

interface PromotionsSidebarProps {
    availableCategories: { slug: string; name: string; count: number }[];
    selectedCats: Set<string>;
    toggleCat: (slug: string) => void;
    clearCats: () => void;
    selectAllCats: () => void;
    isAllCats: boolean;
    typeFilter: 'all' | 'PERCENT' | 'FIXED';
    setTypeFilter: (type: 'all' | 'PERCENT' | 'FIXED') => void;
    cols: number;
    setCols: (cols: number) => void;
    loading: boolean;
}

export const PromotionsSidebar = ({
    availableCategories,
    selectedCats,
    toggleCat,
    clearCats,
    selectAllCats,
    isAllCats,
    typeFilter,
    setTypeFilter,
    cols,
    setCols,
    loading,
}: PromotionsSidebarProps) => {
    return (
        <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
            {/* Danh mục */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 text-sm">Danh mục</h3>
                    <div className="flex gap-2">
                        <button onClick={clearCats}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${isAllCats ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            Tất cả
                        </button>
                        {!isAllCats && (
                            <button onClick={selectAllCats}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                                Chọn tất cả
                            </button>
                        )}
                    </div>
                </div>
                <div className="space-y-1">
                    {availableCategories.map(cat => {
                        const Icon = getCatIcon(cat.slug);
                        const active = selectedCats.has(cat.slug);
                        return (
                            <button key={cat.slug}
                                onClick={() => toggleCat(cat.slug)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition ${active
                                    ? 'bg-purple-600 text-white font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                                <Icon size={14} className={active ? 'text-white' : 'text-gray-400'} />
                                <span className="flex-1 truncate">{cat.name}</span>
                                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-black ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {cat.count}
                                </span>
                            </button>
                        );
                    })}
                    {availableCategories.length === 0 && !loading && (
                        <p className="text-xs text-gray-400 text-center py-3">Không có danh mục</p>
                    )}
                </div>
            </div>

            {/* Loại giảm */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-3">Loại giảm giá</h3>
                <div className="space-y-1">
                    {([
                        ['all', 'Tất cả'],
                        ['PERCENT', '📉 Giảm theo %'],
                        ['FIXED', '💰 Giảm cứng'],
                    ] as const).map(([val, label]) => (
                        <button key={val}
                            onClick={() => setTypeFilter(val)}
                            className={`w-full flex items-center px-3 py-2 rounded-xl text-left text-sm transition ${typeFilter === val
                                ? 'bg-red-600 text-white font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Số cột */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-3">Hiển thị (cột)</h3>
                <div className="flex gap-2">
                    {[3, 4, 5, 6].map(n => (
                        <button key={n} onClick={() => setCols(n)}
                            className={`flex-1 h-8 rounded-lg text-xs font-black transition ${cols === n ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};
