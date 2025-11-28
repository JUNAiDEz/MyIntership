import React, { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';
import { getImageUrl, calculatePrices } from '../utils/productHelpers';
import styles from './ShopPage.module.css';
import Header from '../components/Layout/Header';
import Slider from 'react-slick';
import Footer from '../components/Layout/Footer';
import { 
  FaSearch,
  FaChevronRight,
  FaChevronLeft,
  FaTools,
  FaCarBattery,
  FaCogs,
  FaOilCan,
  FaCompactDisc,
  FaCar
} from 'react-icons/fa';

const ShopPage = ({ onLogout }) => {
  // Mock Data
  const categories = [
    { id: 1, name: 'Service Kits', icon: <FaTools /> },
    { id: 2, name: 'Batteries', icon: <FaCarBattery /> },
    { id: 3, name: 'Engine Parts', icon: <FaCogs /> },
    { id: 4, name: 'Engine Oil', icon: <FaOilCan /> },
    { id: 5, name: 'Suspension', icon: <FaCar /> }, 
    { id: 6, name: 'Brake Discs', icon: <FaCompactDisc /> },
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await apiGet('/api/inventory/products?active=true');
        const list = Array.isArray(raw) ? raw : (raw.items || raw || []);

        const mapped = list.map((p) => {
          const id = p.product_template_id || p.id || p.product_id;
          const title = p.product_name || p.title || p.name || '';
          const img = getImageUrl((p.images && (p.images[0]?.image_url || p.images[0]?.url)) || p.imageUrl || p.image_url || '');
          const prices = calculatePrices({ price: p.variants?.[0]?.unit_price ?? p.price ?? p.base_price ?? 0, discount: p.discount ?? 0 });

          return {
            id,
            name: title,
            price: `฿${prices.displayPrice}`,
            oldPrice: prices.displayOldPrice ? `฿${prices.displayOldPrice}` : null,
            discount: p.discount ? `${p.discount}` : null,
            img,
            raw: p
          };
        });

        if (mounted) setProducts(mapped);
      } catch (err) {
        console.error('Failed to load products for ShopPage:', err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.container}>
      <Header onLogout={onLogout} />

      {/* --- Hero Section --- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h4>Up To 50% Off</h4>
          <h1>CUSTOM WIDE BODY KITS</h1>
          <button className={styles.btnPrimary}>Shop Now</button>
        </div>
        <img src="https://placehold.co/800x400/aa0000/white?text=Car+Banner" alt="Hero Car" className={styles.heroImage} />
      </section>

      {/* --- Banners Section (Slider) --- */}
      {/* เปลี่ยนชื่อ class เป็น bannerSlider เพื่อให้ CSS ควบคุมการเลื่อน */}
      <section className={`${styles.section} ${styles.bannerSliderWrapper}`}>
        <div className={styles.bannerSlider}>
          <Slider
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={2}
            slidesToScroll={1}
            arrows={true}
            responsive={[
              { breakpoint: 992, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } }
            ]}
          >
            {/* Banner 1 */}
            <div>
              <div className={`${styles.banner} ${styles.bannerDark}`}>
                <div className={styles.bannerText}>
                  <span>New Arrivals</span>
                  <h2>WHEELS & DISK</h2>
                  <button className={styles.btnPrimary}>Shop Now</button>
                </div>
                <img src="https://placehold.co/300x200/333/ccc?text=Wheel" alt="Wheel" />
              </div>
            </div>

            {/* Banner 2 */}
            <div>
              <div className={`${styles.banner} ${styles.bannerRed}`}>
                <div className={styles.bannerText}>
                  <span>Big Saving</span>
                  <h2>SAVE 30% OFF</h2>
                  <button className={styles.btnPrimary}>Shop Now</button>
                </div>
                <img src="https://placehold.co/300x200/cc0000/fff?text=Car+Front" alt="Car" />
              </div>
            </div>

            {/* Banner 3 */}
            <div>
              <div className={`${styles.banner} ${styles.bannerBlue}`}>
                <div className={styles.bannerText}>
                  <span>Best Performance</span>
                  <h2>TURBO KITS</h2>
                  <button className={styles.btnPrimary}>Shop Now</button>
                </div>
                <img src="https://placehold.co/300x200/0033cc/fff?text=Turbo" alt="Turbo" />
              </div>
            </div>

          </Slider>
        </div>
      </section>

      {/* --- Shop By Department --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Shop By Department</h3>
          <div className={styles.arrows}>
            <button><FaChevronLeft /></button>
            <button><FaChevronRight /></button>
          </div>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.categoryCard}>
              <div className={styles.catIcon}>{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features bar removed per request */}

      {/* --- Latest Products --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Latest Products</h3>
          <div className={styles.arrows}>
            <button><FaChevronLeft /></button>
            <button><FaChevronRight /></button>
          </div>
        </div>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageWrapper}>
                {product.discount && <span className={styles.badge}>{product.discount}</span>}
                <img src={product.img} alt={product.name} />
              </div>
              <div className={styles.productInfo}>
                <div className={styles.rating}>⭐⭐⭐⭐⭐</div>
                <h4>{product.name}</h4>
                <div className={styles.priceRow}>
                  {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice}</span>}
                  <span className={styles.price}>{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopPage;