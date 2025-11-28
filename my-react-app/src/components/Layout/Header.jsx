// src/components/Header.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logoImage from '../../assets/logo.png'; // โลโก้หลัก
import ThemeSwitch from './ThemeSwitch';
import SearchInput from './SearchInput';
import YellowNavbar from './YellowNavbar';

// Import ไอคอนทั้งหมด
import { 
  FaEnvelope,
  FaBars,
  FaTools, FaBoxOpen, FaTags, FaCar, FaImages, FaFileAlt, FaQuestionCircle
} from 'react-icons/fa';

// รับ onLogout prop มาจาก App.jsx (เผื่อไว้ใช้ในอนาคต หากต้องการใส่ปุ่ม Logout ใน Navbar แทน)
function Header({ onLogout }) {
  const [openDropdown, setOpenDropdown] = useState(null); // null, 'category', 'products'

  return (
    <header className={styles.headerContainer}>
      
      {/* ลบส่วน Top Bar (แถบขาว) ออกไปแล้ว */}

      {/* ===== NAVBAR (เมนูหลัก) ===== */}
      <nav className={styles.navbar}>
        <div className={styles.container}>
          
          {/* --- ฝั่งซ้าย: โลโก้ และ ปุ่มหมวดหมู่ --- */}
          <div className={styles.navLeft}>
            {/* 1. โลโก้ */}
            <Link to="/" className={styles.logoLink}>
              <img 
                src={logoImage} 
                alt="GT7 MOTOR Logo" 
                className={styles.logoImage}
              />
            </Link>

            {/* 2. Dropdown "หมวดหมู่" */}
            <div className={styles.categoryDropdownContainer}>
              <div 
                className={styles.categoryMenu} 
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              >
                <FaBars />
                หมวดหมู่ ▾
              </div>

              {openDropdown === 'category' && (
                <ul className={styles.dropdownMenu}>
                  <li><a href="/ourservices"><FaTools /> <span>บริการ</span></a></li>
                  <li><a href="/shop"><FaBoxOpen /> <span>สินค้า</span></a></li>
                  <li><a href="/promotions"><FaTags /> <span>โปรโมชั่น</span></a></li>
                  <li><a href="/car"><FaCar /> <span>รถยนต์</span></a></li>
                  <li><a href="/portfolio"><FaImages /> <span>ผลงานของร้าน</span></a></li>
                  <li><a href="#"><FaFileAlt /> <span>บทความเพิ่มเติม</span></a></li>
                  <li><a href="/faq"><FaQuestionCircle /> <span>คำถามที่พบบ่อย</span></a></li>
                  <li><a href="#"><FaEnvelope /> <span>ส่งคำถามให้กับทางร้าน</span></a></li>
                </ul>
              )}
            </div>
          </div>
          
          {/* --- ฝั่งขวา: controls (theme switch) --- */}
          <div className={styles.navRight}>
            <ThemeSwitch />
            <SearchInput />
            <YellowNavbar />
          </div>
        </div>
      </nav>

    </header>
  );
}

export default Header;