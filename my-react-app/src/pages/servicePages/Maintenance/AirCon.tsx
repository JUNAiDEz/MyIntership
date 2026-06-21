import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// ================== DATA: AIR CONDITIONING ==================
// pricingData จะถูกดึงจาก API

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000&auto=format&fit=crop', title: 'Before & After ล้างแอร์', desc: 'คราบเมือกและฝุ่นสะสม' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1632823471565-1ec20121d1f5', title: 'ล้างแบบไม่ถอดตู้', desc: 'ใช้กล้อง Micro Cam ส่อง' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'ขั้นตอนการล้างแอร์', desc: 'รีวิวขั้นตอนการทำงาน' }
];

function AirCon({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'aircon'],
    queryFn: async () => {
      const res: any = await api.apiGet('/api/services/aircon/pricing');
      return Array.isArray(res) ? res : [];
    },
  });

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!Array.isArray(dbData) || dbData.length === 0) return [];
    return dbData.map((brandGroup: any) => ({
      brand: brandGroup.brand,
      models: (brandGroup.models || []).map((model: any) => ({ ...model }))
    }));
  }, [dbData]);

  const allServicePackages = useMemo(() => {
    return pricingData.flatMap((brandGroup: any) =>
      brandGroup.models.map((model: any) => ({
        ...model,
        brand: brandGroup.brand,
        image_url: model.image_url || model.img || ''
      }))
    );
  }, [pricingData]);
  if (loadingPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>ไม่สามารถโหลดข้อมูลราคาได้</h2></div></main><Footer /></div>;

  const handleOpenPopup = (item: any) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/maintenance/aircon';
  const title = 'Air-Con Cleaning — ล้างแอร์รถยนต์';
  const description = 'บริการล้างแอร์รถยนต์ ด้วยเทคโนโลยีประสิทธิภาพสูง ราคามาตรฐาน พร้อมรีวิวจริงจากลูกค้า';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO
  const prices = allServicePackages.map((p: any) => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Air-Con Cleaning',
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
          title="AIR-CON CLEANING" 
          subtitle="ล้างแอร์รถยนต์ ล้างตู้แอร์" 
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
                { label: 'Fluid Change', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/maintenance/fluid-change' },
                { label: 'Engine Spa', sub: 'สปาเครื่องยนต์', path: '/services/maintenance/engine-spa' },
              ].map((item: any, i: number) => (
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

export default AirCon;