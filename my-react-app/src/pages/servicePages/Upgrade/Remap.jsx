import React, { useState, useMemo, useEffect } from 'react';
import styles from './Remap.module.css';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
import api from '../../../utils/api';
// ==================================================================================
// Data for Remap service (ตัวอย่างข้อมูลราคาสำหรับหน้า Remap)
// ==================================================================================

// ================== DATA: Remap Pricing (Dynamic) ==================

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1000&auto=format&fit=crop', title: 'Before/After Dyno', desc: 'ผลทดสอบก่อนและหลังการรีแมพ' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'Remap Process', desc: 'ตัวอย่างขั้นตอนการรีแมพ ECU' }
];

const faqItems = [
  { question: 'การรีแมพคืออะไร?', answer: 'การปรับจูนกล่องควบคุมเครื่องยนต์ (ECU) เพื่อเพิ่มสมรรถนะและการตอบสนองของเครื่องยนต์ โดยปรับค่าการจ่ายเชื้อเพลิง ไทมิ่ง และแรงบิดตามความต้องการ.' },
  { question: 'การรีแมพปลอดภัยหรือไม่?', answer: 'เมื่อดำเนินการโดยช่างที่มีประสบการณ์และทดสอบอย่างเหมาะสม การรีแมพปลอดภัย แต่ควรเลือกการตั้งค่าที่เหมาะสมกับเครื่องยนต์และการใช้งาน.' },
  { question: 'ต้องใช้เวลานานเท่าไร?', answer: 'ทั่วไปการรีแมพใช้เวลา 1-3 ชั่วโมง ขึ้นอยู่กับขั้นตอนการทดสอบและการปรับจูนบนไดโน.' }
];

// ==================================================================================
// Subcomponents (ย้ายโครงสร้างจาก PipeClean มาใช้กับ Remap)
// ==================================================================================

const HeroSection = ({ bgImage }) => (
  <section className={styles.heroSection}>
    <div className={styles.heroMainBanner} style={{ backgroundImage: `url(${bgImage})` }}>
      <div className={styles.heroOverlayContent}>
        <h1 className={styles.heroTitle}>REMAP <span className={styles.highlightText}>TUNING</span></h1>
        <div className={styles.heroDescription}>
          ปรับจูนกล่อง ECU เพื่อเพิ่มสมรรถนะและการตอบสนองของเครื่องยนต์
        </div>
      </div>
    </div>
  </section>
);

const PriceSelector = ({ pricingData }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [resultData, setResultData] = useState(null);

  const handleBrandChange = (e) => { setSelectedBrand(e.target.value); setSelectedModel(''); setResultData(null); };
  const handleModelChange = (e) => {
    const modelName = e.target.value;
    setSelectedModel(modelName);
    if (selectedBrand && modelName) {
      const brandData = pricingData.find(b => b.brand === selectedBrand);
      const modelData = brandData?.models.find(m => m.name === modelName);
      setResultData(modelData);
    }
  };

  const availableModels = selectedBrand ? pricingData.find(b => b.brand === selectedBrand)?.models || [] : [];

  return (
    <section className={styles.selectorSection}>
      <div className={styles.selectorContainer}>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>BRAND</label>
            <select className={styles.customSelect} value={selectedBrand} onChange={handleBrandChange}>
              <option value="">เลือกยี่ห้อรถ...</option>
              {pricingData.map((b, idx) => <option key={idx} value={b.brand}>{b.brand}</option>)}
            </select>
          </div>
          <div>
            <label className={styles.label}>MODEL</label>
            <select className={styles.customSelect} value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand}>
              <option value="">เลือกรุ่น...</option>
              {availableModels.map((m, idx) => <option key={idx} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {resultData && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>{selectedBrand} {resultData.name}</div>
            <div className={styles.resultBody}>
              <div className={styles.priceItem}><span>ค่าบริการรีแมพ</span><span className={styles.priceValue}>{resultData.price}</span></div>
              <div style={{color:'#888', fontSize:'0.9rem', lineHeight: '1.6'}}>Stage: <span style={{color:'#fff'}}>{resultData.stage}</span></div>
              {resultData.note && <div style={{marginTop: '15px', color: '#ffc709', fontSize:'0.8rem'}}>* {resultData.note}</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ServiceCatalog = ({ allPackages, onOpenModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allPackages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allPackages.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <section className={styles.catalogSection} id="catalog-start">
      <h2 className={styles.relatedTitle}>PRICE LIST</h2>
      <div className="container">
        <div className={styles.catalogGrid}>
          {currentItems.map((item, idx) => {
            const idList = ['1492144534655-ae79c964c9d7','1550355291-bbee04a92027','1503376780353-7e6692767b70'];
            const imgBase = `https://images.unsplash.com/photo-${idList[idx % idList.length]}`;
            const imgSmall = `${imgBase}?w=400&h=300&fit=crop&q=80`;
            const imgLarge = `${imgBase}?w=800&h=600&fit=crop&q=80`;
            return (
              <div key={idx} className={styles.servicePackageCard} onClick={() => onOpenModal(item)}>
                <div className={styles.cardImageWrapper}>
                  <img src={imgSmall} srcSet={`${imgLarge} 800w, ${imgSmall} 400w`} sizes="(max-width: 600px) 400px, 800px" alt={item.name} className={styles.cardImg} loading="lazy" decoding="async" width="400" height="300" />
                  <div className={styles.cardOverlay}><span className={styles.viewBtn}>ดูรายละเอียด</span></div>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.pkgBrand}>{item.brand}</span>
                  <h4 className={styles.pkgModel}>{item.name}</h4>
                  <div className={styles.pkgPriceRow}><span style={{color:'#888'}}>ราคาเริ่มต้น</span><span className={styles.pkgMainPrice}>{item.price}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
             <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button key={num} className={`${styles.pageBtn} ${currentPage === num ? styles.activePageBtn : ''}`} onClick={() => handlePageChange(num)}>{num}</button>
            ))}
             <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        )}
      </div>
    </section>
  );
};

const ReviewGallery = () => (
  <section className={`${styles.reviewSection} container`}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle} style={{color: '#fff'}}>GALLERY & REVIEW</h2>
      <div className={styles.titleUnderline}></div>
    </div>
    <div className={styles.reviewGrid}>
      {reviewItems.map((item, idx) => (
        <div key={idx} className={styles.reviewCard}>
          <div className={styles.reviewMedia}>
            {item.type === 'video' ? (
              <iframe width="100%" height="250" src={`https://www.youtube.com/embed/${item.videoId}`} title={item.title} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <img src={item.src} alt={item.title} loading="lazy" decoding="async" width="1000" height="600" />
            )}
          </div>
          <div className={styles.reviewContent}><h4>{item.title}</h4><p>{item.desc}</p></div>
        </div>
      ))}
    </div>
  </section>
);

const ServiceModal = ({ isOpen, data, onClose }) => {
  if (!isOpen || !data) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.closeBtn} onClick={onClose}>&times;</span>
        <div className={styles.modalHeader}><span className={styles.modalBrand}>{data.brand}</span><h3>{data.name}</h3></div>
        <div className={styles.modalBody}>
          <div className={styles.modalPriceItem}><label>ค่าบริการรีแมพ</label><span className={styles.modalMainPrice}>{data.price}</span></div>
          <div className={styles.modalDivider}></div>
          <div className={styles.modalOptionGroup}><h4>รายละเอียด</h4><div className={styles.modalRow}><span>Stage</span><span className={styles.val}>{data.stage}</span></div></div>
          {data.note && <div className={styles.modalNote}><strong>หมายเหตุ:</strong> {data.note}</div>}
        </div>
        <div className={styles.modalFooter}><button className={styles.btnCloseModal} onClick={onClose}>ปิดหน้าต่าง</button></div>
      </div>
    </div>
  );
};

function Remap({ onLogout }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [dbData, setDbData] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [errorPricing, setErrorPricing] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        const res = await api.apiGet('/api/services/remap/pricing');
        setDbData(res || []);
      } catch (err) {
        setErrorPricing('ไม่สามารถโหลดข้อมูลราคาได้');
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];
    return dbData.map(brandGroup => ({
      brand: brandGroup.brand,
      models: (brandGroup.models || []).map(model => ({ ...model }))
    }));
  }, [dbData]);

  const allServicePackages = useMemo(() => {
    return pricingData.flatMap(brandGroup =>
      brandGroup.models.map(model => ({
        ...model,
        brand: brandGroup.brand,
        image_url: model.image_url || model.img || ''
      }))
    );
  }, [pricingData]);

  const handleOpenPopup = (item) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop';

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/remap';
  const title = 'REMAP Tuning — GT7 Motor';
  const description = 'ปรับจูนกล่อง ECU (Remap) เพื่อเพิ่มสมรรถนะ การตอบสนองของเครื่องยนต์ และประหยัดน้ำมัน ให้เหมาะกับการใช้งานจริง.';
  const mainImage = heroImage;

  const prices = allServicePackages.map(p => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter(Boolean);

  const lowPrice = prices.length ? Math.min(...prices) : null;

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Remap / ECU Tuning',
    'description': description,
    'serviceType': 'ECU Remap',
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
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Bangkok',
      'addressLocality': 'Bangkok',
      'addressCountry': 'TH'
    },
    'geo': { '@type': 'GeoCoordinates', 'latitude': 13.736717, 'longitude': 100.523186 },
    'openingHours': ['Mo-Fr 09:00-18:00', 'Sa 09:00-14:00']
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(f => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } }))
  };

  const jsonLdArray = [serviceLd, localBusinessLd, faqLd];

  if (loadingPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>{errorPricing}</h2></div></main><Footer /></div>;

  return (
    <div className={styles.pipeCleanPage}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={mainImage} />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="900" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={mainImage} />

        <link rel="preload" as="image" href={mainImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLdArray)}</script>
      </Helmet>
      <Header onLogout={onLogout} />
      <main className={styles.mainContent}>
        <HeroSection bgImage={heroImage} />
        <PriceSelector pricingData={pricingData} />

        <section className={styles.relatedServices}>
          <div className="container">
             <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
             <div className={styles.heroThumbnails}>
              {[{ label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },{ label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },{ label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },].map((item, i) => (
                <div key={i} className={styles.thumbnailCard} onClick={() => go(item.path)}>
                  <div className={styles.thumbnailText}><h3>{item.label}</h3><p>{item.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServiceCatalog allPackages={allServicePackages} onOpenModal={handleOpenPopup} />
        <ReviewGallery />

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

export default Remap;