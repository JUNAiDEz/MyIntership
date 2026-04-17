// src/components/Product/ProductCarousel.jsx

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick'; 
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard'; 
import styles from './ProductCarousel.module.css';

function ProductCarousel({ title, items, viewAllLink }) {
  
  // 1. ฟังก์ชันเช็คขนาดหน้าจอ (ปรับแต่งตัวเลขได้ตามต้องการ)
  const getSlidesCount = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 2;   // มือถือ: โชว์ 2 อัน
      if (width < 992) return 2;   // แท็บเล็ต: โชว์ 2 อัน (หรือแก้เป็น 3 ก็ได้)
      if (width < 1200) return 3;  // คอมพิวเตอร์จอเล็ก: โชว์ 3 อัน
      return 4;                    // หน้าจอใหญ่ปกติ: โชว์ 4 อัน
    }
    return 4; // ค่า Default ป้องกัน Error
  };

  // 2. สร้าง State เก็บจำนวนการ์ด
  const [slidesToShow, setSlidesToShow] = useState(getSlidesCount());

  // 3. ดักจับ Event เวลาย่อ/ขยายจอ หรือหมุนมือถือ
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesCount());
    };

    window.addEventListener('resize', handleResize);
    // Cleanup ป้องกัน Memory Leak
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. เอาตัวแปร state มาใส่ใน Settings ได้เลย
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: slidesToShow, // ✨ ควบคุมจำนวนจาก State ของเราเอง 100%
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    // ไม่ต้องใช้ responsive array แล้ว
  };

  return (
    <div className={styles.carouselSection}> 
      <div className={styles.carouselContainer}> 
        
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {title}
          </h2>
          {viewAllLink && (
            <Link to={viewAllLink} className={styles.viewAllLink}>
              {title && title.includes('สินค้า') ? 'VIEW ALL PRODUCTS' : 'VIEW ALL SERVICES'}
            </Link>
          )}
        </div>
        
        {/* ใส่ key={slidesToShow} เพื่อบังคับให้ Slider รีเซ็ตตัวเองใหม่เวลาเปลี่ยนจำนวน (กันบั๊กการ์ดเบียดกัน) */}
        <Slider key={slidesToShow} {...settings}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: '0 10px', height: '100%' }}>
              <ProductCard product={item} />
            </div>
          ))}
        </Slider>

      </div>
    </div>
  );
}

export default ProductCarousel;