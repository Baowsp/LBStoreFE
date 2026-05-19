import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  current: string;
  options: string[];
  onSelect: (val: string) => void;
}

export const FilterDropdown = ({ label, current, options, onSelect }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${current !== 'Tất cả' ? 'border-red-600 bg-red-50 text-red-600' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
        {label}: {current}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 p-2 animate-in fade-in slide-in-from-top-2">
            <div className="max-h-60 overflow-y-auto no-scrollbar pr-1 custom-scrollbar">
              {options.map((opt: string) => (
                <button key={opt} onClick={() => { onSelect(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${current === opt ? 'bg-red-600 text-white' : 'hover:bg-red-50 text-gray-600'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
