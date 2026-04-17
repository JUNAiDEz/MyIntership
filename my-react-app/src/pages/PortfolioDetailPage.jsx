import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PortfolioDetailPage.module.css'; 
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { apiGet } from '../utils/api';

export default function PortfolioDetailPage({ onLogout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherProjects, setOtherProjects] = useState([]);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0); // เลื่อนขึ้นบนสุดเมื่อเปลี่ยนหน้า

    // Fetch Main Project
    apiGet(`/api/portfolio/projects?slug=${slug}`)
      .then(res => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const p = res.data[0];
          setCar({
            id: p.project_id || p.id,
            slug: p.slug,
            title: p.title,
            year: p.completion_date ? new Date(p.completion_date).getFullYear() : p.year,
            model: p.car_model?.model_name || p.model,
            image: p.cover_image_url || p.image,
            summary: p.description || p.summary,
            services: (p.categories || p.services || []).map(c => ({ 
                id: c.portfolio_category_id || c.id, 
                title: c.category_name || c.title 
            })),
            gallery: (p.gallery || []).map(g => g.image_url || g)
          });
        } else {
          setCar(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setCar(null);
        setLoading(false);
      });

    // Fetch Other Projects
    apiGet('/api/portfolio/projects?limit=4') // Limit 4 กำลังสวยสำหรับ Grid
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setOtherProjects(res.data.filter(p => p.slug !== slug).slice(0, 3)); // หั่นให้เหลือ 3 อันพอดีแถว
        } else {
          setOtherProjects([]);
        }
      })
      .catch(() => setOtherProjects([]));
  }, [slug]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <div className={styles.loadingSpinner}></div>
                <h2 className={styles.loadingText}>กำลังโหลดผลงาน...</h2>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Not Found State ---
  if (!car) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <h2 className={styles.errorText}>ไม่พบผลงานนี้</h2>
                <button className={styles.btnPrimary} onClick={() => navigate('/portfolio')}>
                    ← กลับหน้ารวมผลงาน
                </button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className={styles.pageWrapper}>
      <Header onLogout={onLogout} />
      <main className={styles.mainContent}>
        
        {/* Main Detail Card */}
        <div className={styles.detailContainer}>
            {/* Top Image Area */}
            <div className={styles.imageWrapper}>
                <img src={car.image} alt={car.title} className={styles.detailImage} />
                <div className={styles.imageOverlayBadge}>
                    {car.model} | {car.year}
                </div>
            </div>

            <div className={styles.detailBody}>
              <h1 className={styles.detailTitle}>{car.title}</h1>
              
              <div className={styles.divider}></div>

              <p className={styles.detailSummary}>{car.summary}</p>
              
              {/* Services Tags */}
              <div className={styles.metaSection}>
                  <h4 className={styles.sectionHeader}>SERVICES PERFORMED</h4>
                  <ul className={styles.serviceList}>
                    {car.services.map((s) => <li key={s.id}>{s.title}</li>)}
                  </ul>
              </div>

              {/* Gallery Grid */}
              {car.gallery && car.gallery.length > 0 && (
                <div className={styles.gallerySection}>
                  <h4 className={styles.sectionHeader}>PROJECT GALLERY</h4>
                  <div className={styles.galleryGrid}>
                    {car.gallery.map((img, i) => (
                      <div key={i} className={styles.galleryItem}>
                          <img src={img} alt={`${car.title} ${i+1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actionArea}>
                  <button className={styles.btnPrimary} onClick={() => navigate('/portfolio')}>
                    ← ดูผลงานทั้งหมด
                  </button>
              </div>
            </div>
        </div>

        {/* Other Projects Grid */}
        {otherProjects.length > 0 && (
          <section className={styles.otherSection}>
            <h2 className={styles.otherTitle}>
              ผลงานอื่นๆ ที่น่าสนใจ
            </h2>
            <div className={styles.otherGrid}>
              {otherProjects.map((p) => (
                <div
                  key={p.id}
                  className={styles.otherCard}
                  onClick={() => navigate(`/portfolio/${p.slug}`)}
                >
                  <div className={styles.otherCardImageWrapper}>
                    <img
                      src={p.cover_image_url || p.image || 'https://via.placeholder.com/348x228'}
                      alt={p.title}
                    />
                  </div>
                  <div className={styles.otherCardContent}>
                    <div className={styles.otherCardTitle}>{p.title}</div>
                    <div className={styles.otherCardSubtitle}>
                        {p.car_model?.model_name || p.model}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}