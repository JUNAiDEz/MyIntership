// src/pages/PublicSite.jsx

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import Header from '../components/Layout/Header';
import HeroSection from '../components/PageSections/HeroSection';
import ProductCarousel from '../components/Product/ProductCarousel';
import BlogSection from '../components/Blog/BlogSection';
import PartnerSection from '../components/PageSections/PartnerSection';
import Footer from '../components/Layout/Footer';
import PosterCarousel from '../components/PageSections/PosterCarousel';
import CarColorizer from '../components/PageSections/CarColorizer'; 
import AgentChatBot from '../components/AgentChatBot';

import { apiGet } from '../utils/api';
import { getImageUrl } from '../utils/productHelpers';

// Import CSS ใหม่
import styles from './PublicSite.module.css'; 
// Import Icons (ต้องลง react-icons: npm install react-icons)
import { FaTools, FaShieldAlt, FaAward, FaCalendarCheck } from 'react-icons/fa';

function PublicSite({ onLogout }) {
  
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loadingError, setLoadingError] = useState(null);

  // --- Fetch Data Logic (คงเดิมของคุณไว้) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [rawProducts, rawServices] = await Promise.all([
          apiGet('/api/inventory/products?active=true').catch(err => []),
          apiGet('/api/services').catch(err => [])
        ]);

        const productsList = Array.isArray(rawProducts) ? rawProducts : (Array.isArray(rawProducts?.items) ? rawProducts.items : []);
        const servicesList = Array.isArray(rawServices) ? rawServices : (Array.isArray(rawServices?.items) ? rawServices.items : []);

        const mapProduct = (p) => ({
          id: p.product_template_id || p.id || p.product_id,
          title: p.product_name || p.title || p.name || '',
          imageUrl: getImageUrl((p.images && (p.images[0]?.image_url || p.images[0]?.url)) || p.imageUrl || p.image_url || ''),
          price: Number(p.variants?.[0]?.unit_price ?? p.price ?? p.base_price ?? 0) || 0,
          discount: p.discount || p.discount_text || '',
          raw: p
        });

        const mapService = (s) => ({
          id: s.service_id || s.id,
          title: s.service_name || s.title || s.name || '',
          imageUrl: getImageUrl((s.images && (s.images[0]?.image_url || s.images[0]?.url)) || s.imageUrl || s.image_url || ''),
          price: Number(s.base_labor_cost ?? s.price ?? (s.pricings && s.pricings[0]?.price) ?? 0) || 0,
          discount: s.discount || '',
          raw: s
        });

        const pickPopular = (arr, mapFn) => {
          if (!Array.isArray(arr)) return [];
          return arr.map(mapFn).slice(0, 8); // ตัดมาแค่ 8 ตัว
        };

        setPopularProducts(pickPopular(productsList, mapProduct));
        setPopularServices(pickPopular(servicesList, mapService));

      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoadingError(error?.message);
        setPopularProducts([]);
        setPopularServices([]);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>GT7 Garage | ศูนย์บริการรถยนต์ครบวงจร</title>
        <meta name="description" content="GT7 Garage ศูนย์บริการรถยนต์ครบวงจร บริการแต่งรถ ซ่อมบำรุง เปลี่ยนถ่ายของเหลว..." />
        {/* ... Meta tags อื่นๆ ... */}
      </Helmet>

      {/* 🔥 Header แบบ Sticky (เรียกใช้คลาสจาก CSS เพื่อแก้บั๊กมือถือ) 🔥 */}
      <div className={styles.stickyNav}>
         <Header onLogout={onLogout} />
      </div>
      
      {/* 1. Hero Section (Banner ใหญ่) */}
      <HeroSection />

      {/* 2. Features Section (เพิ่มใหม่: สร้างความเชื่อถือ) */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>WHY CHOOSE <span>GT7 MOTOR</span></h2>
          <p style={{color:'#aaa'}}>ทำไมต้องเลือกใช้บริการกับเรา?</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaTools className={styles.featureIcon} />
            <h3>PROFESSIONAL TEAM</h3>
            <p>ทีมช่างผู้เชี่ยวชาญ มากประสบการณ์ พร้อมดูแลรถคุณเหมือนรถของเราเอง</p>
          </div>
          <div className={styles.featureCard}>
            <FaShieldAlt className={styles.featureIcon} />
            <h3>PREMIUM PARTS</h3>
            <p>ใช้อะไหล่แท้และผลิตภัณฑ์คุณภาพสูงมาตรฐานระดับโลกเท่านั้น</p>
          </div>
          <div className={styles.featureCard}>
            <FaAward className={styles.featureIcon} />
            <h3>WARRANTY</h3>
            <p>รับประกันงานซ่อมและอะไหล่ ให้คุณมั่นใจในทุกการขับขี่</p>
          </div>
        </div>
      </section>

      {/* 3. Poster Carousel (โปรโมชั่น/ไฮไลท์) */}
      <div className={styles.sectionSpacing}>
         <PosterCarousel />
      </div>

      {/* 4. Car Colorizer (ฟีเจอร์เด็ด) */}
      <div className={styles.sectionSpacing}>
         <CarColorizer />
      </div>

      <div className={styles.mainContainer}>
        
        {/* 5. Parallax Call to Action (เพิ่มใหม่: กระตุ้นการจอง) */}
        <section className={styles.parallaxSection}>
           <div className={styles.parallaxContent}>
              <h2>READY TO <span>UPGRADE?</span></h2>
              <p>ยกระดับสมรรถนะและความสวยงามให้รถของคุณวันนี้ ปรึกษาผู้เชี่ยวชาญของเราได้ฟรี</p>
              <Link to="/contact" className={styles.ctaBtn}>
                 <FaCalendarCheck style={{marginRight:'10px'}}/> จองคิวบริการ
              </Link>
           </div>
        </section>

        {/* 6. Popular Services */}
        {popularServices.length > 0 && (
          <div className={styles.carouselSection}>
             <ProductCarousel 
               title="บริการยอดนิยม" 
               items={popularServices}
               viewAllLink="/ourservices"
             />
          </div>
        )}

        {/* 7. Popular Products */}
        {popularProducts.length > 0 && (
          <div className={styles.carouselSection}>
             <ProductCarousel 
               title="สินค้ายอดนิยม" 
               items={popularProducts}
               viewAllLink="/shop"
             />
          </div>
        )}

        {loadingError && (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '20px' }}>
             (ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้)
          </div>
        )}

        {/* 8. Blog Section */}
        <div className={styles.sectionSpacing}>
           <BlogSection />
        </div>

        {/* 9. Partner / Dealer Section 🔥 วางโชว์โลโก้ตรงนี้ 🔥 */}
        <div className={styles.sectionSpacing}>
           <PartnerSection />
        </div>

      </div>

      <Footer />
      <AgentChatBot />
    </div>
  );
}

export default PublicSite;