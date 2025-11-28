import React from 'react' // <--- ไม่ต้องใช้ useState แล้ว
import styles from './BlogCard.module.css'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

function BlogCard({ blog }) {
  // --- ลบ useState, onMouseEnter, onMouseLeave ---

  return (
    <div className={styles.blogCard}> {/* <--- ลบ onMouseEnter/Leave ออก */}
      {/* ส่วนรูปภาพและป้ายวันที่ */}
      <div className={styles.imageContainer}>
        <img src={blog.imageUrl} alt={blog.title} className={styles.blogImage} />
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
          <a href="#" className={styles.readMore}>
            READ MORE &rarr;
          </a>
          
          {/* V--- ลบ {isHovered && (...)} ออก ให้แสดง div นี้ตลอด */}
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
          {/* ^--- ลบ {isHovered && (...)} ออก */}

        </div>
      </div>
    </div>
  )
}

export default BlogCard