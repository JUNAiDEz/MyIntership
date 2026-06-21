import React, { useState, useMemo, type ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
// 👇 เรียกใช้ CSS กลาง
import styles from "../../../components/ServicePage/ServicePageLayout.module.css";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import type { ServicePricingGroup, ServiceModel, ReviewItem } from '@/types';

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


// ================== DATA: Exhaust (Dynamic) ==================

const reviewItems: ReviewItem[] = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop', title: 'ติดตั้ง HKS', desc: 'ตัวอย่างงานติดตั้งท่อ HKS Hi-Power ตรงรุ่น' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000&auto=format&fit=crop', title: 'Greddy', desc: 'ติดตั้งท่อ Greddy Revolution เสียงแน่น' },
  { type: 'video', videoId: 'QwZT7T-TXT0', title: 'รีวิวท่อไอเสีย', desc: 'ขั้นตอนการติดตั้งและทดสอบเสียงท่อ' }
];

const faqItems = [
  { question: 'ท่อไอเสียแต่งต่างจากเดิมอย่างไร?', answer: 'ท่อแต่งช่วยเพิ่มการไหลเวียนของไอเสีย เพิ่มแรงม้า และปรับเสียงได้ตามต้องการ' },
  { question: 'ท่อสแตนเลสกับไทเทเนียมต่างกันอย่างไร?', answer: 'สแตนเลสทนทานกว่า ไทเทเนียมเบากว่าและเสียงแหลมกว่า' },
  { question: 'มีรับประกันไหม?', answer: 'รับประกันสินค้าและงานติดตั้ง 1 ปีเต็ม' }
];

// ================== MAIN COMPONENT ==================

function Exhaust({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ServiceModel | null>(null);

  // ดึงข้อมูลจาก API
  const { data: dbData = [], isLoading: loading, isError: error } = useQuery({
    queryKey: ['service-pricing', 'exhaust'],
    queryFn: async () => {
      const res = await api.apiGet<ServicePricingGroup[]>('/api/services/exhaust/pricing');
      // flatten ให้เป็น array เดียว
      const flat: ServiceModel[] = [];
      (res || []).forEach((group: ServicePricingGroup) => {
        (group.models || []).forEach((model: ServiceModel) => {
          flat.push({
            brand: group.brand,
            ...model
          });
        });
      });
      return flat;
    },
  });

  // แปลง Flat List -> Grouped by Brand (สำหรับ UI PriceSelector)
  const pricingData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];
    const brands = [...new Set(dbData.map((item: ServiceModel) => item.brand))];
    return brands.map((brand): ServicePricingGroup => ({
      brand: brand as string,
      models: dbData.filter((item: ServiceModel) => item.brand === brand)
    }));
  }, [dbData]);

  // Flatten Data สำหรับ ServiceCatalog
  const allServicePackages = useMemo(() => {
    return pricingData.flatMap((brandGroup: ServicePricingGroup) =>
      brandGroup.models.map((model: ServiceModel) => ({
        ...model,
        brand: brandGroup.brand,
        image_url: model.image_url || model.img || ''
      }))
    );
  }, [pricingData]);

  const handleOpenPopup = (item: ServiceModel) => {
    setModalData(item); 
    setShowModal(true); 
  };

  const heroImage = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/exhaust';
  const title = 'Exhaust Service — GT7 Motor';
  const description = 'บริการติดตั้งท่อไอเสียแต่ง ท่อสแตนเลส ไทเทเนียม พร้อมปรับเสียงและสมรรถนะ โดยช่างผู้เชี่ยวชาญ';
  const mainImage = heroImage;

  // Logic หา Low Price สำหรับ SEO
  const prices = allServicePackages.map((p: ServiceModel) => {
    const digits = String(p.price || '').replace(/[^0-9]/g, ''); 
    return digits ? Number(digits) : null; 
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const serviceLd = {
    '@context': 'https://schema.org', 
    '@type': 'Service', 
    'name': 'Exhaust Service', 
    'description': description, 
    'serviceType': 'Exhaust',
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
    'mainEntity': faqItems.map((f) => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } }))
  };

  const jsonLdArray = [serviceLd, localBusinessLd, faqLd];

  // Loading State
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff' }}>
        <h2 style={{ color: '#F4D03F' }}>กำลังโหลดข้อมูลบริการ...</h2>
        <p>กรุณารอสักครู่</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111', color: '#fff' }}>
        <h3 style={{ color: 'red' }}>ไม่สามารถโหลดข้อมูลราคาได้</h3>
      </div>
    );
  }

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
          title="EXHAUST SERVICE" 
          subtitle="ติดตั้งท่อไอเสีย เพิ่มแรงม้า ปรับเสียง" 
        />

        {/* 2. Price Selector (Dynamic) */}
        {pricingData.length > 0 ? (
          <PriceSelector pricingData={pricingData as ComponentProps<typeof PriceSelector>['pricingData']} />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
            ยังไม่มีข้อมูลราคาในระบบ
          </div>
        )}

        {/* 3. Related Services */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
                { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
                { label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },
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

        {/* 4. Service Catalog */}
        <ServiceCatalog
          allPackages={allServicePackages as ComponentProps<typeof ServiceCatalog>['allPackages']}
          onOpenModal={handleOpenPopup as ComponentProps<typeof ServiceCatalog>['onOpenModal']}
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

export default Exhaust;