import React, { useState } from 'react';
import styles from './CarColorizer.module.css';

// 1. รายการสี (คงจำนวนเดิม) พร้อมไฟล์ภาพที่เตรียมไว้ใต้ /public/images/carwrap
const colorOptions = [
    {
    name: 'Black',
    hex: '#34495E',
    image: 'carmatteblack.png',
    swatchImage: 'matteblack.png',
  },
    {
    name: 'Yellow',
    hex: '#F1C40F',
    image: 'carkevlar.png',
    swatchImage: 'kevlar.png',
  },
    {
    name: 'Purple',
    hex: '#9B59B6',
    image: 'carhoneycombblack8D.png',
    swatchImage: 'honeycombblack8D.png',
  },
    {
    name: 'Blue',
    hex: '#3498DB',
    image: 'carglossyblackpet.png',
    swatchImage: 'glossyblackpet.png',
  },
  {
    name: 'White',
    hex: '#ECF0F1',
    image: 'carpearlwhitepet.png',
    swatchImage: 'pearlwhitepet.png',
  },
  {
    name: 'Red',
    hex: '#E74C3C',
    image: 'carredpet.png',
    swatchImage: 'redpet.png',
  },

  {
    name: 'Green',
    hex: '#2ECC71',
    image: 'carlimesavinglizardpet.png',
    swatchImage: 'limesavinglizardpet.png',
  },



];

const carWrapFolder = '/images/carwrap/';
const fallbackCarImage = '/images/cars/gtr.png';

function CarColorizer() {
  // 3. สร้าง State เพื่อเก็บ "สี/ไฟล์ที่เลือก"
  const [activeColor, setActiveColor] = useState(colorOptions[0]);
  const [hasImageError, setHasImageError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('right');
  const [touchStartX, setTouchStartX] = useState(null);

  const getImageSrc = (imageFile) => `${carWrapFolder}${imageFile}`;
  const displayedImage = hasImageError
    ? fallbackCarImage
    : getImageSrc(activeColor.image);

  const applyColorByIndex = (nextIndex) => {
    const boundedIndex =
      nextIndex < 0
        ? colorOptions.length - 1
        : nextIndex >= colorOptions.length
        ? 0
        : nextIndex;
    setSlideDir(boundedIndex >= activeIndex ? 'right' : 'left');
    setActiveIndex(boundedIndex);
    setActiveColor(colorOptions[boundedIndex]);
    setHasImageError(false);
  };

  const handleSelectColor = (color) => {
    const nextIndex = colorOptions.findIndex((c) => c.name === color.name);
    setSlideDir(nextIndex >= activeIndex ? 'right' : 'left');
    setActiveIndex(nextIndex);
    setActiveColor(color);
    setHasImageError(false); // รีเซ็ต error เมื่อเปลี่ยนภาพ
  };
  const getSwatchStyle = (color) => ({
    backgroundColor: color.hex,
    backgroundImage: color.swatchImage ? `url(${getImageSrc(color.swatchImage)})` : 'none',
  });

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40;
    if (deltaX > threshold) {
      applyColorByIndex(activeIndex - 1);
    } else if (deltaX < -threshold) {
      applyColorByIndex(activeIndex + 1);
    }
    setTouchStartX(null);
  };

  return (
    <div className={styles.colorizerSection}>
      <div className={styles.container}>
        
        <h2 className={styles.title}></h2>
        
        {/* 4. ส่วนแสดงรูปภาพ (ใช้ภาพแยกตามสี) */}
        <div
          className={styles.imageWrapper}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={() => applyColorByIndex(activeIndex - 1)}
            aria-label="Previous color"
          >
            ‹
          </button>
          <img
            key={activeColor.name}
            src={displayedImage}
            alt={`${activeColor.name} Car Wrap`}
            className={`${styles.baseImage} ${styles[slideDir === 'right' ? 'slideInRight' : 'slideInLeft']}`}
            onError={() => setHasImageError(true)}
          />
          <button
            type="button"
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={() => applyColorByIndex(activeIndex + 1)}
            aria-label="Next color"
          >
            ›
          </button>
        </div>

        {/* 5. ส่วนปุ่มเลือกสี */}
        <div className={styles.controls}>
          {colorOptions.map((color) => (
            <button
              key={color.name}
              className={`${styles.swatch} ${activeColor.name === color.name ? styles.active : ''}`}
              style={getSwatchStyle(color)}
              onClick={() => handleSelectColor(color)}
              aria-label={color.name}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default CarColorizer;