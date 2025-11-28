import React from 'react';
import styles from './VideoSection.module.css';

// vvv 1. (แก้ไข!) รับ props 3 ตัว vvv
function VideoSection({ title, youtubeId, backgroundColor }) {
  return (
    // vvv 2. (แก้ไข!) ใช้ backgroundColor จาก prop vvv
    <div className={styles.videoSection} style={{ backgroundColor: backgroundColor }}>
      <div className={styles.container}>
        
        {/* vvv 3. (แก้ไข!) ใช้ title จาก prop vvv */}
        <h2 className={styles.title}>{title}</h2>
        
        <div className={styles.videoWrapper}>
          <iframe 
            // vvv 4. (แก้ไข!) ใช้ youtubeId จาก prop vvv
            src={`https://www.youtube.com/embed/${youtubeId}`} 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;