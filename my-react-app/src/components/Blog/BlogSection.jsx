// src/components/Blog/BlogSection.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { apiGet } from '../../utils/api';
import styles from './BlogSection.module.css'; // อ้างอิงไฟล์ CSS ใหม่

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apiGet('/api/blog?published=true&limit=3');
        if (response && response.data) {
          setBlogs(response.data);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div style={{ color: '#aaa', textAlign: 'center' }}>กำลังโหลดบทความ...</div>;
  if (blogs.length === 0) return null; // ซ่อนไปเลยถ้าไม่มีบทความ

  return (
    <div className={styles.blogContainer}>
      
      {/* ส่วนหัว */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>บทความ</h2>
        <Link to="/blog" className={styles.viewAllLink}>READ MORE</Link>
      </div>

      {/* กริดบทความ */}
      <div className={styles.blogGrid}>
        {blogs.map((blog) => {
          // ดึงวันที่มาสร้างเป็นป้าย Badge สีเหลืองสวยๆ
          const dateObj = new Date(blog.published_at);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('en-US', { month: 'short' });

          return (
            <Link to={`/blog/${blog.slug || blog.id}`} key={blog.id} className={styles.blogCard}>
              
              <div className={styles.imgWrapper}>
                <img 
                  src={blog.image_url || 'https://via.placeholder.com/400x250'} 
                  alt={blog.title} 
                  className={styles.blogImg} 
                />
                {/* ป้ายวันที่มุมซ้ายบน */}
                {blog.published_at && (
                  <div className={styles.dateBadge}>
                    <span className={styles.day}>{day}</span>
                    <span className={styles.month}>{month}</span>
                  </div>
                )}
              </div>

              <div className={styles.blogContent}>
                <h3 className={styles.blogTitle}>{blog.title}</h3>
                
                {/* ปุ่มอ่านเพิ่มเติม (จะถูกดันไปล่างสุดอัตโนมัติด้วย margin-top: auto) */}
                <div className={styles.readMore}>
                  อ่านเพิ่มเติม <FaArrowRight />
                </div>
              </div>

            </Link>
          );
        })}
      </div>
      
    </div>
  );
}

export default BlogSection;