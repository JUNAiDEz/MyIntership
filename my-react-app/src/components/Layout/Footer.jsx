// src/components/Layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

// Import ไอคอนที่เหมาะกับอู่รถ
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLine,
  FaTools, FaAward, FaHeadset, FaShieldAlt,
  FaMapMarkerAlt, FaPhoneAlt, FaClock
} from 'react-icons/fa';

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.container}>
        
        {/* ===== 1. FOOTER MAIN (4 คอลัมน์) ===== */}
        <div className={styles.footerGrid}>
          
          {/* Column 1: ABOUT US */}
          <div className={styles.footerColumn}>
            <h3>ABOUT GT7 MOTOR</h3>
            <p>
              GT7 Motor ศูนย์บริการรถยนต์ครบวงจร นำเข้าและจำหน่ายอะไหล่แท้ แบรนด์ชั้นนำระดับโลก พร้อมทีมช่างผู้เชี่ยวชาญที่ดูแลรถคุณด้วยมาตรฐานสูงสุด
            </p>
            <div className={styles.socialIcons}>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Line"><FaLine /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
            </div>
          </div>

          {/* Column 2: OUR SERVICES */}
          <div className={styles.footerColumn}>
            <h3>OUR SERVICES</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/services">เปลี่ยนถ่ายของเหลว</Link></li>
              <li><Link to="/services">ระบบช่วงล่างและเบรก</Link></li>
              <li><Link to="/services">ตั้งศูนย์และเปลี่ยนยาง</Link></li>
              <li><Link to="/services">จูนนิ่งอัพเกรดสมรรถนะ</Link></li>
              <li><Link to="/services">ตรวจเช็คสภาพรถยนต์</Link></li>
            </ul>
          </div>

          {/* Column 3: QUICK LINKS */}
          <div className={styles.footerColumn}>
            <h3>QUICK LINKS</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/shop">สั่งซื้อสินค้าและอะไหล่</Link></li>
              <li><Link to="/promotions">โปรโมชั่นประจำเดือน</Link></li>
              <li><Link to="/blog">บทความและผลงาน</Link></li>
              <li><Link to="/about">เกี่ยวกับเรา</Link></li>
              <li><Link to="/contact">ติดต่อจองคิว</Link></li>
            </ul>
          </div>

          {/* Column 4: CONTACT US */}
          <div className={styles.footerColumn}>
            <h3>CONTACT US</h3>
            <ul className={styles.contactInfo}>
              <li>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>บริษัท จีที เซเว่น มอเตอร์ จํากัด  531 ถนนหทันราษฎร์ แขวงสามวาตะวันตก  เขตคลองสามวา กรุงเทพมหานคร 10510</span>
              </li>
              <li>
                <FaPhoneAlt className={styles.contactIcon} />
                <span>02-123-4567, 081-999-9999</span>
              </li>
              <li>
                <FaClock className={styles.contactIcon} />
                <span>เปิดบริการทุกวัน: 09:00 น. - 18:00 น.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ===== 2. FOOTER FEATURES (แถบล่างสุด) ===== */}
        <div className={styles.footerFeatures}>
          <div className={styles.featureItem}>
            <FaTools size={36} className={styles.featureIcon} />
            <div className={styles.featureText}>
              <h4>Professional Service</h4>
              <p>บริการโดยทีมช่างผู้ชำนาญการ</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaAward size={36} className={styles.featureIcon} />
            <div className={styles.featureText}>
              <h4>Premium Parts</h4>
              <p>ใช้อะไหล่แท้คุณภาพระดับโลก</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaShieldAlt size={36} className={styles.featureIcon} />
            <div className={styles.featureText}>
              <h4>Warranty Guarantee</h4>
              <p>รับประกันงานซ่อมและอะไหล่</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaHeadset size={36} className={styles.featureIcon} />
            <div className={styles.featureText}>
              <h4>Free Consultation</h4>
              <p>ให้คำปรึกษาและประเมินราคาฟรี</p>
            </div>
          </div>
        </div>

        {/* ===== 3. COPYRIGHT ===== */}
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} GT7 MOTOR. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;