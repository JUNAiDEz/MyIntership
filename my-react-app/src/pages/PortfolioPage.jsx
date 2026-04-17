import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './PortfolioPage.module.css'; // Import CSS ใหม่
import { apiGet } from '../utils/api';
import { FaArrowRight } from 'react-icons/fa';

// --- Sub-Components ---

const PortfolioFilter = ({ services, activeFilter, onFilterChange }) => (
  <div className={styles.filterContainer}>
    {services.map(service => (
      <button
        key={service}
        className={activeFilter === service ? styles.filterActive : styles.filterButton}
        onClick={() => onFilterChange(service)}
      >
        {service}
      </button>
    ))}
  </div>
);

// การ์ดแบบ Cinematic (รูปเต็มใบ)
const PortfolioCard = ({ car }) => (
  <Link to={`/portfolio/${car.slug}`} className={styles.projectCard}>
    {/* รูปภาพพื้นหลัง */}
    <img 
      src={car.image || 'https://via.placeholder.com/400x300'} 
      alt={car.title} 
      className={styles.cardImage} 
      loading="lazy"
    />
    
    {/* Overlay สีดำที่จะโผล่มาตอน Hover */}
    <div className={styles.cardOverlay}>
      <div className={styles.cardContent}>
        {/* Tags Categories */}
        <div className={styles.tags}>
             {car.services.slice(0, 2).map((s, i) => (
                 <span key={i} className={styles.tag}>{s.title}</span>
             ))}
        </div>

        <h3 className={styles.cardTitle}>{car.title}</h3>
        <span className={styles.cardModel}>
           {car.model} {car.year && `• ${car.year}`}
        </span>

        <div className={styles.viewBtn}>
           VIEW PROJECT <FaArrowRight />
        </div>
      </div>
    </div>
  </Link>
);

const seo = {
  title: 'PORTFOLIO | GT7 MOTORSPORT ผลงานของเรา',
  description: 'รวมผลงานการปรับแต่ง ซ่อมบำรุง และติดตั้งอุปกรณ์รถยนต์ระดับพรีเมียม',
  url: 'https://front.gt7dev.com/portfolio',
  image: 'https://front.gt7dev.com/og-image-portfolio.jpg'
};

// --- Main Component ---

export default function PortfolioPage({ onLogout }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Load Data
  useEffect(() => {
    setLoading(true);
    apiGet('/api/portfolio/projects')
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setCars(res.data.map(p => ({
            id: p.project_id || p.id,
            slug: p.slug,
            title: p.title,
            year: p.completion_date ? new Date(p.completion_date).getFullYear() : p.year,
            model: p.car_model?.model_name || p.model || 'Custom Build',
            image: p.cover_image_url || p.image,
            summary: p.description || p.summary || '',
            services: (p.categories || p.services || []).map(c => ({ id: c.portfolio_category_id || c.id, title: c.category_name || c.title })),
          })));
        } else {
          setCars([]);
        }
        setLoading(false);
      })
      .catch(() => {
        // Mock Data เผื่อ API ยังไม่พร้อม (ลบออกได้ถ้าไม่ใช้)
        // setCars([
        //     { id:1, slug:'porsche-911', title:'Porsche 911 GT3', model:'911 GT3', year:'2023', image:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', services:[{title:'Wrap'}, {title:'Tuning'}] },
        //     { id:2, slug:'gtr-r35', title:'Nissan GTR R35 Widebody', model:'GTR R35', year:'2022', image:'https://images.unsplash.com/photo-1600706432502-78b9ad43229b?w=800', services:[{title:'Body Kit'}, {title:'Suspension'}] },
        // ]);
        setCars([]); 
        setLoading(false);
      });
  }, []);

  // Filter Logic
  const allServices = useMemo(() => {
    const services = new Set();
    cars.forEach(car => {
      car.services.forEach(service => services.add(service.title));
    });
    return ['All', ...Array.from(services).sort()];
  }, [cars]);

  const filteredCars = useMemo(() => {
    if (activeFilter === 'All') return cars;
    return cars.filter(car =>
      car.services.some(service => service.title === activeFilter)
    );
  }, [cars, activeFilter]);


  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />

        <main>
          {/* Hero Header */}
          <div className={styles.heroHeader}>
             <div className={styles.heroOverlay}></div>
             <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>OUR <span>MASTERPIECES</span></h1>
                <p className={styles.heroSubtitle}>
                    ผลงานความภูมิใจที่เราบรรจงสร้างสรรค์เพื่อรถคันโปรดของคุณ 
                    ด้วยมาตรฐานระดับสากลและความใส่ใจในทุกรายละเอียด
                </p>
             </div>
          </div>

          {/* Filters */}
          <PortfolioFilter
            services={allServices}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Grid Layout */}
          <div className={styles.portfolioGrid}>
            {loading && <p className={styles.loadingMessage}>Loading Projects...</p>}
            
            {!loading && filteredCars.length === 0 && (
              <div className={styles.emptyState}>
                <p>No projects found in this category.</p>
                <button onClick={() => setActiveFilter('All')} style={{background:'none', border:'1px solid #ffc709', color:'#ffc709', padding:'8px 20px', cursor:'pointer', marginTop:'10px'}}>
                   View All Projects
                </button>
              </div>
            )}
            
            {!loading && filteredCars.map(car => (
               <PortfolioCard key={car.id} car={car} />
            ))}
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}