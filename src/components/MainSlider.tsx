import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const banners = [
  "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/iphone-16-pro-km-moi-home.png",
  "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/s24-ultra-th-3-home.jpg",
];

export const MainSlider = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        className="h-[300px]"
      >
        {banners.map((url, i) => (
          <SwiperSlide key={i}>
            <img src={url} className="w-full h-full object-cover" alt="Banner" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};