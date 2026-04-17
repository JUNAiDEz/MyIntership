
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

// ================== DATA: STEP 1 ==================
const pricingData = [
  {
    brand: "TOYOTA",
    models: [
      { name: "VIOS / YARIS", img: "https://images.unsplash.com/photo-1621503940178-62024220cc33?q=80&w=600&auto=format&fit=crop", price: "1,200.- / 1,800.-", stage: "Standard / Premium", note: "Standard: 1,200.-, Premium: 1,800.-" },
      { name: "ALTIS", img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=600&auto=format&fit=crop", price: "1,400.- / 2,000.-", stage: "Standard / Premium", note: "Standard: 1,400.-, Premium: 2,000.-" },
      { name: "CAMRY", img: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?q=80&w=600&auto=format&fit=crop", price: "1,600.- / 2,400.-", stage: "Standard / Premium", note: "Standard: 1,600.-, Premium: 2,400.-" },
    ]
  },
  {
    brand: "HONDA",
    models: [
      { name: "JAZZ / CITY", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=600&auto=format&fit=crop", price: "1,200.- / 1,800.-", stage: "Standard / Premium", note: "Standard: 1,200.-, Premium: 1,800.-" },
      { name: "CIVIC", img: "https://images.unsplash.com/photo-1605816922336-6c703b44c602?q=80&w=600&auto=format&fit=crop", price: "1,400.- / 2,000.-", stage: "Standard / Premium", note: "Standard: 1,400.-, Premium: 2,000.-" },
    ]
  }
];

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop', title: 'STEP 1 Treatment', desc: 'ทำความสะอาดเครื่องยนต์ภายใน' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04', title: 'Engine Protection', desc: 'ป้องกันการสึกหรอ' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'ขั้นตอนการใช้ STEP 1', desc: 'วิธีการใช้งาน' }
];

function Step1({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Flatten all models for ServiceCatalog
  const allServicePackages = useMemo(() => {
    return pricingData.flatMap(brandGroup => brandGroup.models.map(model => ({ ...model, brand: brandGroup.brand })));
  }, []);

  const handleOpenPopup = (item) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/product/step1';
  const title = 'STEP 1 — ผลิตภัณฑ์ดูแลพื้นฐาน';
  const description = 'STEP 1 ชุดผลิตภัณฑ์ดูแลพื้นฐานสำหรับรถยนต์และบริการบำรุงรักษา';
  const mainImage = heroImage;

  // For SEO price range
  const prices = allServicePackages.map(p => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter(Boolean);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'STEP 1',
      'description': description,
      'image': mainImage,
      'brand': { '@type': 'Brand', 'name': 'STEP 1' },
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
          title="STEP 1" 
          subtitle="BASIC CAR CARE PRODUCTS" 
        />

        <PriceSelector pricingData={pricingData} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'GT7', sub: 'Premium Products', path: '/services/product/gt7' },
                { label: 'Nano Coating', sub: 'Paint Protection', path: '/services/product/nano' },
                { label: 'M-MAX', sub: 'Engine Care', path: '/services/product/mmax' },
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

export default Step1;