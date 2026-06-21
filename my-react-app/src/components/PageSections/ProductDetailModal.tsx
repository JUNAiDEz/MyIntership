// src/components/PageSections/ProductDetailModal.tsx
import type { MouseEvent } from 'react';
import { getImageUrl, calculatePrices } from '@/utils/productHelpers';
import type { Product } from '@/types';

interface ModalProduct extends Product {
  stock?: number;
  brand?: { name?: string };
  description?: string;
}

interface ProductDetailModalProps {
  product: ModalProduct;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const navButtonCls =
  'absolute top-1/2 z-[1001] flex h-[35px] w-[35px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-white/90 text-[1.2rem] font-bold text-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-110 hover:bg-white md:h-[45px] md:w-[45px] md:text-[1.8rem]';

function ProductDetailModal({ product, onClose, onNext, onPrev }: ProductDetailModalProps) {
  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  const handleNextClick = (e: MouseEvent) => {
    e.stopPropagation();
    onNext();
  };

  const handlePrevClick = (e: MouseEvent) => {
    e.stopPropagation();
    onPrev();
  };

  const { displayPrice, displayOldPrice } = calculatePrices(product);
  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-[1000] box-border flex h-full w-full items-center justify-center bg-black/70 p-2.5 md:p-5" onClick={onClose}>

      <button className={`${navButtonCls} left-[5px] md:left-[30px]`} onClick={handlePrevClick}>
        &lt;
      </button>

      <div className="relative max-h-[95vh] w-full max-w-full overflow-y-auto rounded-lg bg-white shadow-[0_5px_15px_rgba(0,0,0,0.3)] md:max-h-[90vh] md:max-w-[900px]" onClick={stopPropagation}>

        <button className="absolute right-2.5 top-2.5 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#ccc] bg-white p-0 text-base font-bold text-[#555] hover:bg-[#f4f4f4] md:right-[15px] md:top-[15px] md:h-[30px] md:w-[30px] md:text-[1.2rem]" onClick={onClose}>×</button>

        <div className="grid grid-cols-1 gap-5 p-[15px] md:grid-cols-2 md:gap-[30px] md:p-[30px]">

          <div className="w-full">
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.title}
              className="h-auto w-full rounded-lg border border-[#eee] object-contain max-md:max-h-[300px] md:aspect-square"
            />
          </div>

          <div className="flex flex-col">
            {product.brand && (
              <span className="mb-[5px] text-[0.8rem] font-bold uppercase text-[#777] md:text-[0.9rem]">{product.brand.name}</span>
            )}

            <h2 className="m-0 mb-2.5 text-[1.3rem] font-bold text-[#222] md:text-[1.8rem]">{product.title}</h2>

            <div className="mb-2.5">
              <span className="text-[1.3rem] font-bold text-black md:text-[1.5rem]">{displayPrice}฿</span>
              {displayOldPrice && (
                <span className="ml-2 text-[0.9rem] text-[#999] line-through md:ml-2.5 md:text-[1.1rem]">{displayOldPrice}฿</span>
              )}
            </div>

            <div className="mb-[15px] text-[0.8rem] text-[#777] md:text-[0.9rem]">
              <span className="mr-[5px] text-[#f39c12]">⭐️⭐️⭐️⭐️⭐️</span>
              <span>({product.reviews?.length || 0}) Reviews</span>
            </div>

            <div className="mb-[15px] text-[0.8rem] font-medium md:text-[0.9rem]">
              สถานะ: <span className={inStock ? 'font-bold text-[#28a745]' : 'font-bold text-[#dc3545]'}>
                {inStock ? `มีสินค้า (${product.stock} ชิ้น)` : 'สินค้าหมด'}
              </span>
            </div>

            <p className="mb-5 grow text-[0.9rem] leading-[1.6] text-[#555] md:text-base">
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>

            <button
              className="w-full cursor-pointer rounded border-none bg-[#ffc107] p-2.5 text-[0.9rem] font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e0e0e0] md:p-3 md:text-base"
              disabled={!inStock}
            >
              {inStock ? 'ADD TO CART' : 'สินค้าหมด'}
            </button>
          </div>
        </div>
      </div>

      <button className={`${navButtonCls} right-[5px] md:right-[30px]`} onClick={handleNextClick}>
        &gt;
      </button>

    </div>
  );
}

export default ProductDetailModal;
