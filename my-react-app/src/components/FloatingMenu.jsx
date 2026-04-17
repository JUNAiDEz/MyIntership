import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react'; // เพิ่ม ChevronDown
import styles from './FloatingMenu.module.css';


const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null); // เก็บ index ของเมนูที่เปิดอยู่
  const navigate = useNavigate();
  const location = useLocation();
  // เมื่อเปิดเมนู ให้เช็ค path ปัจจุบันแล้วเปิด subMenu ที่ตรงกับ path
  React.useEffect(() => {
    if (isOpen) {
      // หา index ของหัวข้อหลักที่มี subItem path ตรงกับ path ปัจจุบัน
      const foundIndex = menuItems.findIndex(item =>
        item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path))
      );
      setActiveMenuIndex(foundIndex !== -1 ? foundIndex : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, location.pathname]);

  const showMenu =
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/ourservices');

  if (!showMenu) return null;

  // กำหนดข้อมูลเมนูแบบมีหัวข้อย่อย (SubItems)
  const menuItems = [
    { 
      label: 'บริการดูแลรักษาเครื่องยนต์', 
      // ไม่มี path เพราะกดแล้วจะแค่เปิด Dropdown
      subItems: [
        { label: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },
        { label: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
        { label: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
        { label: 'ล้างแอร์', path: '/services/air-con-cleaning' }
      ]
    },
    { 
      label: 'บริการจัดทรง', 
      subItems: [
        { label: 'โหลดหน้า - หลัง', path: '/services/suspension' },
        { label: 'โช๊คอัพ', path: '/services/shock-absorber' },
        { label: 'ล้อแม็กซ์ - ยาง', path: '/services/wheels-tyres' },
        { label: 'ตั้งศูนย์', path: '/services/alignment' },
        { label: 'ลูกหมาก', path: '/services/ball-joints' }
      ]
    },
    { 
      label: 'บริการอัพเกรดเครื่องยนต์', 
      subItems: [
        { label: 'รีแมพ', path: '/services/remap' },
        { label: 'ท่อแทน', path: '/services/custom-exhaust' },
        { label: 'เทอร์โบ อินเตอร์', path: '/services/turbo-inter' },
        { label: 'แก้วาล์ว', path: '/services/valve-service' },
        { label: 'รีโมทควบคุมระยะไกล', path: '/services/remote-control' }
      ]
    },
    { 
      label: 'บริการประดับยนต์ & แร็ปสติ๊กเกอร์', 
      subItems: [
        { label: 'ฟิล์มป้องกันรอย', path: '/services/film-protect' },
        { label: 'สติ๊กเกอร์', path: '/services/sticker' },
        { label: 'วัดบูส', path: '/services/boost-gauge' },
        { label: 'ท่อ', path: '/services/exhaust' }
      ]
    },
    { 
      label: 'สินค้าภายในร้าน', 
      subItems: [
        { label: 'GT7', path: '/product/gt7' },
        { label: 'STEP 1', path: '/product/step1' },
        { label: 'Nano', path: '/product/nano' },
        { label: 'Mmax', path: '/product/mmax' },
        { label: 'น้ำหอม', path: '/product/perfume' }
        
      ]
    },
  ];

  // ฟังก์ชันกดหัวข้อหลัก
  const handleMainItemClick = (index, item) => {
    if (item.subItems) {
      // ถ้ามีลูก ให้ Toggle เปิด/ปิด
      setActiveMenuIndex(activeMenuIndex === index ? null : index);
    } else {
      // ถ้าไม่มีลูก (เช่น สินค้าภายในร้าน) ให้เปลี่ยนหน้าเลย
      handleNavigate(item.path);
    }
  };

  // ฟังก์ชันเปลี่ยนหน้า (เมื่อกดที่เมนูย่อย หรือเมนูที่ไม่มีลูก)
  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
      setIsOpen(false);
      setActiveMenuIndex(null); // Reset เมนูย่อย
    }
  };

  return (
    <div className={styles.container}>
      {/* ส่วน Popup Menu */}
      <div 
        className={`${styles.menuPopup} ${isOpen ? styles.menuOpen : styles.menuClosed}`}
      >
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>เมนูนำทาง</span>
        </div>
        
        <div className={styles.menuList}>
          {menuItems.map((item, index) => (
            <div key={index} className={styles.menuItemWrapper}>
              {/* ปุ่มหัวข้อหลัก */}
              <button
                onClick={() => handleMainItemClick(index, item)}
                className={`${styles.menuItem} ${activeMenuIndex === index ? styles.menuItemActive : ''}`}
              >
                <span>{item.label}</span>
                {/* เช็คว่าถ้ามี subItems ให้แสดง icon dropdown */}
                {item.subItems ? (
                  activeMenuIndex === index ? 
                    <ChevronDown size={16} className={styles.menuIconActive} /> : 
                    <ChevronRight size={16} className={styles.menuIcon} />
                ) : (
                  <ChevronRight size={16} className={styles.menuIcon} />
                )}
              </button>

              {/* ส่วนแสดงรายการย่อย (Dropdown) */}
              <div className={`${styles.subMenu} ${activeMenuIndex === index ? styles.subMenuOpen : ''}`}>
                {item.subItems && item.subItems.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => handleNavigate(subItem.path)}
                    className={styles.subMenuItem}
                  >
                    - {subItem.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่ม FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.fabButton}
        aria-label="Toggle Menu"
      >
        <div className={`${styles.iconWrapper} ${isOpen ? styles.rotate : ''}`}>
           {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};

export default FloatingMenu;