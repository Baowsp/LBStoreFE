import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ProductCard } from '../ProductCard';
import { AdBanner } from '../AdBanner';
import { Sidebar } from '../Sidebar';
import {
    ChevronRight, Zap, Smartphone, Laptop, Headphones, PackageX,
    Speaker, Camera, Battery, Package, Watch
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CategorySection = ({ title, icon: Icon, products, banners, slug, rows, cols }: any) => {
    if (!products || products.length === 0) return null;

    const colClasses: Record<number, string> = {
        2: "grid-cols-2 md:grid-cols-2 lg:grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        5: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
        6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
    };

    const numCols = cols || 4;
    const gridClass = colClasses[numCols] || colClasses[4];
    const maxItems = rows ? rows * numCols : products.length;

    const displayProducts = products.slice(0, maxItems);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2">
                    <Icon className="text-red-600" size={24} /> {title}
                </h2>
                <Link to={`/search?category=${slug}`} className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1">
                    Xem tất cả <ChevronRight size={16} />
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {banners && banners.length > 0 ? (
                    <>
                        <div className="hidden lg:block lg:col-span-3 rounded-2xl overflow-hidden shadow-sm relative min-h-[300px]">
                            <div className="absolute inset-0">
                                <Swiper modules={[Autoplay, Pagination]} spaceBetween={0} slidesPerView={1} pagination={{ clickable: true }} autoplay={{ delay: 3500 }} className="h-full w-full">
                                    {banners.map((img: string, idx: number) => (
                                        <SwiperSlide key={idx} className="h-full w-full">
                                            <img src={img} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                        <div className="lg:col-span-9">
                            <div className={`grid ${gridClass} gap-4`}>
                                {displayProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-12">
                        <div className={`grid ${gridClass} gap-4`}>
                            {displayProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
