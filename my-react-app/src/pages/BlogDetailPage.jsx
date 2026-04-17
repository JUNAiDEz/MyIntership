import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './BlogDetailPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogDetailPage({ onLogout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherBlogs, setOtherBlogs] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0); // ให้เลื่อนขึ้นบนสุดเสมอเวลาเปลี่ยนหน้า
    
    // Fetch Current Blog
    fetch(`${API_URL}/api/blog?slug=${slug}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setBlog(result.data[0]);
        } else {
          setBlog(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });

    // Fetch Other Blogs
    fetch(`${API_URL}/api/blog?published=true&limit=4`) 
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setOtherBlogs(result.data.filter(b => b.slug !== slug).slice(0, 3)); // เอาแค่ 3 บทความให้พอดี Grid
        } else {
          setOtherBlogs([]);
        }
      })
      .catch(() => setOtherBlogs([]));
  }, [slug]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <div className={styles.loadingSpinner}></div>
                <h2 className={styles.loadingText}>กำลังเตรียมบทความ...</h2>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
            <div className={styles.stateContainer}>
                <h2 className={styles.errorText}>{error}</h2>
                <button className={styles.btnPrimary} onClick={() => navigate('/blog')}>
                    ← กลับหน้ารวมบทความ
                </button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Not Found State ---
  if (!blog) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.stateContainer}>
            <h2 className={styles.errorText}>ไม่พบบทความนี้</h2>
            <button className={styles.btnPrimary} onClick={() => navigate('/blog')}>
                ← กลับหน้ารวมบทความ
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
      
      {/* Hero Banner ด้านบนสุด (ทำให้ดูเป็นนิตยสารรถยนต์) */}
      <div className={styles.heroBanner}>
          <img
            src={blog.image_url || 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?q=80&w=1920&auto=format&fit=crop'}
            alt={blog.title}
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
      </div>

      <main className={styles.mainContent}>
        {/* Main Article Card (กล่องเนื้อหาที่ลอยขึ้นมาทับรูป) */}
        <article className={styles.detailContainer}>
          <div className={styles.detailBody}>
            
            {/* Meta Info */}
            <div className={styles.metaContainer}>
               <div className={styles.categoryTag}>GT7 BLOG</div>
               {blog.published_at && (
                <span className={styles.publishDate}>
                  {new Date(blog.published_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              )}
              <div className={styles.metaDivider}></div>
              {blog.author && <span className={styles.authorName}>BY {blog.author}</span>}
            </div>

            <h1 className={styles.title}>{blog.title}</h1>
            
            {blog.description && (
              <div className={styles.descriptionBox}>
                 <p>{blog.description}</p>
              </div>
            )}
            
            <div
              className={styles.blogContent}
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />
            
            <div className={styles.actionArea}>
                <button className={styles.btnPrimary} onClick={() => navigate('/blog')}>
                ← กลับไปหน้าบทความทั้งหมด
                </button>
            </div>
          </div>
        </article>

        {/* Other Blogs Section */}
        {otherBlogs.length > 0 && (
          <section className={styles.otherSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.otherTitle}>บทความอื่นๆ ที่น่าสนใจ</h2>
                <div className={styles.titleLine}></div>
            </div>
            
            <div className={styles.otherGrid}>
              {otherBlogs.map((b) => (
                <div
                  key={b.id}
                  className={styles.otherCard}
                  onClick={() => navigate(`/blog/${b.slug}`)}
                >
                  <div className={styles.otherCardImageWrapper}>
                    <img
                        src={b.image_url || 'https://images.unsplash.com/photo-1632823470937-f1e87c487244?q=80&w=600&auto=format&fit=crop'}
                        alt={b.title}
                    />
                    <div className={styles.readMoreTag}>อ่านต่อ</div>
                  </div>
                  <div className={styles.otherCardContent}>
                    <div className={styles.otherCardMeta}>
                        <span className={styles.metaHighlight}>{b.author || 'GT7 Admin'}</span>
                        <span>•</span>
                        <span>
                            {b.published_at ? new Date(b.published_at).toLocaleDateString('th-TH', {
                                month: 'short', day: 'numeric'
                            }) : 'ล่าสุด'}
                        </span>
                    </div>
                    <div className={styles.otherCardTitle}>{b.title}</div>
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