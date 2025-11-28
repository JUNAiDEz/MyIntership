import React, { useRef } from 'react';
import styles from './PromotionPage.module.css';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FaBoxOpen, FaWrench, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaTools, FaCarBattery, FaCogs, FaOilCan, FaCompactDisc, FaCar } from 'react-icons/fa';
import shopStyles from '../pages/ShopPage.module.css';

// --- (ข้อมูลจำลอง: โปรโมชั่นยอดนิยม) ---
const popularPromotionsData = [
  {
    id: 'promo2',
    description:
      'เปลี่ยนโช๊คอัพ 4 ต้น พร้อมบริการตั้งศูนย์ฟรี! ขับขี่มั่นใจกว่าเดิม',
    bannerImageUrl:
      'https://placehold.co/1200x400/#8e44ad/FFF?text=Popular+Promo',
    items: [
      { type: 'service', name: 'เปลี่ยนโช๊คอัพ', imageUrl: 'https://placehold.co/100x100/8e44ad/FFF?text=Shocks' },
      { type: 'service', name: 'ตั้งศูนย์', imageUrl: 'https://placehold.co/100x100/27ae60/FFF?text=Align' },
      { type: 'product', name: 'น้ำมันเบรค', imageUrl: 'https://placehold.co/100x100/f39c12/FFF?text=Brake+Oil' },
    ],
    originalPrice: '25500',
    discountPrice: '24999',
  },
  {
    id: 'promo1',
    description:
      'ดูแลรถคุณให้พร้อมลุยทุกสถานการณ์ ทั้งล้าง อัด ฉีด และเคลือบสี...',
    bannerImageUrl:
      'https://placehold.co/1200x400/#2ecc71/FFF?text=Popular+Promo',
    items: [
      { type: 'service', name: 'สปาเครื่องยนต์', imageUrl: 'https://placehold.co/100x100/2ecc71/FFF?text=Spa' },
      { type: 'service', name: 'ล้างแอร์', imageUrl: 'https://placehold.co/100x100/1abc9c/FFF?text=Air-Con' },
      { type: 'product', name: 'น้ำมันเครื่อง GT7', imageUrl: 'https://placehold.co/100x100/e67e22/FFF?text=GT7+Oil' },
    ],
    originalPrice: '3500',
    discountPrice: '2999',
  },
  {
    id: 'promo3',
    description:
      'ซื้อผลิตภัณฑ์ดูแลรถยนต์จาก MMAX ครบชุด รับส่วนลดทันที 15%',
    bannerImageUrl:
      'https://placehold.co/1200x400/#c0392b/FFF?text=Popular+Promo',
    items: [
      { type: 'product', name: 'MMAX Cleaner', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Cleaner' },
      { type: 'product', name: 'MMAX Wax', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Wax' },
      { type: 'product', name: 'MMAX Tire Black', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Tire' },
      { type: 'product', name: 'MMAX Polish', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Polish' },
    ],
    originalPrice: '1650',
    discountPrice: '1400',
  },
  // เพิ่มข้อมูลอันที่ 4 เพื่อทดสอบการเลื่อน
   {
    id: 'promo4',
    description:
      'โปรโมชั่นยางรถยนต์ ซื้อ 3 แถม 1 วันนี้เท่านั้น!',
    bannerImageUrl:
      'https://placehold.co/1200x400/#3498db/FFF?text=New+Tires',
    items: [
      { type: 'product', name: 'ยาง R16', imageUrl: 'https://placehold.co/100x100/3498db/FFF?text=Tire' },
      { type: 'service', name: 'ถ่วงล้อ', imageUrl: 'https://placehold.co/100x100/27ae60/FFF?text=Balance' },
    ],
    originalPrice: '12000',
    discountPrice: '9000',
  },
];


// --- (ข้อมูลจำลอง: โปรโมชั่นทั้งหมด) ---
const allPromotionsData = [
  {
    id: 'promo1',
    description:
      'ดูแลรถคุณให้พร้อมลุยทุกสถานการณ์ ทั้งล้าง อัด ฉีด และเคลือบสี พร้อมส่วนลดพิเศษสำหรับน้ำมันเครื่อง',
    bannerImageUrl:
      'https://placehold.co/1200x400/#777/FFF?text=1200x400',
    items: [
      { type: 'service', name: 'สปาเครื่องยนต์', imageUrl: 'https://placehold.co/100x100/2ecc71/FFF?text=Spa' },
      { type: 'service', name: 'ล้างแอร์', imageUrl: 'https://placehold.co/100x100/1abc9c/FFF?text=Air-Con' },
      { type: 'product', name: 'น้ำมันเครื่อง GT7', imageUrl: 'https://placehold.co/100x100/e67e22/FFF?text=GT7+Oil' },
      { type: 'service', name: 'เคลือบสี', imageUrl: 'https://placehold.co/100x100/27ae60/FFF?text=Polish' },
    ],
    originalPrice: '3500',
    discountPrice: '2999',
  },
  {
    id: 'promo2',
    description:
      'เปลี่ยนโช๊คอัพ 4 ต้น พร้อมบริการตั้งศูนย์ฟรี! ขับขี่มั่นใจกว่าเดิม',
    bannerImageUrl:
      'https://placehold.co/1200x400/#777/FFF?text=1200x400',
    items: [
      { type: 'service', name: 'เปลี่ยนโช๊คอัพ', imageUrl: 'https://placehold.co/100x100/8e44ad/FFF?text=Shocks' },
      { type: 'service', name: 'ตั้งศูนย์', imageUrl: 'https://placehold.co/100x100/27ae60/FFF?text=Align' },
      { type: 'product', name: 'น้ำมันเบรค', imageUrl: 'https://placehold.co/100x100/f39c12/FFF?text=Brake+Oil' },
    ],
    originalPrice: '25500',
    discountPrice: '24999',
  },
  {
    id: 'promo3',
    description:
      'ซื้อผลิตภัณฑ์ดูแลรถยนต์จาก MMAX ครบชุด รับส่วนลดทันที 15% ให้รถคุณเงางามเหมือนใหม่',
    bannerImageUrl:
      'https://placehold.co/1200x400/#777/FFF?text=1200x400',
    items: [
      { type: 'product', name: 'MMAX Cleaner', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Cleaner' },
      { type: 'product', name: 'MMAX Wax', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Wax' },
      { type: 'product', name: 'MMAX Tire Black', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Tire' },
      { type: 'product', name: 'MMAX Polish', imageUrl: 'https://placehold.co/100x100/c0392b/FFF?text=Polish' },
    ],
    originalPrice: '1650',
    discountPrice: '1400',
  },
];

// --- (Component ย่อยสำหรับการ์ดโปรโมชั่น) ---
const PromotionCard = ({ promotion }) => {
  const visibleItems = promotion.items.slice(0, 3);
  const hasMoreItems = promotion.items.length > 3;

  return (
    <div className={styles.card}>
      <div className={styles.cardBanner}>
        <img src={promotion.bannerImageUrl} alt="promotion banner" />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>{promotion.description}</p>

        <h4 className={styles.itemsHeader}>รายการในโปรโมชั่นนี้:</h4>

        <div className={styles.itemsGrid}>
          {visibleItems.map((item, index) => (
            <div key={index} className={styles.itemBox}>
              <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemType}>
                  {item.type === 'product' ? <FaBoxOpen /> : <FaWrench />}
                  {item.type === 'product' ? ' สินค้า' : ' บริการ'}
                </span>
              </div>
            </div>
          ))}
          {hasMoreItems && <div className={styles.moreItems}>+ ดูเพิ่มเติม...</div>}
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceWrapper}>
            <span className={styles.originalPrice}>{promotion.originalPrice}฿</span>
            <span className={styles.discountPrice}>{promotion.discountPrice}฿</span>
          </div>
          <button className={styles.detailsButton}>ดูรายละเอียด</button>
        </div>
      </div>
    </div>
  );
};

// --- (Component หลักของหน้า) ---
function PromotionPage({ onLogout }) {
  const scrollContainerRef = useRef(null);

  /**
   * * Logic การเลื่อน (เหมือนเดิม แต่คราวนี้จะทำงานร่วมกับ CSS scroll-snap)
   * */
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. หาการ์ดแรกสุดในแถบเลื่อน
    const card = container.querySelector('.' + styles.carouselCardWrapper);
    if (!card) return; 

    // 2. คำนวณระยะเลื่อน = ความกว้างการ์ด 1 ใบ + gap (25px)
    const cardWidth = card.offsetWidth;
    const gap = 25; // ⬅️ ต้องตรงกับ gap (25px) ใน CSS
    const scrollAmount = cardWidth + gap; // ระยะเลื่อน 1 การ์ด

    // 3. Logic การวนลูป (เหมือนเดิม)
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === 'right') {
      // (JS จะเลื่อนไป 1 การ์ด และ CSS scroll-snap จะช่วยล็อคให้เข้าที่)
      if (container.scrollLeft >= maxScrollLeft - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else { // direction === 'left'
      if (container.scrollLeft === 0) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };


  return (
    <div className="App">
      <Header onLogout={onLogout} />
      
      <main className={styles.pageWrapper}>
        
        {/* 1. แบนเนอร์เต็มความกว้าง (เหมือนเดิม) */}
        <div className={styles.heroBanner}>
          <img
            src="https://placehold.co/1920x730/555/FFF?text=1920x730"
            alt="โปรโมชั่น GT7 Motor"
            className={styles.heroImage}
          />
        </div>

        {/* 2. Wrapper สำหรับ content (มี padding ซ้ายขวา) */}
        <div className={styles.contentWrapper}>
          
          {/* ส่วน: โปรโมชั่นยอดนิยม (แบบ Carousel) */}
          <div className={styles.popularSection}>
            <h2 className={styles.sectionTitle}>โปรโมชั่นมาแรง</h2>
            
            <div className={styles.carouselWrapper}>
              
              {/* ปุ่มเลื่อนซ้าย */}
              <button 
                className={`${styles.carouselButton} ${styles.prevButton}`} 
                onClick={() => scroll('left')}
              >
                <FaChevronLeft />
              </button>

              {/* แถบเลื่อน */}
              <div className={styles.carouselTrack} ref={scrollContainerRef}>
                {popularPromotionsData.map((promo) => (
                  // Wrapper สำหรับการ์ดใน Carousel
                  <div key={promo.id} className={styles.carouselCardWrapper}>
                    <PromotionCard promotion={promo} />
                  </div>
                ))}
              </div>

              {/* ปุ่มเลื่อนขวา */}
              <button 
                className={`${styles.carouselButton} ${styles.nextButton}`} 
                onClick={() => scroll('right')}
              >
                <FaChevronRight />
              </button>

            </div>
          </div>


          {/* 3. Shop By Department (reuse ShopPage styles) */}
          <section className={shopStyles.section}>
            <div className={shopStyles.sectionHeader}>
              <h3>Shop By Department</h3>
              <div className={shopStyles.arrows}>
                <button><FaChevronLeft /></button>
                <button><FaChevronRight /></button>
              </div>
            </div>
            <div className={shopStyles.categoryGrid}>
              {[
                { id: 1, name: 'Service Kits', icon: <FaTools /> },
                { id: 2, name: 'Batteries', icon: <FaCarBattery /> },
                { id: 3, name: 'Engine Parts', icon: <FaCogs /> },
                { id: 4, name: 'Engine Oil', icon: <FaOilCan /> },
                { id: 5, name: 'Suspension', icon: <FaCar /> },
                { id: 6, name: 'Brake Discs', icon: <FaCompactDisc /> },
              ].map((cat) => (
                <div key={cat.id} className={shopStyles.categoryCard}>
                  <div className={shopStyles.catIcon}>{cat.icon}</div>
                  <p>{cat.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. กริดโปรโมชั่น (ทั้งหมด) */}
          <h2 className={styles.sectionTitle}>โปรโมชั่นทั้งหมด</h2>
          <div className={styles.promotionsGrid}>
            {allPromotionsData.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
</div>

        </div> {/* ปิด .contentWrapper */}

      </main> {/* ปิด .pageWrapper */}
      <Footer />
    </div>
  );
}

export default PromotionPage;