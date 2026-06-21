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

// ==================================================================================
// 1. DATA SOURCE (Pipe Clean)
// ==================================================================================
import api from '../../../utils/api';
import type { ServicePricingGroup, ServiceModel, ReviewItem } from '@/types';

// pricingData จะถูกดึงจาก API

const reviewItems: ReviewItem[] = [
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1000&auto=format&fit=crop',
    title: 'คราบเขม่าสะสมก่อนล้าง',
    desc: 'สภาพท่อร่วมไอดีที่มีเขม่าอุดตันจำนวนมาก ทำให้รถวิ่งไม่ออก'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=1000&auto=format&fit=crop',
    title: 'หลังล้างสะอาดเหมือนใหม่',
    desc: 'ขจัดคราบเขม่าออกจนหมด ช่วยให้อากาศไหลเวียนได้ดีขึ้น'
  },
  {
    type: 'video',
    videoId: 'dQw4w9WgXcQ', 
    title: 'รีวิวขั้นตอนการทำงาน',
    desc: 'ชมขั้นตอนการถอดล้างและประกอบกลับอย่างละเอียด'
  }
];

// ==================================================================================
// 2. MAIN COMPONENT
// ==================================================================================

function PipeClean({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ServiceModel | null>(null);

  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'pipe-clean'],
    queryFn: async () => {
      const res = await api.apiGet<ServicePricingGroup[]>('/api/services/pipe-clean/pricing');
      return Array.isArray(res) ? res : [];
    },
  });

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!Array.isArray(dbData) || dbData.length === 0) return [];
    return dbData.map((brandGroup: ServicePricingGroup) => ({
      brand: brandGroup.brand,
      models: (brandGroup.models || []).map((model: ServiceModel) => ({ ...model }))
    }));
  }, [dbData]);

  const allServicePackages = useMemo(() => {
    return pricingData.flatMap((brandGroup: ServicePricingGroup) =>
      brandGroup.models.map((model: ServiceModel) => ({
        ...model,
        brand: brandGroup.brand,
        image_url: model.image_url || model.img || ''
      }))
    );
  }, [pricingData]);
  if (loadingPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pageContainer}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>ไม่สามารถโหลดข้อมูลราคาได้</h2></div></main><Footer /></div>;

  const handleOpenPopup = (item: ServiceModel) => {
    setModalData(item);
    setShowModal(true);
  };

  // 🟢 ใช้รูปจาก URL แทนการ Import ไฟล์
  const heroImage = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1600&auto=format&fit=crop';
  
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/maintenance/pipe-cleaning';
  const title = 'Intake Cleaning — ล้างท่อร่วมไอดี';
  const description = 'บริการล้างท่อร่วมไอดี & อุด EGR มาตรฐานศูนย์บริการ แก้ปัญหารถอืด กินน้ำมัน';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO (ดึงเลขตัวแรกจาก string ราคา)
  const prices = allServicePackages.map((p: ServiceModel) => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? parseInt(digits.substring(0, 4)) : null;
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Intake Cleaning',
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
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={mainImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLdArray)}</script>
      </Helmet>
      
      <Header onLogout={onLogout} />

      <main className={styles.mainContent}>
        
        {/* 1. Hero */}
        <HeroSection 
          bgImage={heroImage}
          title="INTAKE CLEANING"
          subtitle="ล้างท่อร่วมไอดี อุด EGR"
        />

        {/* 2. Price Selector */}
        <PriceSelector pricingData={pricingData as React.ComponentProps<typeof PriceSelector>['pricingData']} />

        {/* 3. Related Services */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER MAINTENANCE SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/maintenance/fluid-change' },
                { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/maintenance/engine-spa' },
                { label: 'REMAP TUNING', sub: 'รีแมพ เพิ่มแรงม้า', path: '/services/upgrade/remap' },
              ].map((item, i: number) => (
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

        {/* 4. Catalog */}
        <ServiceCatalog allPackages={allServicePackages} onOpenModal={handleOpenPopup as React.ComponentProps<typeof ServiceCatalog>['onOpenModal']} />

        {/* 5. Reviews */}
        <ReviewGallery reviewItems={reviewItems} />
        
        {/* 6. Map */}
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

export default PipeClean;