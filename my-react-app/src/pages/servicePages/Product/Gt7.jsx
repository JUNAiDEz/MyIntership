import React, { useState, useMemo } from 'react';
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

// ================== DATA: GT7 ==================
const pricingData = [
  {
    brand: 'LUBRICANTS (หล่อลื่น)',
    models: [
      { name: 'GT7 Multi-Purpose Spray', price: '150.-', size: '400 ml', stage: 'Standard', note: 'สเปรย์เอนกประสงค์ หล่อลื่น ไล่ความชื้น กัดสนิม', img: 'https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 White Lithium Grease', price: '250.-', size: '300 ml', stage: 'Standard', note: 'จารบีขาว ทนความร้อนสูง สำหรับงานหนัก', img: 'https://images.unsplash.com/photo-1615900119312-2bc24f772549?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Chain Lube', price: '350.-', size: '400 ml', stage: 'Standard', note: 'สเปรย์หล่อลื่นโซ่ ไม่ดีดกระเด็น', img: 'https://images.unsplash.com/photo-1589305971279-00f0422f3e29?q=80&w=600&auto=format&fit=crop' },
    ]
  },
  {
    brand: 'CLEANERS (ทำความสะอาด)',
    models: [
      { name: 'GT7 Brake Cleaner', price: '200.-', size: '500 ml', stage: 'Standard', note: 'สเปรย์ล้างเบรค แห้งไว ไม่ทิ้งคราบ', img: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Contact Cleaner', price: '220.-', size: '300 ml', stage: 'Standard', note: 'ล้างหน้าสัมผัสไฟฟ้า แผงวงจร', img: 'https://images.unsplash.com/photo-1592853625511-ad0ed28cb151?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Throttle Body Cleaner', price: '280.-', size: '400 ml', stage: 'Standard', note: 'ล้างปีกผีเสื้อ ขจัดคราบเขม่า', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop' },
    ]
  },
  {
    brand: 'ADDITIVES (สารบำรุง)',
    models: [
      { name: 'GT7 Engine Flush', price: '350.-', size: '300 ml', stage: 'Standard', note: 'ชะล้างคราบตะกอนในเครื่องยนต์ก่อนเปลี่ยนถ่าย', img: 'https://images.unsplash.com/photo-1498887960847-2a5e46312788?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Injector Cleaner', price: '300.-', size: '250 ml', stage: 'Standard', note: 'ล้างหัวฉีด เพิ่มอัตราเร่ง ประหยัดน้ำมัน', img: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Oil Treatment', price: '450.-', size: '300 ml', stage: 'Standard', note: 'สารเคลือบเครื่องยนต์ ลดการสึกหรอ', img: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=600&auto=format&fit=crop' },
    ]
  },
  {
    brand: 'COOLING (ระบบหล่อเย็น)',
    models: [
      { name: 'GT7 Long Life Coolant (Green)', price: '450.-', size: '4 Liters', stage: 'Standard', note: 'น้ำยาหล่อเย็นสูตรเข้มข้น สีเขียว', img: 'https://images.unsplash.com/photo-1605218413431-d793a0e52751?q=80&w=600&auto=format&fit=crop' },
      { name: 'GT7 Long Life Coolant (Pink)', price: '450.-', size: '4 Liters', stage: 'Standard', note: 'น้ำยาหล่อเย็นสูตรเข้มข้น สีชมพู', img: 'https://images.unsplash.com/photo-1605218413431-d793a0e52751?q=80&w=600&auto=format&fit=crop' },
    ]
  }
];

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?q=80&w=1000&auto=format&fit=crop', title: 'GT7 Spray ใช้งานได้จริง', desc: 'แก้ปัญหาสนิมเกาะน็อตล้อ ขันออกง่ายขึ้นทันที' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1000&auto=format&fit=crop', title: 'ล้างเบรคสะอาดหมดจด', desc: 'ขจัดคราบฝุ่นผ้าเบรคและน้ำมัน โดยไม่ทำลายลูกยาง' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'สาธิตการใช้ Engine Flush', desc: 'วิธีการล้างภายในเครื่องยนต์ด้วย GT7 Engine Flush' }
];

const faqItems = [
  { question: 'GT7 คืออะไร?', answer: 'ผลิตภัณฑ์ดูแลรักษารถยนต์คุณภาพสูง ครอบคลุมทั้งหล่อลื่น ทำความสะอาด สารบำรุง และระบบหล่อเย็น' },
  { question: 'เหมาะกับรถประเภทใด?', answer: 'เหมาะกับรถยนต์ทุกประเภทที่ต้องการดูแลรักษาและเพิ่มประสิทธิภาพ' },
  { question: 'ปลอดภัยหรือไม่?', answer: 'ผลิตจากวัตถุดิบคุณภาพสูง ปลอดภัยต่อผู้ใช้และสิ่งแวดล้อม' }
];

function Gt7({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const allServicePackages = useMemo(() => {
    return pricingData.flatMap(brandGroup => brandGroup.models.map(model => ({ ...model, brand: brandGroup.brand })));
  }, []);

  const handleOpenPopup = (item) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1635773173748-0387b320d755?q=80&w=1600&auto=format&fit=crop';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/gt7-products';
  const title = 'GT7 Products — Car Care Solution';
  const description = 'ผลิตภัณฑ์ดูแลรักษารถยนต์ GT7 Motor ทั้งน้ำมันหล่อลื่น สารทำความสะอาด และสารบำรุงเครื่องยนต์';
  const mainImage = heroImage;
  
  const prices = allServicePackages.map(p => { 
    const digits = String(p.price || '').replace(/[^0-9]/g, ''); 
    return digits ? Number(digits) : null; 
  }).filter(Boolean);
  const lowPrice = prices.length ? Math.min(...prices) : null;

  const jsonLdArray = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'GT7 Car Care Products',
      'description': description,
      'image': mainImage,
      'brand': { '@type': 'Brand', 'name': 'GT7 Motor' },
      'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'THB', 'lowPrice': lowPrice, 'url': pageUrl }
    }
  ];

  return (
    // 👇 2. ใช้ class .pageContainer แทน .gt7Page
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
          title="GT7" 
          subtitle="HIGH PERFORMANCE CAR CARE PRODUCTS" 
        />

        <PriceSelector pricingData={pricingData} />

        {/* ส่วนนี้ยังคงเรียกใช้ styles.relatedServices จากไฟล์กลางได้ เพราะเรา copy CSS ไปใส่ไว้แล้ว */}
        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[
                { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
                { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
                { label: 'REMAP', sub: 'จูนกล่อง ECU', path: '/services/remap' },
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

export default Gt7;