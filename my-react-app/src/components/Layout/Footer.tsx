// src/components/Layout/Footer.tsx
import { Link } from 'react-router-dom';

// Import ไอคอนที่เหมาะกับอู่รถ
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLine,
  FaTools, FaAward, FaHeadset, FaShieldAlt,
  FaMapMarkerAlt, FaPhoneAlt, FaClock,
} from 'react-icons/fa';

// คลาสที่ใช้ซ้ำ
const headingCls =
  "relative mb-6 pb-2.5 text-[1.2rem] font-bold uppercase tracking-[1px] text-white " +
  "after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-10 after:bg-accent after:content-['']";
const linkCls =
  'inline-block text-[0.95rem] text-[#aaa] no-underline transition-all duration-300 hover:pl-[5px] hover:text-accent';

function Footer() {
  return (
    <footer className="relative z-[2] border-t-2 border-[#222] bg-[#080808] pt-[60px] text-white">
      <div className="mx-auto max-w-[1400px] px-5">

        {/* ===== 1. FOOTER MAIN (4 คอลัมน์) ===== */}
        <div className="mb-[50px] grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: ABOUT US */}
          <div>
            <h3 className={headingCls}>ABOUT GT7 MOTOR</h3>
            <p className="mb-5 text-[0.95rem] leading-[1.6] text-[#aaa]">
              GT7 Motor ศูนย์บริการรถยนต์ครบวงจร นำเข้าและจำหน่ายอะไหล่แท้ แบรนด์ชั้นนำระดับโลก พร้อมทีมช่างผู้เชี่ยวชาญที่ดูแลรถคุณด้วยมาตรฐานสูงสุด
            </p>
            <div className="flex gap-[15px]">
              {[
                { Icon: FaFacebookF, label: 'Facebook' },
                { Icon: FaInstagram, label: 'Instagram' },
                { Icon: FaLine, label: 'Line' },
                { Icon: FaTwitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#1a1a1a] text-[1.2rem] text-[#aaa] no-underline transition-all duration-300 hover:-translate-y-[3px] hover:bg-accent hover:text-black"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: OUR SERVICES */}
          <div>
            <h3 className={headingCls}>OUR SERVICES</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-3"><Link to="/services" className={linkCls}>เปลี่ยนถ่ายของเหลว</Link></li>
              <li className="mb-3"><Link to="/services" className={linkCls}>ระบบช่วงล่างและเบรก</Link></li>
              <li className="mb-3"><Link to="/services" className={linkCls}>ตั้งศูนย์และเปลี่ยนยาง</Link></li>
              <li className="mb-3"><Link to="/services" className={linkCls}>จูนนิ่งอัพเกรดสมรรถนะ</Link></li>
              <li className="mb-3"><Link to="/services" className={linkCls}>ตรวจเช็คสภาพรถยนต์</Link></li>
            </ul>
          </div>

          {/* Column 3: QUICK LINKS */}
          <div>
            <h3 className={headingCls}>QUICK LINKS</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-3"><Link to="/shop" className={linkCls}>สั่งซื้อสินค้าและอะไหล่</Link></li>
              <li className="mb-3"><Link to="/promotions" className={linkCls}>โปรโมชั่นประจำเดือน</Link></li>
              <li className="mb-3"><Link to="/blog" className={linkCls}>บทความและผลงาน</Link></li>
              <li className="mb-3"><Link to="/about" className={linkCls}>เกี่ยวกับเรา</Link></li>
              <li className="mb-3"><Link to="/contact" className={linkCls}>ติดต่อจองคิว</Link></li>
            </ul>
          </div>

          {/* Column 4: CONTACT US */}
          <div>
            <h3 className={headingCls}>CONTACT US</h3>
            <ul className="m-0 list-none p-0">
              <li className="mb-[15px] flex items-start gap-[15px] text-[0.95rem] leading-[1.5] text-[#aaa]">
                <FaMapMarkerAlt className="mt-[3px] shrink-0 text-[1.2rem] text-accent" />
                <span>บริษัท จีที เซเว่น มอเตอร์ จํากัด  531 ถนนหทันราษฎร์ แขวงสามวาตะวันตก  เขตคลองสามวา กรุงเทพมหานคร 10510</span>
              </li>
              <li className="mb-[15px] flex items-start gap-[15px] text-[0.95rem] leading-[1.5] text-[#aaa]">
                <FaPhoneAlt className="mt-[3px] shrink-0 text-[1.2rem] text-accent" />
                <span>02-123-4567, 081-999-9999</span>
              </li>
              <li className="mb-[15px] flex items-start gap-[15px] text-[0.95rem] leading-[1.5] text-[#aaa]">
                <FaClock className="mt-[3px] shrink-0 text-[1.2rem] text-accent" />
                <span>เปิดบริการทุกวัน: 09:00 น. - 18:00 น.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ===== 2. FOOTER FEATURES (แถบล่างสุด) ===== */}
        <div className="grid grid-cols-1 gap-5 border-y border-[#222] py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: FaTools, title: 'Professional Service', desc: 'บริการโดยทีมช่างผู้ชำนาญการ' },
            { Icon: FaAward, title: 'Premium Parts', desc: 'ใช้อะไหล่แท้คุณภาพระดับโลก' },
            { Icon: FaShieldAlt, title: 'Warranty Guarantee', desc: 'รับประกันงานซ่อมและอะไหล่' },
            { Icon: FaHeadset, title: 'Free Consultation', desc: 'ให้คำปรึกษาและประเมินราคาฟรี' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-5">
              <Icon size={36} className="shrink-0 text-accent" />
              <div>
                <h4 className="m-0 mb-[5px] text-[1.1rem] font-semibold text-white">{title}</h4>
                <p className="m-0 text-[0.85rem] text-[#aaa]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== 3. COPYRIGHT ===== */}
        <div className="py-[25px] text-center text-[0.9rem] text-[#666]">
          <p>&copy; {new Date().getFullYear()} GT7 MOTOR. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
