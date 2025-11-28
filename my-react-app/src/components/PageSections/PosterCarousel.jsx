import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import styles from './PosterCarousel.module.css';

// 400x300
const posters = [
  { id: 1, imageUrl: 'https://placehold.co/400x300/333/FFF?text=POSTER+1', linkUrl: '/shop' },
  { id: 2, imageUrl: 'https://placehold.co/400x300/555/FFF?text=POSTER+2', linkUrl: '/services' },
  { id: 3, imageUrl: 'https://placehold.co/400x300/777/FFF?text=PROMOTION', linkUrl: '/' },
  { id: 4, imageUrl: 'https://placehold.co/400x300/999/FFF?text=POSTER+4', linkUrl: '/shop' },
];

function PosterCarousel() {
  
  // 1. ฟังก์ชันคำนวณจำนวนรูป
  const calculateSlidesToShow = () => {
    const width = window.innerWidth;
    
    // ✨ แก้ตรงนี้ครับ: เปลี่ยน return 1 เป็น return 2 ✨
    if (width < 768) return 2;   // มือถือ: แสดง 2 ชิ้น
    
    if (width < 1024) return 2;  // แท็บเล็ต: แสดง 2 ชิ้น
    return 3;                    // คอมพิวเตอร์: แสดง 3 ชิ้น
  };

  // 2. Set ค่าเริ่มต้น
  const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow());

  // 3. ดักจับการ Resize
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(calculateSlidesToShow());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    
    // ใช้ค่าจาก State
    slidesToShow: slidesToShow,
    slidesToScroll: 1,

    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
  };

  return (
    <div className={styles.posterSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>SERVICE POSTER</h2>
        
        {/* ใส่ key เพื่อบังคับ Render ใหม่เมื่อจำนวนเปลี่ยน */}
        <Slider key={slidesToShow} {...settings}>
          {posters.map(poster => (
            <div key={poster.id} className={styles.posterWrapper}>
              <Link to={poster.linkUrl} className={styles.posterLink}>
                {/* ใส่ width: 100% เพื่อให้รูปยืดหดตามกรอบ ไม่ล้นออกมา */}
                <img 
                  src={poster.imageUrl} 
                  alt={`Poster ${poster.id}`} 
                  style={{ width: '100%', display: 'block' }} 
                />
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default PosterCarousel;