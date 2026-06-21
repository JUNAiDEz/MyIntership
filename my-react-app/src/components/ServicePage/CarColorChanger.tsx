// หมายเหตุ: ใช้ CSS mask layering + รองรับ parentStyles (caller ส่ง styles module เองได้)
// จึงคง CarColorChanger.module.css ไว้ (ตาม MIGRATION_PLAYBOOK)
import styles from './CarColorChanger.module.css';

interface AreaOption {
  id: string;
  name: string;
}
interface ColorOption {
  color_id: string | number;
  color_code: string;
  name?: string;
}
interface CarInfo {
  name?: string;
  description?: string;
}

interface CarColorChangerProps {
  currentCar?: CarInfo | null;
  colors: ColorOption[];
  selectedArea: string;
  selectedColorId: string | number;
  STICKER_AREA_OPTIONS: AreaOption[];
  setSelectedArea: (id: string) => void;
  setSelectedColorId: (id: string | number) => void;
  getImagePath: (layer: string, area: string) => string;
  handlePrev: () => void;
  handleNext: () => void;
  styles?: Record<string, string>;
}

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
  styles: parentStyles,
}: CarColorChangerProps) => {
  const s = parentStyles || styles;

  if (!currentCar) return null;

  const activeColor = colors.find(c => c.color_id === selectedColorId);

  return (
    <div className={s.colorizerSection}>
      <div className={s.container}>

        <div className={s.showcaseInfo}>
          <h1 className={s.showcaseTitle}>{currentCar.name}</h1>
          <p className={s.showcaseDesc}>{currentCar.description || 'Premium Sticker Wrap Service'}</p>
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
            {/* 1. เลเยอร์รถพื้นฐาน */}
            <img
              src={getImagePath('base', selectedArea)}
              className={s.carLayerBase}
              alt="Car Base"
            />

            {/* 2. เลเยอร์สี (mask ตามรูป paint) */}
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
                  transform: 'none',
                  mixBlendMode: 'multiply',
                  opacity: 0.9,
                  transition: 'background-color 0.4s ease',
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
