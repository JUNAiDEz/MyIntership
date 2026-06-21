// src/components/PageSections/ShopProductCard.tsx
import { useState, type MouseEvent } from 'react';
import { getImageUrl, calculatePrices } from '@/utils/productHelpers';
import type { Product } from '@/types';

interface ShopProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

function ShopProductCard({ product, onProductClick }: ShopProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImageUrl = getImageUrl(product.imageUrl);
  const { displayPrice, displayOldPrice } = calculatePrices(product);

  const handleAddToCartClick = (e: MouseEvent) => {
    e.stopPropagation(); // (หยุดไม่ให้ Modal เปิด)
    // (ใส่ logic เพิ่มลงตะกร้าจริงที่นี่)
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border border-[#eee] bg-white transition-shadow duration-200 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
    >
      <div className="relative w-full shrink-0 overflow-hidden bg-[#f9f9f9] pb-[100%]">
        <img src={displayImageUrl} alt={product.title} className="absolute left-0 top-0 h-full w-full object-cover" />

        {/* แสดง % ส่วนลดที่มุม */}
        {product.discount && (
          <div className="absolute right-2 top-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#ffc107] text-[0.65rem] font-bold text-black md:right-2.5 md:top-2.5 md:h-[35px] md:w-[35px] md:text-[0.7rem]">
            {String(product.discount)}
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-3 md:p-[15px]">
        <div className="mb-2 text-[0.75rem] text-[#777] md:mb-2.5 md:text-[0.8rem]">
          <span className="mr-[5px] text-[#f39c12]">⭐️⭐️⭐️⭐️⭐️</span>
          <span>({product.reviews?.length || 0}) Review</span>
        </div>
        <h4 className="m-0 mb-2 line-clamp-2 h-[2.34rem] text-[0.9rem] font-bold leading-[1.3] text-[#333] md:mb-2.5 md:h-[2.6rem] md:text-base">{product.title}</h4>

        <div className="mt-auto flex h-[35px] items-center gap-1.5 md:h-10 md:gap-2">
          {isHovered ? (
            <button className="w-full cursor-pointer rounded border-0 bg-[#ffc107] p-2 text-[0.8rem] font-bold text-black transition-opacity hover:opacity-90 md:p-2.5 md:text-[0.9rem]" onClick={handleAddToCartClick}>
              ADD TO CART
            </button>
          ) : (
            <>
              <span className="text-base font-bold text-black md:text-[1.1rem]">{displayPrice}฿</span>
              {displayOldPrice && (
                <span className="text-[0.8rem] text-[#999] line-through md:text-[0.9rem]">{displayOldPrice}฿</span>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default ShopProductCard;
