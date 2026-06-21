// ขนาดรูปของปุ่ม 800 x 800 px
// หมายเหตุ: มี align variants + slick arrows (:global) + responsive ซับซ้อน → คง ServiceBanner.module.css ไว้ (ตาม MIGRATION_PLAYBOOK)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';

import styles from './ServiceBanner.module.css';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface BannerOption {
  text: string;
}

interface BannerButton {
  text: string;
  buttonImage?: string;
  link?: string;
  extraOptions?: BannerOption[];
}

interface ServiceBannerProps {
  imageUrl?: string;
  mobileImageUrl?: string;
  title?: string;
  subtitle?: string;
  buttons?: BannerButton[];
  align?: 'left' | 'right' | 'center';
  omitOverlay?: boolean;
}

const ButtonContent = ({ button }: { button: BannerButton }) => (
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

function ServiceBanner({ imageUrl, mobileImageUrl, title, subtitle, buttons = [], align = 'left', omitOverlay = false }: ServiceBannerProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleOptions = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const calculateSlidesToShow = (): number => {
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 992) return 2;
    return 3;
  };

  const [slidesToShow, setSlidesToShow] = useState(calculateSlidesToShow());

  useEffect(() => {
    const handleResize = () => setSlidesToShow(calculateSlidesToShow());
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
    slidesToShow,
    slidesToScroll: 1,
    arrows: window.innerWidth >= 768,
    pauseOnHover: true,
    swipeToSlide: true,
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
                {buttons[openIndex].extraOptions!.map((opt) => (
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
