import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBoxOpen, FaChevronDown, FaImages, FaNewspaper,
  FaVideo, FaHome, FaGlobe, FaSignOutAlt, FaBell, FaSearch,
} from 'react-icons/fa';

import { usePermissions } from '../utils/usePermissions';

// ใช้ธีมกลางของ Dashboard (ไฟล์ shared หลายหน้า) — ยังคง CSS Module ไว้
import styles from '../pages/Dashboard/Dashboard.module.css';

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const { userRole, canAccessResource, loading } = usePermissions();

  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoArea}>
            <Link to="/dashboard" className={styles.logoText}>GT7 <span>ADMIN</span></Link>
          </div>
          <div style={{ padding: '20px', color: '#666' }}>กำลังโหลด...</div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>GT7</div>
          <Link to="/dashboard" className={styles.logoText}>GT7 <span>ADMIN</span></Link>
        </div>

        <nav className={styles.navMenu}>
          <Link to="/dashboard" className={`${styles.navItem} ${location.pathname === '/dashboard' ? styles.active : ''}`}>
            <FaHome className={styles.navIcon}/> ภาพรวม
          </Link>

          <div
            className={`${styles.navDropdownContainer} ${isDropdownOpen ? styles.open : ''}`}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className={`${styles.navItem} ${['products','services','promotion','car','sticker','dealers'].some(p => isActive(p)) ? styles.active : ''}`}>
              <FaBoxOpen className={styles.navIcon}/> ฐานข้อมูล <FaChevronDown size={10} style={{ marginLeft: 6, opacity: 0.7 }} />
            </button>
            <div className={styles.dropdownMenu}>
              {canAccessResource('products') && (
                <Link to="/dashboard/products" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>สินค้าอะไหล่</Link>
              )}
              {canAccessResource('services') && (
                <Link to="/dashboard/services" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>บริการค่าแรง</Link>
              )}
              {canAccessResource('promotion') && (
                <Link to="/dashboard/promotion" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>โปรโมชั่น</Link>
              )}
              {canAccessResource('car') && (
                <Link to="/dashboard/car" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>รถยนต์</Link>
              )}
              <Link to="/dashboard/sticker" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>สติ๊กเกอร์</Link>
              {canAccessResource('dealer') && (
                <Link to="/dashboard/dealers" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>ตัวแทนจำหน่าย</Link>
              )}
            </div>
          </div>

          {canAccessResource('portfolio') && (
            <Link to="/dashboard/portfolio" className={`${styles.navItem} ${isActive('portfolio') ? styles.active : ''}`}><FaImages className={styles.navIcon}/> ผลงาน</Link>
          )}
          {canAccessResource('blog') && (
            <Link to="/dashboard/blog" className={`${styles.navItem} ${isActive('blog') ? styles.active : ''}`}><FaNewspaper className={styles.navIcon}/> บทความ</Link>
          )}
          {canAccessResource('livestream') && (
            <Link to="/dashboard/livestream" className={`${styles.navItem} ${isActive('livestream') ? styles.active : ''}`}><FaVideo className={styles.navIcon}/> ไลฟ์สด</Link>
          )}
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.searchBar}>
            <FaSearch />
            <input type="text" placeholder="ค้นหาเมนู..." />
          </div>

          <button className={styles.iconButton}>
            <FaBell />
            <span className={styles.badge}>3</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconButton}
            title="ไปที่หน้าเว็บหลัก"
          >
            <FaGlobe />
          </a>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>{userRole || 'Administrator'}</span>
            </div>
            <button onClick={onLogout} className={styles.logoutButton} title="ออกจากระบบ">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
