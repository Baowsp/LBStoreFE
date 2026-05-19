import React from 'react';
import type { BackendCategory } from '../../services/api';

interface CategoryTabsProps {
  categories: BackendCategory[];
  appliedCategory: string;
  setTempCategory: (val: string) => void;
  setAppliedCategory: (val: string) => void;
  updateURL: (params: any) => void;
}

export const CategoryTabs = ({ categories, appliedCategory, setTempCategory, setAppliedCategory, updateURL }: CategoryTabsProps) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-6 mb-2">
      <button 
        onClick={() => { 
          setTempCategory('Tất cả'); 
          setAppliedCategory('Tất cả'); 
          updateURL({ page: 1 }); 
        }} 
        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${appliedCategory === 'Tất cả' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
      >
        Tất cả
      </button>
      {categories.map((cat) => (
        <button 
          key={cat.id} 
          onClick={() => { 
            setTempCategory(cat.name); 
            setAppliedCategory(cat.name); 
            updateURL({ page: 1 }); 
          }} 
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${appliedCategory === cat.name ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
