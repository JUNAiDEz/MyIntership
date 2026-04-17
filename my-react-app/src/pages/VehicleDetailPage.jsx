import React, { useEffect, useState } from 'react';
import useCarModelsByBrand from '../hooks/useCarModelsByBrand';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { apiGet } from '../utils/api';

// Styles
import styles from './ServiceCards.module.css'; 

const API_URL = import.meta.env.VITE_API_URL;

const fetchVehicleBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/api/vehicles/master/models/slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return result.data;
  } catch (error) {}
  return null;
};

function VehicleDetailPage({ onLogout }) {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      const data = await fetchVehicleBySlug(slug);
      setVehicle(data);
      setLoading(false);

      if (data && data.car_model_id) {
        const serviceEndpoints = [
          '/api/services/film-protect/pricing',
          '/api/services/engine-spa/pricing',
          '/api/services/fluid-change/pricing',
          '/api/services/pipe-clean/pricing',
          '/api/services/aircon/pricing',
          '/api/services/alignment/pricing',
          '/api/services/ball-joints/pricing',
          '/api/services/shock-absorber/pricing',
          '/api/services/suspension/pricing',
          '/api/services/wheels-tires/pricing',
          '/api/services/upgrade/pricing',
          '/api/services/custom-exhaust/pricing',
          '/api/services/remap/pricing',
          '/api/services/valve-service/pricing',
          '/api/services/remote-control/pricing',
          '/api/services/boost-gauge/pricing',
          '/api/services/exhaust/pricing',
          '/api/services/sticker/pricing',
        ];

        let allServices = [];
        try {
            const allResults = await Promise.all(serviceEndpoints.map(ep => apiGet(ep)));
            allResults.forEach(serviceRes => {
            if (Array.isArray(serviceRes)) {
                serviceRes.forEach(group => {
                if (Array.isArray(group.models)) {
                    allServices.push(...group.models.filter(m => m.car_model_id === data.car_model_id));
                }
                });
            }
            });
        } catch (e) { console.error('Error fetching services', e); }
        
        setRelatedServices(allServices);
      } else {
        setRelatedServices([]);
      }
    };
    loadVehicle();
  }, [slug]);

  let displayData = null;
  let brandId = null;

  if (vehicle) {
    const images = Array.isArray(vehicle.images) && vehicle.images.length > 0
      ? vehicle.images.map(img => img.url || img.image_url)
      : [vehicle.image_url || '/images/no-image.png'];
    const brandName = vehicle.brand?.brand_name || '';
    const modelName = vehicle.model_name || '';
    const title = [brandName, modelName].filter(Boolean).join(' ');
    brandId = vehicle.brand_id;
    
    displayData = {
      title: title || '-',
      // แก้ให้เป็นค่าว่าง '' ถ้าไม่มี description (เดิมเป็น '-') เพื่อไม่ให้แสดงขีด
      description: vehicle.description || '', 
      variants: vehicle.variants || [],
      images,
      note: vehicle.note,
    };
  }

  const { models: brandModels } = useCarModelsByBrand(brandId);

  useEffect(() => {
    if (displayData && displayData.images.length > 0) {
      setActiveImage(displayData.images[0]);
    }
  }, [vehicle]);

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>
  );

  if (!displayData) return (
    <div className={styles.emptyState}>
      <h2>ไม่พบข้อมูลรถ</h2>
      <Link to="/vehicle-models" className={styles.btnSecondary}>กลับไปหน้ารุ่นรถ</Link>
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
            <Link to="/car">รุ่นรถทั้งหมด</Link>
            <span className={styles.sep}>/</span>
            <span className={styles.current}>{displayData.title}</span>
          </nav>

          <div className={styles.productLayout}>
            
            {/* Gallery Section */}
            <div className={styles.gallerySection}>
              <div className={styles.mainImageWrapper}>
                <img 
                  src={activeImage || '/images/no-image.png'} 
                  alt={displayData.title} 
                  className={styles.mainImage} 
                />
              </div>
              {displayData.images.length > 1 && (
                <div className={styles.thumbnailList}>
                  {displayData.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.thumbnailWrapper} ${activeImage === img ? styles.activeThumb : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`view ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className={styles.infoSection}>
              <h1 className={styles.productTitle}>{displayData.title}</h1>
              
              {/* Model Selection Area */}
              <div className={styles.modelSelectContainer}>
                
                {/* 1. ปุ่มหลัก: ย้อนกลับไปหน้ารวม */}
                <div className={styles.modelSelectTopRow}>
                    <Link to="/vehicle-models" className={styles.btnChangeModel}>
                        <span className={styles.iconBack}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                        </span>
                        <span>เลือกรถรุ่นอื่น</span>
                    </Link>
                    <span className={styles.modelHint}>ไม่ใช่รุ่นที่คุณต้องการ?</span>
                </div>

                {/* 2. รายชื่อรุ่นรถอื่นๆ ในยี่ห้อเดียวกัน */}
                {brandModels && brandModels.length > 1 && (
                  <div className={styles.siblingModelsList}>
                    {brandModels
                      .filter(m => m.car_model_id !== vehicle?.car_model_id)
                      .map(m => (
                        <Link
                          key={m.car_model_id}
                          to={`/vehicle/${m.slug}`}
                          className={styles.btnSiblingModel}
                        >
                          {m.model_name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              {/* Description: แสดงเฉพาะเมื่อมีข้อมูลจริงๆ จะได้ไม่โชว์เส้นเปล่าๆ */}
              {displayData.description && (
                <>
                  <p className={styles.description}>{displayData.description}</p>
                  <div className={styles.divider}></div>
                </>
              )}

              {/* Variants Section */}
              {displayData.variants.length > 0 && (
                <div className={styles.variantsWrapper}>
                  <h4 className={styles.sectionTitle}>ตัวเลือกที่มีจำหน่าย</h4>
                  <div className={styles.variantsList}>
                    {displayData.variants.map((v, i) => (
                      <div className={styles.variantRow} key={i}>
                        <div className={styles.variantInfo}>
                          <span className={styles.variantName}>{v.variant_name || 'Standard'}</span>
                          {v.sku && <span className={styles.skuBadge}>SKU: {v.sku}</span>}
                        </div>
                        <div className={styles.variantAction}>
                           <div className={styles.variantPriceGroup}>
                              <span className={styles.variantPrice}>{Number(v.unit_price).toLocaleString()}</span>
                              <span className={styles.variantUnit}>บาท</span>
                           </div>
                           <button className={styles.btnVariantBuy} disabled={v.stock_quantity === 0}>
                             {v.stock_quantity > 0 ? 'สนใจจอง' : 'สินค้าหมด'}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className={styles.servicesSection}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.headerTitle}>บริการแนะนำสำหรับรุ่นนี้</h4>
              <div className={styles.headerLine}></div>
            </div>

            {relatedServices.length === 0 ? (
              <div className={styles.emptyServices}>ยังไม่มีบริการเพิ่มเติมสำหรับรุ่นนี้</div>
            ) : (
              <div className={styles.servicesGrid}>
                {relatedServices
                  .filter(s => s.car_model_id === vehicle?.car_model_id && (s.stage || s.name) !== displayData.title)
                  .map((s, index) => (
                    <Link 
                      key={s.id || index} 
                      to={`/services/${s.service_slug || s.slug || s.stage || s.name}`} 
                      className={styles.serviceCard}
                    >
                      <div className={styles.cardBody}>
                        <div className={styles.iconWrapper}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                          </svg>
                        </div>
                        <h5 className={styles.serviceName}>{s.stage || s.name}</h5>
                        <p className={styles.servicePrice}>
                          {s.price ? Number(s.price).toLocaleString() : '-'} 
                          <span className={styles.currencyLabel}> THB</span>
                        </p>
                      </div>
                      <div className={styles.cardFooter}>
                         <span>ดูรายละเอียด</span>
                         <span className={styles.arrow}>&rarr;</span>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default VehicleDetailPage;