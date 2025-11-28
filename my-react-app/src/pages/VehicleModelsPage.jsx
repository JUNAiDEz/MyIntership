import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './VehicleModelsPage.module.css';
import { apiGet } from '../utils/api';
import { getImageUrl } from '../utils/productHelpers';

// Mock Data
const BODY_TYPES = [
  { id: 'suv', label: 'SUV' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'truck', label: 'Truck' },
  { id: 'coupe', label: 'Coupe' },
  { id: 'van', label: 'Van' },
  { id: 'hatchback', label: 'Hatchback' },
];

const TYPE_MODELS = {
  suv: [
    { id: 'toyota-rav4', label: 'Toyota RAV4' },
    { id: 'honda-cr-v', label: 'Honda CR-V' },
    { id: 'nissan-xtrail', label: 'Nissan X-Trail' },
    { id: 'ford-escape', label: 'Ford Escape' },
    { id: 'bmw-x5', label: 'BMW X5' },
  ],
  sedan: [
    { id: 'honda-civic', label: 'Honda Civic' },
    { id: 'toyota-corolla', label: 'Toyota Corolla' },
    { id: 'bmw-3series', label: 'BMW 3 Series' },
    { id: 'mercedes-cclass', label: 'Mercedes C-Class' },
  ],
  truck: [
    { id: 'toyota-hilux', label: 'Toyota Hilux' },
    { id: 'ford-f150', label: 'Ford F-150' },
    { id: 'chevrolet-silverado', label: 'Chevrolet Silverado' },
  ],
  coupe: [
    { id: 'bmw-4series', label: 'BMW 4 Series' },
    { id: 'audi-tt', label: 'Audi TT' },
    { id: 'ford-mustang', label: 'Ford Mustang' },
  ],
  van: [
    { id: 'toyota-hiace', label: 'Toyota Hiace' },
    { id: 'mercedes-vito', label: 'Mercedes Vito' },
    { id: 'nissan-elder', label: 'Nissan NV200' },
  ],
  hatchback: [
    { id: 'vw-golf', label: 'Volkswagen Golf' },
    { id: 'honda-fit', label: 'Honda Fit / Jazz' },
    { id: 'toyota-yaris', label: 'Toyota Yaris' },
  ],
};

// Per-model available years (mocked)
const MODEL_YEARS = {
  'toyota-rav4': [2010, 2015, 2020, 2023],
  'honda-cr-v': [2008, 2012, 2018, 2021],
  'nissan-xtrail': [2011, 2016, 2019],
  'ford-escape': [2013, 2017, 2022],
  'bmw-x5': [2009, 2014, 2019, 2022],
  'honda-civic': [2006, 2010, 2016, 2020],
  'toyota-corolla': [2005, 2010, 2014, 2019],
  'bmw-3series': [2008, 2012, 2016, 2021],
  'mercedes-cclass': [2007, 2013, 2018, 2022],
  'toyota-hilux': [2010, 2015, 2020],
  'ford-f150': [2009, 2014, 2018, 2021],
  'chevrolet-silverado': [2011, 2016, 2020],
  'bmw-4series': [2014, 2018, 2021],
  'audi-tt': [2007, 2010, 2015, 2019],
  'ford-mustang': [2010, 2015, 2020, 2022],
  'toyota-hiace': [2008, 2012, 2017, 2020],
  'mercedes-vito': [2011, 2016, 2020],
  'nissan-elder': [2010, 2014, 2018],
  'vw-golf': [2005, 2010, 2015, 2019],
  'honda-fit': [2007, 2011, 2016, 2020],
  'toyota-yaris': [2009, 2013, 2018, 2021],
};

// Brands list shown above the types
const BRANDS = [
  { id: 'all', label: 'All' },
  { id: 'toyota', label: 'Toyota' },
  { id: 'honda', label: 'Honda' },
  { id: 'nissan', label: 'Nissan' },
  { id: 'mazda', label: 'Mazda' },
  { id: 'ford', label: 'Ford' },
  { id: 'bmw', label: 'BMW' },
  { id: 'mercedes', label: 'Mercedes' },
  { id: 'audi', label: 'Audi' },
  { id: 'chevrolet', label: 'Chevrolet' },
  { id: 'vw', label: 'Volkswagen' },
  { id: 'hyundai', label: 'Hyundai' },
  { id: 'kia', label: 'Kia' },
];

// Temporary mock data to display while API data is not available
const USE_MOCK = true;

// Generate comprehensive mock products and services per model/year
const ALL_MODELS = Object.values(TYPE_MODELS).flat();

const MOCK_PRODUCTS = ALL_MODELS.flatMap((m) => {
  const years = MODEL_YEARS[m.id] || [2020];
  return years.map((y, idx) => ({
    id: `${m.id}-p-${y}`,
    name: `${m.label} - อะไหล่ชุดที่ ${idx + 1} (${y})`,
    img: '',
    model: m.id,
    year: y,
    price: 500 + idx * 250,
    description: `อะไหล่สำหรับ ${m.label} ปี ${y}`,
  }));
});

const MOCK_SERVICES = ALL_MODELS.flatMap((m) => {
  const years = MODEL_YEARS[m.id] || [2020];
  return years.map((y, idx) => ({
    id: `${m.id}-s-${y}`,
    name: `${m.label} - บริการ ${idx === 0 ? 'เช็คระยะ' : 'เปลี่ยนถ่าย'} (${y})`,
    model: m.id,
    year: y,
    durationMin: idx === 0 ? 60 : 90,
    price: 300 + idx * 150,
    description: `บริการสำหรับ ${m.label} ปี ${y}`,
  }));
});

function VehicleModelsPage() {
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0].id);
  const [selectedType, setSelectedType] = useState(BODY_TYPES[0].id);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  // Set default model when type or brand changes
  useEffect(() => {
    const models = TYPE_MODELS[selectedType] || [];
    // apply brand filter if not 'all'
    const filtered = selectedBrand && selectedBrand !== 'all'
      ? models.filter((m) => m.id.startsWith(selectedBrand))
      : models;

    if (filtered && filtered.length > 0) {
      setSelectedModel(filtered[0].id);
    } else {
      setSelectedModel(null);
    }
  }, [selectedType, selectedBrand]);
  useEffect(() => {
    let mounted = true;

    if (!selectedModel) {
      if (mounted) {
        setProducts([]);
        setServices([]);
        setLoading(false);
      }
      return () => { mounted = false; };
    }

    const load = async () => {
      if (USE_MOCK) {
        const filteredProducts = MOCK_PRODUCTS.filter((p) =>
          matchesModel(p.model || p, selectedModel) && (selectedYear ? p.year === selectedYear : true)
        );
        const filteredServices = MOCK_SERVICES.filter((s) =>
          matchesModel(s.model || s, selectedModel) && (selectedYear ? s.year === selectedYear : true)
        );

        if (mounted) {
          setProducts(filteredProducts.map(normalizeProductFromMock));
          setServices(filteredServices.map(normalizeServiceFromMock));
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoading(true);
        setError(null);
        setProducts([]);
        setServices([]);
      }

      try {
        const yearQuery = selectedYear ? `&year=${selectedYear}` : '';
        const prodRes = await apiGet(`/api/inventory/products?active=true&vehicleModel=${encodeURIComponent(selectedModel)}${yearQuery}`).catch(() => null);
        const servRes = await apiGet(`/api/services?active=true&vehicleModel=${encodeURIComponent(selectedModel)}${yearQuery}`).catch(() => null);

        if (!mounted) return;

        if (Array.isArray(prodRes) && prodRes.length > 0) {
          setProducts(prodRes.map(normalizeProduct));
        } else {
          const all = await apiGet('/api/inventory/products?active=true').catch(() => []);
          const list = Array.isArray(all) ? all : (all.items || all || []);
          const filtered = list.filter((p) => matchesModel(p, selectedModel) && (selectedYear ? (p.year === selectedYear) : true)).map(normalizeProduct);
          setProducts(filtered);
        }

        if (Array.isArray(servRes) && servRes.length > 0) {
          setServices(servRes.map(normalizeService));
        } else {
          const allS = await apiGet('/api/services').catch(() => []);
          const listS = Array.isArray(allS) ? allS : (allS.items || allS || []);
          const filteredS = listS.filter((s) => matchesModel(s, selectedModel) && (selectedYear ? (s.year === selectedYear) : true)).map(normalizeService);
          setServices(filteredS);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [selectedModel, selectedYear]);

  function matchesModel(item, modelStr) {
    try {
      const json = JSON.stringify(item).toLowerCase();
      return json.includes(modelStr.toLowerCase()) || json.includes(modelStr.replace(/[-_]/g, ' ').toLowerCase());
    } catch (e) {
      return false;
    }
  }

  function normalizeProduct(p) {
    const title = p.product_name || p.title || p.name || p.product_name_en || '';
    const img = getImageUrl((p.images && (p.images[0]?.image_url || p.images[0]?.url)) || p.imageUrl || p.image_url || '');
    return { id: p.id || p.product_id || p.product_template_id, name: title, raw: p, img };
  }

  function normalizeService(s) {
    const title = s.title || s.service_name || s.name || '';
    const img = s.imageUrl || s.image_url || '';
    return { id: s.id || s.service_id, name: title, raw: s, img };
  }

  // Normalizers for mock data shapes
  function normalizeProductFromMock(p) {
    return { id: p.id, name: p.name, raw: p, img: p.img || '' };
  }

  function normalizeServiceFromMock(s) {
    return { id: s.id, name: s.name, raw: s };
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.container}>
        {/* ส่วนที่ 1: ประเภทของรถ (Top Row) */}
        <div className={styles.topSection}>
          <h2 className={styles.sectionTitle}>ประเภทของรถ</h2>
            {/* Brands row above types */}
            <div className={styles.brandsRow}>
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`${styles.brandButton} ${selectedBrand === b.id ? styles.brandSelected : ''}`}
                  onClick={() => setSelectedBrand(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className={styles.typesRow}>
              {BODY_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.typeButton} ${selectedType === t.id ? styles.typeSelected : ''}`}
                  onClick={() => setSelectedType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
        </div>

        {/* ส่วนที่ 2: Layout 2 คอลัมน์ (ซ้าย: รุ่นรถ, ขวา: สินค้า/บริการ) */}
        <div className={styles.layout}>
          
          {/* Sidebar ซ้าย: รุ่นของรถ */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h3>รุ่นของรถ</h3>
              <span className={styles.selectedTypeLabel}>({BODY_TYPES.find(t => t.id === selectedType)?.label})</span>
            </div>
            
            <div className={styles.modelsList}>
              {((TYPE_MODELS[selectedType] || []).filter((m) => {
                if (!selectedBrand || selectedBrand === 'all') return true;
                return m.id.startsWith(selectedBrand);
              })).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.modelButton} ${selectedModel === m.id ? styles.modelSelected : ''}`}
                  onClick={() => setSelectedModel(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {selectedModel && MODEL_YEARS[selectedModel] && (
              <div className={styles.yearsRow}>
                <h4 className={styles.yearsLabel}>ปีที่ผลิต</h4>
                <div className={styles.yearsList}>
                  <button
                    type="button"
                    className={`${styles.yearButton} ${selectedYear === null ? styles.yearSelected : ''}`}
                    onClick={() => setSelectedYear(null)}
                  >
                    ทุกปี
                  </button>
                  {MODEL_YEARS[selectedModel].map((y) => (
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
            )}
          </aside>

          {/* Content ขวา: สินค้าและบริการ */}
          <section className={styles.content}>
            
            {/* สินค้าที่เกี่ยวข้อง */}
            <div className={styles.contentSection}>
              <div className={styles.headerRow}>
                <h2>สินค้าที่เกี่ยวข้อง</h2>
              </div>

              {loading && <div className={styles.hint}>กำลังโหลดข้อมูล...</div>}
              {error && <div className={styles.hintError}>เกิดข้อผิดพลาด: {error}</div>}

              {!loading && !error && (
                <div className={styles.grid}>
                  {products.length === 0 && <div className={styles.empty}>ไม่พบสินค้าสำหรับรุ่นนี้</div>}
                  {products.map((p) => (
                    <div key={p.id} className={styles.card}>
                      <div className={styles.cardImage}>
                        {p.img ? <img src={p.img} alt={p.name} /> : <div className={styles.placeholder}>No image</div>}
                      </div>
                      <div className={styles.cardBody}>
                        <h4 className={styles.cardTitle}>{p.name}</h4>
                        <button className={styles.cardBtn}>ดูรายละเอียด</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* โปรโมชั่น/บริการที่เกี่ยวข้อง */}
            <div className={styles.contentSection}>
              <div className={styles.headerRow}>
                <h2>โปรโมชั่นที่เกี่ยวข้อง</h2>
              </div>
              
              {!loading && !error && (
                <div className={styles.grid}>
                  {services.length === 0 && <div className={styles.empty}>ไม่พบโปรโมชั่นสำหรับรุ่นนี้</div>}
                  {services.map((s) => (
                    <div key={s.id} className={styles.card}>
                      <div className={styles.cardImage}>
                        {s.img ? <img src={s.img} alt={s.name} /> : <div className={styles.placeholder}>No image</div>}
                      </div>
                      <div className={styles.cardBody}>
                        <h4 className={styles.cardTitle}>{s.name}</h4>
                        <button className={styles.cardBtn}>ดูรายละเอียด</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VehicleModelsPage;