import React from 'react';
import styles from './PlaceholderBanner.module.css';

function PlaceholderBanner() {
  return (
    <div className={styles.bannerContainer}>
      <img 
        src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1920&h=730&fit=crop&q=80" 
        alt="Car Banner" 
        className={styles.bannerImage}
        onError={(e) => {
          console.error('Image failed to load');
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

export default PlaceholderBanner;