import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../ProductCard';
import type { Product } from '../../types/product';

interface Props {
  featuredProducts: Product[];
}

export const FlashSaleSection = ({ featuredProducts }: Props) => {
  if (featuredProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 mb-12 shadow-xl shadow-red-100 relative overflow-hidden">
      <Zap size={180} className="absolute -top-10 -right-10 text-white opacity-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
          <Zap className="animate-pulse text-yellow-300" fill="currentColor" />
          Khuyến mãi HOT
        </h2>
        <Link
          to="/search"
          className="text-white text-xs font-black uppercase bg-white/20 px-6 py-2.5 rounded-full backdrop-blur-md hover:bg-white/30 transition-all"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
        {featuredProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
