import { Link } from 'react-router-dom';

// วิดีโอเสิร์ฟจาก public/ (static, พร้อมย้าย CDN) — ไม่ฝังเข้า JS bundle
const CAR_VIDEO = '/video/car-video.mp4';

import {
  FaWrench, FaTachometerAlt, FaCar,
  FaGift, FaAward, FaQuestionCircle,
} from 'react-icons/fa';

const iconCls =
  'transition-transform duration-300 group-hover:-translate-y-[5px] group-hover:scale-110 group-hover:[filter:drop-shadow(0_0_8px_rgba(255,199,9,0.6))]';
const featureLinkCls =
  'group flex flex-col items-center justify-center border-b border-r border-[#222] p-[20px_10px] text-[#aaa] no-underline transition-all duration-300 hover:bg-[#1a1a1a] hover:text-accent md:p-[30px_10px]';
const featureLabelCls = 'mt-2.5 text-[0.9rem] font-semibold uppercase';

function HeroSection() {
  return (
    <div className="relative w-full bg-[#050505]">

      {/* ===== 1. HERO BANNER (Video Background) ===== */}
      <div className="relative flex h-[50vh] min-h-[500px] w-full items-center justify-center overflow-hidden sm:h-[65vh]">

        {/* Layer สีดำจางๆ เพื่อให้ตัวหนังสืออ่านง่าย */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#050505] via-black/20 to-black/60"></div>

        {/* Video Background */}
        <video
          className="absolute left-1/2 top-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover brightness-[0.6]"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/cars/gtr.png"
        >
          <source src={CAR_VIDEO} type="video/mp4" />
          Browser ของคุณไม่รองรับการเล่นวิดีโอ
        </video>

        {/* Hero Text Content */}
        <div className="relative z-[2] px-5 text-center text-white">
          <h1 className="m-0 text-[2.2rem] font-black italic uppercase leading-[1.1] tracking-[2px] text-white [text-shadow:0_0_30px_rgba(0,0,0,0.8)] sm:text-[3rem] lg:text-[4rem]">
            GT7 <span className="text-accent">MOTOR</span>
          </h1>
          <p className="mt-2.5 text-[1.2rem] font-light tracking-[1px] text-[#ddd]">CENTER OF EXCELLENCE FOR YOUR VEHICLE</p>
        </div>
      </div>

      {/* ===== 2. FEATURES GRID (Navigation Bar) ===== */}
      <div className="relative z-[3] -mt-1 grid grid-cols-2 border-b border-t-4 border-b-[#222] border-t-accent bg-[#111] sm:grid-cols-3 lg:grid-cols-6">
        <Link to="/ourservices" className={featureLinkCls}>
          <FaWrench size={32} className={iconCls} />
          <p className={featureLabelCls}>บริการ</p>
        </Link>

        <Link to="/shop" className={featureLinkCls}>
          <FaTachometerAlt size={32} className={iconCls} />
          <p className={featureLabelCls}>สินค้า</p>
        </Link>

        <Link to="/car" className={featureLinkCls}>
          <FaCar size={32} className={iconCls} />
          <p className={featureLabelCls}>รถยนต์</p>
        </Link>

        <Link to="/promotions" className={featureLinkCls}>
          <FaGift size={32} className={iconCls} />
          <p className={featureLabelCls}>โปรโมชั่น</p>
        </Link>

        <Link to="/portfolio" className={featureLinkCls}>
          <FaAward size={32} className={iconCls} />
          <p className={featureLabelCls}>ผลงาน</p>
        </Link>

        <Link to="/faq" className={featureLinkCls}>
          <FaQuestionCircle size={32} className={iconCls} />
          <p className={featureLabelCls}>ถาม-ตอบ</p>
        </Link>
      </div>

    </div>
  );
}

export default HeroSection;
