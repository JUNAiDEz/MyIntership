// src/pages/Services/Remap/components/HeroSection.jsx
import React from 'react';
import styles from './HeroSection.module.css'; // ปรับ path ตามที่อยู่จริงของไฟล์ css

const HeroSection = ({ bgImage, title, subtitle }) => {
  return (
    <section className={styles.heroSection}>
      <div 
        className={styles.heroMainBanner} 
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className={styles.heroOverlayContent}>
          <h1 className={styles.heroTitle}>
            {title} <span className={styles.highlightText}>TUNING</span>
          </h1>
          <div className={styles.heroDescription}>
            {subtitle}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;