import React from 'react';
import styles from './Sticker.module.css'; // เปลี่ยน import
import { useNavigate } from 'react-router-dom';

import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';

function Sticker({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  return (
    <div className={styles.pipeCleanPage}> {/* ใช้ class .pipeCleanPage จาก template */}
      <Header onLogout={onLogout} />

      <main className={styles.mainContent}>
        
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroMainBanner}>
            <div className={`${styles.heroImagePlaceholder} ${styles.large}`}></div> {/* Image placeholder */}
            <div className={styles.heroOverlayContent}>
              <h1 className={styles.heroTitle}>สติ๊กเกอร์ตกแต่ง</h1>
              <p className={styles.heroDescription}>
                สติ๊กเกอร์ติดรถหลากดีไซน์ 
                ติดตั้งโดยช่างมืออาชีพ
              </p>
              <button className={styles.readMoreButton}>READ MORE</button>
              <div className={styles.carouselControls}>
                <button>&lt;</button>
                <button>&gt;</button>
              </div>
            </div>
          </div>
          <div className={styles.heroThumbnails}>
            <div
              className={styles.thumbnailCard}
              role="button"
              tabIndex={0}
              onClick={() => go('/services/fluid-change')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/services/fluid-change'); } }}
            >
              <div className={`${styles.thumbnailImagePlaceholder} ${styles.medium}`}></div>
              <div className={styles.thumbnailText}>
                <h3>บริการเปลี่ยนถ่ายของเหลว</h3>
                <p>Fluid Change Service.</p>
              </div>
            </div>
            <div
              className={styles.thumbnailCard}
              role="button"
              tabIndex={0}
              onClick={() => go('/services/engine-spa')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/services/engine-spa'); } }}
            >
              <div className={`${styles.thumbnailImagePlaceholder} ${styles.medium}`}></div>
              <div className={styles.thumbnailText}>
                <h3>บริการสปาเครื่องยนต์</h3>
                <p>Engine Detailing Service.</p>
              </div>
            </div>
            <div
              className={styles.thumbnailCard}
              role="button"
              tabIndex={0}
              onClick={() => go('/services/air-con')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/services/air-con'); } }}
            >
              <div className={`${styles.thumbnailImagePlaceholder} ${styles.medium}`}></div>
              <div className={styles.thumbnailText}>
                <h3>บริการล้างแอร์</h3>
                <p>Car A/C Cleaning Service.</p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR SERVICES SECTION */}
        <section className={`${styles.ourServicesSection} container`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>บริการเกี่ยวกับสติ๊กเกอร์</h2>
            <div className={styles.carouselControls}>
              <button>&lt;</button>
              <button>&gt;</button>
            </div>
          </div>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>สติ๊กเกอร์คาดหน้า</h3>
              <p>ติดตั้งสติ๊กเกอร์คาดกระจกหน้า</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>สติ๊กเกอร์ติดข้าง</h3>
              <p>ติดสติ๊กเกอร์ลายข้างรถ (Racing / Custom)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>สติ๊กเกอร์ตัด</h3>
              <p>บริการตัดสติ๊กเกอร์ตามแบบ / โลโก้ทีม</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>สติ๊กเกอร์ฝากระโปรง</h3>
              <p>ติดตั้งสติ๊กเกอร์ฝากระโปรงหน้า / หลัง</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ลอกสติ๊กเกอร์</h3>
              <p>บริการลอกสติ๊กเกอร์เก่า ขจัดคราบกาว</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>แร็ปสี (Wrap)</h3>
              <p>บริการแร็ปเปลี่ยนสีรถยนต์ (Color Wrap)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
          </div>
        </section>

        {/* WELCOME AND NEWS SECTION (เหมือน template) */}
        <section className={`${styles.welcomeNewsSection} container`}>
          <div className={styles.welcomeCarRepair}>
            <h2 className={styles.sectionTitle}>VIDEO & PICTURE REVIEW</h2>
            <div className={styles.welcomeContent}>
              <div className={`${styles.welcomeImagePlaceholder} ${styles.largeImage}`}></div>
              <div className={styles.welcomeText}>
                <p>
                  LOREM IPSUM DOLOR SIT AMET CONSE CTEUR ADIPISCING ELIT. SED DO EIUSMOD
                  TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA IPSUM DOLOR SIT AMET...
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...
                </p>
                <button className={styles.moreDetailsButton}>MORE DETAILS</button>
              </div>
            </div>
          </div>

          <div className={styles.newsOurHoursSection}>
            <div className={styles.newsSection}>
              <h2 className={styles.sectionTitle}>PROMOTION</h2>
              <div className={styles.newsItem}>
                <span className={styles.newsDate}>25 of December, 2013</span>
                <p className={styles.newsDescription}>LOREM IPSUM DOLOR SIT AMET...</p>
                <p className={styles.newsSubDescription}>Ut enim ad minim veniam...</p>
              </div>
              <div className={styles.newsItem}>
                <span className={styles.newsDate}>25 of December, 2013</span>
                <p className={styles.newsDescription}>LOREM IPSUM DOLOR SIT AMET...</p>
                <p className={styles.newsSubDescription}>Ut enim ad minim veniam...</p>
              </div>
              <a href="#" className={styles.seeAllLink}>SEE ALL</a>
            </div>
            <div className={styles.ourHoursSection}>
              <h2 className={styles.sectionTitle}>Our Hours</h2>
              <div className={styles.hoursCard}>
                <h3>24 Hour Emergency Towing</h3>
                <p>Saturday: <span>7:00AM - 10PM</span></p>
                <p>Sunday: <span>7:00AM - 10PM</span></p>
                <p>Night Drop Repair</p>
                <div className={`${styles.hoursImagePlaceholder} ${styles.mediumImage}`}></div>
              </div>
              <div className={styles.ourLocation}>
                <h3>Our Location</h3>
                <ShopMap address="GT7 Motor, Bangkok, Thailand" height="220px" />
              </div>
            </div>
          </div>
        </section>

        {/* --- ส่วนที่ถูกลบออก (Video, Carousel) --- */}
        
      </main>

      <Footer />
    </div>
  );
}

export default Sticker;