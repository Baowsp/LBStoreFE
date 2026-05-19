import React from 'react';

export const InputGroup = ({ label, icon, value, disabled = false, type = "text", placeholder = "", onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-3.5 text-gray-300">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3.5 border-transparent rounded-2xl font-bold text-sm outline-none transition-all ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-50 focus:ring-2 focus:ring-red-500 focus:bg-white border hover:border-gray-200'
        }`}
      />
    </div>
  </div>
);
