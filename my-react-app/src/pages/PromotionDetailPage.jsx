import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './PromotionDetailPage.module.css';
import { allPromotionsData } from './PromotionPage';
import { apiGet } from '../utils/api';

function PromotionDetailPage({ onLogout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    apiGet(`/api/sales/promotions/slug/${slug}`)
      .then((data) => {
        if (data && !data.message) {
          if (isMounted) setPromotion(data);
        } else {
          // fallback to mock data
          const mockPromo = allPromotionsData.find(
            (promo) => promo.slug === slug || promo.id === slug
          );
          if (isMounted) setPromotion(mockPromo || null);
        }
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        const mockPromo = allPromotionsData.find(
          (promo) => promo.slug === slug || promo.id === slug
        );
        setPromotion(mockPromo || null);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [slug]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <div className={styles.loadingSpinner}></div>
                <h2 className={styles.loadingText}>กำลังโหลดโปรโมชั่น...</h2>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Not Found State ---
  if (!promotion) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <h2 className={styles.errorText}>ไม่พบโปรโมชั่นนี้</h2>
                <button className={styles.btnPrimary} onClick={() => navigate('/promotions')}>
                    ← กลับหน้าโปรโมชั่น
                </button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Map Data
  const items = Array.isArray(promotion.items) ? promotion.items : [];
  const bannerImageUrl = promotion.bannerImageUrl || promotion.image_url || 'https://via.placeholder.com/800x400?text=Promotion';
  const description = promotion.description || promotion.promotion_name || '';
  const originalPrice = promotion.originalPrice || promotion.discount_value || '';
  const discountPrice = promotion.discountPrice || '';
  const title = promotion.promotion_name || promotion.title || 'รายละเอียดโปรโมชั่น';

  return (
    <>
      <Helmet>
        <title>{title} | GT7 Motor</title>
        <meta name="description" content={description} />
      </Helmet>
      
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            
            <div className={styles.detailContainer}>
                {/* Image Section */}
                <div className={styles.imageWrapper}>
                    <img src={bannerImageUrl} alt={title} className={styles.promotionImage} />
                    <div className={styles.promoBadge}>PROMOTION</div>
                </div>

                <div className={styles.detailBody}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.pageTitle}>{title}</h1>
                        <div className={styles.divider}></div>
                    </div>

                    <div className={styles.descriptionBox}>
                        {description}
                    </div>

                    {/* Items Grid */}
                    <div className={styles.itemsSection}>
                        <h4 className={styles.sectionHeader}>INCLUDED ITEMS</h4>
                        <div className={styles.itemsGrid}>
                            {items.length === 0 && <p className={styles.emptyText}>ไม่มีข้อมูลรายการสินค้า</p>}
                            {items.map((item, idx) => (
                                <div className={styles.itemCard} key={idx}>
                                    <div className={styles.itemCardInner}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                                        ) : (
                                            <div className={styles.itemPlaceholder}>IMG</div>
                                        )}
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.itemType}>{item.type === 'product' ? 'PRODUCT' : 'SERVICE'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className={styles.footerSection}>
                        <div className={styles.priceWrapper}>
                            {originalPrice && (
                                <span className={styles.originalPrice}>
                                    {Number(originalPrice).toLocaleString()}฿
                                </span>
                            )}
                            {discountPrice && (
                                <span className={styles.discountPrice}>
                                    {Number(discountPrice).toLocaleString()}฿
                                </span>
                            )}
                        </div>
                        <button onClick={() => navigate('/promotions')} className={styles.btnPrimary}>
                            ← กลับหน้ารวม
                        </button>
                    </div>

                </div>
            </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default PromotionDetailPage;