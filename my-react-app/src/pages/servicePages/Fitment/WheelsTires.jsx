import React from 'react';
import styles from './WheelsTires.module.css'; // เปลี่ยน import
import { useNavigate } from 'react-router-dom';

import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';

function WheelsTires({ onLogout }) {
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
              <h1 className={styles.heroTitle}>บริการล้อแม็ก · ยาง</h1>
              <p className={styles.heroDescription}>
                เราให้บริการติดตั้งและจัดชุดล้อแม็กซ์พร้อมยางที่เหมาะกับรถของคุณ 
                รวมถึงการบาลานซ์และแนะนำรุ่นยางตามการใช้งานจริง
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
            <h2 className={styles.sectionTitle}>บริการของเรา</h2>
            <div className={styles.carouselControls}>
              <button>&lt;</button>
              <button>&gt;</button>
            </div>
          </div>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ล้อแม็กซ์</h3>
              <p>จำหน่ายและติดตั้งล้อแม็กซ์ลายสวยงาม</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ยางรถยนต์</h3>
              <p>จำหน่ายยางรถยนต์ทุกยี่ห้อ ทุกขนาด</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ตั้งศูนย์</h3>
              <p>บริการตั้งศูนย์ล้อด้วยระบบคอมพิวเตอร์</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่วงล้อ</h3>
              <p>บริการถ่วงล้อ ให้การขับขี่นุ่มนวล</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>สลับยาง</h3>
              <p>บริการสลับยางตามระยะ เพื่อยืดอายุการใช้งาน</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ปะยาง / ซ่อมยาง</h3>
              <p>บริการปะยาง ฉุกเฉิน รวดเร็ว ทันใจ</p>
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
        
        {/* --- ส่วนที่ถูกลบออก --- */}
        {/* <div className={styles.videoSection}>...</div> */}
        {/* <ReviewGallery images={reviewImages} /> */}
        {/* <ProductCarousel title="โปรโมชั่นที่เกี่ยวข้อง" items={relatedPromotionsData} /> */}
        {/* --- สิ้นสุดส่วนที่ถูกลบ --- */}
        
      </main>

      <Footer />
    </div>
  );
}

export default WheelsTires;