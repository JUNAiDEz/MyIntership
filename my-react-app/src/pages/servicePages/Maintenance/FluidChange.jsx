import React from 'react';
import styles from './PipeClean.module.css'; // เปลี่ยน import
import { useNavigate } from 'react-router-dom';

import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
// ไม่ได้ใช้ ProductCarousel และ ReviewGallery แล้ว
// import ProductCarousel from '../../components/Product/ProductCarousel';
// (ReviewGallery component definition is also removed)

// --- Component หลักของหน้า ---
function FluidChange({ onLogout }) {
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
              <h1 className={styles.heroTitle}>บริการถ่ายของเหลว<br/>(Fluid Change)</h1>
              <p className={styles.heroDescription}>
                การเปลี่ยนถ่ายของเหลวเป็นสิ่งสำคัญที่สุดในการดูแลรักษารถยนต์ 
                ไม่ว่าจะเป็นน้ำมันเครื่อง, น้ำมันเกียร์, หรือน้ำมันเบรก
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
              onClick={() => go('/services/pipe-cleaning')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/services/fluid-change'); } }}
            >
              <div className={`${styles.thumbnailImagePlaceholder} ${styles.medium}`}></div>
              <div className={styles.thumbnailText}>
                <h3>บริการล้างท่อร่วมไอดีอุด EGR</h3>
                <p>Intake Manifold Cleaning & EGR Blanking Service.</p>
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
            <h2 className={styles.sectionTitle}>บริการเกี่ยวกับของเหลว</h2>
            <div className={styles.carouselControls}>
              <button>&lt;</button>
              <button>&gt;</button>
            </div>
          </div>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำมันเครื่อง</h3>
              <p>เปลี่ยนถ่ายน้ำมันเครื่อง (สังเคราะห์แท้)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำมันเกียร์</h3>
              <p>เปลี่ยนถ่ายน้ำมันเกียร์ (ATF / CVT)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำมันเบรก</h3>
              <p>เปลี่ยนถ่ายน้ำมันเบรก (DOT3 / DOT4)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำมันเฟืองท้าย</h3>
              <p>เปลี่ยนถ่ายน้ำมันเฟืองท้าย (Differential)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำยาหล่อเย็น</h3>
              <p>เปลี่ยนถ่ายน้ำยาหล่อเย็น (Coolant)</p>
              <a href="#" className={styles.readMore}>READ MORE</a>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconPlaceholder} ${styles.small}`}></div>
              <h3>ถ่ายน้ำมันเพาเวอร์</h3>
              <p>เปลี่ยนถ่ายน้ำมันพวงมาลัยเพาเวอร์</p>
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

        {/* --- ส่วนที่ถูกลบออก (Video, Carousel, ReviewGallery) --- */}
        
      </main>

      <Footer />
    </div>
  );
}

export default FluidChange;