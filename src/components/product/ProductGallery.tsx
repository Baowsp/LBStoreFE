import React from 'react';
import type { Product, ProductVariant, ProductVariantColor } from '../../types/product';

interface ProductGalleryProps {
  product: Product;
  selectedVariant: ProductVariant;
  selectedColor: ProductVariantColor | null;
  setSelectedColor: (c: ProductVariantColor) => void;
  displayImage: string;
}

export const ProductGallery = ({ product, selectedVariant, selectedColor, setSelectedColor, displayImage }: ProductGalleryProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 flex flex-col items-center">
      <img
        src={displayImage}
        className="h-[150px] md:h-[220px] object-contain hover:scale-105 transition-transform duration-700 max-w-full"
        alt={product.name}
      />
      {/* Thumbnail màu sắc: hiển thị ảnh từng màu của variant đang chọn */}
      {selectedVariant.variantColors.length > 0 && (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {selectedVariant.variantColors.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedColor(c)}
              className={`w-20 h-20 border-2 rounded-2xl p-1 flex items-center justify-center cursor-pointer transition-all ${
                selectedColor?.id === c.id ? 'border-red-500' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              {c.imageUrl ? (
                <img src={c.imageUrl} className="max-h-full object-contain" alt={c.color} />
              ) : (
                <span className="text-[10px] text-gray-500 text-center">{c.color}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
