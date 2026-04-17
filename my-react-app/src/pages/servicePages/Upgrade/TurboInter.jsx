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

// ================== DATA: Turbo/Intercooler ==================
// pricingData จะถูกดึงจาก API

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1000&auto=format&fit=crop', title: 'ติดตั้งเทอร์โบ HKS', desc: 'ตัวอย่างงานติดตั้งเทอร์โบ HKS GT II พร้อมเดินท่อ' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop', title: 'เดินท่ออินเตอร์', desc: 'งานเดินท่ออินเตอร์คูลเลอร์อลูมิเนียมดัดทราย ไร้รอยคอด' },
  { type: 'video', videoId: 'lXKDu6cdXLI', title: 'รีวิว Turbo Upgrade', desc: 'สาธิตการอัพเกรดเทอร์โบและอินเตอร์ เพิ่มแรงม้าเห็นผลจริง' }
];

const faqItems = [
  { question: 'Turbo/Intercooler คืออะไร?', answer: 'Turbo คืออุปกรณ์เพิ่มแรงอัดอากาศเข้าสู่เครื่องยนต์ ส่วน Intercooler คืออุปกรณ์ลดอุณหภูมิอากาศหลังจากผ่านเทอร์โบเพื่อเพิ่มประสิทธิภาพ.' },
  { question: 'ติดตั้งเทอร์โบ/อินเตอร์คูลเลอร์ดีอย่างไร?', answer: 'ช่วยเพิ่มแรงม้า แรงบิด และลดอุณหภูมิไอดี ทำให้เครื่องยนต์ทำงานได้เต็มประสิทธิภาพมากขึ้น.' },
  { question: 'ใช้กับรถรุ่นไหนได้บ้าง?', answer: 'ติดตั้งได้กับรถยนต์หลากหลายรุ่น ทั้งเบนซินและดีเซล' },
  { question: 'มีรับประกันไหม?', answer: 'รับประกันสินค้าและงานติดตั้ง 1 ปีเต็ม' }
];

// ================== MAIN COMPONENT ==================

function TurboInter({ onLogout }) {
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
        const res = await api.apiGet('/api/services/turbo-inter/pricing');
        // ตรวจสอบว่า res เป็น array จริง
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

  const handleOpenPopup = (item) => { 
    setModalData(item); 
    setShowModal(true); 
  };

  const heroImage = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/turbo-inter';
  const title = 'Turbo/Intercooler — GT7 Motor';
  const description = 'บริการติดตั้งเทอร์โบและอินเตอร์คูลเลอร์ เพิ่มแรงม้า แรงบิด พร้อมระบบระบายความร้อนที่มีประสิทธิภาพ';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO
  const prices = allServicePackages.map(p => { 
    const digits = String(p.price || '').replace(/[^0-9]/g, ''); 
    return digits ? Number(digits) : null; 
  }).filter(Boolean);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const serviceLd = {
    '@context': 'https://schema.org', 
    '@type': 'Service', 
    'name': 'Turbo/Intercooler', 
    'description': description, 
    'serviceType': 'Turbo/Intercooler',
    'provider': { '@type': 'AutoRepair', 'name': 'GT7 Motor', 'url': pageUrl, 'image': mainImage, 'telephone': '+66-000-000-000' },
    'areaServed': 'TH', 
    'offers': lowPrice ? { '@type': 'Offer', 'priceCurrency': 'THB', 'price': lowPrice, 'url': pageUrl } : undefined,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': pageUrl }
  };

  const localBusinessLd = {
    '@context': 'https://schema.org', 
    '@type': 'LocalBusiness', 
    'name': 'GT7 Motor', 
    'image': mainImage, 
    'telephone': '+66-000-000-000',
    'address': { '@type': 'PostalAddress', 'streetAddress': 'Bangkok', 'addressLocality': 'Bangkok', 'addressCountry': 'TH' },
    'geo': { '@type': 'GeoCoordinates', 'latitude': 13.736717, 'longitude': 100.523186 },
    'openingHours': ['Mo-Fr 09:00-18:00', 'Sa 09:00-14:00']
  };

  const faqLd = {
    '@context': 'https://schema.org', 
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(f => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } }))
  };

  const jsonLdArray = [serviceLd, localBusinessLd, faqLd];

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={mainImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLdArray)}</script>
      </Helmet>

      <Header onLogout={onLogout} />

      <main className={styles.mainContent}>
        
        {/* 1. Hero Section */}
        <HeroSection 
          bgImage={heroImage} 
          title="TURBO INTERCOOLER" 
          subtitle="อัพเกรดเทอร์โบ เพิ่มแรงม้า ระบายความร้อน" 
        />

        {/* 2. Price Selector */}
        <PriceSelector pricingData={pricingData} />

        {/* 3. Related Services */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
                { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
                { label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },
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
           <div className={styles.ourLocation} style={{textAlign: 'center'}}>
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

export default TurboInter;