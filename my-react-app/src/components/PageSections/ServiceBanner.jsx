// ขนาดรูปของปุ่ม 800 x 800 px
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

import styles from './ServiceBanner.module.css';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ButtonContent = ({ button }) => (
  <>
    {button.buttonImage && (
      <img
        src={button.buttonImage}
        alt={button.text ? `${button.text} - รูปภาพปุ่มบริการ GT7 Motor` : 'รูปภาพปุ่มบริการ GT7 Motor'}
        className={styles.buttonImage}
      />
    )}
    <span className={styles.buttonText}>{button.text}</span>
  </>
);

function ServiceBanner({ imageUrl, mobileImageUrl, title, subtitle, buttons = [], align = 'left', omitOverlay = false }) {

  const [openIndex, setOpenIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleOptions = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const calculateSlidesToShow = () => {
    const width = window.innerWidth;
    // ใช้จำนวนเต็มบน mobile เพื่อให้ infinite slick ทำงานถูกต้อง
    if (width < 768) return 2;
    if (width < 992) return 2;
    return 3;
  };

  const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow());

  // เมื่อมีการย่อ-ขยายหน้าจอ React จะ Re-render ทำให้ค่า arrows ถูกคำนวณใหม่ตามด้านล่างเสมอ
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(calculateSlidesToShow());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ImageComponent = () => (
    <picture style={{ display: 'block', width: '100%', height: '100%' }}>
      {mobileImageUrl && (
        <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
      )}
      <img
        src={imageUrl}
        alt={title ? `${title} - แบนเนอร์บริการ GT7 Motor` : 'แบนเนอร์บริการ GT7 Motor'}
        className={styles.bannerImage}
      />
    </picture>
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    cssEase: 'ease-in-out',
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: window.innerWidth >= 768,
    pauseOnHover: true,
    swipeToSlide: true,
    // ปิด focusOnSelect, centerMode เพื่อความลื่น
  };

  return (
    <div className={styles.bannerContainer}>

      <ImageComponent />

      {!omitOverlay && (
        <div className={`${styles.contentOverlay} ${styles[align]}`}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

          {buttons.length > 0 && (
            <div className={styles.buttonsGroup}>
              <Slider key={slidesToShow} {...sliderSettings}>
                {buttons.map((button, idx) => (
                  <div key={button.text} className={styles.buttonSlideWrapper}>
                    {Array.isArray(button.extraOptions) && button.extraOptions.length > 0 ? (
                      <button
                        type="button"
                        className={styles.button}
                        aria-expanded={openIndex === idx}
                        onClick={() => toggleOptions(idx)}
                      >
                        <ButtonContent button={button} />
                      </button>
                    ) : (
                      <Link to={button.link || '#'} className={styles.button}>
                        <ButtonContent button={button} />
                      </Link>
                    )}
                  </div>
                ))}
              </Slider>
            </div>
          )}

          {openIndex !== null && Array.isArray(buttons[openIndex]?.extraOptions) && (
            <div className={`${styles.sidePanel} ${styles[align]} ${openIndex !== null ? styles.open : ''}`}>
              <div className={styles.sidePanelHeader}>
                {buttons[openIndex].text}
              </div>
              <div className={styles.sidePanelContent}>
                {buttons[openIndex].extraOptions.map((opt) => (
                  <button
                    key={opt.text}
                    type="button"
                    className={`${styles.optionButton} ${selectedOption === opt.text ? styles.optionSelected : ''}`}
                    onClick={() => {
                      setSelectedOption(opt.text);
                      setOpenIndex(null);
                    }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ServiceBanner;