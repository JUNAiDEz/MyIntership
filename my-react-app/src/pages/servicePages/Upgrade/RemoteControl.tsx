import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// ================== DATA: Remote Control ==================
// pricingData จะถูกดึงจาก API

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop', title: 'ติดตั้งรีโมท Viper', desc: 'ตัวอย่างงานติดตั้งรีโมท Viper พร้อมกันขโมย' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=1000&auto=format&fit=crop', title: 'Pandora Smart Pro', desc: 'ควบคุมรถผ่านแอปมือถือ' },
  { type: 'video', videoId: 'QwZT7T-TXT0', title: 'รีวิว Remote Start', desc: 'สาธิตการใช้งานรีโมทสตาร์ทรถยนต์' }
];

const faqItems = [
  { question: 'Remote Start คืออะไร?', answer: 'คือระบบที่ช่วยให้สามารถสตาร์ทรถยนต์จากระยะไกลผ่านรีโมทหรือมือถือได้' },
  { question: 'ติดตั้งรีโมทควบคุมปลอดภัยไหม?', answer: 'ปลอดภัยเมื่อใช้สินค้ามาตรฐานและติดตั้งโดยช่างผู้เชี่ยวชาญ พร้อมระบบกันขโมย' },
  { question: 'ใช้กับรถรุ่นไหนได้บ้าง?', answer: 'ติดตั้งได้กับรถยนต์เกือบทุกรุ่น ทั้งเบนซินและดีเซล' },
  { question: 'มีรับประกันไหม?', answer: 'รับประกันสินค้าและงานติดตั้ง 1 ปีเต็ม' }
];

// ================== MAIN COMPONENT ==================

function RemoteControl({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'remote-control'],
    queryFn: async () => {
      const res: any = await api.apiGet('/api/services/remote-control/pricing');
      return Array.isArray(res) ? res : [];
    },
  });

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];
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

  const handleOpenPopup = (item: any) => { 
    setModalData(item); 
    setShowModal(true); 
  };

  const heroImage = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/remote-control';
  const title = 'Remote Control — GT7 Motor';
  const description = 'บริการติดตั้งรีโมทควบคุมระยะไกล สตาร์ทรถ ล็อค/ปลดล็อค ประตู เปิดแอร์ แจ้งเตือนกันขโมย ควบคุมผ่านรีโมทหรือมือถือ';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO
  const prices = allServicePackages.map((p: any) => { 
    const digits = String(p.price || '').replace(/[^0-9]/g, ''); 
    return digits ? Number(digits) : null; 
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const serviceLd = {
    '@context': 'https://schema.org', 
    '@type': 'Service', 
    'name': 'Remote Control', 
    'description': description, 
    'serviceType': 'Remote Start/Keyless',
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
    'mainEntity': faqItems.map((f: any) => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } }))
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
          title="REMOTE CONTROL" 
          subtitle="ติดตั้งรีโมทสตาร์ท Keyless และกันขโมย" 
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

export default RemoteControl;