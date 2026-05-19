import React from 'react';

export type PaymentMethod = 'cod' | 'vietqr' | 'momo' | 'zalopay';

interface PaymentOptionProps {
  value: PaymentMethod;
  currentMethod: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
}

export const PaymentOption = ({ value, currentMethod, onChange, icon, title, subtitle, badgeText, badgeColor = 'bg-green-100 text-green-700' }: PaymentOptionProps) => (
  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${currentMethod === value ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${currentMethod === value ? 'bg-red-100' : 'bg-gray-100'}`}>{icon}</div>
      <div>
        <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
          {title}
          {badgeText && <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${badgeColor}`}>{badgeText}</span>}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${currentMethod === value ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}>
      {currentMethod === value && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
    <input type="radio" name="payment" value={value} className="hidden" onChange={() => onChange(value)} />
  </label>
);
