import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './FAQPage.module.css';
import { FaArrowRight, FaQuestionCircle } from 'react-icons/fa'; // เพิ่มไอคอน

const API_URL = import.meta.env.VITE_API_URL;

export default function FAQPage({ onLogout }) {
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const seo = {
    title: 'FAQ | GT7 MOTORSPORT คำถามที่พบบ่อย',
    description: 'ศูนย์รวมข้อมูลและคำถามที่พบบ่อยเกี่ยวกับบริการ สินค้า และการปรับแต่งรถยนต์จาก GT7 Motor',
    url: 'https://front.gt7dev.com/faq',
    image: 'https://front.gt7dev.com/og-image-faq.jpg'
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faq?active=true&limit=1000`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        // Slugify helper
        const slugify = (text, id) => {
           return (text?.toString().toLowerCase()
             .replace(/[^a-z0-9ก-๙\s-]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-') || 'faq-' + id) + (id ? '-' + id : '');
        };

        const sortedFaqs = [...result.data].sort((a, b) => a.sort_order - b.sort_order).map(faq => ({
          ...faq,
          slug: faq.slug || slugify(faq.question, faq.id)
        }));
        setFaqData(sortedFaqs);

        // ดึงหมวดหมู่
        const uniqueCategories = ['All', ...new Set(sortedFaqs.map(item => item.category || 'General'))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Mock Data (Fallback ถ้า API ยังไม่พร้อม เพื่อให้เห็นดีไซน์)
      /* const mockData = [
         { id:1, category:'Service', question:'ระยะเวลาในการเปลี่ยนถ่ายน้ำมันเครื่อง?', answer:'ใช้เวลาประมาณ 45-60 นาทีครับ รวมถึงการตรวจเช็คสภาพรถเบื้องต้น 30 รายการฟรี', slug:'oil-change-time' },
         { id:2, category:'Product', question:'รับประกันสินค้ากี่ปี?', answer:'สินค้าอะไหล่แท้รับประกัน 1-3 ปี ขึ้นอยู่กับประเภทสินค้า ส่วนงานติดตั้งรับประกันงาน 1 ปีเต็มครับ', slug:'warranty-info' },
         { id:3, category:'Payment', question:'รับบัตรเครดิตไหม?', answer:'เรารับบัตรเครดิตทุกธนาคาร และมีบริการผ่อน 0% นานสูงสุด 10 เดือน สำหรับยอด 5,000 บาทขึ้นไป', slug:'payment-methods' },
      ];
      setFaqData(mockData);
      setCategories(['All', 'Service', 'Product', 'Payment']);
      */
    }
  };

  const filteredFaqs = selectedCategory === 'All'
    ? faqData
    : faqData.filter(item => (item.category || 'General') === selectedCategory);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />

        {/* Hero Section (เพิ่มเข้ามาใหม่) */}
        <div className={styles.heroHeader}>
           <div className={styles.heroOverlay}></div>
           <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>KNOWLEDGE <span>BASE</span></h1>
              <p className={styles.heroSubtitle}>
                  ศูนย์รวมข้อมูลทางเทคนิค คำแนะนำการบริการ และคำถามที่พบบ่อย <br/>
                  เพื่อความมั่นใจสูงสุดในการใช้บริการกับเรา
              </p>
           </div>
        </div>

        {/* Filter Buttons */}
        <div className={styles.filterContainer}>
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? 'ALL TOPICS' : category.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FAQ Grid Cards */}
        <div className={styles.gridContainer}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(item => (
              /* ใช้ Link ครอบทั้งการ์ดเพื่อให้กดตรงไหนก็ได้ */
              <Link key={item.id} to={`/faq/${item.slug}`} className={styles.card}>
                
                <div className={styles.cardContent}>
                  {/* Category Badge */}
                  <span className={styles.categoryBadge}>
                    {item.category || 'General'}
                  </span>
                  
                  {/* Question */}
                  <h3 className={styles.cardTitle}>
                    {item.question}
                  </h3>
                  
                  {/* Snippet Answer */}
                  <p className={styles.cardSnippet}>
                    {item.answer}
                  </p>
                </div>
                
                {/* Read More Button */}
                <div className={styles.cardButton}>
                  READ ANSWER <FaArrowRight className={styles.iconArrow} />
                </div>

              </Link>
            ))
          ) : (
            <div className={styles.noData}>
               <FaQuestionCircle size={40} style={{marginBottom:'15px', color:'#333'}} />
               <p>No FAQs found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}