// src/components/Product/ProductCarousel.tsx
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductCarouselProps {
  title?: string;
  items: Product[];
  viewAllLink?: string;
}

function ProductCarousel({ title, items, viewAllLink }: ProductCarouselProps) {
  // 1. ฟังก์ชันเช็คขนาดหน้าจอ (ปรับแต่งตัวเลขได้ตามต้องการ)
  const getSlidesCount = (): number => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 2;   // มือถือ: โชว์ 2 อัน
      if (width < 992) return 2;   // แท็บเล็ต: โชว์ 2 อัน
      if (width < 1200) return 3;  // คอมพิวเตอร์จอเล็ก: โชว์ 3 อัน
      return 4;                    // หน้าจอใหญ่ปกติ: โชว์ 4 อัน
    }
    return 4; // ค่า Default ป้องกัน Error
  };

  // 2. สร้าง State เก็บจำนวนการ์ด
  const [slidesToShow, setSlidesToShow] = useState(getSlidesCount());

  // 3. ดักจับ Event เวลาย่อ/ขยายจอ หรือหมุนมือถือ
  useEffect(() => {
    const handleResize = () => setSlidesToShow(getSlidesCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. เอาตัวแปร state มาใส่ใน Settings ได้เลย
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <div className="relative z-[2] mb-[60px]">
      <div className="product-carousel mx-auto max-w-[1400px] px-2.5">

        <div className="mb-[30px] flex items-center justify-between border-b border-themed pb-[15px] transition-colors md:items-end">
          <h2 className="m-0 border-l-[5px] border-accent pl-[15px] text-[1.5rem] font-extrabold italic uppercase leading-none text-text-main transition-colors md:text-[2rem]">
            {title}
          </h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="whitespace-nowrap rounded-[20px] border border-text-accent px-2.5 py-1 text-[0.8rem] font-semibold text-text-accent no-underline transition-all duration-300 hover:bg-text-accent hover:text-bg-main hover:shadow-[0_0_15px_rgba(255,199,9,0.4)] md:px-[15px] md:py-1.5 md:text-[0.9rem]"
            >
              {title && title.includes('สินค้า') ? 'VIEW ALL PRODUCTS' : 'VIEW ALL SERVICES'}
            </Link>
          )}
        </div>

        {/* ใส่ key={slidesToShow} เพื่อบังคับให้ Slider รีเซ็ตตัวเองใหม่เวลาเปลี่ยนจำนวน (กันบั๊กการ์ดเบียดกัน) */}
        <Slider key={slidesToShow} {...settings}>
          {items.map((item) => (
            <div key={String(item.id)} style={{ padding: '0 10px', height: '100%' }}>
              <ProductCard product={item} />
            </div>
          ))}
        </Slider>

      </div>
    </div>
  );
}

export default ProductCarousel;
