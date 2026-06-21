import { useState, type TouchEvent } from 'react';

interface ColorOption {
  name: string;
  hex: string;
  image: string;
  swatchImage?: string;
}

// รายการสี พร้อมไฟล์ภาพใต้ /public/images/carwrap
const colorOptions: ColorOption[] = [
  { name: 'Black', hex: '#34495E', image: 'carmatteblack.png', swatchImage: 'matteblack.png' },
  { name: 'Yellow', hex: '#F1C40F', image: 'carkevlar.png', swatchImage: 'kevlar.png' },
  { name: 'Purple', hex: '#9B59B6', image: 'carhoneycombblack8D.png', swatchImage: 'honeycombblack8D.png' },
  { name: 'Blue', hex: '#3498DB', image: 'carglossyblackpet.png', swatchImage: 'glossyblackpet.png' },
  { name: 'White', hex: '#ECF0F1', image: 'carpearlwhitepet.png', swatchImage: 'pearlwhitepet.png' },
  { name: 'Red', hex: '#E74C3C', image: 'carredpet.png', swatchImage: 'redpet.png' },
  { name: 'Green', hex: '#2ECC71', image: 'carlimesavinglizardpet.png', swatchImage: 'limesavinglizardpet.png' },
];

const carWrapFolder = '/images/carwrap/';
const fallbackCarImage = '/images/cars/gtr.png';

const navButtonCls =
  'absolute top-1/2 z-[2] flex h-[38px] w-[38px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-black/45 text-[22px] text-white transition-all duration-200 hover:scale-105 hover:bg-black/65 md:h-11 md:w-11 md:text-[26px]';

function CarColorizer() {
  const [activeColor, setActiveColor] = useState<ColorOption>(colorOptions[0]);
  const [hasImageError, setHasImageError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const getImageSrc = (imageFile: string) => `${carWrapFolder}${imageFile}`;
  const displayedImage = hasImageError ? fallbackCarImage : getImageSrc(activeColor.image);

  const applyColorByIndex = (nextIndex: number) => {
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

  const handleSelectColor = (color: ColorOption) => {
    const nextIndex = colorOptions.findIndex((c) => c.name === color.name);
    setSlideDir(nextIndex >= activeIndex ? 'right' : 'left');
    setActiveIndex(nextIndex);
    setActiveColor(color);
    setHasImageError(false);
  };

  const getSwatchStyle = (color: ColorOption) => ({
    backgroundColor: color.hex,
    backgroundImage: color.swatchImage ? `url(${getImageSrc(color.swatchImage)})` : 'none',
  });

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
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
    <div className="border-t border-[#1f1f1f] bg-black bg-[url('/images/carwrap/Eiei.png')] bg-cover bg-center bg-no-repeat py-5 md:py-[50px] max-md:ml-[calc(50%-50vw)] max-md:mr-[calc(50%-50vw)] max-md:w-screen max-md:bg-[#f5f5f5]">
      <div className="mx-auto max-w-[1200px] px-3 md:px-[15px]">

        <h2 className="mb-5 mt-0 text-center text-[1.3rem] font-black text-white md:mb-[30px] md:text-[1.8rem]"></h2>

        {/* ส่วนแสดงรูปภาพ (ภาพแยกตามสี) */}
        <div
          className="relative aspect-video overflow-hidden rounded-md bg-transparent md:rounded-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            className={`${navButtonCls} left-3`}
            onClick={() => applyColorByIndex(activeIndex - 1)}
            aria-label="Previous color"
          >
            ‹
          </button>
          <img
            key={activeColor.name}
            src={displayedImage}
            alt={`${activeColor.name} Car Wrap`}
            className={`block h-full w-full object-contain ${slideDir === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
            onError={() => setHasImageError(true)}
          />
          <button
            type="button"
            className={`${navButtonCls} right-3`}
            onClick={() => applyColorByIndex(activeIndex + 1)}
            aria-label="Next color"
          >
            ›
          </button>
        </div>

        {/* ส่วนปุ่มเลือกสี */}
        <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-[25px] md:gap-[15px]">
          {colorOptions.map((color) => {
            const isActive = activeColor.name === color.name;
            return (
              <button
                key={color.name}
                className={`h-[35px] w-[35px] cursor-pointer rounded-full border-2 bg-cover bg-center bg-no-repeat shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-110 md:h-10 md:w-10 md:border-[3px] ${isActive ? 'scale-[1.15] border-[#007bff]' : 'border-white'}`}
                style={getSwatchStyle(color)}
                onClick={() => handleSelectColor(color)}
                aria-label={color.name}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default CarColorizer;
