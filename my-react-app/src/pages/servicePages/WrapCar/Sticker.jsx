import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from '../../../components/ServicePage/ServicePageLayout.module.css';
import stickerStyles from './Sticker.module.css';
import { useNavigate } from 'react-router-dom';
import api, { API_URL } from '../../../utils/api';

import Header from '../../../components/Layout/Header';
import Footer from '../../../components/Layout/Footer';
import ShopMap from '../../../components/Map/ShopMap';
import HeroSection from '../../../components/ServicePage/HeroSection';
import PriceSelector from '../../../components/ServicePage/PriceSelector';
import ServiceCatalog from '../../../components/ServicePage/ServiceCatalog';
import ReviewGallery from '../../../components/ServicePage/ReviewGallery';
import ServiceModal from '../../../components/ServicePage/ServiceModal';
import CarColorChanger from '../../../components/ServicePage/CarColorChanger';

const STICKER_AREA_OPTIONS = [
  { name: 'รูปหลัก / กระจก', id: 'full' }, 
  { name: 'ประตูรถ', id: 'door' },
  { name: 'แก้มข้าง', id: 'fender' },
  { name: 'ประตูท้ายรถ', id: 'trunk' },
  { name: 'กระโปรงหน้า', id: 'hood' },
  { name: 'หลังคา', id: 'roof' },
];

const reviewItems = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?q=80&w=1000&auto=format&fit=crop', title: 'Before & After ติดสติ๊กเกอร์', desc: 'ผลงานเปลี่ยนสีรถ' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1632823470937-f1e87c487244?q=80&w=1000&auto=format&fit=crop', title: 'Wrap เปลี่ยนสีรอบคัน', desc: 'สีสดใส ทนทาน' },
  { type: 'video', videoId: 'dQw4w9WgXcQ', title: 'ขั้นตอนการติดสติ๊กเกอร์', desc: 'รีวิวขั้นตอนการทำงาน' }
];

function Sticker({ onLogout }) {
  const heroImage = 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?q=80&w=1920&auto=format&fit=crop';
  const title = 'Sticker Car Wrap — เปลี่ยนสีรถด้วยสติ๊กเกอร์เกรดพรีเมียม';
  const description = 'บริการแร๊ปสีรถด้วยสติ๊กเกอร์เกรดพรีเมียม เปลี่ยนลุครถของคุณได้หลากหลายสี ปกป้องสีเดิม ลอกออกได้ ไม่ทิ้งคราบกาว พร้อมทีมช่างมืออาชีพ';

  const navigate = useNavigate();
  const go = (path) => navigate(path);

  const [dbData, setDbData] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [errorPricing, setErrorPricing] = useState(null);

  const [cars, setCars] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0); 
  const [selectedColorId, setSelectedColorId] = useState('original');
  const [selectedArea, setSelectedArea] = useState('full');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        const res = await api.apiGet('/api/services/sticker/pricing');
        setDbData(res || []);
      } catch (err) {
        setErrorPricing('ไม่สามารถโหลดข้อมูลราคาได้');
      } finally {
        setLoadingPricing(false);
      }
    };

    const fetchStickerData = async () => {
      try {
        setLoading(true);
        const [carsRes, colorsRes] = await Promise.all([
          fetch(`${API_URL}/api/stickers/cars`),
          fetch(`${API_URL}/api/stickers/colors`)
        ]);
        
        if (!carsRes.ok || !colorsRes.ok) throw new Error('Failed to fetch data');
        
        const carsData = await carsRes.json();
        const colorsData = await colorsRes.json();
        
        const colorsWithOriginal = [
          { id: 0, name: 'Original', color_id: 'original', color_code: '#cccccc', css_filter: 'none', display_order: -1 },
          ...colorsData
        ];
        
        setCars(carsData);
        setColors(colorsWithOriginal);
      } catch (error) {
        console.error('Error fetching sticker data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
    fetchStickerData();
  }, []);

  const currentCar = cars[activeIndex];

  // --- LOGIC: กรองเฉพาะจุดที่มีรูปภาพใน Database ---
  const availableAreaOptions = useMemo(() => {
    if (!currentCar) return [];
    return STICKER_AREA_OPTIONS.filter(option => {
      if (option.id === 'full') return !!currentCar.base_image;
      
      // เช็คว่ามี Path รูปภาพทั้ง base และ paint ใน column หรือไม่
      const baseKey = `base_${option.id}_image`;
      const paintKey = `paint_${option.id}_image`;
      return currentCar[baseKey] && currentCar[paintKey];
    });
  }, [currentCar]);

  useEffect(() => {
    setSelectedColorId('original');
    
    // ถ้าจุดที่เลือกอยู่ปัจจุบันไม่มีในรถคันใหม่ ให้ดีดกลับไปที่ 'full'
    const isAreaStillAvailable = availableAreaOptions.some(opt => opt.id === selectedArea);
    if (!isAreaStillAvailable) {
      setSelectedArea('full');
    }
  }, [activeIndex, availableAreaOptions, selectedArea]);

  const pricingData = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];
    return dbData.map(brandGroup => ({
      brand: brandGroup.brand,
      models: (brandGroup.models || []).map(model => ({
        ...model,
        price: [
          model.mirror && `กระจกมองข้าง: ${model.mirror}`,
          model.door && `ประตูรถ: ${model.door}`,
          model.fender && `แก้มข้าง: ${model.fender}`,
          model.trunk && `ประตูท้ายรถ: ${model.trunk}`,
          model.hood && `กระโปรงหน้า: ${model.hood}`,
          model.roof && `หลังคา: ${model.roof}`
        ].filter(Boolean).join(' / ')
      }))
    }));
  }, [dbData]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % cars.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + cars.length) % cars.length);

  const getColorFilter = () => {
    const colorObj = colors.find(c => c.color_id === selectedColorId);
    return (colorObj && colorObj.css_filter) ? colorObj.css_filter : 'none';
  };

  const getImagePath = (type, area = null) => {
    if (!currentCar) return '';
    const suffix = (area && area !== 'full') ? `_${area}` : '';
    const key = `${type}${suffix}_image`;
    return currentCar[key] || currentCar[`${type}_image`];
  };

  const allServicePackages = pricingData.flatMap(brandGroup => 
    brandGroup.models.map(model => ({ ...model, brand: brandGroup.brand }))
  );

  if (loading || loadingPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: '#ffc709' }}><h2>กำลังโหลดข้อมูล...</h2></div></main><Footer /></div>;
  if (errorPricing) return <div className={styles.pipeCleanPage}><Header onLogout={onLogout} /><main className={styles.mainContent}><div style={{ textAlign: 'center', padding: '100px 20px', color: 'red' }}><h2>{errorPricing}</h2></div></main><Footer /></div>;

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Header onLogout={onLogout} />
      <main className={styles.mainContent}>
        <HeroSection bgImage={heroImage} title="STICKER CAR WRAP" subtitle="เปลี่ยนลุครถของคุณด้วยสติ๊กเกอร์เกรดพรีเมียม" />
        
        <PriceSelector pricingData={pricingData} />

        <section className={stickerStyles.colorizerSection}>
            <CarColorChanger
              currentCar={currentCar}
              colors={colors}
              selectedArea={selectedArea}
              selectedColorId={selectedColorId}
              STICKER_AREA_OPTIONS={availableAreaOptions} // ใช้ตัวที่กรองแล้ว
              setSelectedArea={setSelectedArea}
              setSelectedColorId={setSelectedColorId}
              getImagePath={getImagePath}
              getColorFilter={getColorFilter}
              handlePrev={handlePrev}
              handleNext={handleNext}
              cars={cars}
              activeIndex={activeIndex}
            />
        </section>

        <section className={styles.relatedServices}>
          <div className="container">
            <h3 className={styles.relatedTitle}>OTHER SERVICES</h3>
            <div className={styles.heroThumbnails}>
              {[{ label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' }, { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' }, { label: 'PIPE CLEAN', sub: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' }].map((item, i) => (
                <div key={i} className={styles.thumbnailCard} onClick={() => go(item.path)}>
                  <div className={styles.thumbnailText}><h3>{item.label}</h3><p>{item.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ServiceCatalog allPackages={allServicePackages} onOpenModal={(item) => { setModalData(item); setShowModal(true); }} />
        <ReviewGallery reviewItems={reviewItems} />

        <section className={`${styles.mapSection} container`}>
          <div className={styles.ourLocation}><h3>Our Location</h3><ShopMap address="GT7 Motor, Bangkok, Thailand" height="400px" /></div>
        </section>
      </main>
      <Footer />
      <ServiceModal isOpen={showModal} data={modalData} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default Sticker;