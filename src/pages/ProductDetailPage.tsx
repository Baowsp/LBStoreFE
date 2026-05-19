import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';
import { SpecTable } from '../components/SpecTable';
import { fetchProductById } from '../services/api';
import type { Product, ProductVariant, ProductVariantColor } from '../types/product';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInfoCard } from '../components/product/ProductInfoCard';

export const ProductDetailPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATES ---
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadProduct = async () => {
      setIsLoading(true);
      if (id) {
        const data = await fetchProductById(id);
        if (data) {
          setProduct(data);
          const firstVariant = data.variants?.[0] ?? null;
          setSelectedVariant(firstVariant);
          setSelectedColor(firstVariant?.variantColors?.[0] ?? null);
          setSelectedWarranty(data.warrantyOptions?.[0] ?? { id: 0, name: 'Bảo hành tiêu chuẩn', price: 0 });
        }
      }
      setIsLoading(false);
    };
    loadProduct();
  }, [id]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.variantColors?.[0] ?? null);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (!product || !selectedVariant) return <div className="text-center py-20 font-bold text-gray-500">Sản phẩm không tồn tại!</div>;

  const variantPrice = selectedVariant.discountedPrice ?? selectedVariant.originalPrice;
  const finalPrice = variantPrice + (selectedWarranty?.price || 0);

  const displayImage =
    selectedColor?.imageUrl ||
    selectedVariant.thumbnailUrl ||
    product.image;

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-10">
      <div className="container mx-auto px-4 py-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <Link to="/" className="hover:text-cps font-medium">Trang chủ</Link> <ChevronRight size={12} />
          <span>{product.category}</span> <ChevronRight size={12} />
          <span className="text-gray-900 font-bold truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-8 space-y-6">
            <ProductGallery 
              product={product} 
              selectedVariant={selectedVariant} 
              selectedColor={selectedColor} 
              setSelectedColor={setSelectedColor} 
              displayImage={displayImage} 
            />

            <SpecTable specs={product.specs || product.description || product.specDetails} />

            {(() => {
              const isJson = product.description?.trim().startsWith('{') || product.description?.trim().startsWith('[');
              if (isJson || !product.description) return null;
              
              return (
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-black mb-4 uppercase tracking-tight text-gray-800">Mô tả sản phẩm</h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </div>
                </div>
              );
            })()}

            <CommentSection productId={product.id} />
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-4 space-y-6">
            <ProductInfoCard 
              product={product} 
              selectedVariant={selectedVariant} 
              selectedColor={selectedColor} 
              selectedWarranty={selectedWarranty} 
              setSelectedColor={setSelectedColor} 
              setSelectedWarranty={setSelectedWarranty} 
              handleVariantChange={handleVariantChange} 
              finalPrice={finalPrice} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};