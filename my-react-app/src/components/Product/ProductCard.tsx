import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Helper function (กรณีไม่ได้ import มา)
const getImageUrl = (img?: string): string => {
  if (!img) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${API_URL}${img}`;
};

interface CalculatedPrices {
  displayPrice: string;
  displayOldPrice: string | null;
  discountPercent: number;
}

// ฟังก์ชันคำนวณราคา
const calculatePrices = (product: Product): CalculatedPrices => {
  // รองรับทั้ง field 'price' และ 'unit_price' (เผื่อมาจาก structure ต่างกัน)
  const originalPrice = parseFloat(String(product.price ?? product.unit_price ?? 0));

  // รองรับ discount ทั้งแบบตัวเลขและ string (เช่น "10%")
  let discountVal: number | string = product.discount ?? 0;
  if (typeof discountVal === 'string') {
    discountVal = parseFloat(discountVal.replace('%', ''));
  }
  const discountPercent = Math.abs(Number(discountVal));

  let finalPrice = originalPrice;
  let oldPrice: number | null = null;

  if (discountPercent > 0 && originalPrice > 0) {
    finalPrice = originalPrice - (originalPrice * discountPercent) / 100;
    oldPrice = originalPrice;
  }

  return {
    displayPrice: finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    displayOldPrice: oldPrice ? oldPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : null,
    discountPercent,
  };
};

interface ProductCardProps {
  product: Product;
}

// กลุ่ม class ที่ตอบสนอง hover ของการ์ด (group) — ทำให้รูป zoom และชื่อเปลี่ยนสีตอน hover
function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // ดึงรูปภาพ (รองรับ structure หลายแบบ)
  const imageSource = product.images?.[0]?.image_url || product.imageUrl || product.image_url || '';
  const displayImageUrl = getImageUrl(imageSource);

  // คำนวณราคา
  const { displayPrice, displayOldPrice, discountPercent } = calculatePrices(product);

  // สร้าง Link URL (ใช้ slug ถ้ามี ถ้าไม่มีใช้ id)
  const productLink = product.slug ? `/shop/${product.slug}` : `/shop/${product.id || product.product_template_id}`;

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-[#222] bg-[#111] text-white transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:-translate-y-2 hover:border-accent hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. ส่วนรูปภาพ (คลิกแล้วไปหน้าสินค้า) */}
      <Link to={productLink} className="relative block w-full overflow-hidden bg-[#1a1a1a] pt-[100%]">
        <img
          src={displayImageUrl}
          alt={product.title || product.product_name || ''}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          loading="lazy"
        />

        {discountPercent > 0 && (
          <div className="absolute right-2.5 top-2.5 z-[2] rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
            -{discountPercent}%
          </div>
        )}
      </Link>

      {/* 2. ส่วนข้อมูลสินค้า */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-accent">
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span className="text-[0.75rem] text-[#666]">({product.reviews?.length || 0} Reviews)</span>
        </div>

        <Link to={productLink} className="no-underline">
          {/* ตัดข้อความเหลือ 2 บรรทัด (line-clamp-2) แทน ::-webkit-line-clamp เดิม */}
          <h4 className="m-0 mb-2.5 line-clamp-2 h-[2.8em] text-base font-medium leading-[1.4] text-[#ddd] transition-colors group-hover:text-white">
            {product.title || product.product_name || 'สินค้าไม่มีชื่อ'}
          </h4>
        </Link>

        {/* ดันลงล่างสุด + fix ความสูงกันกระตุกตอนสลับปุ่ม */}
        <div className="mt-auto flex h-10 items-center justify-between">
          {isHovered ? (
            <Link to={productLink} className="w-full">
              <button className="w-full cursor-pointer rounded border-0 bg-accent px-4 py-2 text-sm font-bold uppercase text-black transition-all hover:bg-white hover:shadow-[0_0_10px_rgba(255,199,9,0.6)]">
                VIEW DETAILS
              </button>
            </Link>
          ) : (
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-accent">{displayPrice}฿</span>
              {displayOldPrice && <span className="ml-2 text-sm text-[#666] line-through">{displayOldPrice}฿</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
