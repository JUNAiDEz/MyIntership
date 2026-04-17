// src/pages/Services/Remap/components/ReviewGallery.jsx
import React from 'react';
import styles from './ReviewGallery.module.css';

const ReviewGallery = ({ reviewItems }) => {
  return (
    <section className={`${styles.reviewSection} container`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} style={{color: '#fff'}}>GALLERY & REVIEW</h2>
        <div className={styles.titleUnderline}></div>
      </div>
      <div className={styles.reviewGrid}>
        {reviewItems.map((item, idx) => (
          <div key={idx} className={styles.reviewCard}>
            <div className={styles.reviewMedia}>
              {item.type === 'video' ? (
                <iframe 
                  width="100%" 
                  height="250" 
                  src={`https://www.youtube.com/embed/${item.videoId}`} 
                  title={item.title} 
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              ) : (
                <img 
                  src={item.src} 
                  alt={item.title} 
                  loading="lazy" 
                  decoding="async" 
                  width="1000" 
                  height="600" 
                />
              )}
            </div>
            <div className={styles.reviewContent}>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewGallery;