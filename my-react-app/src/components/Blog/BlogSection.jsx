import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import BlogCard from './BlogCard'; 
import styles from './BlogSection.module.css'; 

// --- ข้อมูล Blog จำลอง ---
const blogData = [
  { id: 1, date: '20', month: 'Oct', author: 'RASAUNA', title: 'Beauty Skin Care Product In Stock', description: 'Namikamd sodales vel online best prices when an unknown printer took a galley of', imageUrl: 'https://via.placeholder.com/348x228' },
  { id: 2, date: '24', month: 'Oct', author: 'RASAUNA', title: 'Lorem ipsum dolor sit thre elit.', description: 'Namikamd sodales vel online best prices when an unknown printer took a galley of', imageUrl: 'https://via.placeholder.com/348x228' },
  { id: 3, date: '22', month: 'Oct', author: 'RASAUNA', title: 'Possimus libero Id moles cumqu.', description: 'Namikamd sodales vel online best prices when an unknown printer took a galley of', imageUrl: 'https://via.placeholder.com/348x228' },
  { id: 4, date: '18', month: 'Oct', author: 'RASAUNA', title: 'Another Blog Post Example', description: 'Namikamd sodales vel online best prices when an unknown printer took a galley of', imageUrl: 'https://via.placeholder.com/348x228' },
];

function BlogSection() {
  
  // 1. ฟังก์ชันคำนวณจำนวนคอลัมน์
  const calculateSlidesToShow = () => {
    const width = window.innerWidth;
    
    // มือถือ (< 768px) ให้แสดง 2
    if (width < 768) return 2; 
    
    // แท็บเล็ตและคอมพิวเตอร์ ให้แสดง 3
    return 3; 
  };

  // 2. State เก็บค่าจำนวน slide
  const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow());

  // 3. useEffect ดักจับการเปลี่ยนขนาดจอ
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
    
    // ✨ ใช้ค่าจาก State ✨
    slidesToShow: slidesToShow, 
    slidesToScroll: 1,

    // เพิ่มลูกเล่น Autoplay
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
  };

  return (
    <div className={styles.blogSection}> 
      <div className={styles.blogContainer}>
        
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.titleAccent}></span>
            BLOG & ARTICLE
          </h2>
          <a href="#" className={styles.viewAllLink}>
            VIEW ALL BLOG
          </a>
        </div>
        
        {/* ✨ ใส่ key เพื่อบังคับ Render ใหม่เมื่อ Breakpoint เปลี่ยน ✨ */}
        <Slider key={slidesToShow} {...settings}>
          {blogData.map((blog) => (
            <div key={blog.id}>
              {/* padding เล็กน้อยเพื่อให้การ์ดไม่ติดกันเกินไป */}
              <div style={{ padding: '0 10px' }}>
                <BlogCard blog={blog} />
              </div>
            </div>
          ))}
        </Slider>

      </div>
    </div>
  );
}

export default BlogSection;