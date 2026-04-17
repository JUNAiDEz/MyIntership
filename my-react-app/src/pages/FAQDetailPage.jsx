import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './FAQDetailPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function FAQDetailPage({ onLogout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherFaqs, setOtherFaqs] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Fetch Main FAQ
    fetch(`${API_URL}/api/faq?slug=${slug}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setFaq(result.data[0]);
        } else {
          setFaq(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
      });

    // Fetch Other FAQs
    fetch(`${API_URL}/api/faq?active=true&limit=8`)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setOtherFaqs(result.data.filter(f => f.slug !== slug));
        } else {
          setOtherFaqs([]);
        }
      })
      .catch(() => setOtherFaqs([]));
  }, [slug]);

  const BackButton = () => (
    <button className={styles.btnPrimary} onClick={() => navigate('/faq')}>
      ← กลับหน้ารวม FAQ
    </button>
  );

  // --- States ---
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.stateContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2 className={styles.loadingText}>กำลังโหลดข้อมูล...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
           <div className={styles.stateContainer}>
              <h2 className={styles.errorText}>{error}</h2>
              <BackButton />
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!faq) {
    return (
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.stateContainer}>
            <h2 className={styles.questionTitle}>ไม่พบคำถามที่คุณค้นหา</h2>
            <p className={styles.subText}>ข้อมูลอาจถูกลบหรือย้ายไปแล้ว</p>
            <BackButton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Success Render ---
  return (
    <div className={styles.pageWrapper}>
      <Header onLogout={onLogout} />
      <main className={styles.mainContent}>
        
        {/* Main Content Card */}
        <div className={styles.detailContainer}>
          <div className={styles.contentHeader}>
            <span className={styles.categoryBadge}>
              {faq.category || 'ทั่วไป'}
            </span>
            <h1 className={styles.questionTitle}>{faq.question}</h1>
          </div>
          <div className={styles.detailBody}>
            <div className={styles.answerText}>{faq.answer}</div>
            <div className={styles.actionArea}>
               <BackButton />
            </div>
          </div>
        </div>

        {/* Other FAQs Section */}
        {otherFaqs.length > 0 && (
          <section className={styles.otherSection}>
            <h2 className={styles.otherTitle}>
              คำถามอื่นๆ ที่น่าสนใจ
            </h2>
            <div className={styles.otherGrid}>
              {otherFaqs.map((f) => (
                <div
                  key={f.id}
                  className={styles.otherCard}
                  onClick={() => navigate(`/faq/${f.slug}`)}
                >
                  <div className={styles.otherCardContent}>
                    <div className={styles.otherCardTitle}>{f.question}</div>
                    <div className={styles.otherCardCategory}>{f.category || 'ทั่วไป'}</div>
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