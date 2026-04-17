import React from 'react'
import { Link } from 'react-router-dom';
import styles from './BlogCard.module.css'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

function BlogCard({ blog }) {
  // ตรวจสอบถ้า slide ถูก clone และ aria-hidden ให้ปิด focus
  const parent = typeof window !== 'undefined' ? document.activeElement?.closest('.slick-slide[aria-hidden="true"]') : null;
  const isClonedHidden = parent != null;

  return (
    <div className={styles.blogCard} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Link
        to={`/blog/${blog.slug}`}
        className={styles.linkOverlay}
        tabIndex={isClonedHidden ? -1 : 0}
        aria-label={blog.title}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        aria-hidden={isClonedHidden ? 'true' : undefined}
      />
      {/* ส่วนรูปภาพและป้ายวันที่ */}
      <div className={styles.imageContainer}>
        <img src={blog.imageUrl} alt={blog.title ? `${blog.title} - รูปภาพบทความ/ข่าวสาร GT7 Motor` : 'รูปภาพบทความ/ข่าวสาร GT7 Motor'} className={styles.blogImage} />
        <div className={styles.dateBadge}>
          <strong>{blog.date}</strong>
          <span>{blog.month}</span>
        </div>
      </div>

      {/* ส่วนเนื้อหา */}
      <div className={styles.cardContent}>
        <p className={styles.author}>BY: {blog.author}</p>
        <h4 className={styles.title}>{blog.title}</h4>
        <p className={styles.description}>{blog.description}</p>
        {/* ส่วน Read More และ Social Icons */}
        <div className={styles.cardFooter}>
          <span className={styles.readMore}>READ MORE &rarr;</span>
          <div className={styles.socialIcons}>
            <button type="button" aria-label="Facebook" className={styles.iconBtn}><FaFacebookF /></button>
            <button type="button" aria-label="Twitter" className={styles.iconBtn}><FaTwitter /></button>
            <button type="button" aria-label="Instagram" className={styles.iconBtn}><FaInstagram /></button>
            <button type="button" aria-label="YouTube" className={styles.iconBtn}><FaYoutube /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogCard