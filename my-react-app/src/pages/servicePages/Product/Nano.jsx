
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

// ================== DATA: NANO COATING ==================
const pricingData = [
  {
    brand: "TOYOTA",
    models: [
      { name: "VIOS / YARIS", img: "https://images.unsplash.com/photo-1621503940178-62024220cc33?q=80&w=600&auto=format&fit=crop", price: "3,500.- / 5,500.-", stage: "Standard / Premium", note: "Standard: 3,500.-, Premium: 5,500.-" },
      { name: "ALTIS", img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=600&auto=format&fit=crop", price: "3,800.- / 6,000.-", stage: "Standard / Premium", note: "Standard: 3,800.-, Premium: 6,000.-" },
      { name: "CAMRY", img: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?q=80&w=600&auto=format&fit=crop", price: "4,500.- / 7,000.-", stage: "Standard / Premium", note: "รถขนาดใหญ่, Standard: 4,500.-, Premium: 7,000.-" },
    ]
  },
  {
    brand: "HONDA",
    models: [
      { name: "JAZZ / CITY", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?q=80&w=600&auto=format&fit=crop", price: "3,500.- / 5,500.-", stage: "Standard / Premium", note: "Standard: 3,500.-, Premium: 5,500.-" },
      { name: "CIVIC", img: "https://images.unsplash.com/photo-1605816922336-6c703b44c602?q=80&w=600&auto=format&fit=crop", price: "3,800.- / 6,000.-", stage: "Standard / Premium", note: "Standard: 3,800.-, Premium: 6,000.-" },
    ]
  }
];

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop', title: 'Nano Coating', desc: 'ฟิล์มเคลือบสีรถ' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04', title: 'Paint Protection', desc: 'ป้องกันรอยขีดข่วน' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'Nano Application', desc: 'ขั้นตอนการเคลือบ' }
];

function Nano({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Flatten all models for ServiceCatalog
  const allServicePackages = useMemo(() => {
    return pricingData.flatMap(brandGroup => brandGroup.models.map(model => ({ ...model, brand: brandGroup.brand })));
  }, []);

  const handleOpenPopup = (item) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/product/nano';
  const title = 'Nano Coating — เคลือบสีรถยนต์';
  const description = 'บริการเคลือบสีรถยนต์ด้วยเทคโนโลยีนาโน ปกป้องสีรถและเพิ่มความเงางาม';
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
      'name': 'Nano Coating',
      'description': description,
      'image': mainImage,
      'brand': { '@type': 'Brand', 'name': 'Nano' },
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
          title="NANO COATING" 
          subtitle="PAINT PROTECTION" 
        />

        <PriceSelector pricingData={pricingData} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'GT7', sub: 'Premium Products', path: '/services/product/gt7' },
                { label: 'STEP 1', sub: 'Engine Treatment', path: '/services/product/step1' },
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

export default Nano;
