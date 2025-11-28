import React from 'react';
import styles from './PlaceholderBanner.module.css';

function PlaceholderBanner() {
  return (
    <div className={styles.bannerContainer}>
      <h1 className={styles.placeholderText}>1920x730</h1>
      {/* (ในอนาคตคุณสามารถใส่เนื้อหาหรือรูปภาพจริงที่นี่) */}
    </div>
  );
}

export default PlaceholderBanner;