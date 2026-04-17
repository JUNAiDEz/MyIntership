
import React, { useState, useMemo, useEffect } from 'react';
import styles from "../../../components/ServicePage/ServicePageLayout.module.css";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
import HeroSection from '../../../components/ServicePage/HeroSection';
import PriceSelector from '../../../components/ServicePage/PriceSelector';
import ServiceCatalog from '../../../components/ServicePage/ServiceCatalog';
import ReviewGallery from '../../../components/ServicePage/ReviewGallery';
import ServiceModal from '../../../components/ServicePage/ServiceModal';

import api from '../../../utils/api';

// pricingData จะถูกดึงจาก API

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1000&auto=format&fit=crop', title: 'ตั้งศูนย์ล้อ 3D', desc: 'แม่นยำด้วยเครื่องมือตั้งศูนย์ระบบ 3 มิติ มาตรฐานศูนย์บริการ' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop', title: 'เช็คช่วงล่างฟรี', desc: 'ตรวจเช็คลูกหมาก บูชปีกนก และระบบบังคับเลี้ยว' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'ขั้นตอนการตั้งศูนย์', desc: 'ชมขั้นตอนการปรับตั้งมุมล้อ Camber, Caster, Toe' }
];

function Alignment({ onLogout }) {
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
        const res = await api.apiGet('/api/services/alignment/pricing');
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

  const heroImage = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/fitment/alignment';
  const title = 'Alignment & Balancing — ตั้งศูนย์ล้อ ถ่วงล้อ';
  const description = 'บริการตั้งศูนย์ล้อ ถ่วงล้อ ด้วยเครื่องมือ 3D มาตรฐานศูนย์บริการ พร้อมเช็คช่วงล่างฟรี';
  const mainImage = heroImage;

  const prices = allServicePackages.map(p => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter(Boolean);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Alignment & Balancing',
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
        <HeroSection 
          bgImage={heroImage} 
          title="ALIGNMENT & BALANCING" 
          subtitle="ตั้งศูนย์ล้อ ถ่วงล้อ 3D" 
        />

        <PriceSelector pricingData={pricingData} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER FITMENT SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'Ball Joints', sub: 'ลูกหมากปีกนก', path: '/services/fitment/ball-joints' },
                { label: 'Shock Absorber', sub: 'เปลี่ยนโช๊คอัพ', path: '/services/fitment/shock-absorber' },
                { label: 'Suspension', sub: 'โหลดเตี้ย/ยกสูง', path: '/services/fitment/suspension' },
                { label: 'Wheels & Tires', sub: 'เปลี่ยนยาง/ล้อแม็ก', path: '/services/fitment/wheels-tires' },
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

        <ServiceCatalog 
          allPackages={allServicePackages} 
          onOpenModal={handleOpenPopup} 
        />

        <ReviewGallery reviewItems={reviewItems} />

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

export default Alignment;