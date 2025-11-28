import React, { useState } from 'react';
import styles from './CarColorizer.module.css';

// 1. รายการสี (คุณสามารถเพิ่ม/แก้ไขสี Hex code ได้ตามต้องการ)
const colorOptions = [
  { name: 'White', hex: '#ECF0F1' }, // (สีขาว/เทาอ่อน จะล้างสี)
  { name: 'Red', hex: '#E74C3C' },
  { name: 'Blue', hex: '#3498DB' },
  { name: 'Green', hex: '#2ECC71' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'Black', hex: '#34495E' },
];

// 2. Path ของรูปรถ (จากโฟลเดอร์ public)
const baseCarImage = '/images/cars/truck.png';

function CarColorizer() {
  // 3. สร้าง State เพื่อเก็บ "สีที่เลือก"
  const [activeColor, setActiveColor] = useState(colorOptions[0].hex); // เริ่มต้นด้วยสีแดง

  return (
    <div className={styles.colorizerSection}>
      <div className={styles.container}>
        
        <h2 className={styles.title}>COLOR WRAP TEST SERVICE</h2>
        
        {/* 4. ส่วนแสดงรูปภาพ */}
        <div className={styles.imageWrapper}>
          {/* 4a. รูปรถพื้นฐาน (สีขาว/เทา) */}
          <img 
            src={baseCarImage} 
            alt="Base Car Wrap" 
            className={styles.baseImage} 
          />
          {/* 4b. "เลเยอร์สี" ที่จะย้อมทับรูป 
             (เราใช้ mix-blend-mode: multiply ใน CSS) */}
          <div 
            className={styles.colorOverlay}
            style={{ 
              backgroundColor: activeColor,
              // (ถ้าเลือกสีขาว/เทาอ่อน เราจะซ่อนเลเยอร์สี)
              opacity: activeColor === '#ECF0F1' ? 0 : 1 
            }}
          ></div>
        </div>

        {/* 5. ส่วนปุ่มเลือกสี */}
        <div className={styles.controls}>
          {colorOptions.map((color) => (
            <button
              key={color.name}
              className={`${styles.swatch} ${activeColor === color.hex ? styles.active : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setActiveColor(color.hex)}
              aria-label={color.name}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default CarColorizer;