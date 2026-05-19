import type { Product } from "../types/product";

export const MOCK_BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=690&h=300&fit=crop",
    link: "/product/1",
    alt: "iPhone 16 Series"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=690&h=300&fit=crop",
    link: "/product/2",
    alt: "Galaxy S24 Ultra"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=690&h=300&fit=crop",
    link: "/product/4",
    alt: "MacBook Air M3"
  }
];

export const MOCK_SUB_BANNERS = [
  {
    id: 1,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/690x300_ROI_MacBookNeo.png",
    link: "/category/laptop",
    alt: "Back to School"
  },
  {
    id: 2,
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:100/plain/https://dashboard.cellphones.com.vn/storage/Home(3).png",
    link: "/category/accessories",
    alt: "Phụ kiện Apple"
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "iPhone 16 Pro Max 512GB",
    price: 36990000,
    originalPrice: 40990000,
    discount: "-10%",
    brand: "Apple",
    category: "Phone",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-sa-mac.png",
    colorOptions: [
      { name: "Titan tự nhiên", code: "#8e8c87" },
      { name: "Titan Sa mạc", code: "#c7b198" },
      { name: "Titan Trắng", code: "#f2f2f2" },
      { name: "Titan Đen", code: "#333333" },
    ],
    variants: [
      { storage: "256GB", price: 34990000, originalPrice: 37990000 },
      { storage: "512GB", price: 39990000, originalPrice: 42990000 },
      { storage: "1TB", price: 44990000, originalPrice: 47990000 },
    ],
    specs: [
      { label: "Màn hình", value: "6.9 inches, LTPO Super Retina XDR OLED" },
      { label: "Chipset", value: "Apple A18 Pro (3nm)" },
      { label: "RAM", value: "8GB" },
      { label: "Bộ nhớ trong", value: "512GB" },
      { label: "Camera sau", value: "48MP (Chính) + 48MP (Góc rộng) + 12MP (Tele 5x)" },
      { label: "Pin", value: "4,676 mAh, Sạc nhanh 25W" }
    ],
    comments: [
      { id: 101, user: "Nguyễn Văn A", content: "Máy quá đẹp, màu titan sa mạc nhìn sang thực sự!", stars: 5, date: "15/09/2024" },
      { id: 102, user: "Trần Thị B", content: "Nút Camera Control mới dùng chưa quen lắm nhưng chụp ảnh tiện.", stars: 4, date: "20/09/2024" }
    ],
    warrantyOptions: [
      { id: 1, name: "Bảo hành tiêu chuẩn 12 tháng", price: 0 },
      { id: 2, name: "AppleCare+ (2 năm)", price: 4500000 },
      { id: 3, name: "Bảo hành VIP 1 đổi 1 (12 tháng)", price: 1500000 },
    ]
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra 12GB 256GB",
    price: 26990000,
    originalPrice: 33990000,
    discount: "-20%",
    brand: "Samsung",
    category: "Phone",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
    colorOptions: [
      { name: "Xám Titan", code: "#808080" },
      { name: "Đen Titan", code: "#000000" },
      { name: "Tím Titan", code: "#800080" },
      { name: "Vàng Titan", code: "#FFD700" },
    ],
    variants: [
      { storage: "256GB", price: 26990000, originalPrice: 33990000 },
      { storage: "512GB", price: 29990000, originalPrice: 37490000 },
      { storage: "1TB", price: 35990000, originalPrice: 44490000 },
    ],
    specs: [
      { label: "Màn hình", value: "6.8 inches, Dynamic AMOLED 2X, 120Hz" },
      { label: "Chipset", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { label: "RAM", value: "12GB" },
      { label: "Camera", value: "200MP + 50MP + 12MP + 10MP" },
      { label: "Pin", value: "5000 mAh, 45W" }
    ],
    comments: [],
    warrantyOptions: [
      { id: 1, name: "Bảo hành chính hãng 12 tháng", price: 0 },
      { id: 2, name: "Samsung Care+ 1 năm", price: 1200000 },
    ]
  },
  {
    id: 3,
    name: "Xiaomi 14 Ultra 16GB 512GB",
    price: 29990000,
    originalPrice: 32990000,
    discount: "-9%",
    brand: "Xiaomi",
    category: "Phone",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra-trang-min.png",
    colorOptions: [
      { name: "Đen", code: "#000000" },
      { name: "Trắng", code: "#FFFFFF" },
    ],
    variants: [],
    specs: [
      { label: "Màn hình", value: "6.73 inches, LTPO AMOLED, 120Hz" },
      { label: "Chipset", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "Leica 50MP (Quad Cam)" },
      { label: "Pin", value: "5000 mAh, 90W" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 4,
    name: "MacBook Air M3 13 inch 2024 8GB 256GB",
    price: 27490000,
    originalPrice: 27990000,
    discount: "-2%",
    brand: "Apple",
    category: "Laptop",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch-gray-1.png",
    colorOptions: [
      { name: "Xám", code: "#808080" },
      { name: "Bạc", code: "#C0C0C0" },
      { name: "Xanh đen", code: "#191970" },
      { name: "Vàng", code: "#FFD700" },
    ],
    variants: [
      { storage: "256GB", price: 27490000, originalPrice: 27990000 },
      { storage: "512GB", price: 32490000, originalPrice: 32990000 },
    ],
    specs: [
      { label: "Màn hình", value: "13.6 inches, Liquid Retina" },
      { label: "Chipset", value: "Apple M3" },
      { label: "RAM", value: "8GB" },
      { label: "SSD", value: "256GB" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 5,
    name: "iPad Pro 11 inch M4 2024 Wifi 256GB",
    price: 28990000,
    originalPrice: 29990000,
    discount: "-3%",
    brand: "Apple",
    category: "Laptop",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-13-select-wifi-spaceblack-202405-02.jpg",
    colorOptions: [
      { name: "Đen không gian", code: "#333333" },
      { name: "Bạc", code: "#C0C0C0" },
    ],
    variants: [],
    specs: [
      { label: "Màn hình", value: "11 inches, Ultra Retina XDR OLED" },
      { label: "Chipset", value: "Apple M4 (9-core CPU)" },
      { label: "RAM", value: "8GB" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 6,
    name: "Tai nghe chống ồn Sony WH-1000XM5",
    price: 6490000,
    originalPrice: 7990000,
    discount: "-19%",
    brand: "Sony",
    category: "Audio",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/o/sony_wh-1000xm5_3_.png",
    colorOptions: [
      { name: "Đen", code: "#000000" },
      { name: "Bạc", code: "#C0C0C0" },
      { name: "Xanh dương", code: "#0000FF" },
    ],
    variants: [],
    specs: [
      { label: "Loại", value: "Over-ear" },
      { label: "Kết nối", value: "Bluetooth 5.2" },
      { label: "Pin", value: "30 giờ (NC on)" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 7,
    name: "Apple Watch Ultra 2 49mm 4G",
    price: 19990000,
    originalPrice: 21990000,
    discount: "-9%",
    brand: "Apple",
    category: "Watch",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/w/a/watch-ultra-2-alpine-blue-1.png",
    colorOptions: [],
    variants: [],
    specs: [
      { label: "Màn hình", value: "1.92 inches, Retina LTPO OLED, 3000 nits" },
      { label: "Vi xử lý", value: "Apple S9 SiP" },
      { label: "Pin", value: "36 giờ (chế độ thường)" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 8,
    name: "ASUS ROG Phone 8 12GB 256GB",
    price: 19990000,
    originalPrice: 21990000,
    discount: "-9%",
    brand: "ASUS",
    category: "Phone",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/o/rog-phone-8-black-1.png",
    colorOptions: [
      { name: "Đen Phantom", code: "#000000" },
      { name: "Xám", code: "#808080" },
    ],
    variants: [],
    specs: [
      { label: "Màn hình", value: "6.78 inches, AMOLED, 165Hz" },
      { label: "Chipset", value: "Snapdragon 8 Gen 3" },
      { label: "Pin", value: "5500 mAh, 65W" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 9,
    name: "Tai nghe Bluetooth Apple AirPods Pro 2 2023 USB-C",
    price: 5990000,
    originalPrice: 6190000,
    discount: "-3%",
    brand: "Apple",
    category: "Audio",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/i/airpods-pro-2-usb-c_1.png",
    colorOptions: [],
    variants: [],
    specs: [
      { label: "Chip", value: "Apple H2" },
      { label: "Chống ồn", value: "ANC 2.0" },
      { label: "Sạc", value: "MagSafe, USB-C" }
    ],
    comments: [],
    warrantyOptions: []
  },
  {
    id: 10,
    name: "Loa Bluetooth Marshall Stanmore III",
    price: 9290000,
    originalPrice: 10990000,
    discount: "-15%",
    brand: "Marshall",
    category: "Audio",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/marshall-stanmore-iii-black-1.png",
    colorOptions: [
      { name: "Đen", code: "#000000" },
      { name: "Kem", code: "#F5F5DC" },
      { name: "Nâu", code: "#8B4513" },
    ],
    variants: [],
    specs: [
      { label: "Công suất", value: "80W" },
      { label: "Kết nối", value: "Bluetooth 5.2, AUX, RCA" }
    ],
    comments: [],
    warrantyOptions: []
  }
];
