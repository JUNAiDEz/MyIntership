// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logoImage from '../../assets/logo.png'; 
import ThemeSwitch from './ThemeSwitch';
import SearchInput from './SearchInput';
import YellowNavbar from './YellowNavbar';

import { 
  FaEnvelope,
  FaBars,
  FaTools, FaBoxOpen, FaTags, FaCar, FaImages, FaFileAlt, FaQuestionCircle,
  FaChevronDown 
} from 'react-icons/fa';

function Header({ onLogout }) {
  const [openDropdown, setOpenDropdown] = useState(null); 
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

  const renderArrow = (isOpen) => (
    <FaChevronDown className={`${styles.arrowIcon} ${isOpen ? styles.open : ''}`} />
  );

  return (
    <>
      {/* 🔥 กล่องล่องหน ดันเนื้อหาไม่ให้โดน Header ทับตอนเริ่มหน้า 🔥 */}
      <div className={styles.headerSpacer}></div>

      {/* 🔥 ตัว Header เปลี่ยนไปใช้ Fixed แทนใน CSS 🔥 */}
      <header className={`${styles.headerContainer} ${isScrolled ? styles.scrolled : ''}`}>
        
        <nav className={styles.navbar}>
          <div className={styles.container}>
            
            {/* --- ฝั่งซ้าย --- */}
            <div className={styles.navLeft}>
              <Link to="/" className={styles.logoLink}>
                <img src={logoImage} alt="GT7 MOTOR Logo" className={styles.logoImage} />
              </Link>

              <div className={styles.categoryDropdownContainer}>
                <div 
                  className={styles.categoryMenu} 
                  onClick={() => {
                    resetServiceSubmenus();
                    setOpenDropdown(openDropdown === 'category' ? null : 'category');
                  }}
                >
                  <FaBars />
                  <span>หมวดหมู่ ▾</span>
                </div>

                {openDropdown === 'category' && (
                  <ul className={styles.dropdownMenu}>
                    
                    <li className={styles.hasSubmenu}>
                      <a
                        href="/ourservices"
                        onClick={e => {
                          e.preventDefault();
                          resetServiceSubmenus();
                          setOpenServiceSub(v => !v);
                        }}
                      >
                        <div className={styles.menuLabel}>
                          <FaTools /> <span>บริการ</span>
                        </div>
                        {renderArrow(openServiceSub)}
                      </a>
                      
                      {openServiceSub && (
                        <ul className={styles.submenu}>
                          
                          <li className={styles.hasSubmenu}>
                            <a
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
                              <ul className={styles.submenu}> 
                                <li><a href="/services/pipe-cleaning">- ล้างท่อรวมไอดี</a></li>
                                <li><a href="/services/fluid-change">- เปลี่ยนถ่ายของเหลว</a></li>
                                <li><a href="/services/engine-spa">- สปาเครื่องยนต์</a></li>
                                <li><a href="/services/air-con">- ล้างแอร์</a></li>
                              </ul>
                            )}
                          </li>

                          <li className={styles.hasSubmenu}>
                            <a
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
                              <ul className={styles.submenu}>
                                <li><a href="/services/suspension">- โหลดหน้า - หลัง</a></li>
                                <li><a href="/services/shock-absorber">- โช้คอัพ</a></li>
                                <li><a href="/services/wheels-tyres">- ล้อและยาง</a></li>
                                <li><a href="/services/alignment">- ตั้งศูนย์</a></li>
                                <li><a href="/services/ball-joints">- ลูกหมาก</a></li>
                              </ul>
                            )}
                          </li>

                          <li className={styles.hasSubmenu}>
                            <a
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
                              <ul className={styles.submenu}>
                                <li><a href="/services/remap">- รีแมพ</a></li>
                                <li><a href="/services/custom-exhaust">- ท่อแทน</a></li>
                                <li><a href="/services/turbo-intercooler">- เทอร์โบ อินเตอร์</a></li>
                                <li><a href="/services/valve-service">- แก้วาล์ว</a></li>
                                <li><a href="/services/remote-control">- รีโมทควบคุมระยะไกล</a></li>
                              </ul>
                            )}
                          </li>

                          <li className={styles.hasSubmenu}>
                            <a
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
                              <ul className={styles.submenu}>
                                <li><a href="/services/film-protect">- ฟิลม์สีกันรอย</a></li>
                                <li><a href="/services/sticker">- สติ๊กเกอร์</a></li>
                                <li><a href="/services/boost-gauge">- วัดบูส</a></li>
                                <li><a href="/services/exhaust">- ท่อ</a></li>
                              </ul>
                            )}
                          </li>
                        </ul>
                      )}
                    </li>

                    <li><a href="/shop"><div className={styles.menuLabel}><FaBoxOpen /> <span>สินค้า</span></div></a></li>
                    <li><a href="/promotions"><div className={styles.menuLabel}><FaTags /> <span>โปรโมชั่น</span></div></a></li>
                    <li><a href="/car"><div className={styles.menuLabel}><FaCar /> <span>รถยนต์</span></div></a></li>
                    <li><a href="/portfolio"><div className={styles.menuLabel}><FaImages /> <span>ผลงานของร้าน</span></div></a></li>
                    <li><a href="/blog"><div className={styles.menuLabel}><FaFileAlt /> <span>บทความเพิ่มเติม</span></div></a></li>
                    <li><a href="/faq"><div className={styles.menuLabel}><FaQuestionCircle /> <span>คำถามที่พบบ่อย</span></div></a></li>
                    <li><a href="/contact"><div className={styles.menuLabel}><FaEnvelope /> <span>ส่งคำถามให้กับทางร้าน</span></div></a></li>
                  </ul>
                )}
              </div>
            </div>
            
            {/* --- ฝั่งขวา --- */}
            <div className={styles.navRight}>
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