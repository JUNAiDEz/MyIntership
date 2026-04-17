import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaStar, FaCommentDots, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getImageUrl } from '../utils/productHelpers';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './ProductDetailPage.module.css'; 

const API_URL = import.meta.env.VITE_API_URL;

const MOCK_REVIEWS = [
  { id: 1, user: 'Pichai S.', rating: 5, date: '2 วันที่แล้ว', comment: 'สินค้าคุณภาพดีมากครับ จัดส่งไว แพ็คของมาแน่นหนา' },
  { id: 2, user: 'Somsak K.', rating: 4, date: '1 สัปดาห์ที่แล้ว', comment: 'ใช้งานได้ดีครับ คุ้มราคา แนะนำเลย' },
  { id: 3, user: 'Anna W.', rating: 5, date: '2 สัปดาห์ที่แล้ว', comment: 'ชอบมากค่ะ ตรงปก บริการดี' },
];

// ดึงข้อมูลโปรโมชั่นที่เกี่ยวข้องกับสินค้านี้
const fetchPromotionsByProduct = async (productId) => {
  try {
    const res = await fetch(`${API_URL}/api/promotions/by-product/${productId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch (err) { return []; }
};

// ... (Functions fetchProductBySlug เหมือนเดิม) ...
const fetchProductBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/inventory/products/slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return { ...result.data, _source: 'products' };
  } catch (error) {}

  try {
    const response = await fetch(`${API_URL}/api/products/product-car-model/by-slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return { ...result.data, _source: 'productCarModel' };
  } catch (error) {}
  
  return null;
};

function ProductDetailPage({ onLogout }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showReviews, setShowReviews] = useState(false); // State ควบคุมการแสดงรีวิว
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await fetchProductBySlug(slug);
      setProduct(data);
      setLoading(false);
      window.scrollTo(0, 0);
      setShowReviews(false);
      // ดึงโปรโมชั่นที่เกี่ยวข้อง
      if (data && (data.product_template_id || data.id)) {
        const promos = await fetchPromotionsByProduct(data.product_template_id || data.id);
        setPromotions(promos);
      } else {
        setPromotions([]);
      }
    };
    loadProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelated = async () => {
        try {
            const res = await fetch(`${API_URL}/api/inventory/products?limit=10`);
            if (res.ok) {
                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.items || []);
                const filtered = items.filter(item => item.slug !== slug).slice(0, 4);
                setRelatedProducts(filtered);
            }
        } catch (err) { console.error(err); }
    };
    if (slug) fetchRelated();
  }, [slug]);

  let displayData = null;
  if (product) {
    if (product._source === 'products') {
      const rawImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images.map(img => getImageUrl(img.image_url || img.url))
        : [getImageUrl(product.image_url || product.img)];
      
      displayData = {
        title: product.title || product.product_name,
        description: product.description,
        price: product.price,
        variants: product.variants || [],
        images: rawImages,
        note: null,
      };
    } else if (product._source === 'productCarModel') {
      const pt = product.product_template || {};
      const rawImages = Array.isArray(pt.images) && pt.images.length > 0
        ? pt.images.map(img => getImageUrl(img.image_url || img.url))
        : [getImageUrl(pt.image_url)];

      displayData = {
        title: pt.product_name || '-',
        description: pt.description || '-',
        price: product.price, 
        variants: pt.variants || [],
        images: rawImages,
        note: product.note,
      };
    }
  }

  useEffect(() => {
    if (displayData && displayData.images.length > 0) {
      setActiveImage(displayData.images[0]);
    }
  }, [product]);

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>
  );

  if (!displayData) return (
    <div className={styles.emptyState}>
      <h2>ไม่พบสินค้านี้</h2>
      <Link to="/shop" className={styles.btnSecondary}>กลับไปหน้าสินค้า</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{displayData.title} | GT7 Motor</title>
        <meta name="description" content={displayData.description || ''} />
      </Helmet>
      <Header onLogout={onLogout} />
      
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          
          <nav className={styles.breadcrumb}>
            <Link to="/">หน้าแรก</Link>
            <span className={styles.sep}>/</span>
            <Link to="/shop">สินค้าทั้งหมด</Link>
            <span className={styles.sep}>/</span>
            <span className={styles.current}>{displayData.title}</span>
          </nav>

          <div className={styles.productDetailCard}>
            {/* Left: Gallery */}
            <div className={styles.gallerySection}>
              <div className={styles.mainImageWrapper}>
                <img src={activeImage || '/images/no-image.png'} alt={displayData.title} className={styles.mainImage} />
              </div>
              {displayData.images.length > 1 && (
                <div className={styles.thumbnailList}>
                  {displayData.images.map((img, idx) => (
                    <div key={idx} className={`${styles.thumbnailWrapper} ${activeImage === img ? styles.activeThumb : ''}`} onClick={() => setActiveImage(img)}>
                      <img src={img} alt={`view ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className={styles.infoSection}>
              <h1 className={styles.productTitle}>{displayData.title}</h1>
              <div className={styles.priceContainer}>
                {displayData.variants.length > 0 ? (
                  <div>
                    <span className={styles.labelPrice}>ราคาเริ่มต้น:</span>
                    <span className={styles.priceValue}>{Number(displayData.variants[0].unit_price).toLocaleString()}</span>
                    <span className={styles.currency}>THB</span>
                  </div>
                ) : (
                  <div>
                    <span className={styles.priceValue}>{displayData.price ? Number(displayData.price).toLocaleString() : '-'}</span>
                    <span className={styles.currency}>THB</span>
                  </div>
                )}
              </div>
              <div className={styles.divider}></div>
              <div className={styles.descriptionSection}>
                <h4>รายละเอียดสินค้า</h4>
                <p>{displayData.description}</p>
                {displayData.note && <div className={styles.noteBox}><strong>หมายเหตุ:</strong> {displayData.note}</div>}
              </div>

              {displayData.variants.length > 0 && (
                <div className={styles.variantsTableWrapper}>
                  <h4>รายละเอียดตัวเลือกสินค้า</h4>
                  <div className={styles.variantsGrid}>
                    {displayData.variants.map((v, i) => (
                      <div className={styles.variantCard} key={i}>
                        <div className={styles.variantCardHeader}>
                          <span className={styles.variantName}>{v.variant_name || 'ไม่มีชื่อ'}</span>
                          {v.sku && <span className={styles.skuBadge}>SKU: {v.sku}</span>}
                        </div>
                        <div className={styles.variantCardBody}>
                          <span className={styles.variantPrice}>{Number(v.unit_price).toLocaleString()} <span className={styles.currency}>บาท</span></span>
                          {typeof v.stock_quantity !== 'undefined' && (
                            <span className={v.stock_quantity > 0 ? styles.inStock : styles.outOfStock}>
                              {v.stock_quantity > 0 ? `สต็อก: ${v.stock_quantity}` : 'หมดสต็อก'}
                            </span>
                          )}
                        </div>
                        <div className={styles.variantCardFooter}>
                          <button className={styles.btnVariantBuy} disabled={v.stock_quantity === 0}>สั่งซื้อ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area: ปุ่มสั่งซื้อ & ปุ่ม Toggle รีวิว */}
              <div className={styles.actionArea}>
                <button className={styles.btnPrimaryFull}>สั่งซื้อสินค้าทันที</button>
                
                {/* ปุ่มกดเพื่อเปิด/ปิดรีวิว */}
                <button 
                  className={`${styles.btnReviewToggle} ${showReviews ? styles.active : ''}`} 
                  onClick={() => setShowReviews(!showReviews)}
                >
                  <FaCommentDots /> 
                  <span>{showReviews ? 'ซ่อนรีวิว' : `อ่านรีวิวจากผู้ใช้งาน (${MOCK_REVIEWS.length})`}</span>
                  {showReviews ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* --- NEW: ส่วนแสดงโปรโมชั่นที่เกี่ยวข้องกับสินค้านี้ --- */}
          {promotions.length > 0 && (
            <div className={styles.promotionsSection}>
              <h3 className={styles.promotionsHeader}>โปรโมชั่นที่เกี่ยวข้อง</h3>
              <div className={styles.promotionsGrid}>
                {promotions.map((promo) => (
                  <div key={promo.promotion_id} className={styles.promotionCard}>
                    <div className={styles.promotionTitle}>{promo.promotion_name}</div>
                    <div className={styles.promotionDesc}>{promo.description}</div>
                    <div className={styles.promotionDiscount}>ส่วนลด: {promo.discount_value} {promo.promotion_type === 'PERCENT' ? '%' : 'บาท'}</div>
                    {promo.products && promo.products.length > 0 && (
                      <div className={styles.promotionProducts}>
                        <strong>สินค้าที่ร่วมรายการ:</strong>
                        <ul>
                          {promo.products.map((p) => (
                            <li key={p.product_variant_id}>รหัสสินค้า: {p.product_variant_id} ราคาหลังลด: {p.discounted_price}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {promo.services && promo.services.length > 0 && (
                      <div className={styles.promotionServices}>
                        <strong>บริการที่ร่วมรายการ:</strong>
                        <ul>
                          {promo.services.map((s) => (
                            <li key={s.service_id}>บริการ: {s.service_id} ราคาหลังลด: {s.discounted_price}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- ส่วนแสดงเนื้อหารีวิว (อยู่นอก ProductCard แต่อยู่เหนือ Related Products) --- */}
          {showReviews && (
            <div className={styles.reviewsSection}>
                <h3 className={styles.reviewHeader}>ความคิดเห็นจากลูกค้า</h3>
                <div className={styles.reviewGrid}>
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeaderRow}>
                        <span className={styles.reviewUser}>{review.user}</span>
                        <div className={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color={i < review.rating ? "#ffc709" : "#e5e7eb"} size={14} />
                          ))}
                        </div>
                      </div>
                      <div className={styles.reviewDate}>{review.date}</div>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className={styles.relatedSection}>
                <h3 className={styles.relatedHeader}>สินค้าอื่นๆ ที่น่าสนใจ</h3>
                <div className={styles.relatedGrid}>
                    {relatedProducts.map((item) => {
                        const imgUrl = (item.images && item.images.length > 0) ? item.images[0].image_url : (item.image_url || '/images/no-image.png');
                        const price = item.variants && item.variants.length > 0 ? item.variants[0].unit_price : item.price;
                        return (
                            <Link to={`/product/${item.slug}`} key={item.id || item.product_template_id} className={styles.relatedCard}>
                                <div className={styles.relatedImageWrapper}>
                                    <img src={getImageUrl(imgUrl)} alt={item.product_name} />
                                </div>
                                <div className={styles.relatedContent}>
                                    <h4 className={styles.relatedTitle}>{item.product_name}</h4>
                                    <div className={styles.relatedPrice}>{price ? `฿${Number(price).toLocaleString()}` : 'สอบถามราคา'}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetailPage;