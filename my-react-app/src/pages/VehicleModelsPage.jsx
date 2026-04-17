import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './VehicleModelsPage.module.css';
import { apiGet } from '../utils/api';

const seo = {
  title: 'รุ่นรถยนต์ | GT7 Motor ศูนย์รวมข้อมูลรุ่นรถและบริการสำหรับรถยนต์ทุกประเภท',
  description: 'สำรวจข้อมูลรุ่นรถยนต์ยอดนิยมในไทย ทั้ง SUV, Sedan, Truck, Coupe, Van, Hatchback พร้อมบริการและโปรโมชั่นสำหรับรถแต่ละรุ่นจาก GT7 Motor',
  url: 'https://front.gt7dev.com/car',
  image: 'https://front.gt7dev.com/og-image-car.jpg'
};

function VehicleModelsPage() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [productCarModels, setProductCarModels] = useState([]);
  const [loadingProductCarModels, setLoadingProductCarModels] = useState(false);

  const [showFilters, setShowFilters] = useState(true);
  
  // 🔥 1. เพิ่ม State สำหรับตรวจสอบธีม (Light Mode)
  const [isLightMode, setIsLightMode] = useState(false);

  // 🔥 2. ดักจับการเปลี่ยนธีมแบบ Real-time
  useEffect(() => {
    // ฟังก์ชันเช็คว่าตอนนี้เป็น Light Mode หรือไม่ (รองรับหลายรูปแบบ)
    const checkTheme = () => {
      const isLight = 
        document.body.classList.contains('light-mode') || 
        document.body.classList.contains('light') ||
        document.documentElement.classList.contains('light-mode') ||
        document.documentElement.getAttribute('data-theme') === 'light' ||
        localStorage.getItem('theme') === 'light';
      setIsLightMode(isLight);
    };

    checkTheme(); // เช็คครั้งแรกตอนโหลดหน้า

    // ใช้ MutationObserver เพื่อดักจับตอนที่คุณกดปุ่มสลับธีม
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  }, []);

  useEffect(() => {
    const fetchBrandsAndModels = async () => {
      setLoading(true);
      setError(null);
      try {
        const [brandRes, modelRes] = await Promise.all([
          apiGet('/api/vehicles/master/brands'),
          apiGet('/api/vehicles/master/models'),
        ]);
        if (brandRes && brandRes.success && Array.isArray(brandRes.data)) {
          setBrands([{ brand_id: 'all', brand_name: 'All' }, ...brandRes.data]);
        } else {
          setBrands([{ brand_id: 'all', brand_name: 'All' }]);
        }
        if (modelRes && modelRes.success && Array.isArray(modelRes.data)) {
          setModels(modelRes.data);
        } else {
          setModels([]);
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลยี่ห้อ/รุ่นรถ');
        setBrands([{ brand_id: 'all', brand_name: 'All' }]);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandsAndModels();
  }, []);

  useEffect(() => {
    const filtered = selectedBrand === 'all' ? models : models.filter(m => m.brand_id === selectedBrand);
    if (filtered.length > 0) {
      setSelectedModel(filtered[0].car_model_id);
    } else {
      setSelectedModel(null);
    }
    setSelectedYear(null);
  }, [selectedBrand, models]);


  useEffect(() => {
    let mounted = true;
    if (!selectedModel) {
      if (mounted) {
        setProducts([]);
        setServices([]);
        setProductCarModels([]);
        setLoading(false);
        setLoadingProductCarModels(false);
      }
      return () => { mounted = false; };
    }
    const load = async () => {
      setLoading(true);
      setLoadingProductCarModels(true);
      setError(null);
      setProducts([]);
      setServices([]);
      setProductCarModels([]);
      try {
        const pcmRes = await apiGet(`/api/products/product-car-model/by-car-model/${selectedModel}`);
        if (pcmRes && pcmRes.success && Array.isArray(pcmRes.data)) {
          setProductCarModels(pcmRes.data);
        } else {
          setProductCarModels([]);
        }

        const prodRes = await apiGet(`/api/inventory/products?active=true&car_model_id=${encodeURIComponent(selectedModel)}`);

        const pricingEndpoints = [
          '/api/services/sticker/pricing',
          '/api/services/film-protect/pricing',
          '/api/services/valve-service/pricing',
          '/api/services/exhaust/pricing',
          '/api/services/boost-gauge/pricing',
          '/api/services/turbo-inter/pricing',
          '/api/services/remote-control/pricing',
          '/api/services/fluid-change/pricing',
          '/api/services/pipe-clean/pricing',
          '/api/services/aircon/pricing',
          '/api/services/engine-spa/pricing',
          '/api/services/alignment/pricing',
          '/api/services/ball-joints/pricing',
          '/api/services/shock-absorber/pricing',
          '/api/services/suspension/pricing',
          '/api/services/wheels-tires/pricing',
          '/api/services/upgrade/pricing',
          '/api/services/custom-exhaust/pricing',
          '/api/services/remap/pricing',
        ];

        const pricingResults = await Promise.all(
          pricingEndpoints.map(ep => apiGet(ep))
        );

        let allServices = [];
        pricingResults.forEach(result => {
          if (Array.isArray(result)) {
            result.forEach(group => {
              if (Array.isArray(group.models)) {
                allServices.push(...group.models.filter(m => m.car_model_id === selectedModel));
              }
            });
          }
        });

        if (!mounted) return;
        setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.items || []));
        setServices(allServices);
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า/บริการ');
      } finally {
        setLoading(false);
        setLoadingProductCarModels(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [selectedModel]);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      <Header />
      
      {/* 🔥 3. ใส่คลาส styles.lightMode ลงไปถ้าระบบตรวจสอบเจอว่าเป็นธีมสว่าง */}
      <main className={`${styles.container} ${isLightMode ? styles.lightMode : ''}`}>
        <div className={styles.layout}>
          
          <aside className={styles.sidebar}>
            <div 
              className={styles.filterHeaderToggle} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <h3>ค้นหาและกรอง</h3>
              <button className={styles.toggleBtn}>
                {showFilters ? 'ซ่อนตัวเลือก ▲' : 'แสดงตัวเลือก ▼'}
              </button>
            </div>

            {showFilters && (
              <div className={styles.filterContent}>
                
                <div className={styles.sidebarHeader} style={{ marginTop: '10px' }}>
                  <h3>เลือกยี่ห้อ</h3>
                </div>
                <div className={styles.brandsRow}>
                  {brands.map((b) => (
                    <button
                      key={b.brand_id}
                      className={styles.brandButton + (selectedBrand === b.brand_id ? ' ' + styles.brandSelected : '')}
                      onClick={() => setSelectedBrand(b.brand_id)}
                    >
                      {b.brand_name}
                    </button>
                  ))}
                </div>

                <div className={styles.sidebarHeader} style={{ marginTop: '20px' }}>
                  <h3>เลือกรุ่น</h3>
                </div>
                <div className={styles.modelsListWrapper}>
                  <div className={styles.modelsList}>
                    {models.length === 0 && <span>กำลังโหลดรุ่นรถ...</span>}
                    {models.filter(m => selectedBrand === 'all' || m.brand_id === selectedBrand).map((m) => (
                      <button
                        key={m.car_model_id}
                        className={styles.modelButton + (selectedModel === m.car_model_id ? ' ' + styles.modelSelected : '')}
                        onClick={() => setSelectedModel(m.car_model_id)}
                      >
                        {m.model_name} {m.brand?.brand_name ? `(${m.brand.brand_name})` : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedModel && (() => {
                  const model = models.find(m => m.car_model_id === selectedModel);
                  if (!model || !model.model_year) return null;
                  const years = Array.isArray(model.model_year) ? model.model_year : [model.model_year];
                  
                  return (
                    <>
                      <div className={styles.sidebarHeader} style={{ marginTop: '20px' }}>
                        <h3>เลือกปี</h3>
                      </div>
                      <div className={styles.yearsRow} style={{ borderTop: 'none', marginTop: '10px', paddingTop: 0 }}>
                        <div className={styles.yearsList}>
                          <button
                            type="button"
                            className={`${styles.yearButton} ${selectedYear === null ? styles.yearSelected : ''}`}
                            onClick={() => setSelectedYear(null)}
                          >
                            ทั้งหมด
                          </button>
                          {years.map((y) => (
                            <button
                              key={y}
                              type="button"
                              className={`${styles.yearButton} ${selectedYear === y ? styles.yearSelected : ''}`}
                              onClick={() => setSelectedYear(y)}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </aside>
          
          <section className={styles.content}>

            <div className={styles.contentSection}>
              <div className={styles.headerRow}>
                <h2>บริการและโปรโมชั่น</h2>
              </div>
              {!loading && !error && (
                <div className={styles.grid}>
                  {services.length === 0 && <div className={styles.empty}>ไม่พบโปรโมชั่นสำหรับรุ่นนี้</div>}
                  {services.map((s, idx) => (
                    <div key={s.id || `${s.stage}-${idx}`} className={styles.card}>
                      <div className={styles.cardImage}>
                        {s.service_img && typeof s.service_img === 'string' && s.service_img.trim() !== '' ? (
                          s.service_img.startsWith('http') ? (
                            <img src={s.service_img} alt={s.stage || s.name} />
                          ) : (
                            <img src={`${API_URL}${s.service_img}`} alt={s.stage || s.name} />
                          )
                        ) : (
                          <div className={styles.placeholder}>No image</div>
                        )}
                        <div className={styles.priceTag}>฿{s.price ? s.price.toLocaleString() : '-'}</div>
                      </div>
                      <div className={styles.cardBody}>
                        <h4 className={styles.cardTitle}>{s.stage || s.name}</h4>
                        <div className={styles.cardFooter}>
                          {(() => {
                            const selectedCarModel = models.find(m => m.car_model_id === selectedModel);
                            const carModelSlug = selectedCarModel?.slug;
                            if (carModelSlug) {
                              return (
                                <Link to={`/vehicle/${carModelSlug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }} target="_blank" rel="noopener noreferrer">
                                  <button className={styles.cardBtnSecondary} type="button">จองคิว</button>
                                </Link>
                              );
                            }
                            return <button className={styles.cardBtnSecondary} disabled>จองคิว</button>;
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.contentSection}>
              <div className={styles.headerRow}>
                <h2>สินค้าที่เกี่ยวข้อง</h2>
              </div>
              {loading && <div className={styles.hint}>กำลังโหลดข้อมูล...</div>}
              {error && <div className={styles.hintError}>เกิดข้อผิดพลาด: {error}</div>}
              {!loadingProductCarModels && !error && (
                <div className={styles.grid}>
                  {productCarModels.length === 0 && <div className={styles.empty}>ไม่พบสินค้าสำหรับรุ่นนี้</div>}
                  {productCarModels.map((pcm) => {
                    const pt = pcm.product_template;
                    const imgUrl = pt?.images?.[0]?.image_url;
                    const slug = pt?.slug || pt?.product_template_id;
                    return (
                      <Link
                        key={pcm.product_template_id + '-' + pcm.car_model_id}
                        to={slug ? `/shop/${slug}` : '#'}
                        className={styles.card}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className={styles.cardImage}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={pt?.product_name || '-'} />
                          ) : <div className={styles.placeholder}>No image</div>}
                          <div className={styles.priceTag}>฿{pcm.price ? Number(pcm.price).toLocaleString() : '-'}</div>
                        </div>
                        <div className={styles.cardBody}>
                          <h4 className={styles.cardTitle}>{pt?.product_name || '-'}</h4>
                          <div style={{ fontSize: '0.9em', color: '#888', marginBottom: 4 }}>หมายเหตุ: {pcm.note || '-'}</div>
                          <div className={styles.cardFooter}>
                             <button className={styles.cardBtn}>ดูสินค้า</button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default VehicleModelsPage;