import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Sidebar } from '../Sidebar';
import { AdBanner } from '../AdBanner';
import { MOCK_SUB_BANNERS } from '../../data/mock';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Props {
  banners: any[];
}

export const HeroSection = ({ banners }: Props) => {
  const mainSliderBanners = banners.filter(b => b.position === 'HOME_MAIN_SLIDER' && b.active);
  const subBanners = banners.filter(b => b.position === 'HOME_SUB_BANNER' && b.active).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
      {/* Sidebar danh mục */}
      <div className="hidden lg:block lg:col-span-2">
        <Sidebar />
      </div>

      {/* Slider chính */}
      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm overflow-hidden h-[300px] lg:h-[360px]">
        {mainSliderBanners.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="h-full"
          >
            {mainSliderBanners.map(b => (
              <SwiperSlide key={b.id} className="h-full">
                <AdBanner
                  link={b.banner?.targetUrl || '#'}
                  image={b.banner?.imageUrl}
                  alt={b.banner?.title}
                  className="w-full h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 font-bold uppercase italic bg-gray-100">
            LB Store
          </div>
        )}
      </div>

      {/* Sub-banners bên phải */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-[300px] lg:h-[360px]">
        {subBanners.length > 0
          ? subBanners.map(sb => (
              <AdBanner
                key={sb.id}
                link={sb.banner?.targetUrl || '#'}
                image={sb.banner?.imageUrl}
                alt={sb.banner?.title}
                className="flex-1 w-full"
              />
            ))
          : MOCK_SUB_BANNERS.map(sb => (
              <AdBanner key={sb.id} link={sb.link} image={sb.image} alt={sb.alt} className="flex-1 w-full" />
            ))
        }
      </div>
    </div>
  );
};
