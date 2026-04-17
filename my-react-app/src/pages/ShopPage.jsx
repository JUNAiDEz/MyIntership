import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/api';
// import { getImageUrl, calculatePrices } from '../utils/productHelpers'; // (Uncomment เมื่อใช้งานจริง)
import styles from './ShopPage.module.css';
import Header from '../components/Layout/Header';
import Slider from 'react-slick';
import Footer from '../components/Layout/Footer';
import { 
  FaChevronRight,
  FaChevronLeft,
  FaTools,
  FaCarBattery,
  FaCogs,
  FaOilCan,
  FaCompactDisc,
  FaCar
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

// Mock function for demo (ลบออกเมื่อใช้จริง)
const getImageUrl = (url) => url;
const calculatePrices = ({ price, discount }) => {
  const discounted = price - (price * (discount / 100));
  return { displayPrice: discounted.toLocaleString(), displayOldPrice: price.toLocaleString() };
};

const ShopPage = ({ onLogout }) => {
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
  const skeletonCount = 8;

  // ดึงข้อมูล Product จริงจาก backend
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // ใช้ endpoint ที่ backend รองรับจริง
        const raw = await apiGet('/api/inventory/products?active=true');
        // สมมติ raw เป็น array ของ products
        const mapped = Array.isArray(raw)
          ? raw.map((item) => {
              let img = 'https://pngimg.com/uploads/car_wheel/car_wheel_PNG23316.png';
              if (item.images && item.images.length > 0) {
                // หา image ที่เป็น primary ถ้ามี
                const primary = item.images.find(img => img.is_primary);
                img = primary ? primary.image_url : item.images[0].image_url;
              }
              return {
                id: item.product_template_id || item.id,
                name: item.product_name || item.name,
                price: item.price ? `฿${item.price}` : '',
                oldPrice: item.old_price ? `฿${item.old_price}` : '',
                discount: item.discount_percent ? `${item.discount_percent}% OFF` : '',
                img,
                raw: item,
              };
            })
          : [];
        if (mounted) setProducts(mapped);
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดสินค้า');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const sliderSettings = {
    dots: false, // ปิดจุดไข่ปลาให้ดูคลีน
    infinite: true,
    speed: 600,
    slidesToShow: 3, // โชว์ 3 banner ถ้าจอใหญ่
    slidesToScroll: 1,
    arrows: false, // ซ่อนลูกศร default แล้วใช้ custom arrow (ถ้าต้องการ) หรือเปิด true
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: true } }
    ]
  };

  const seo = {
    title: 'SHOP | GT7 MOTORSPORT',
    description: 'ศูนย์รวมอะไหล่และอุปกรณ์แต่งรถยนต์ High Performance',
    url: 'https://front.gt7dev.com/shop',
    image: 'https://front.gt7dev.com/og-image-shop.jpg'
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        {/* Meta tags... */}
      </Helmet>
      
      <div className={styles.pageWrapper}>
        
        <div className={styles.stickyNav}>
          <Header onLogout={onLogout} />
        </div>

          {/* --- Hero Section (ปรับปรุงข้อความและ Button) --- */}
          <section
            className={styles.hero}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: 500,
              display: 'flex',
              alignItems: 'center',
              padding: '0 5%',
            }}
          >
            <div className={styles.heroContent}>
              <h4 style={{color:'#ffc709', letterSpacing:'2px', fontWeight:'bold'}}>PREMIUM AUTO PARTS</h4>
              <h1>CUSTOM WIDE <br/><span style={{color:'transparent', WebkitTextStroke:'2px #fff'}}>BODY KITS</span></h1>
              <p style={{color:'#aaa', maxWidth:'500px', marginBottom:'20px'}}>
                ยกระดับสมรรถนะและความสวยงามให้รถของคุณด้วยชุดแต่งระดับโลก
                จาก GT7 MOTORSPORT ตัวแทนจำหน่ายอย่างเป็นทางการ
              </p>
              <button className={styles.btnPrimary}>EXPLORE NOW</button>
            </div>
          </section>

        <div className={styles.container}>

          {/* --- Banners Section (ดันขึ้นมาทับ Hero นิดๆ) --- */}
          <section className={`${styles.section} ${styles.bannerSliderWrapper}`}>
            <Slider {...sliderSettings}>
                {/* Banner 1 */}
                <div className={styles.slideItem}>
                   <div className={styles.banner} style={{ backgroundImage: `url('/images/FeatureBar/sdw.jpg')`, backgroundSize:'cover' }}>
                     <div className={styles.bannerOverlay} />
                     <div className={styles.bannerText}>
                       <span style={{color:'#ccc'}}>New Collection</span>
                       <h2>WHEELS</h2>
                       <button className={styles.btnPrimary} style={{padding:'8px 20px', fontSize:'0.8rem'}}>View</button>
                     </div>
                   </div>
                </div>
                {/* Banner 2 */}
                <div className={styles.slideItem}>
                   <div className={styles.banner} style={{ backgroundImage: `url('/images/FeatureBar/turbo.jpg')`, backgroundSize:'cover' }}>
                     <div className={styles.bannerOverlay} />
                     <div className={styles.bannerText}>
                       <span style={{color:'#ffc709'}}>Limited Offer</span>
                       <h2>TURBO KITS</h2>
                       <button className={styles.btnPrimary} style={{padding:'8px 20px', fontSize:'0.8rem'}}>View</button>
                     </div>
                   </div>
                </div>
                 {/* Banner 3 */}
                 <div className={styles.slideItem}>
                   <div className={styles.banner} style={{ backgroundImage: `url('/images/FeatureBar/exhaust.jpg')`, backgroundSize:'cover' }}>
                     <div className={styles.bannerOverlay} />
                     <div className={styles.bannerText}>
                       <span style={{color:'#ccc'}}>Performance</span>
                       <h2>EXHAUST</h2>
                       <button className={styles.btnPrimary} style={{padding:'8px 20px', fontSize:'0.8rem'}}>View</button>
                     </div>
                   </div>
                </div>
            </Slider>
          </section>

          {/* --- Shop By Department --- */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Shop By <span style={{color:'#ffc709'}}>Category</span></h3>
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

          {/* --- Latest Products --- */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Latest <span style={{color:'#ffc709'}}>Arrivals</span></h3>
              <div className={styles.arrows}>
                 <Link to="/shop/all" style={{fontSize:'0.9rem', color:'#fff', textDecoration:'none', marginRight:'15px'}}>VIEW ALL</Link>
              </div>
            </div>
            
            {loading && (
              <div className={styles.productGrid}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} className={`${styles.productCard} ${styles.skeletonCard}`}>
                    <div className={styles.productImageWrapper} />
                    <div className={styles.productInfo}>
                      <div className={styles.skeletonLine} style={{width:'80%'}} />
                      <div className={styles.skeletonLine} style={{width:'40%'}} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && (
                <div className={styles.productGrid}>
                {products.map((product) => (
                    <Link
                    key={product.id}
                    to={`/shop/${product.raw.slug}`}
                    className={styles.productCard}
                    >
                    <div className={styles.productImageWrapper}>
                        {product.discount && <span className={styles.badge}>{product.discount}</span>}
                        {/* ใส่เงาใต้รูปรถ/อะไหล่ เพื่อความสมจริง */}
                        <div style={{position:'absolute', bottom:'10%', width:'70%', height:'20px', background:'black', filter:'blur(15px)', opacity:0.6, borderRadius:'50%'}}></div>
                        <img src={product.img} alt={product.name} />
                    </div>
                    <div className={styles.productInfo}>
                        <h4>{product.name}</h4>
                        <div className={styles.priceRow}>
                            <span className={styles.price}>{product.price}</span>
                            {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice}</span>}
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            )}
          </section>

        </div> {/* End .container */}
        
        <Footer />
        
      </div>
    </>
  );
};

export default ShopPage;