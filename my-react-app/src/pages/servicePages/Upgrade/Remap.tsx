import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
import api from '../../../utils/api';
import type { ServicePricingGroup, ServiceModel, ReviewItem } from '@/types';
// ==================================================================================
// Data for Remap service (ตัวอย่างข้อมูลราคาสำหรับหน้า Remap)
// ==================================================================================

// ================== DATA: Remap Pricing (Dynamic) ==================

const reviewItems: ReviewItem[] = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1000&auto=format&fit=crop', title: 'Before/After Dyno', desc: 'ผลทดสอบก่อนและหลังการรีแมพ' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'Remap Process', desc: 'ตัวอย่างขั้นตอนการรีแมพ ECU' }
];

const faqItems = [
  { question: 'การรีแมพคืออะไร?', answer: 'การปรับจูนกล่องควบคุมเครื่องยนต์ (ECU) เพื่อเพิ่มสมรรถนะและการตอบสนองของเครื่องยนต์ โดยปรับค่าการจ่ายเชื้อเพลิง ไทมิ่ง และแรงบิดตามความต้องการ.' },
  { question: 'การรีแมพปลอดภัยหรือไม่?', answer: 'เมื่อดำเนินการโดยช่างที่มีประสบการณ์และทดสอบอย่างเหมาะสม การรีแมพปลอดภัย แต่ควรเลือกการตั้งค่าที่เหมาะสมกับเครื่องยนต์และการใช้งาน.' },
  { question: 'ต้องใช้เวลานานเท่าไร?', answer: 'ทั่วไปการรีแมพใช้เวลา 1-3 ชั่วโมง ขึ้นอยู่กับขั้นตอนการทดสอบและการปรับจูนบนไดโน.' }
];

// ==================================================================================
// Reusable className constants
// ==================================================================================

// .relatedTitle (white context — used outside .catalogSection)
const relatedTitleCls = 'text-center text-[2rem] mb-10 uppercase tracking-[2px]';
// .relatedTitle inside .catalogSection (override: black, no shadow, bold) -> "PRICE LIST"
const catalogTitleCls = 'text-center text-[2rem] mb-10 uppercase tracking-[2px] text-black [text-shadow:none] font-extrabold';
// .pageBtn
const pageBtnCls = 'w-10 h-10 border border-[#ddd] bg-white text-[#333] cursor-pointer transition-all duration-300 rounded-full font-semibold hover:border-[#333] hover:bg-[#f0f0f0]';
// .activePageBtn (also keeps activePageBtn:hover override)
const activePageBtnCls = 'bg-[#ffc709] text-black border-[#ffc709] font-bold hover:bg-[#e0b000]';

// ==================================================================================
// Subcomponents (ย้ายโครงสร้างจาก PipeClean มาใช้กับ Remap)
// ==================================================================================

const HeroSection = ({ bgImage }: { bgImage: string }) => (
  <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[200px] after:bg-[linear-gradient(to_top,#0a0a0a,transparent)] after:z-[1] max-md:h-[70vh]">
    <div className="w-full h-full flex flex-col items-center justify-center bg-center bg-cover bg-fixed" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="text-center z-[2] mb-20 animate-zoom-in">
        <h1 className="text-[4rem] font-extrabold m-0 uppercase text-white [text-shadow:0_0_20px_rgba(255,199,9,0.3)] tracking-[2px] leading-none max-md:text-[2.5rem]">REMAP <span className="text-[#ffc709] italic pr-2.5">TUNING</span></h1>
        <div className="mt-5 text-[1.2rem] text-white/80 font-light bg-black/50 inline-block px-[30px] py-2.5 rounded-[50px] border border-white/20 backdrop-blur-[5px]">
          ปรับจูนกล่อง ECU เพื่อเพิ่มสมรรถนะและการตอบสนองของเครื่องยนต์
        </div>
      </div>
    </div>
  </section>
);

const PriceSelector = ({ pricingData }: { pricingData: ServicePricingGroup[] }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [resultData, setResultData] = useState<ServiceModel | null>(null);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedBrand(e.target.value); setSelectedModel(''); setResultData(null); };
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelName = e.target.value;
    setSelectedModel(modelName);
    if (selectedBrand && modelName) {
      const brandData = pricingData.find((b: ServicePricingGroup) => b.brand === selectedBrand);
      const modelData = brandData?.models.find((m: ServiceModel) => m.name === modelName);
      setResultData(modelData ?? null);
    }
  };

  const availableModels = selectedBrand ? pricingData.find((b: ServicePricingGroup) => b.brand === selectedBrand)?.models || [] : [];

  return (
    <section className="relative z-10 -mt-[100px] px-5 max-md:-mt-[60px]">
      <div className="bg-[rgba(20,20,20,0.85)] backdrop-blur-[15px] [-webkit-backdrop-filter:blur(15px)] p-10 rounded-[20px] border border-[rgba(255,199,9,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-[900px] mx-auto">
        <div className="grid grid-cols-2 gap-[30px] items-end max-md:grid-cols-1">
          <div>
            <label className="text-[#ffc709] text-[0.9rem] uppercase tracking-[1px] mb-2.5 block font-semibold">BRAND</label>
            <select className="w-full px-5 py-[15px] bg-black text-white border border-[#333] rounded-lg text-[1.1rem] cursor-pointer transition-all duration-300 outline-none focus:border-[#ffc709] focus:shadow-[0_0_15px_rgba(255,199,9,0.2)]" value={selectedBrand} onChange={handleBrandChange}>
              <option value="">เลือกยี่ห้อรถ...</option>
              {pricingData.map((b: ServicePricingGroup, idx: number) => <option key={idx} value={b.brand}>{b.brand}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#ffc709] text-[0.9rem] uppercase tracking-[1px] mb-2.5 block font-semibold">MODEL</label>
            <select className="w-full px-5 py-[15px] bg-black text-white border border-[#333] rounded-lg text-[1.1rem] cursor-pointer transition-all duration-300 outline-none focus:border-[#ffc709] focus:shadow-[0_0_15px_rgba(255,199,9,0.2)]" value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand}>
              <option value="">เลือกรุ่น...</option>
              {availableModels.map((m: ServiceModel, idx: number) => <option key={idx} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {resultData && (
          <div className="mt-[30px] bg-[linear-gradient(135deg,#1a1a1a,#000)] border-l-[5px] border-[#ffc709] rounded-lg overflow-hidden animate-slide-down-20">
            <div className="bg-[#ffc709] text-black px-5 py-2.5 font-black uppercase">{selectedBrand} {resultData.name}</div>
            <div className="p-5">
              <div className="flex justify-between items-center border-b border-[#333] pb-[15px] mb-[15px]"><span>ค่าบริการรีแมพ</span><span className="text-[2rem] text-[#ffc709] font-bold [text-shadow:0_0_10px_rgba(255,199,9,0.4)]">{resultData.price}</span></div>
              <div style={{color:'#888', fontSize:'0.9rem', lineHeight: '1.6'}}>Stage: <span style={{color:'#fff'}}>{resultData.stage as React.ReactNode}</span></div>
              {resultData.note && <div style={{marginTop: '15px', color: '#ffc709', fontSize:'0.8rem'}}>* {resultData.note}</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ServiceCatalog = ({ allPackages, onOpenModal }: { allPackages: ServiceModel[]; onOpenModal: (item: ServiceModel) => void }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allPackages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allPackages.length / itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <section className="py-20 px-5 bg-[#f4f4f4] text-[#333]" id="catalog-start">
      <h2 className={catalogTitleCls}>PRICE LIST</h2>
      <div className="container">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[35px] gap-y-20 mb-[100px]">
          {currentItems.map((item: ServiceModel, idx: number) => {
            const idList = ['1492144534655-ae79c964c9d7','1550355291-bbee04a92027','1503376780353-7e6692767b70'];
            const imgBase = `https://images.unsplash.com/photo-${idList[idx % idList.length]}`;
            const imgSmall = `${imgBase}?w=400&h=300&fit=crop&q=80`;
            const imgLarge = `${imgBase}?w=800&h=600&fit=crop&q=80`;
            return (
              <div key={idx} className="group bg-white border border-[#e0e0e0] rounded-2xl overflow-hidden relative transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)] flex flex-col h-full cursor-pointer hover:border-[#ffc709] hover:-translate-y-[5px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]" onClick={() => onOpenModal(item)}>
                <div className="relative w-full h-[200px] overflow-hidden">
                  <img src={imgSmall} srcSet={`${imgLarge} 800w, ${imgSmall} 400w`} sizes="(max-width: 600px) 400px, 800px" alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async" width="400" height="300" />
                  <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"><span className="bg-[#ffc709] text-black px-[25px] py-2.5 rounded-[25px] font-bold uppercase text-[0.9rem]">ดูรายละเอียด</span></div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[0.8rem] text-black bg-[#ffc709] px-3 py-1 rounded-[20px] uppercase tracking-[1px] font-bold inline-block border-none flex-shrink-0 mb-2.5">{item.brand}</span>
                  <h4 className="text-[1.3rem] my-2.5 text-black font-extrabold leading-[1.2] flex-grow">{item.name}</h4>
                  <div className="flex justify-between items-center mt-auto pt-[15px] border-t border-dashed border-[#ddd]"><span style={{color:'#888'}} className="!text-[#666] !text-[0.9rem]">ราคาเริ่มต้น</span><span className="text-[1.8rem] text-[#d32f2f] font-extrabold">{item.price}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-[50px] flex justify-center gap-2">
             <button className={pageBtnCls} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num: number) => (
              <button key={num} className={`${pageBtnCls} ${currentPage === num ? activePageBtnCls : ''}`} onClick={() => handlePageChange(num)}>{num}</button>
            ))}
             <button className={pageBtnCls} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        )}
      </div>
    </section>
  );
};

const ReviewGallery = () => (
  <section className="py-20 px-5 bg-[#111] container">
    <div className="text-center mb-[50px]">
      <h2 className="text-[2.2rem] font-bold text-white mb-2.5" style={{color: '#fff'}}>GALLERY & REVIEW</h2>
      <div className="w-20 h-1 bg-[#ffc709] mx-auto rounded-sm"></div>
    </div>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 mt-10">
      {reviewItems.map((item, idx) => (
        <div key={idx} className="group bg-[#111] border border-[#333]">
          <div className="h-[220px] overflow-hidden">
            {item.type === 'video' ? (
              <iframe width="100%" height="250" src={`https://www.youtube.com/embed/${item.videoId}`} title={item.title} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <img src={item.src} alt={item.title} loading="lazy" decoding="async" width="1000" height="600" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            )}
          </div>
          <div className="p-5"><h4 className="text-white m-0 mb-[5px]">{item.title}</h4><p className="text-[#777] text-[0.9rem]">{item.desc}</p></div>
        </div>
      ))}
    </div>
  </section>
);

const ServiceModal = ({ isOpen, data, onClose }: { isOpen: boolean; data: ServiceModel | null; onClose: () => void }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-[9999] animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto relative animate-slide-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <span className="absolute top-5 right-5 text-[2rem] text-[#666] cursor-pointer leading-none transition-colors duration-200 z-[1] hover:text-black" onClick={onClose}>&times;</span>
        <div className="px-[30px] pt-[30px] pb-5 border-b-2 border-[#f0f0f0]"><span className="inline-block bg-[#ffc709] text-black px-4 py-1.5 rounded-[20px] text-[0.85rem] font-bold uppercase tracking-[1px] mb-[15px]">{data.brand}</span><h3 className="text-[1.8rem] font-extrabold text-black m-0">{data.name}</h3></div>
        <div className="p-[30px]">
          <div className="flex justify-between items-center mb-5"><label className="text-[1rem] text-[#666] font-semibold">ค่าบริการรีแมพ</label><span className="text-[2rem] text-[#d32f2f] font-extrabold">{data.price}</span></div>
          <div className="h-px bg-[#e0e0e0] my-[25px]"></div>
          <div><h4 className="text-[1.2rem] text-black mt-0 mb-[15px] font-bold">รายละเอียด</h4><div className="flex justify-between items-center py-3 border-b border-dashed border-[#e0e0e0]"><span className="text-[#333]">Stage</span><span className="font-bold text-black text-[1.1rem]">{data.stage as React.ReactNode}</span></div></div>
          {data.note && <div className="mt-5 p-[15px] bg-[#fff9e6] border-l-4 border-[#ffc709] rounded text-[0.9rem] text-[#666]"><strong className="text-black">หมายเหตุ:</strong> {data.note}</div>}
        </div>
        <div className="px-[30px] py-5 border-t-2 border-[#f0f0f0] flex justify-center"><button className="bg-[#333] text-white px-10 py-3 border-none rounded-[25px] font-bold text-[1rem] cursor-pointer transition-all duration-300 uppercase hover:bg-[#ffc709] hover:text-black hover:shadow-[0_5px_15px_rgba(255,199,9,0.4)]" onClick={onClose}>ปิดหน้าต่าง</button></div>
      </div>
    </div>
  );
};

function Remap({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ServiceModel | null>(null);

  const { data: dbData = [], isLoading: loadingPricing, isError: errorPricing } = useQuery({
    queryKey: ['service-pricing', 'remap'],
    queryFn: async () => {
      const res = await api.apiGet<ServicePricingGroup[]>('/api/services/remap/pricing');
      return Array.isArray(res) ? res : [];
    },
  });

  // แปลงข้อมูลให้เหมาะกับ UI เดิม
  const pricingData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];
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

  const handleOpenPopup = (item: ServiceModel) => { setModalData(item); setShowModal(true); };

  const heroImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop';

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://front.gt7dev.com/services/remap';
  const title = 'REMAP Tuning — GT7 Motor';
  const description = 'ปรับจูนกล่อง ECU (Remap) เพื่อเพิ่มสมรรถนะ การตอบสนองของเครื่องยนต์ และประหยัดน้ำมัน ให้เหมาะกับการใช้งานจริง.';
  const mainImage = heroImage;

  const prices = allServicePackages.map((p: ServiceModel) => {
    const digits = String(p.price || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : null;
  }).filter((n: number | null): n is number => n !== null);

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
    'mainEntity': faqItems.map((f) => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } }))
  };

  const jsonLdArray = [serviceLd, localBusinessLd, faqLd];

  if (loadingPricing) return <div className="bg-[#0a0a0a] text-white min-h-screen"><Header onLogout={onLogout} /><main className="pb-[60px]"><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className="bg-[#0a0a0a] text-white min-h-screen"><Header onLogout={onLogout} /><main className="pb-[60px]"><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>ไม่สามารถโหลดข้อมูลราคาได้</h2></div></main><Footer /></div>;

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
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
      <main className="pb-[60px]">
        <HeroSection bgImage={heroImage} />
        <PriceSelector pricingData={pricingData} />

        <section className="py-20 bg-[#0a0a0a]">
          <div className="container">
             <h3 className={relatedTitleCls}>OTHER SERVICES</h3>
             <div className="flex justify-center gap-5 flex-wrap">
              {[{ label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },{ label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },{ label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },].map((item, i) => (
                <div key={i} className="group w-[280px] h-[180px] bg-[#111] border border-[#333] flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-[0.4s] [transform:skewX(-10deg)] rounded-[10px] hover:bg-[#ffc709] hover:border-[#ffc709] hover:[transform:skewX(-10deg)_translateY(-10px)] hover:shadow-[0_10px_30px_rgba(255,199,9,0.2)] max-md:transform-none max-md:w-full max-md:h-[120px]" onClick={() => go(item.path)}>
                  <div className="[transform:skewX(10deg)] text-center z-[2] max-md:transform-none"><h3 className="text-white text-[1.5rem] m-0 font-extrabold uppercase group-hover:text-black">{item.label}</h3><p className="text-[#888] mt-[5px] mb-0 group-hover:text-black">{item.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServiceCatalog allPackages={allServicePackages} onOpenModal={handleOpenPopup} />
        <ReviewGallery />

        <section className="container" style={{padding:'40px 20px'}}>
           <div style={{textAlign: 'center'}}>
             <h3 className={relatedTitleCls}>OUR LOCATION</h3>
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
