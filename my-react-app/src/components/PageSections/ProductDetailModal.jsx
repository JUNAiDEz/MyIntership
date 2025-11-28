// src/components/PageSections/ProductDetailModal.jsx

import React from 'react';
import styles from './ProductDetailModal.module.css';
import { getImageUrl, calculatePrices } from '../../utils/productHelpers';
function ProductDetailModal({ product, onClose, onNext, onPrev }) {

  const stopPropagation = (e) => e.stopPropagation();

  const handleNextClick = (e) => {
    e.stopPropagation();
    onNext();
  };

  const handlePrevClick = (e) => {
    e.stopPropagation();
    onPrev();
  };

  // --- 🌟 (ใหม่!) เรียกใช้ฟังก์ชันคำนวณราคา ---
  const { displayPrice, displayOldPrice } = calculatePrices(product);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      
      <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrevClick}>
        &lt;
      </button>

      <div className={styles.modalContent} onClick={stopPropagation}>
        
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.modalBody}>
          
          <div className={styles.imageColumn}>
            <img src={getImageUrl(product.imageUrl)} alt={product.title} />
          </div>

          <div className={styles.infoColumn}>
            {product.brand && (
              <span className={styles.brand}>{product.brand.name}</span>
            )}
            
            <h2 className={styles.title}>{product.title}</h2>
            
            {/* --- 🌟 (แก้ไข!) แสดงราคาทั้งสองแบบ --- */}
            <div className={styles.priceSection}>
              <span className={styles.price}>{displayPrice}฿</span>
              {displayOldPrice && (
                <span className={styles.oldPriceModal}>{displayOldPrice}฿</span>
              )}
            </div>

            <div className={styles.rating}>
              <span>⭐️⭐️⭐️⭐️⭐️</span>
              <span>({product.reviews?.length || 0}) Reviews</span>
            </div>

            <div className={styles.stock}>
              สถานะ: <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                {product.stock > 0 ? `มีสินค้า (${product.stock} ชิ้น)` : 'สินค้าหมด'}
              </span>
            </div>

            <p className={styles.description}>
              {product.description || 'ไม่มีรายละเอียดสินค้า'}
            </p>

            <button 
              className={styles.addToCartButton} 
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? 'ADD TO CART' : 'สินค้าหมด'}
            </button>
          </div>
        </div>
      </div>

      <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNextClick}>
        &gt;
      </button>

    </div>
  );
}

export default ProductDetailModal;