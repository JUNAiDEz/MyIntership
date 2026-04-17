// src/components/PageSections/PosterCarousel.jsx
// ขนาดรูป 1280 x 720

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import styles from './PosterCarousel.module.css';

// Import CSS ของ Slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PosterCarousel() {
  // Mockup ข้อมูลแบนเนอร์
  const posters = [
    {
      id: 1,
      imageUrl: '/images/FeatureBar/mainternance.jpg',
      alt: 'Intake Cleaning',
      link: '/services/pipe-cleaning'
    },
    {
      id: 2,
      imageUrl: '/images/FeatureBar/Brake.jpg',
      alt: 'Store',
      link: '/shop'
    },
    {
      id: 3,
      imageUrl: '/images/FeatureBar/Promotions.jpg',
      alt: 'Promotion',
      link: '/promotions'
    },
    {
      id: 4,
      imageUrl: '/images/FeatureBar/Wrap.jpg',
      alt: 'Striker',
      link: '/services/sticker'
    }
  ];

  // 1. ฟังก์ชันเช็คขนาดหน้าจอ
  const getSlidesCount = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 1;   // มือถือ: โชว์ 1 รูป
      if (width < 1024) return 2;  // แท็บเล็ต: โชว์ 2 รูป
      return 3;                    // คอมพิวเตอร์: โชว์ 3 รูป
    }
    return 3; // ค่า Default
  };

  // 2. สร้าง State เก็บจำนวนรูป และสถานะความเป็นมือถือ (เพื่อเปิด CenterMode)
  const [slidesToShow, setSlidesToShow] = useState(getSlidesCount());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 600 : false);

  // 3. ดักจับ Event เวลาย่อ/ขยายจอ
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesCount());
      setIsMobile(window.innerWidth < 600); // ถ้าจอกว้างน้อยกว่า 600px ถือว่าเป็นมือถือ
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  // 4. ตั้งค่า Slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: slidesToShow, // ✨ ควบคุมด้วย State
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    
    // ✨ ถ้าเป็นมือถือ ให้เปิด centerMode โชว์ขอบรูปข้างๆ โคตรเท่!
    centerMode: isMobile,
    centerPadding: isMobile ? '20px' : '0px'
  };

  return (
    <div className={styles.carouselWrapper}>
      
      {/* Header ของ Section */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>โปสเตอร์</h2>
      </div>

      {/* Slider (ใส่ key={slidesToShow} เพื่อบังคับให้รีเฟรชตอนเปลี่ยนจอ) */}
      <Slider key={slidesToShow} {...settings}>
        {posters.map((poster) => (
          <Link to={poster.link} key={poster.id} className={styles.posterLink}>
            <div className={styles.posterCard}>
              <img 
                src={poster.imageUrl} 
                alt={poster.alt} 
                className={styles.posterImage} 
                loading="lazy"
              />
              <div className={styles.posterOverlay}></div>
            </div>
          </Link>
        ))}
      </Slider>

    </div>
  );
}

export default PosterCarousel;