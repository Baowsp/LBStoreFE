export const BRAND_FILTERS: Record<string, any> = {
  "Apple": [
    { label: "Dòng iPhone", options: ["iPhone 17 Series", "iPhone 16 Series", "iPhone 15 Series"] },
    { label: "Loại màn hình", options: ["OLED", "LTPO Super Retina"] }
  ],
  "Samsung": [
    { label: "Dòng Galaxy", options: ["Galaxy S Series", "Galaxy Z Series", "Galaxy A Series"] },
    { label: "Tính năng", options: ["Hỗ trợ S-Pen", "Màn hình gập", "Kháng nước IP68"] }
  ],
  "Default": [
    { label: "Mức giá", options: ["Dưới 5 triệu", "5 - 10 triệu", "Trên 15 triệu"] },
    { label: "RAM", options: ["8GB", "12GB", "16GB"] }
  ]
};