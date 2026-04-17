import React from 'react';
import styles from './PromotionCard.module.css';

export default function PromotionCard({ promotion, onSelect }) {
  const productCount = (promotion.products || []).length;
  const serviceCount = (promotion.services || []).length;

  return (
    <div className={styles.card} onClick={() => onSelect(promotion)}>
      {promotion.image && (
        <div className={styles.imageWrap}>
          <img src={promotion.image} alt={promotion.title} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{promotion.title}</h3>
        <p className={styles.desc}>{promotion.description}</p>

        <div className={styles.meta}> 
          <span className={styles.badge}>{productCount} สินค้า</span>
          <span className={styles.badge}>{serviceCount} บริการ</span>
          {promotion.active ? <span className={styles.active}>กำลังใช้งาน</span> : <span className={styles.inactive}>ไม่แสดง</span>}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={(e) => { e.stopPropagation(); onSelect(promotion); }}>ดูรายละเอียด</button>
        </div>
      </div>
    </div>
  );
}
