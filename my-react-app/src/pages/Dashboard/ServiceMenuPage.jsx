import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ServiceMenuPage.module.css';
import { 
  FaListUl, FaCarSide, FaTools, FaRocket, FaStickyNote, FaChevronRight 
} from 'react-icons/fa';

const ServiceMenuPage = () => {
  // รวมข้อมูลไว้ใน Array เพื่อให้จัดการง่าย และรองรับการดึง API ในอนาคต
  const menuItems = [
    {
      id: 'manage',
      title: 'จัดการข้อมูลบริการ',
      desc: 'รายการบริการทั่วไป และข้อมูลพื้นฐาน',
      path: '/dashboard/services/manage',
      icon: <FaListUl />,
      color: 'blue',
      isFullWidth: true, // ตัวนี้อยู่บนสุด เต็มจอ
      count: 120 // ตัวอย่าง: จำนวนรายการ (รอต่อ API)
    },
    {
      id: 'fitment',
      title: 'จัดการข้อมูลจัดทรง',
      desc: 'ศูนย์ล้อ, ลูกหมาก, โช้คอัพ, ล้อ-ยาง',
      path: '/dashboard/services/fitment',
      icon: <FaCarSide />,
      color: 'orange',
      count: 45
    },
    {
      id: 'maintenance',
      title: 'บำรุงรักษา (Maintenance)',
      desc: 'ล้างท่อ, Engine Spa, เปลี่ยนถ่ายของเหลว',
      path: '/dashboard/services/maintenance',
      icon: <FaTools />,
      color: 'green',
      count: 8
    },
    {
      id: 'upgrade',
      title: 'ข้อมูลอัปเกรดความแรง',
      desc: 'ท่อไอเสีย, รีแมพ, เทอร์โบ, วาล์ว',
      path: '/dashboard/services/upgrade',
      icon: <FaRocket />,
      color: 'red',
      count: 32
    },
    {
      id: 'wrap',
      title: 'Wrap & Sticker',
      desc: 'ฟิล์มกรองแสง, สติ๊กเกอร์, เกจวัด',
      path: '/dashboard/services/wrapcar',
      icon: <FaStickyNote />,
      color: 'purple',
      count: 15
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>บริการค่าแรง</h2>
        <p className={styles.pageSubtitle}>เลือกเมนูเพื่อจัดการข้อมูลในส่วนต่างๆ</p>
      </div>

      <div className={styles.menuList}>
        {menuItems.map((item) => (
          <Link 
            key={item.id}
            to={item.path} 
            className={`${styles.menuCard} ${item.isFullWidth ? styles.fullWidth : ''}`}
          >
            {/* Icon Section */}
            <div className={`${styles.iconBox} ${styles[item.color]}`}>
              {item.icon}
            </div>

            {/* Content Section */}
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <h3>{item.title}</h3>
                {/* Badge แสดงจำนวนรายการ (Feature ใหม่) */}
                {item.count !== undefined && (
                  <span className={styles.badge}>
                    {item.count} รายการ
                  </span>
                )}
              </div>
              <span className={styles.desc}>{item.desc}</span>
            </div>

            {/* Arrow */}
            <div className={styles.arrow}>
              <FaChevronRight />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceMenuPage;