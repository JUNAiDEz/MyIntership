import React, { useState } from 'react'; // <-- 1. Import useState
import { Routes, Route, Link } from 'react-router-dom'; 
import styles from './Dashboard.module.css';
import { 
  FaHome, FaWarehouse, FaBoxOpen, 
  FaShoppingCart, FaRegFile, FaShoppingBag,
  FaChevronDown // <-- 2. Import ไอคอนลูกศร
} from 'react-icons/fa';

// Import หน้าต่างๆ ที่เราจะสลับ
import DashboardHome from './DashboardHome';
import ProductManagementPage from './ProductManagementPage';
import ServiceManagementPage from './ServiceManagementPage';
import PromotionManagementPage from './PromotionManagementPage';
import CarManagementPage from './CarManagementPage';
import PortfolioManagementPage from './PortfolioManagementPage';
import ArticlesManagementPage from './ArticlesManagementPage';
import FAQManagementPage from './FAQManagementPage';

// --- (Component Placeholder สำหรับหน้าที่ยังไม่เสร็จ) ---
function PlaceholderPage({ title }) {
  return (
    <div className={styles.content}>
      <h2 className={styles.contentTitle}>{title}</h2>
      <p>หน้านี้กำลังอยู่ระหว่างการพัฒนา...</p>
    </div>
  );
}
// ----------------------------------------------------

// --- 1. Main Dashboard Component (Layout) ---
function DashboardPage({ onLogout }) {
  return (
    <div className={styles.dashboardPage}>
      <DashboardHeader onLogout={onLogout} />
      <div className={styles.contentArea}>
        {/* "ปลั๊ก" ที่เนื้อหาจะเปลี่ยน ตาม URL */}
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="services" element={<ServiceManagementPage />} />
          <Route path="promotion" element={<PromotionManagementPage />} />
          <Route path="car" element={<CarManagementPage />} />
          <Route path="portfolio" element={<PortfolioManagementPage />} />
          <Route path="blog" element={<ArticlesManagementPage />} />
          <Route path="faq" element={<FAQManagementPage />} />
        </Routes>
      </div>
      <DashboardFooter />
    </div>
  );
}

// --- 2. Header (แถบเมนูด้านบนสีดำ) ---
function DashboardHeader({ onLogout }) {
  // 3. (ใหม่!) เพิ่ม State สำหรับเปิด/ปิด Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.logoText}>GT7 MOTOR</span>
        <nav className={styles.navMenu}>
          
          <Link to="/dashboard" className={styles.navItem}><FaHome /> หน้าแรก</Link>
          
          {/* vvv 4. (แก้ไข!) เปลี่ยน Link เป็น Dropdown vvv */}
          <div className={styles.navItemDropdownContainer}>
            <button 
              className={styles.navItem}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // <-- สลับ State
            >
              <FaBoxOpen /> จัดการสินค้า/บริการ <FaChevronDown size={10} />
            </button>
            
            {/* เมนู Dropdown ที่ซ่อนอยู่ */}
            {isDropdownOpen && (
              <div className={styles.navDropdownMenu}>
                <Link 
                  to="/dashboard/products" 
                  className={styles.navDropdownItem}
                  onClick={() => setIsDropdownOpen(false)} // <-- ปิด Dropdown เมื่อคลิก
                >
                  จัดการสินค้า
                </Link>
                <Link 
                  to="/dashboard/services" 
                  className={styles.navDropdownItem}
                  onClick={() => setIsDropdownOpen(false)} // <-- ปิด Dropdown เมื่อคลิก
                >
                  จัดการบริการ
                </Link>
                                <Link 
                  to="/dashboard/promotion" 
                  className={styles.navDropdownItem}
                  onClick={() => setIsDropdownOpen(false)} // <-- ปิด Dropdown เมื่อคลิก
                >
                  จัดการโปรโมชั่น
                </Link>
              </div>
            )}
          </div>
          {/* ^^^ สิ้นสุดการแก้ไข ^^^ */}

          <Link to="/dashboard/car" className={styles.navItem}><FaWarehouse /> จัดการข้อมูลรถยนต์</Link>
          <Link to="/dashboard/portfolio" className={styles.navItem}><FaRegFile /> จัดการผลงานของร้าน</Link>
          <Link to="/dashboard/blog" className={styles.navItem}><FaShoppingBag /> จัดการบทความ</Link>
          <Link to="/dashboard/faq" className={styles.navItem}><FaShoppingCart /> จัดการคำถามที่พบบ่อย</Link>
        </nav>
      </div>
      <div className={styles.headerRight}>
        <Link to="/" className={styles.userLink}>ดูหน้าเว็บหลัก</Link>
        <span className={styles.userAvatar}>S</span>
        <button onClick={onLogout} className={styles.logoutButton}>ออกจากระบบ</button>
      </div>
    </header>
  );
}

// --- 3. Footer (แถบล่างสุดสีดำ) ---
function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <span>© GT7 Motor Co.,Ltd.</span>
      <span>Build #20250908</span>
    </footer>
  );
}

export default DashboardPage;

