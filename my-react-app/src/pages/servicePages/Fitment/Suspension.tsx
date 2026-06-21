import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from '../../../components/ServicePage/ServicePageLayout.module.css';
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
import type { ServicePricingGroup, ServiceModel, ReviewItem } from '@/types';

// pricingData will be fetched from API

// ข้อมูลรีวิว
const reviewItems: ReviewItem[] = [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?q=80&w=1000&auto=format&fit=crop',
      title: 'จัดทรงกระบะซิ่ง',
      desc: 'โหลดหน้า 2 หลัง 4 ทรงสวย ขับขี่มั่นใจ'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
      title: 'ยกสูง Off-Road',
      desc: 'ติดตั้งชุดยก 2 นิ้ว พร้อมเปลี่ยนปีกนกปรับองศา'
    },
	{
	  type: 'video',
	  videoId: 'dQw4w9WgXcQ', 
	  title: 'รีวิวการขับขี่หลังจัดทรง',
	  desc: 'ทดสอบสมรรถนะและความนุ่มนวลหลังทำช่วงล่าง'
	}
];

function Suspension({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ServiceModel | null>(null);

  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'suspension'],
    queryFn: async () => {
      const res = await api.apiGet<ServicePricingGroup[]>('/api/services/suspension/pricing');
      return Array.isArray(res) ? res : [];
    },
  });

  // Transform API data to match UI
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

  const handleOpenPopup = (item: ServiceModel) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/fitment/suspension';
  const title = 'Suspension Tuning — โหลดเตี้ย ยกสูง';
  const description = 'บริการโหลดเตี้ย ยกสูง และจัดทรงรถยนต์ ด้วยอะไหล่คุณภาพ ราคามาตรฐาน พร้อมรีวิวจริงจากลูกค้า';
  const mainImage = heroImage;

  const prices = allServicePackages.map((p: ServiceModel) => {
    const digits = String(p.lowering || p.lifting || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter((n: number | null): n is number => n !== null);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Suspension Tuning',
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
          title="SUSPENSION TUNING" 
          subtitle="โหลดเตี้ย ยกสูง และจัดทรงรถยนต์ ให้สวยงามและขับขี่ปลอดภัย" 
        />

        <PriceSelector pricingData={pricingData as React.ComponentProps<typeof PriceSelector>['pricingData']} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER FITMENT SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'Alignment', sub: 'ตั้งศูนย์ล้อ', path: '/services/fitment/alignment' },
                { label: 'Ball Joints', sub: 'ลูกหมากปีกนก', path: '/services/fitment/ball-joints' },
                { label: 'Shock Absorber', sub: 'เปลี่ยนโช๊คอัพ', path: '/services/fitment/shock-absorber' },
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
          onOpenModal={handleOpenPopup as React.ComponentProps<typeof ServiceCatalog>['onOpenModal']}
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

export default Suspension;