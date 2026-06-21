import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
// 👇 เรียกใช้ CSS กลาง
import styles from "../../../components/ServicePage/ServicePageLayout.module.css";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

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


// ================== DATA: Custom Exhaust (Dynamic) ==================

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?q=80&w=1000&auto=format&fit=crop', title: 'ติดตั้งท่อไอเสียสแตนเลส', desc: 'ตัวอย่างงานติดตั้งท่อไอเสียกับรถลูกค้า' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1000&auto=format&fit=crop', title: 'ทดสอบเสียงท่อ', desc: 'ทดสอบเสียงท่อหลังติดตั้งจริง' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000&auto=format&fit=crop', title: 'งานเชื่อมคุณภาพ', desc: 'โชว์งานเชื่อมและวัสดุสแตนเลสแท้' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'Exhaust Sound Demo', desc: 'ตัวอย่างเสียงท่อไอเสียจริง' }
];

const faqItems = [
  { question: 'Custom Exhaust คืออะไร?', answer: 'คือการออกแบบและติดตั้งท่อไอเสียใหม่ทั้งเส้นหรือบางส่วน เพื่อเพิ่มสมรรถนะ ปรับแต่งเสียง และความสวยงามให้กับรถของคุณ' },
  { question: 'เลือกเสียงท่อได้ไหม?', answer: 'สามารถเลือกเสียงท่อได้ทั้งแบบนุ่ม เงียบ หรือดุดัน ตามความต้องการของลูกค้า' },
  { question: 'ใช้เวลาติดตั้งนานไหม?', answer: 'โดยทั่วไปใช้เวลา 1-2 วัน ขึ้นอยู่กับรูปแบบและความซับซ้อนของงาน' },
  { question: 'รับประกันงานหรือไม่?', answer: 'รับประกันงานเชื่อมและวัสดุ 1 ปีเต็ม' },
  { question: 'วัสดุที่ใช้คืออะไร?', answer: 'ใช้สแตนเลสเกรด 304 แท้ทุกชิ้นส่วน ทนทานต่อการกัดกร่อนและความร้อนสูง' }
];

// ================== MAIN COMPONENT ==================

function CustomExhaust({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // ดึงข้อมูลราคาท่อไอเสีย custom จาก API
  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'custom-exhaust'],
    queryFn: async () => {
      const res: any = await api.apiGet('/api/services/custom-exhaust/pricing');
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

  const handleOpenPopup = (item: any) => { 
    setModalData(item); 
    setShowModal(true); 
  };

  const heroImage = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/custom-exhaust';
  const title = 'Custom Exhaust — GT7 Motor';
  const description = 'บริการออกแบบ ติดตั้ง โมดิฟายท่อไอเสียรถยนต์ ท่อสูตร ท่อสแตนเลสแท้ เลือกเสียงได้ งานคุณภาพ รับประกันทุกชิ้นงาน';
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
    'name': 'Custom Exhaust', 
    'description': description, 
    'serviceType': 'Custom Exhaust',
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

  if (loadingPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>ไม่สามารถโหลดข้อมูลราคาได้</h2></div></main><Footer /></div>;

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
          title="CUSTOM EXHAUST" 
          subtitle="ออกแบบและติดตั้งท่อไอเสียสแตนเลส" 
        />

        {/* 2. Price Selector (Dynamic) */}
        <PriceSelector pricingData={pricingData} />

        {/* 3. Related Services */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/maintenance/fluid-change' },
                { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/maintenance/engine-spa' },
                { label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/maintenance/pipe-cleaning' },
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

export default CustomExhaust;