export interface ProductComment {
  id: number;
  user: string;
  userId?: string | number;
  parentId?: number | null;
  content: string;
  stars: number;
  date: string;
  replies?: ProductComment[];
}

export interface WarrantyOption {
  id: number;
  name: string;
  price: number;
}

// Tương ứng với ProductVariantColor từ backend
export interface ProductVariantColor {
  id: number;
  color: string;
  stockQuantity: number;
  imageUrl: string;
}

// Tương ứng với ProductVariant từ backend
export interface ProductVariant {
  id: number;
  storage: string;
  originalPrice: number;
  discountedPrice: number | null;
  stockQuantity: number;
  thumbnailUrl: string;
  variantColors: ProductVariantColor[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug?: string;
  description: string;
  specs?: string; // Dạng text hoặc JSON string từ backend
  createdAt?: string;

  // Giá hiển thị (lấy từ variant đầu tiên, discounted hoặc original)
  price: number;
  originalPrice: number;
  discount: string;
  image: string; // thumbnail của variant đầu tiên hoặc image màu đầu tiên

  variants: ProductVariant[];

  // Cho bảng SpecTable hiển thị thủ công nếu cần map từ string
  specDetails?: {
    label: string;
    value: string;
  }[];
  comments: ProductComment[];
  warrantyOptions: WarrantyOption[];
}