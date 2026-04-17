import React, { useState, useMemo, useEffect } from 'react';
// 👇 เรียกใช้ CSS กลาง
import styles from "../../../components/ServicePage/ServicePageLayout.module.css";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Layout
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';

// Reusable Components
import HeroSection from '../../../components/ServicePage/HeroSection';
import PriceSelector from '../../../components/ServicePage/PriceSelector';
import ServiceCatalog from '../../../components/ServicePage/ServiceCatalog';
import ReviewGallery from '../../../components/ServicePage/ReviewGallery';
import ServiceModal from '../../../components/ServicePage/ServiceModal';

import api from '../../../utils/api';

// ================== DATA: FLUID CHANGE ==================
// pricingData จะถูกดึงจาก API

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1000&auto=format&fit=crop', title: 'งานเปลี่ยนถ่ายน้ำมันเครื่อง', desc: 'ใช้น้ำมันสังเคราะห์แท้ 100% เพื่อการปกป้องสูงสุด' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1635437536163-54b2b3c2006d?q=80&w=1000&auto=format&fit=crop', title: 'เปลี่ยนน้ำมันเกียร์เต็มระบบ', desc: 'ช่วยให้การเปลี่ยนเกียร์นุ่มนวลและยืดอายุการใช้งาน' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'รีวิวขั้นตอนการทำงาน', desc: 'ชมขั้นตอนการดูแลรถยนต์มาตรฐานศูนย์บริการ' }
];

function FluidChange({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [dbData, setDbData] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [errorPricing, setErrorPricing] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        const res = await api.apiGet('/api/services/fluid-change/pricing');
        if (Array.isArray(res)) {
          setDbData(res);
        } else if (res && res.error) {
          setErrorPricing('API Error: ' + res.error);
          setDbData([]);
        } else {
          setErrorPricing('ไม่พบข้อมูลราคาหรือโครงสร้างผิด');
          setDbData([]);
        }
      } catch (err) {
        setErrorPricing('ไม่สามารถโหลดข้อมูลราคาได้');
        setDbData([]);
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!Array.isArray(dbData) || dbData.length === 0) return [];
    return dbData.map(brandGroup => ({
      brand: brandGroup.brand,
      models: (brandGroup.models || []).map(model => ({ ...model }))
    }));
  }, [dbData]);

  const allServicePackages = useMemo(() => {
    return pricingData.flatMap(brandGroup =>
      brandGroup.models.map(model => ({
        ...model,
        brand: brandGroup.brand,
        image_url: model.image_url || model.img || ''
      }))
    );
  }, [pricingData]);
  if (loadingPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>{errorPricing}</h2></div></main><Footer /></div>;

  const handleOpenPopup = (item) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/maintenance/fluid-change';
  const title = 'Fluid Change — เปลี่ยนถ่ายของเหลว';
  const description = 'บริการเปลี่ยนถ่ายของเหลวเครื่องยนต์และเกียร์ ด้วยน้ำมันเกรดพรีเมียม ราคามาตรฐาน พร้อมรีวิวจริงจากลูกค้า';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO
  const prices = allServicePackages.map(p => {
    // ดึงตัวเลขจาก field price
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? parseInt(digits.substring(0, 4)) : null; // เอาตัวเลขชุดแรกมาใช้
  }).filter(Boolean);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Fluid Change',
      'description': description,
      'image': mainImage,
      'provider': { '@type': 'AutoRepair', 'name': 'GT7 Motor' },
      'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'THB', 'lowPrice': lowPrice, 'url': pageUrl }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:image" content={mainImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLdArray)}</script>
      </Helmet>

      <Header onLogout={onLogout} />

      <main className={styles.mainContent}>
        
        {/* 1. Hero Section */}
        <HeroSection 
          bgImage={heroImage} 
          title="FLUID CHANGE" 
          subtitle="เปลี่ยนถ่ายของเหลวเครื่องยนต์และเกียร์" 
        />

        {/* 2. Price Selector */}
        <PriceSelector pricingData={pricingData} />

        {/* 3. Other Services */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER MAINTENANCE SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'Pipe Cleaning', sub: 'ล้างท่อร่วมไอดี', path: '/services/maintenance/pipe-cleaning' },
                { label: 'Engine Spa', sub: 'สปาเครื่องยนต์', path: '/services/maintenance/engine-spa' },
                { label: 'Air-Con Cleaning', sub: 'ล้างแอร์รถยนต์', path: '/services/maintenance/aircon' },
              ].map((item, i) => (
                <div key={i} className={styles.thumbnailCard} onClick={() => go(item.path)}>
                  <div className={styles.thumbnailText}>
                    <h3>{item.label}</h3>
                    <p>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Service Catalog */}
        <ServiceCatalog 
          allPackages={allServicePackages} 
          onOpenModal={handleOpenPopup} 
        />

        {/* 5. Review Gallery */}
        <ReviewGallery reviewItems={reviewItems} />

        {/* 6. Location */}
        <section className="container" style={{padding:'40px 20px'}}>
           <div className={styles.ourLocation}>
             <h3 className={styles.relatedTitle}>OUR LOCATION</h3>
             <ShopMap address="GT7 Motor, Bangkok, Thailand" height="400px" />
           </div>
        </section>

      </main>

      <Footer />
      <ServiceModal isOpen={showModal} data={modalData} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default FluidChange;