import React, { useRef, useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Helmet } from 'react-helmet-async';
import styles from './PromotionPage.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FaBoxOpen, FaWrench, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaTools, FaCarBattery, FaCogs, FaOilCan, FaCompactDisc, FaCar } from 'react-icons/fa';
import { apiGet } from '../utils/api';
import { Link } from 'react-router-dom';

// --- ข้อมูลจำลอง (Mock Data) สำหรับ FLASH DEALS ---
export const allPromotionsData = [
  {
    id: 'promo3',
    slug: 'mmax-car-care-set',
    description: 'ซื้อผลิตภัณฑ์ดูแลรถยนต์จาก MMAX ครบชุด รับส่วนลดทันที 15%',
    bannerImageUrl: '/images/FeatureBar/mainternance.jpg',
    items: [
      { type: 'product', name: 'MMAX Cleaner', imageUrl: '/images/FeatureBar/mmaxcleaner.jpg' },
      { type: 'product', name: 'MMAX Wax', imageUrl: '/images/FeatureBar/mmaxwax.jpg' },
      { type: 'product', name: 'MMAX Tire Black', imageUrl: '/images/FeatureBar/tirewax.jpg' },
    ],
    originalPrice: '1,650',
    discountPrice: '1,400',
  },
  {
    id: 'promo4',
    slug: 'tire-promo',
    description: 'ยางสปอร์ต 4 เส้น ผ่อน 0% นาน 10 เดือน ฟรีค่าแรงติดตั้ง',
    bannerImageUrl: '/images/FeatureBar/tire.jpg',
    items: [
      { type: 'product', name: 'ยางขอบ 18"', imageUrl: '/images/FeatureBar/tire18.jpg' },
      { type: 'service', name: 'ตั้งศูนย์ถ่วงล้อ', imageUrl: '/images/FeatureBar/alignment.jpg' },
    ],
    originalPrice: '18,000',
    discountPrice: '14,500',
  },
  {
    id: 'promo2',
    slug: 'shock-absorber-free-alignment',
    description: 'เปลี่ยนโช๊คอัพ 4 ต้น พร้อมบริการตั้งศูนย์ฟรี! ขับขี่มั่นใจกว่าเดิม',
    bannerImageUrl: '/images/FeatureBar/shock.jpg',
    items: [
      { type: 'service', name: 'เปลี่ยนโช๊คอัพ', imageUrl: '/images/FeatureBar/absober.jpg' },
      { type: 'service', name: 'ตั้งศูนย์', imageUrl: '/images/FeatureBar/alignment.jpg' },
      { type: 'product', name: 'น้ำมันเบรค', imageUrl: '/images/FeatureBar/oil.jpg' },
    ],
    originalPrice: '25,500',
    discountPrice: '24,999',
  },
];

// --- Component ย่อย: PromotionCard ---
// รับ isFlashDeal เข้ามา ถ้าเป็น true จะแสดงหน้าตาแบบรูป Mockup (ดำ-เหลือง)
const PromotionCard = ({ promotion, isFlashDeal = false }) => {
  // ค่าจาก Database (สำหรับ ALL PROMOTIONS)
  const apiProducts = Array.isArray(promotion.products) ? promotion.products : [];
  const apiServices = Array.isArray(promotion.services) ? promotion.services : [];
  const dbName = promotion.promotion_name || promotion.title || '';
  const dbDiscount = promotion.discount_value ? `${promotion.discount_value}${promotion.promotion_type === 'PERCENT' ? '%' : '฿'}` : '';

  // ค่า Mockup (สำหรับ FLASH DEALS)
  const items = Array.isArray(promotion.items) ? promotion.items : [];
  const visibleItems = items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  // ค่าที่ใช้ร่วมกัน
  const bannerUrl = promotion.image_url || promotion.bannerImageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80';
  const promoDesc = promotion.description || '';
  const promoSlug = promotion.slug || promotion.promotion_id || promotion.id;

  // ------------------------------------------
  // 1. UI แบบ FLASH DEALS (โหมดสีดำตามรูป)
  // ------------------------------------------
  if (isFlashDeal) {
    return (
      <div className={styles.card} style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Banner */}
        <div style={{ position: 'relative' }}>
          <div style={{position:'absolute', top:10, right:10, background:'#ff0000', color:'#fff', padding:'5px 10px', fontSize:'0.8rem', fontWeight:'bold', transform:'skew(-10deg)', zIndex:2, boxShadow:'0 2px 5px rgba(0,0,0,0.5)'}}>
               HOT DEAL
          </div>
          <img src={bannerUrl} alt={promoDesc} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
        </div>

        <div className={styles.cardBody} style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '15px', minHeight: '40px' }}>{promoDesc}</p>
          
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            รายการในแพ็กเกจ
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', flexGrow: 1 }}>
            {visibleItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1a1a1a', padding: '10px', borderRadius: '4px' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ddd' }}>{item.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#ffc709', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {item.type === 'product' ? <FaBoxOpen /> : <FaWrench />}
                    {item.type === 'product' ? ' สินค้า' : ' บริการ'}
                  </span>
                </div>
              </div>
            ))}
            {hasMoreItems && <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>+ และอื่นๆ อีก {items.length - 3} รายการ</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '0.8rem', marginBottom: '-5px' }}>{promotion.originalPrice}฿</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc709' }}>{promotion.discountPrice}฿</span>
            </div>
            <Link to={`/promotions/${promoSlug}`} style={{ textDecoration: 'none', border: '1px solid #ffc709', color: '#ffc709', padding: '8px 15px', borderRadius: '4px', fontSize: '0.8rem', background: 'transparent' }}>
              ดูรายละเอียด
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // 2. UI แบบ ALL PROMOTIONS (ดึงจากฐานข้อมูลจริง)
  // ------------------------------------------
  return (
    <div className={styles.card}>
      <div className={styles.cardBanner}>
        <img src={bannerUrl} alt={promoDesc} />
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{dbName}</h3>
        <p className={styles.cardDescription}>{promoDesc}</p>
        
        {dbDiscount && <div className={styles.cardDiscount}>ส่วนลด: {dbDiscount}</div>}

        {(apiProducts.length > 0 || apiServices.length > 0) && (
          <div className={styles.itemsHeader}>รายการที่ร่วมโปรโมชั่น:</div>
        )}
        <div className={styles.itemsGrid}>
          {apiProducts.map((item, index) => (
            <div key={index} className={styles.itemBox}>
              <span className={styles.itemName}>สินค้า: {item.product_variant_id}</span>
              <span className={styles.itemType}><FaBoxOpen /> สินค้า</span>
            </div>
          ))}
          {apiServices.map((item, index) => (
            <div key={index} className={styles.itemBox}>
              <span className={styles.itemName}>บริการ: {item.service_id}</span>
              <span className={styles.itemType}><FaWrench /> บริการ</span>
            </div>
          ))}
        </div>

        <div className={styles.priceSection}>
          <Link to={`/promotions/${promoSlug}`} className={styles.detailsButton} style={{textDecoration:'none'}}>
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Component หลัก ---
function PromotionPage({ onLogout }) {
  const sliderRef = useRef(null);

  // ตั้งค่า Slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3, 
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
        {
          breakpoint: 1024,
          settings: { slidesToShow: 2 }
        },
        {
          breakpoint: 600,
          settings: { slidesToShow: 1 }
        }
      ]
  };

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // โหลดข้อมูล ALL PROMOTIONS (ฐานข้อมูลจริงเท่านั้น)
  useEffect(() => {
    setLoading(true);
    apiGet('/api/sales/promotions?all=1')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
            setPromotions(data);
        } else {
            setPromotions([]); // ถ้าไม่มีข้อมูล ให้ปล่อยว่าง ไม่ดึง mock data มาทับ
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load promotions", err);
        setPromotions([]); // ถ้า API พัง ให้ลิสต์ว่างไปเลย
        setLoading(false);
      });
  }, []);

  const seo = {
    title: 'PROMOTIONS | GT7 MOTORSPORT',
    description: 'รวมดีลสุดพิเศษสำหรับคนรักรถ ของแต่ง อะไหล่ และบริการซ่อมบำรุงในราคาที่คุณพลาดไม่ได้',
    url: 'https://front.gt7dev.com/promotions',
    image: 'https://front.gt7dev.com/og-image-promotions.jpg'
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      {/* เพิ่มพื้นหลังสีเข้มให้ทั้งหน้า เพื่อให้กลมกลืนกับหน้าเว็บคุณ */}
      <div className="App" style={{ backgroundColor: '#050505', color: '#fff', minHeight: '100vh' }}>
        <div style={{position:'sticky', top:0, zIndex:100}}>
             <Header onLogout={onLogout} />
        </div>
        
        <main className={styles.pageWrapper}>
          
          {/* Hero Banner */}
          <div className={styles.heroBanner}>
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
              alt="Promotion Banner"
              className={styles.heroImage}
            />
            <div style={{position:'absolute', zIndex:2, textAlign:'center'}}>
                <h1 style={{fontSize:'4rem', fontStyle:'italic', textTransform:'uppercase', textShadow:'0 0 20px rgba(0,0,0,0.8)'}}>
                    EXCLUSIVE <span style={{color:'#ffc709'}}>DEALS</span>
                </h1>
                <p style={{fontSize:'1.2rem', color:'#ddd'}}>โปรโมชั่นที่ดีที่สุดสำหรับรถของคุณ ประจำเดือนนี้</p>
            </div>
          </div>

          <div className={styles.contentWrapper} style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            
            {/* Section: Slider (Hot Promotions) */}
            <div className={styles.popularSection} style={{ marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ borderLeft: '4px solid #ffc709', paddingLeft: '15px' }}>FLASH <span style={{color:'#ffc709'}}>DEALS</span></h2>
              
              <div className={styles.carouselWrapper} style={{ position: 'relative' }}>
                <div className={styles.slickPrevArrow} onClick={() => sliderRef.current?.slickPrev()} style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, cursor: 'pointer', color: '#ffc709', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%' }}>
                  <FaChevronLeft />
                </div>

                <Slider ref={sliderRef} {...sliderSettings}>
                  {/* FLASH DEALS: ส่ง isFlashDeal=true และใช้ข้อมูล Mockup */}
                  {allPromotionsData.map((promo) => (
                    <div key={promo.id} className={styles.carouselCardWrapper} style={{ padding: '0 10px' }}>
                      <PromotionCard promotion={promo} isFlashDeal={true} />
                    </div>
                  ))}
                </Slider>

                <div className={styles.slickNextArrow} onClick={() => sliderRef.current?.slickNext()} style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, cursor: 'pointer', color: '#ffc709', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%' }}>
                  <FaChevronRight />
                </div>
              </div>
            </div>

            {/* Shop By Category */}
            <h2 className={styles.sectionTitle} style={{ borderLeft: '4px solid #ffc709', paddingLeft: '15px' }}>SHOP BY <span style={{color:'#ffc709'}}>CATEGORY</span></h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'20px', marginBottom:'60px'}}>
                {[
                  { id: 1, name: 'Service Kits', icon: <FaTools /> },
                  { id: 2, name: 'Batteries', icon: <FaCarBattery /> },
                  { id: 3, name: 'Engine Parts', icon: <FaCogs /> },
                  { id: 4, name: 'Engine Oil', icon: <FaOilCan /> },
                  { id: 5, name: 'Suspension', icon: <FaCar /> },
                  { id: 6, name: 'Brake Discs', icon: <FaCompactDisc /> },
                ].map((cat) => (
                  <div key={cat.id} style={{
                      background:'#111', border:'1px solid #333', padding:'25px', textAlign:'center', borderRadius:'8px', cursor:'pointer', transition:'all 0.3s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ffc709'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{fontSize:'2.5rem', color:'#666', marginBottom:'15px'}}>{cat.icon}</div>
                    <div style={{fontWeight:'bold', color:'#ddd'}}>{cat.name}</div>
                  </div>
                ))}
            </div>

            {/* All Promotions Grid */}
            <h2 className={styles.sectionTitle} style={{ borderLeft: '4px solid #ffc709', paddingLeft: '15px' }}>ALL <span style={{color:'#ffc709'}}>PROMOTIONS</span></h2>
            <div className={styles.promotionsGrid}>
              {loading ? (
                <div style={{color:'#fff', textAlign:'center'}}>กำลังโหลดข้อมูล...</div>
              ) : promotions.length === 0 ? (
                <div style={{color:'#aaa', textAlign:'center'}}>ไม่พบโปรโมชั่นในขณะนี้</div>
              ) : (
                /* ALL PROMOTIONS: แสดงข้อมูลจาก API / ฐานข้อมูล (isFlashDeal จะเป็น false) */
                promotions.map((promo) => (
                  <PromotionCard key={promo.promotion_id || promo.id} promotion={promo} isFlashDeal={false} />
                ))
              )}
            </div>

          </div> 
        </main>
        <Footer />
      </div>
    </>
  );
}

export default PromotionPage;