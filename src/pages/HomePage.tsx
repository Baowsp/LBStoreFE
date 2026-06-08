import { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight, Smartphone, Laptop, Headphones, PackageX,
  Speaker, Camera, Battery, Package, Watch
} from 'lucide-react';
import { fetchDisplayBanners, fetchProductsByCategory, fetchPromotedProducts } from '../services/api';
import type { PromotedProduct } from '../services/api';
import type { Product } from '../types/product';
import { readDisplaySetting } from '../utils/displaySettings';

import { HeroSection } from '../components/home/HeroSection';
import { PromotionSection } from '../components/home/PromotionSection';
import { DisplayControls } from '../components/home/DisplayControls';
import { CategorySection } from '../components/home/CategorySection';

const SLUG_TO_POSITION: Record<string, string> = {
  'dien-thoai': 'PHONE',
  'laptop': 'LAPTOP',
  'tai-nghe': 'HEADPHONE',
  'loa': 'LOUDSPEAKER',
  'camera': 'CAMERA',
  'dong-ho-thong-minh': 'SMARTWATCH',
  'phu-kien': 'ACCESSORY',
  'pin': 'BATTERY',
};

const CATEGORIES = [
  { slug: 'dien-thoai', key: 'phones' },
  { slug: 'laptop', key: 'laptops' },
  { slug: 'tai-nghe', key: 'audios' },
  { slug: 'loa', key: 'speakers' },
  { slug: 'camera', key: 'cameras' },
  { slug: 'dong-ho-thong-minh', key: 'watch' },
  { slug: 'phu-kien', key: 'accessories' },
  { slug: 'pin', key: 'battery' },
];

export const HomePage = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, Product[]>>({});
  const [promotedProducts, setPromotedProducts] = useState<PromotedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cols, setCols] = useState(() => readDisplaySetting('home_cols'));
  const [rows, setRows] = useState(() => readDisplaySetting('home_rows'));

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [fetchedBanners, promoted] = await Promise.all([
          fetchDisplayBanners(),
          fetchPromotedProducts(),
        ]);
        setBanners(fetchedBanners);
        setPromotedProducts(promoted);

        const catResults = await Promise.all(
          CATEGORIES.map(c => fetchProductsByCategory(c.slug, 0, 24))
        );
        const newCatData: Record<string, Product[]> = {};
        CATEGORIES.forEach((c, idx) => { newCatData[c.key] = catResults[idx].content; });
        setCategoryData(newCatData);
      } catch (error) {
        console.error('Home load error', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Group sản phẩm theo từng promotion
  const promotionGroups = useMemo(() => {
    const map = new Map<number, { promotionId: number; promotionName: string; products: PromotedProduct[] }>();
    const homePromotions = promotedProducts.filter(p => p.showOnHomepage);
    for (const p of homePromotions) {
      if (!map.has(p.promotionId)) {
        map.set(p.promotionId, { promotionId: p.promotionId, promotionName: p.promotionName, products: [] });
      }
      map.get(p.promotionId)!.products.push(p);
    }
    return Array.from(map.values());
  }, [promotedProducts]);

  if (isLoading) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600" />
      </div>
    );
  }

  const hasData = Object.values(categoryData).some(arr => arr.length > 0) || promotionGroups.length > 0;
  if (!hasData) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen flex flex-col items-center justify-center">
        <PackageX size={80} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-500">Trống</h2>
        <p className="text-gray-400 text-sm">Chưa có sản phẩm nào để hiển thị.</p>
      </div>
    );
  }

  const getCategoryBanners = (slug: string, fallbackUrl: string): string[] => {
    const pos = SLUG_TO_POSITION[slug] || 'CATEGORY_HEADER';
    const catBanners = banners.filter(b => b.position === pos && b.active);
    if (catBanners.length > 0) return catBanners.map((b: any) => b.banner?.imageUrl);
    return [fallbackUrl];
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-10">
      <div className="container mx-auto px-4 pt-4">

        {/* SECTION 1: HERO */}
        <HeroSection banners={banners} />

        {/* SECTION 2: MỖI KHUYẾN MÃI = 1 SECTION */}
        {promotionGroups.map((group, idx) => (
          <PromotionSection
            key={group.promotionId}
            promotionId={group.promotionId}
            promotionName={group.promotionName}
            products={group.products}
            index={idx}
          />
        ))}

        {/* DANH MỤC SẢN PHẨM */}
        <CategorySection title="Laptop" icon={Laptop} slug="laptop" products={categoryData.laptops} banners={getCategoryBanners('laptop', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Điện thoại" icon={Smartphone} slug="dien-thoai" products={categoryData.phones} banners={getCategoryBanners('dien-thoai', 'https://cdn.hoanghamobile.vn//Uploads/2026/04/01/honor-x8d-web.png;trim.threshold=0;trim.percentpadding=0;')} cols={cols} rows={rows} />
        <CategorySection title="Tai nghe" icon={Headphones} slug="tai-nghe" products={categoryData.audios} banners={getCategoryBanners('tai-nghe', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Loa âm thanh" icon={Speaker} slug="loa" products={categoryData.speakers} banners={getCategoryBanners('loa', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Camera" icon={Camera} slug="camera" products={categoryData.cameras} banners={getCategoryBanners('camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Đồng hồ" icon={Watch} slug="dong-ho-thong-minh" products={categoryData.watch} banners={getCategoryBanners('dong-ho-thong-minh', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Phụ kiện" icon={Package} slug="phu-kien" products={categoryData.accessories} banners={getCategoryBanners('phu-kien', 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=300&h=400&fit=crop')} cols={cols} rows={rows} />
        <CategorySection title="Pin & Linh kiện" icon={Battery} slug="pin" products={categoryData.battery} banners={getCategoryBanners('pin', 'https://viendidong.com/wp-content/uploads/2023/10/thay-pin-linh-kien-dien-thoai-thumbnail-viendidong.jpg')} cols={cols} rows={rows} />
      </div>
    </div>
  );
};