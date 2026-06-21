// src/components/PageSections/PosterCarousel.tsx
// ขนาดรูป 1280 x 720
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Poster {
  id: number;
  imageUrl: string;
  alt: string;
  link: string;
}

const posters: Poster[] = [
  { id: 1, imageUrl: '/images/FeatureBar/mainternance.jpg', alt: 'Intake Cleaning', link: '/services/pipe-cleaning' },
  { id: 2, imageUrl: '/images/FeatureBar/Brake.jpg', alt: 'Store', link: '/shop' },
  { id: 3, imageUrl: '/images/FeatureBar/Promotions.jpg', alt: 'Promotion', link: '/promotions' },
  { id: 4, imageUrl: '/images/FeatureBar/Wrap.jpg', alt: 'Striker', link: '/services/sticker' },
];

function PosterCarousel() {
  // 1. ฟังก์ชันเช็คขนาดหน้าจอ
  const getSlidesCount = (): number => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 600) return 1;   // มือถือ: โชว์ 1 รูป
      if (width < 1024) return 2;  // แท็บเล็ต: โชว์ 2 รูป
      return 3;                    // คอมพิวเตอร์: โชว์ 3 รูป
    }
    return 3;
  };

  const [slidesToShow, setSlidesToShow] = useState(getSlidesCount());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 600 : false);

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesCount());
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    centerMode: isMobile,
    centerPadding: isMobile ? '20px' : '0px',
  };

  return (
    <div className="poster-carousel relative z-[2] mx-auto max-w-[1400px] px-[30px] lg:px-2.5">

      {/* Header ของ Section */}
      <div className="mb-[30px] flex items-center justify-between border-b border-themed pb-[15px] transition-colors md:items-end">
        <h2 className="m-0 border-l-[5px] border-accent pl-[15px] text-[1.5rem] font-extrabold italic uppercase leading-none text-text-main transition-colors md:text-[2rem]">โปสเตอร์</h2>
      </div>

      {/* Slider (key={slidesToShow} บังคับ refresh ตอนเปลี่ยนจอ) */}
      <Slider key={slidesToShow} {...settings}>
        {posters.map((poster) => (
          <Link to={poster.link} key={poster.id} className="block px-2.5 no-underline outline-none">
            <div className="group relative h-[250px] w-full cursor-pointer overflow-hidden rounded-xl border border-themed bg-bg-card transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:-translate-y-2.5 hover:border-accent hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(255,199,9,0.2)] md:h-[350px]">
              <img
                src={poster.imageUrl}
                alt={poster.alt}
                className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.08]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent to-40% opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"></div>
            </div>
          </Link>
        ))}
      </Slider>

    </div>
  );
}

export default PosterCarousel;
