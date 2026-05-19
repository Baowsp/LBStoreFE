import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import type { Product, ProductVariant, ProductVariantColor } from '../../types/product';

interface ProductInfoCardProps {
  product: Product;
  selectedVariant: ProductVariant;
  selectedColor: ProductVariantColor | null;
  selectedWarranty: any;
  setSelectedColor: (c: ProductVariantColor) => void;
  setSelectedWarranty: (w: any) => void;
  handleVariantChange: (v: ProductVariant) => void;
  finalPrice: number;
}

export const ProductInfoCard = ({
  product,
  selectedVariant,
  selectedColor,
  selectedWarranty,
  setSelectedColor,
  setSelectedWarranty,
  handleVariantChange,
  finalPrice
}: ProductInfoCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h1 className="text-xl font-black text-gray-900 mb-4">{product.name}</h1>

      {/* CHỌN DUNG LƯỢNG */}
      <div className="mb-6">
        <p className="text-sm font-bold mb-3 uppercase text-gray-700">1. Chọn dung lượng</p>
        <div className="grid grid-cols-3 gap-2">
          {product.variants.map((v) => {
            const vPrice = v.discountedPrice ?? v.originalPrice;
            return (
              <button
                key={v.id}
                onClick={() => handleVariantChange(v)}
                className={`py-2 px-1 border-2 rounded-xl text-center transition-all ${
                  selectedVariant.id === v.id ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <span className="block text-xs font-black">{v.storage}</span>
                <span className="block text-[10px] opacity-80">{vPrice.toLocaleString()}đ</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHỌN MÀU SẮC — từ variantColors của variant đang chọn */}
      {selectedVariant.variantColors.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold mb-3 uppercase text-gray-700">2. Chọn màu sắc</p>
          <div className="grid grid-cols-2 gap-2">
            {selectedVariant.variantColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
                  selectedColor?.id === color.id
                    ? 'border-red-600 bg-red-50 ring-1 ring-red-600'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {color.imageUrl ? (
                  <img src={color.imageUrl} className="w-5 h-5 rounded-full object-cover border border-gray-200" alt={color.color} />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-200 bg-gray-200" />
                )}
                <span className="text-[12px] font-bold text-gray-700">{color.color}</span>
                {color.stockQuantity === 0 && (
                  <span className="text-[10px] text-red-400 ml-auto">Hết</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHỌN GÓI BẢO HÀNH */}
      <div className="mb-6">
        <p className="text-sm font-bold mb-3 uppercase text-gray-700">
          {selectedVariant.variantColors.length > 0 ? '3.' : '2.'} Gói bảo hành
        </p>
        <div className="space-y-2">
          {product.warrantyOptions?.map((w: any) => (
            <div
              key={w.id}
              onClick={() => setSelectedWarranty(w)}
              className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${
                selectedWarranty?.id === w.id ? 'border-red-600 bg-red-50' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedWarranty?.id === w.id
                  ? <CheckCircle2 size={18} className="text-red-600 fill-white" />
                  : <div className="w-[18px] h-[18px] border-2 rounded-full" />
                }
                <span className="text-[12px] font-bold text-gray-700">{w.name}</span>
              </div>
              <span className="text-[11px] font-black">+{w.price.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>

      {/* HIỂN THỊ TỔNG TIỀN */}
      <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-dashed border-red-300">
        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Tổng tiền tạm tính:</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-red-600">{finalPrice.toLocaleString()}đ</span>
          {(selectedVariant.discountedPrice != null && selectedVariant.discountedPrice < selectedVariant.originalPrice) && (
            <span className="text-gray-400 line-through text-sm font-bold">
              {selectedVariant.originalPrice.toLocaleString()}đ
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-2 italic font-medium">
          Đang chọn: {selectedColor?.color ?? '—'}, {selectedVariant.storage}
        </p>
      </div>

      {/* NÚT MUA HÀNG */}
      <button
        onClick={() => {
          if (!selectedColor) {
            alert('Vui lòng chọn màu sắc!');
            return;
          }
          addToCart({
            ...product,
            cartItemId: `${product.id}-${selectedVariant.id}-${selectedColor.id}`,
            price: finalPrice,
            name: product.name,
            maxQuantity: selectedColor.stockQuantity,
            selectedColor: selectedColor.color,
            selectedStorage: selectedVariant.storage,
            selectedRam: '',
            variantId: selectedColor.id,
          });
        }}
        className="w-full bg-cps text-white py-4 rounded-2xl font-black uppercase text-lg hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-[0.98]"
      >
        Mua ngay
      </button>
    </div>
  );
};
