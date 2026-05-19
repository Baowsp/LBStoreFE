import React from 'react';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  updateURL: (params: any) => void;
}

export const SearchPagination = ({ currentPage, totalPages, updateURL }: SearchPaginationProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pb-10">
      <button disabled={currentPage === 0} onClick={() => updateURL({ page: currentPage })} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:border-red-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all">
        Trang trước
      </button>
      {[...Array(totalPages)].map((_, idx) => {
        if (totalPages > 7) {
          if (idx !== 0 && idx !== totalPages - 1 && Math.abs(idx - currentPage) > 2) {
            if (idx === currentPage - 3 || idx === currentPage + 3) return <span key={idx} className="px-2">...</span>;
            return null;
          }
        }
        return (
          <button key={idx} onClick={() => updateURL({ page: idx + 1 })} className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === idx ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
            {idx + 1}
          </button>
        );
      })}
      <button disabled={currentPage >= totalPages - 1} onClick={() => updateURL({ page: currentPage + 2 })} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:border-red-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all">
        Trang sau
      </button>
    </div>
  );
};
