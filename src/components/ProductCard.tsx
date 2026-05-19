import type { Product } from '../types/product';
import { useCartStore } from '../store/useCartStore';
import {Link} from 'react-router-dom';
export const ProductCard = ({ product }: { product: Product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  return (
    <Link to={`/product/${product.id}`} className="group h-full">
    <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full border border-gray-100">
      <div className="h-32 flex items-center justify-center overflow-hidden p-2">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
      <div className="mt-auto">
        <p className="text-red-600 font-bold">{product.price.toLocaleString()}đ</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString()}đ</span>
          <span className="bg-red-100 text-red-600 text-[10px] px-1 rounded font-bold">{product.discount}</span>
        </div>
      </div>
      <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Chặn sự kiện click thẻ div cha
        const defaultVariant = product.variants?.[0];
        const defaultColor = defaultVariant?.variantColors?.[0];
        const variantId = defaultColor?.id;

        addToCart({
          ...product,
          cartItemId: `${product.id}-${defaultVariant?.id || 'def'}-${variantId || 'def'}`,
          variantId: variantId, // Gán ID thực tế từ DB
          selectedColor: defaultColor?.color || '',
          selectedStorage: defaultVariant?.storage || ''
        });
      }}
      className="w-full mt-2 bg-cps text-white py-1 rounded-md text-sm font-bold hover:bg-red-700"
    >
      MUA NGAY
    </button>
    </div>
    </Link>
  );
};