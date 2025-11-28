import React, { useState, useEffect } from 'react';
import Slider from 'react-slick'; 
// import "slick-carousel/slick/slick.css"; // (เปิดไว้ถ้าจำเป็น)
// import "slick-carousel/slick/slick-theme.css";

import ProductCard from './ProductCard';
import styles from './ProductCarousel.module.css';

function ProductCarousel({ title, items }) {
  
  // 1. สร้างฟังก์ชันคำนวณจำนวนรูป ตามขนาดหน้าจอจริง ณ ตอนนั้น
  const calculateSlidesToShow = () => {
    const width = window.innerWidth;
    if (width < 600) return 2;   // มือถือ: แสดง 2 (แก้ตรงนี้ถ้าอยากได้ 1 หรือ 2)
    if (width < 1024) return 3;  // แท็บเล็ต: แสดง 3
    return 4;                    // คอมพิวเตอร์: แสดง 4
  };

  // 2. set ค่าเริ่มต้นทันทีที่เข้าเว็บ
  const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow());

  // 3. ดักจับ event เวลาคนหมุนจอ หรือย่อขยายจอ
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(calculateSlidesToShow());
    };

    window.addEventListener('resize', handleResize);
    
    // cleanup function (ลบ event ออกเมื่อเปลี่ยนหน้า)
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    
    // ✨ ตรงนี้สำคัญ: ใช้ค่าจาก state ของเรา แทนการใช้ responsive array ของ slick ✨
    slidesToShow: slidesToShow, 
    slidesToScroll: 1,
    
    autoplay: true,
    autoplaySpeed: 10000,
    pauseOnHover: true,
    
    // (เอา responsive array ออกไปเลย เพื่อกันมันตีกันกับ Logic ของเรา)
  };

  return (
    <div className={styles.carouselSection}> 
      <div className={styles.carouselContainer}> 
        
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleAccent}></span> 
          {title}
        </h2>
        
        {/* ใส่ key={slidesToShow} เพื่อบังคับให้ Slider สร้างใหม่ทุกครั้งที่จำนวนรูปเปลี่ยน */}
        <Slider key={slidesToShow} {...settings}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: '0 10px' }}>
              <ProductCard product={item} />
            </div>
          ))}
        </Slider>

      </div>
    </div>
  );
}

export default ProductCarousel;