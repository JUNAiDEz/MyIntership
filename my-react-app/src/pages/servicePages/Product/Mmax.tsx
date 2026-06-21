
import React, { useState, useMemo } from 'react';
import styles from "../../../components/ServicePage/ServicePageLayout.module.css";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
// Shared Components
import HeroSection from '../../../components/ServicePage/HeroSection';
import PriceSelector from '../../../components/ServicePage/PriceSelector';
import ServiceCatalog from '../../../components/ServicePage/ServiceCatalog';
import ReviewGallery from '../../../components/ServicePage/ReviewGallery';
import ServiceModal from '../../../components/ServicePage/ServiceModal';

import type { ServiceModel, ReviewItem } from '@/types';

// ================== DATA: M-MAX ==================
const pricingData = [
  {
    brand: "TOYOTA",
    models: [
      { name: "VIOS / YARIS", img: "https://images.unsplash.com/photo-1621503940178-62024220cc33?q=80&w=600&auto=format&fit=crop", price: "650.- / 950.-", stage: "4 สูบ / 6 สูบ", note: "4 สูบ: 650.-, 6 สูบ: 950.-", },
      { name: "CAMRY", img: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?q=80&w=600&auto=format&fit=crop", price: "850.- / 1,200.-", stage: "4 สูบ / 6 สูบ", note: "4 สูบ: 850.-, 6 สูบ: 1,200.-", },
    ]
  },
  {
    brand: "HONDA",
    models: [
      { name: "JAZZ / CITY", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=600&auto=format&fit=crop", price: "650.- / 950.-", stage: "4 สูบ / 6 สูบ", note: "4 สูบ: 650.-, 6 สูบ: 950.-", },
      { name: "CIVIC", img: "https://images.unsplash.com/photo-1605816922336-6c703b44c602?q=80&w=600&auto=format&fit=crop", price: "750.- / 1,050.-", stage: "4 สูบ / 6 สูบ", note: "Turbo, 4 สูบ: 750.-, 6 สูบ: 1,050.-", },
    ]
  }
];

const reviewItems: ReviewItem[] = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop', title: 'M-MAX Treatment', desc: 'เพิ่มประสิทธิภาพเครื่องยนต์' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3', title: 'Engine Performance', desc: 'ลดเสียงดัง เพิ่มแรง' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'M-MAX Application', desc: 'วิธีการใช้งาน' }
];

function Mmax({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ServiceModel | null>(null);

  // Flatten all models for ServiceCatalog
  const allServicePackages = useMemo<ServiceModel[]>(() => {
    return pricingData.flatMap((brandGroup) => brandGroup.models.map((model) => ({ ...model, brand: brandGroup.brand })));
  }, []);

  // param คง any: ServiceCatalog ส่ง PackageItem (ไม่มี index signature) ทำให้ใส่ ServiceModel แล้ว prop callback ไม่ assignable
  const handleOpenPopup = (item: any) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1621503940178-62024220cc33?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/product/mmax';
  const title = 'M-MAX Engine Care — ผลิตภัณฑ์ดูแลเครื่องยนต์';
  const description = 'ผลิตภัณฑ์ M-MAX สำหรับดูแลและเพิ่มประสิทธิภาพเครื่องยนต์ พร้อมบริการสำหรับรถยนต์หลากหลายรุ่น';
  const mainImage = heroImage;

  // For SEO price range
  const prices = allServicePackages.map((p) => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'M-MAX Engine Care',
      'description': description,
      'image': mainImage,
      'brand': { '@type': 'Brand', 'name': 'M-MAX' },
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
          title="M-MAX" 
          subtitle="ENGINE CARE PRODUCTS" 
        />

        <PriceSelector pricingData={pricingData} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'GT7', sub: 'Premium Products', path: '/services/product/gt7' },
                { label: 'STEP 1', sub: 'Engine Treatment', path: '/services/product/step1' },
                { label: 'Nano Coating', sub: 'Paint Protection', path: '/services/product/nano' },
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

export default Mmax;
