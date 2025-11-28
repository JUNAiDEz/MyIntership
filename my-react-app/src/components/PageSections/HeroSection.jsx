import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Import Link
import styles from './HeroSection.module.css';

// Import ไอคอนมาเป็นตัวอย่าง (คุณสามารถเปลี่ยนเป็นรูปของคุณเองได้)
import { 
  FaWrench, FaTachometerAlt, FaCar, 
  FaGift, FaAward, FaQuestionCircle 
} from 'react-icons/fa';

function HeroSection() {
  return (
    <div className={styles.heroContainer}>
      
      {/* ===== 1. HERO BANNER ===== */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>
            Comes With The <span className={styles.heroHighlight}>Ultimate Protection</span>
          </p>
          <h1 className={styles.heroPlaceholder}>1920x730</h1>
          <p className={styles.searchTitle}>Search By Vehicle</p>
          {/* คุณสามารถเพิ่มช่องค้นหาตรงนี้ได้ในอนาคต */}
        </div>
      </div>

      {/* ===== 2. FEATURES GRID (นี่คือส่วนที่แก้ไข) ===== */}
      <div className={styles.featuresGrid}>
        
        {/* vvv 2. เปลี่ยน <div> เป็น <Link> และแก้ className vvv */}
        <Link to="/ourservices" className={styles.featureItemLink}>
          <FaWrench size={40} />
          <p>บริการ</p>
        </Link>
        
        {/* vvv 3. เปลี่ยน <div> เป็น <Link> และใส่ Path /shop vvv */}
        <Link to="/shop" className={styles.featureItemLink}>
          <FaTachometerAlt size={40} />
          <p>สินค้า</p>
        </Link>

        <Link to="/car" className={styles.featureItemLink}>
          <FaCar size={40} />
          <p>รถยนต์</p>
        </Link>

        <Link to="/promotions" className={styles.featureItemLink}>
          <FaGift size={40} />
          <p>โปรโมชั่น</p>
        </Link>

        <Link to="/portfolio" className={styles.featureItemLink}>
          <FaAward size={40} />
          <p>ผลงานของเรา</p>
        </Link>

        <Link to="/faq" className={styles.featureItemLink}>
          <FaQuestionCircle size={40} />
          <p>คำถามที่พบบ่อย</p>
        </Link>
      </div>
      
    </div>
  );
}

export default HeroSection;