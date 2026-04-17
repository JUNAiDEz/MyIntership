import React from 'react';
import styles from './CarColorChanger.module.css';

const CarColorChanger = ({
  currentCar,
  colors,
  selectedArea,
  selectedColorId,
  STICKER_AREA_OPTIONS,
  setSelectedArea,
  setSelectedColorId,
  getImagePath,
  handlePrev,
  handleNext,
  styles: parentStyles
}) => {
  const s = parentStyles || styles;

  if (!currentCar) return null;

  const activeColor = colors.find(c => c.color_id === selectedColorId);

  return (
    <div className={s.colorizerSection}>
      <div className={s.container}>
        
        <div className={s.showcaseInfo}>
          <h1 className={s.showcaseTitle}>{currentCar.name}</h1>
          <p className={s.showcaseDesc}>{currentCar.description || "Premium Sticker Wrap Service"}</p>
        </div>

        <div className={s.controlGroup}>
          <span className={s.controlLabel}>1. เลือกจุดติดสติ๊กเกอร์:</span>
          <div className={s.buttonGroup}>
            {STICKER_AREA_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`${s.optionBtn} ${selectedArea === option.id ? s.activeBtn : ''}`}
                onClick={() => setSelectedArea(option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <div className={s.showcaseMainImageWrapper}>
          <div className={s.showcaseControls}>
            <button onClick={handlePrev} className={s.navButton}>‹</button>
            <button onClick={handleNext} className={s.navButton}>›</button>
          </div>
          
          <div className={s.carLayerContainer}>
            {/* 1. เลเยอร์รถพื้นฐาน - ใช้ขนาด 100% ปกติ */}
            <img 
              src={getImagePath('base', selectedArea)} 
              className={s.carLayerBase} 
              alt="Car Base" 
            />

            {/* 2. เลเยอร์สี - ลบ scale ออก เพื่อไม่ให้สีล้นขอบรถ */}
            {selectedColorId !== 'original' && activeColor && (
              <div 
                className={s.carLayerPaint} 
                style={{ 
                  backgroundColor: activeColor.color_code,
                  maskImage: `url(${getImagePath('paint', selectedArea)})`,
                  WebkitMaskImage: `url(${getImagePath('paint', selectedArea)})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  
                  // แก้ไข: ลบ scale(1.01) ออก เพื่อให้ขนาดเท่ากับรูปรถเป๊ะ
                  transform: 'none', 
                  
                  // ใช้ multiply เพื่อให้สีกลืนเข้าไปในเงารถ
                  mixBlendMode: 'multiply',
                  opacity: 0.9,
                  transition: 'background-color 0.4s ease'
                }}
              />
            )}
          </div>
        </div>

        <div className={s.colorSelector}>
          <span className={s.controlLabel}>2. Select Color:</span>
          <div className={s.colorDots}>
            {colors.map((option) => (
              <div
                key={option.color_id}
                className={`${s.dotWrapper} ${selectedColorId === option.color_id ? s.activeDotWrapper : ''}`}
                onClick={() => setSelectedColorId(option.color_id)}
                title={option.name}
              >
                <span 
                  className={s.dot} 
                  style={{ backgroundColor: option.color_code }} 
                >
                   {option.color_id === 'original' && (
                    <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff', fontSize: '12px' }}>✓</span>
                   )}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarColorChanger;