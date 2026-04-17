import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';

// 1. 🔥 Import วิดีโอจาก path เดิม
import carVideo from '../Video/car-video.mp4';

// Import Icons
import { 
  FaWrench, FaTachometerAlt, FaCar, 
  FaGift, FaAward, FaQuestionCircle 
} from 'react-icons/fa';

function HeroSection() {
  return (
    <div className={styles.heroContainer}>
      
      {/* ===== 1. HERO BANNER (Video Background) ===== */}
      <div className={styles.heroBanner}>
        
        {/* Layer สีดำจางๆ เพื่อให้ตัวหนังสืออ่านง่าย */}
        <div className={styles.heroOverlay}></div>

        {/* Video Background */}
        <video 
          className={styles.heroBannerImage} 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={carVideo} type="video/mp4" />
          Browser ของคุณไม่รองรับการเล่นวิดีโอ
        </video>

        {/* Hero Text Content (เพิ่มเข้ามาให้ดูโปร) */}
        <div className={styles.heroContent}>
           <h1>GT7 <span>MOTOR</span></h1>
           <p>CENTER OF EXCELLENCE FOR YOUR VEHICLE</p>
        </div>
      </div>

      {/* ===== 2. FEATURES GRID (Navigation Bar) ===== */}
      <div className={styles.featuresGrid}>
        
        <Link to="/ourservices" className={styles.featureItemLink}>
          <FaWrench size={32} />
          <p>บริการ</p>
        </Link>
        
        <Link to="/shop" className={styles.featureItemLink}>
          <FaTachometerAlt size={32} />
          <p>สินค้า</p>
        </Link>

        <Link to="/car" className={styles.featureItemLink}>
          <FaCar size={32} />
          <p>รถยนต์</p>
        </Link>

        <Link to="/promotions" className={styles.featureItemLink}>
          <FaGift size={32} />
          <p>โปรโมชั่น</p>
        </Link>

        <Link to="/portfolio" className={styles.featureItemLink}>
          <FaAward size={32} />
          <p>ผลงาน</p>
        </Link>

        <Link to="/faq" className={styles.featureItemLink}>
          <FaQuestionCircle size={32} />
          <p>ถาม-ตอบ</p>
        </Link>
      </div>
      
    </div>
  );
}

export default HeroSection;