import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ProductCard } from '../components/ProductCard';
import { AdBanner } from '../components/AdBanner';
import { Sidebar } from '../components/Sidebar';
import {
  ChevronRight, Zap, Smartphone, Laptop, Headphones, PackageX,
  Speaker, Camera, Battery, Package, Watch
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDisplayBanners, fetchProductsByCategory, fetchProducts } from '../services/api';
import type { Product } from '../types/product';
import { MOCK_SUB_BANNERS } from '../data/mock';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { CategorySection } from '../components/home/CategorySection';


export const HomePage = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(2);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // 1. Load Banners & Hot Deals (Top 5 newest)
        const [fetchedBanners, hotDeals] = await Promise.all([
          fetchDisplayBanners(),
          fetchProducts(0, 5)
        ]);
        setBanners(fetchedBanners);
        setFeaturedProducts(hotDeals.content);

        // 2. Load products for each category in parallel
        const categories = [
          { slug: 'dien-thoai', key: 'phones' },
          { slug: 'laptop', key: 'laptops' },
          { slug: 'tai-nghe', key: 'audios' },
          { slug: 'loa', key: 'speakers' },
          { slug: 'camera', key: 'cameras' },
          { slug: 'dong-ho-thong-minh', key: 'watch' },
          { slug: 'phu-kien', key: 'accessories' },
          { slug: 'pin', key: 'battery' }
        ];

        const catResults = await Promise.all(
          categories.map(c => fetchProductsByCategory(c.slug, 0, 24))
        );

        const newCatData: Record<string, Product[]> = {};
        categories.forEach((c, idx) => {
          newCatData[c.key] = catResults[idx].content;
        });
        setCategoryData(newCatData);

      } catch (error) {
        console.error("Home load error", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
      </div>
    );
  }

  const hasData = featuredProducts.length > 0 || Object.values(categoryData).some(arr => arr.length > 0);

  if (!hasData) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen flex flex-col items-center justify-center">
        <PackageX size={80} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-500">Trống</h2>
        <p className="text-gray-400 text-sm">Chưa có sản phẩm nào để hiển thị.</p>
      </div>
    );
  }


  const slugToPosition: Record<string, string> = {
    'dien-thoai': 'PHONE',
    'laptop': 'LAPTOP',
    'tai-nghe': 'HEADPHONE',
    'loa': 'LOUDSPEAKER',
    'camera': 'CAMERA',
    'dong-ho-thong-minh': 'SMARTWATCH',
    'phu-kien': 'ACCESSORY',
    'pin': 'BATTERY'
  };

  const getCategoryBanners = (slug: string, fallbackUrl: string) => {
    const pos = slugToPosition[slug] || 'CATEGORY_HEADER';
    const catBanners = banners.filter(b => b.position === pos && b.active);
    if (catBanners.length > 0) return catBanners.map(b => b.banner?.imageUrl);
    return [fallbackUrl];
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-10">
      <div className="container mx-auto px-4 pt-4">
        {/* SECTION 1: HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          <div className="hidden lg:block lg:col-span-2"><Sidebar /></div>
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm overflow-hidden h-[300px] lg:h-[360px]">
            {banners.filter(b => b.position === 'HOME_MAIN_SLIDER' && b.active).length > 0 ? (
              <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 4000 }} className="h-full">
                {banners.filter(b => b.position === 'HOME_MAIN_SLIDER' && b.active).map(b => (
                  <SwiperSlide key={b.id} className="h-full">
                    <AdBanner link={b.banner?.targetUrl || '#'} image={b.banner?.imageUrl} alt={b.banner?.title} className="w-full h-full" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : <div className="flex h-full items-center justify-center text-gray-300 font-bold uppercase italic bg-gray-100">LB Store</div>}
          </div>
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-[300px] lg:h-[360px]">
            {banners.filter(b => b.position === 'HOME_SUB_BANNER' && b.active).slice(0, 3).map(sb => (
              <AdBanner key={sb.id} link={sb.banner?.targetUrl || '#'} image={sb.banner?.imageUrl} alt={sb.banner?.title} className="flex-1 w-full" />
            ))}
            {/* Nếu không đủ 3 sub banner, fill bằng Mock data cho khỏi trống */}
            {banners.filter(b => b.position === 'HOME_SUB_BANNER' && b.active).length === 0 && MOCK_SUB_BANNERS.map(sb => (
              <AdBanner key={sb.id} link={sb.link} image={sb.image} alt={sb.alt} className="flex-1 w-full" />
            ))}
          </div>
        </div>

        {/* SECTION 2: FLASH SALE */}
        {featuredProducts.length > 0 && (
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 mb-12 shadow-xl shadow-red-100 relative overflow-hidden">
            <Zap size={180} className="absolute -top-10 -right-10 text-white opacity-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                <Zap className="animate-pulse text-yellow-300" fill="currentColor" /> Khuyến mãi HOT
              </h2>
              <Link to="/search" className="text-white text-xs font-black uppercase bg-white/20 px-6 py-2.5 rounded-full backdrop-blur-md hover:bg-white/30 transition-all">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* DISPLAY CONTROLS */}
        <div className="flex items-center gap-6 mb-6 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm font-semibold text-gray-600">Hiển thị:</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Cột </label>
            <input
              type="number" min="2" max="6"
              value={cols}
              onChange={(e) => setCols(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
              className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
            />
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Hàng </label>
            <input
              type="number" min="1" max="10"
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="w-16 h-8 px-2 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-gray-50 transition-all"
            />
          </div>
        </div>

        {/* CATEGORY SECTIONS */}
        <CategorySection title="Laptop" icon={Laptop} slug="laptop" products={categoryData.laptops} banners={getCategoryBanners('laptop', "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Điện thoại" icon={Smartphone} slug="dien-thoai" products={categoryData.phones} banners={getCategoryBanners('dien-thoai', "https://cdn.hoanghamobile.vn//Uploads/2026/04/01/honor-x8d-web.png;trim.threshold=0;trim.percentpadding=0;")} cols={cols} rows={rows} />
        <CategorySection title="Tai nghe" icon={Headphones} slug="tai-nghe" products={categoryData.audios} banners={getCategoryBanners('tai-nghe', "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Loa âm thanh" icon={Speaker} slug="loa" products={categoryData.speakers} banners={getCategoryBanners('loa', "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Camera" icon={Camera} slug="camera" products={categoryData.cameras} banners={getCategoryBanners('camera', "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Đồng hồ" icon={Watch} slug="dong-ho-thong-minh" products={categoryData.watch} banners={getCategoryBanners('dong-ho-thong-minh', "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Phụ kiện" icon={Package} slug="phu-kien" products={categoryData.accessories} banners={getCategoryBanners('phu-kien', "https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=300&h=400&fit=crop")} cols={cols} rows={rows} />
        <CategorySection title="Pin & Linh kiện" icon={Battery} slug="pin" products={categoryData.battery} banners={getCategoryBanners('pin', "https://viendidong.com/wp-content/uploads/2023/10/thay-pin-linh-kien-dien-thoai-thumbnail-viendidong.jpg")} cols={cols} rows={rows} />
      </div>
    </div>
  );
};