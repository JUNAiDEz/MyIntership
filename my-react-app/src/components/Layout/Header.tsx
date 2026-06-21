// src/components/Layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo.png';
import ThemeSwitch from './ThemeSwitch';
import SearchInput from './SearchInput';
import YellowNavbar from './YellowNavbar';

import {
  FaEnvelope,
  FaBars,
  FaTools, FaBoxOpen, FaTags, FaCar, FaImages, FaFileAlt, FaQuestionCircle,
  FaChevronDown,
} from 'react-icons/fa';

interface HeaderProps {
  onLogout?: () => void;
}

function Header(_props: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openServiceSub, setOpenServiceSub] = useState(false);
  const [openMaintenanceSub, setOpenMaintenanceSub] = useState(false);
  const [openStylingSub, setOpenStylingSub] = useState(false);
  const [openUpgradeSub, setOpenUpgradeSub] = useState(false);
  const [openDecorSub, setOpenDecorSub] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // เลื่อนลงมาเกิน 50px ให้ซ่อนแถวล่างบนมือถือ
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resetServiceSubmenus = () => {
    setOpenServiceSub(false);
    setOpenMaintenanceSub(false);
    setOpenStylingSub(false);
    setOpenUpgradeSub(false);
    setOpenDecorSub(false);
  };

  // submenu <ul>: base = mobile inline accordion; md: = desktop absolute flyout
  const submenuClass =
    'list-none m-0 p-0 bg-black/30 border-l-2 border-accent ' +
    'md:absolute md:top-0 md:left-full md:ml-0.5 md:w-[260px] md:bg-[rgba(20,20,20,0.95)] ' +
    'md:backdrop-blur-[10px] md:border md:border-[#333] md:rounded-xl md:py-2.5 md:px-0 ' +
    'md:shadow-[0_15px_40px_rgba(0,0,0,0.8)] md:animate-fade-in-left';

  // submenu <a>: base = mobile; md: = desktop
  const submenuLinkClass =
    'flex justify-between no-underline py-2.5 pl-[45px] pr-5 text-[0.9rem] text-[#aaa] ' +
    'hover:text-white hover:bg-[rgba(255,199,9,0.15)] ' +
    'md:items-center md:px-5 md:py-3 md:text-[0.95rem] md:text-[#ccc] md:transition-all md:duration-300 ' +
    'md:hover:bg-[rgba(255,199,9,0.1)] md:hover:text-accent md:hover:pl-[25px]';

  // top-level dropdown <a>
  const dropdownLinkClass =
    'flex justify-between items-center px-5 py-3 text-[#ccc] no-underline text-[0.95rem] ' +
    'transition-all duration-300 hover:bg-[rgba(255,199,9,0.1)] hover:text-accent hover:pl-[25px]';

  const renderArrow = (isOpen: boolean) => (
    <FaChevronDown
      className={`text-[0.8rem] transition-transform duration-300 ${
        isOpen ? 'rotate-180 md:-rotate-90 text-accent' : ''
      }`}
    />
  );

  return (
    <>
      {/* 🔥 กล่องล่องหน ดันเนื้อหาไม่ให้โดน Header ทับตอนเริ่มหน้า 🔥 */}
      <div className="h-20 max-md:h-[140px] w-full bg-transparent"></div>

      {/* 🔥 ตัว Header เปลี่ยนไปใช้ Fixed แทนใน CSS 🔥 */}
      <header className="fixed top-0 left-0 w-full z-[9999] bg-[rgba(10,10,10,0.85)] backdrop-blur-[12px] border-b border-[rgba(255,199,9,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all duration-300">

        <nav className="w-full">
          <div
            className={`max-w-[1400px] mx-auto px-5 flex justify-between items-center h-20 [transition:all_0.4s_cubic-bezier(0.25,0.8,0.25,1)] max-md:p-[15px] max-md:h-auto max-md:min-h-[70px] max-md:flex-wrap max-md:gap-[15px] ${
              isScrolled ? 'max-md:gap-0 max-md:pb-2.5' : ''
            }`}
          >

            {/* --- ฝั่งซ้าย --- */}
            <div className="flex items-center gap-[30px] max-lg:gap-[15px] max-md:w-full max-md:justify-between max-md:gap-2.5">
              <Link to="/" className="flex items-center group">
                <img src={logoImage} alt="GT7 MOTOR Logo" className="h-10 max-md:h-8 object-contain transition-[transform,filter] duration-300 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_8px_rgba(255,199,9,0.4))]" />
              </Link>

              <div className="relative">
                <div
                  className="flex items-center gap-2.5 bg-[linear-gradient(135deg,#ffc709,#eaa800)] text-black font-extrabold text-base px-6 py-2.5 max-lg:px-4 max-lg:py-2 max-lg:text-[0.9rem] max-md:px-4 max-md:py-2 max-md:text-[0.9rem] rounded-[30px] cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(255,199,9,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,199,9,0.5)] hover:bg-[linear-gradient(135deg,#ffd633,#ffb300)]"
                  onClick={() => {
                    resetServiceSubmenus();
                    setOpenDropdown(openDropdown === 'category' ? null : 'category');
                  }}
                >
                  <FaBars />
                  <span>หมวดหมู่ ▾</span>
                </div>

                {openDropdown === 'category' && (
                  <ul className="absolute top-[65px] left-0 bg-[rgba(17,17,17,0.95)] backdrop-blur-[10px] border border-[#333] rounded-xl list-none py-2.5 px-0 m-0 w-[280px] shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-fade-in-down-header max-md:w-[250px] max-md:left-auto max-md:right-0 max-md:top-[55px]">

                    <li className="relative">
                      <a
                        className={dropdownLinkClass}
                        href="/ourservices"
                        onClick={e => {
                          e.preventDefault();
                          resetServiceSubmenus();
                          setOpenServiceSub(v => !v);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <FaTools /> <span>บริการ</span>
                        </div>
                        {renderArrow(openServiceSub)}
                      </a>

                      {openServiceSub && (
                        <ul className={submenuClass}>

                          <li className="relative">
                            <a
                              className={submenuLinkClass}
                              href="/ourservices"
                              onClick={e => {
                                e.preventDefault();
                                setOpenMaintenanceSub(v => !v);
                                setOpenStylingSub(false);
                                setOpenUpgradeSub(false);
                                setOpenDecorSub(false);
                              }}
                            >
                              <span>บริการดูแลรักษาเครื่องยนต์</span>
                              {renderArrow(openMaintenanceSub)}
                            </a>
                            {openMaintenanceSub && (
                              <ul className={submenuClass}>
                                <li><a className={submenuLinkClass} href="/services/pipe-cleaning">- ล้างท่อรวมไอดี</a></li>
                                <li><a className={submenuLinkClass} href="/services/fluid-change">- เปลี่ยนถ่ายของเหลว</a></li>
                                <li><a className={submenuLinkClass} href="/services/engine-spa">- สปาเครื่องยนต์</a></li>
                                <li><a className={submenuLinkClass} href="/services/air-con">- ล้างแอร์</a></li>
                              </ul>
                            )}
                          </li>

                          <li className="relative">
                            <a
                              className={submenuLinkClass}
                              href="/ourservices"
                              onClick={e => {
                                e.preventDefault();
                                setOpenStylingSub(v => !v);
                                setOpenMaintenanceSub(false);
                                setOpenUpgradeSub(false);
                                setOpenDecorSub(false);
                              }}
                            >
                              <span>บริการจัดทรง</span>
                              {renderArrow(openStylingSub)}
                            </a>
                            {openStylingSub && (
                              <ul className={submenuClass}>
                                <li><a className={submenuLinkClass} href="/services/suspension">- โหลดหน้า - หลัง</a></li>
                                <li><a className={submenuLinkClass} href="/services/shock-absorber">- โช้คอัพ</a></li>
                                <li><a className={submenuLinkClass} href="/services/wheels-tyres">- ล้อและยาง</a></li>
                                <li><a className={submenuLinkClass} href="/services/alignment">- ตั้งศูนย์</a></li>
                                <li><a className={submenuLinkClass} href="/services/ball-joints">- ลูกหมาก</a></li>
                              </ul>
                            )}
                          </li>

                          <li className="relative">
                            <a
                              className={submenuLinkClass}
                              href="/ourservices"
                              onClick={e => {
                                e.preventDefault();
                                setOpenUpgradeSub(v => !v);
                                setOpenMaintenanceSub(false);
                                setOpenStylingSub(false);
                                setOpenDecorSub(false);
                              }}
                            >
                              <span>บริการอัพเกรดเครื่องยนต์</span>
                              {renderArrow(openUpgradeSub)}
                            </a>
                            {openUpgradeSub && (
                              <ul className={submenuClass}>
                                <li><a className={submenuLinkClass} href="/services/remap">- รีแมพ</a></li>
                                <li><a className={submenuLinkClass} href="/services/custom-exhaust">- ท่อแทน</a></li>
                                <li><a className={submenuLinkClass} href="/services/turbo-intercooler">- เทอร์โบ อินเตอร์</a></li>
                                <li><a className={submenuLinkClass} href="/services/valve-service">- แก้วาล์ว</a></li>
                                <li><a className={submenuLinkClass} href="/services/remote-control">- รีโมทควบคุมระยะไกล</a></li>
                              </ul>
                            )}
                          </li>

                          <li className="relative">
                            <a
                              className={submenuLinkClass}
                              href="/ourservices"
                              onClick={e => {
                                e.preventDefault();
                                setOpenDecorSub(v => !v);
                                setOpenMaintenanceSub(false);
                                setOpenStylingSub(false);
                                setOpenUpgradeSub(false);
                              }}
                            >
                              <span>งานประดับรถยนต์ & แร็ป</span>
                              {renderArrow(openDecorSub)}
                            </a>
                            {openDecorSub && (
                              <ul className={submenuClass}>
                                <li><a className={submenuLinkClass} href="/services/film-protect">- ฟิลม์สีกันรอย</a></li>
                                <li><a className={submenuLinkClass} href="/services/sticker">- สติ๊กเกอร์</a></li>
                                <li><a className={submenuLinkClass} href="/services/boost-gauge">- วัดบูส</a></li>
                                <li><a className={submenuLinkClass} href="/services/exhaust">- ท่อ</a></li>
                              </ul>
                            )}
                          </li>
                        </ul>
                      )}
                    </li>

                    <li className="relative"><a className={dropdownLinkClass} href="/shop"><div className="flex items-center gap-3"><FaBoxOpen /> <span>สินค้า</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/promotions"><div className="flex items-center gap-3"><FaTags /> <span>โปรโมชั่น</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/car"><div className="flex items-center gap-3"><FaCar /> <span>รถยนต์</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/portfolio"><div className="flex items-center gap-3"><FaImages /> <span>ผลงานของร้าน</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/blog"><div className="flex items-center gap-3"><FaFileAlt /> <span>บทความเพิ่มเติม</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/faq"><div className="flex items-center gap-3"><FaQuestionCircle /> <span>คำถามที่พบบ่อย</span></div></a></li>
                    <li className="relative"><a className={dropdownLinkClass} href="/contact"><div className="flex items-center gap-3"><FaEnvelope /> <span>ส่งคำถามให้กับทางร้าน</span></div></a></li>
                  </ul>
                )}
              </div>
            </div>

            {/* --- ฝั่งขวา --- */}
            <div
              className={`flex items-center gap-5 max-lg:gap-[15px] max-md:w-full max-md:justify-center max-md:flex-wrap max-md:[transition:all_0.4s_cubic-bezier(0.25,0.8,0.25,1)] max-md:max-h-[100px] max-md:opacity-100 max-md:overflow-hidden ${
                isScrolled ? 'max-md:max-h-0 max-md:opacity-0 max-md:p-0 max-md:m-0 max-md:pointer-events-none' : ''
              }`}
            >
              <ThemeSwitch />
              <SearchInput />
              <YellowNavbar />
            </div>
          </div>
        </nav>

      </header>
    </>
  );
}

export default Header;
