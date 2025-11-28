// src/components/PageSections/ShopProductCard.jsx

import React, { useState } from 'react';
import styles from './ShopProductCard.module.css';
import { getImageUrl, calculatePrices } from '../../utils/productHelpers';
// (รับ onProductClick มาจาก ShopPage)
function ShopProductCard({ product, onProductClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const displayImageUrl = getImageUrl(product.imageUrl);
  
  // --- 🌟 (ใหม่!) เรียกใช้ฟังก์ชันคำนวณราคา ---
  const { displayPrice, displayOldPrice } = calculatePrices(product);

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // (หยุดไม่ให้ Modal เปิด)
    console.log('Added to cart:', product.title);
    // (ใส่ logic เพิ่มลงตะกร้าจริงที่นี่)
  };

  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)} // (คลิกเพื่อเปิด Modal)
    >
      <div className={styles.imageContainer}>
        <img src={displayImageUrl} alt={product.title} className={styles.productImage} />
        
        {/* (แสดง % ส่วนลดที่มุม) */}
        {product.discount && (
          <div className={styles.discountBadge}>
            {product.discount}
          </div>
        )}
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.rating}>
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span>({product.reviews?.length || 0}) Review</span>
        </div>
        <h4 className={styles.title}>{product.title}</h4>
        
        <div className={styles.priceContainer}>
          {isHovered ? (
            <button className={styles.addToCartButton} onClick={handleAddToCartClick}>
              ADD TO CART
            </button>
          ) : (
            <>
              {/* --- 🌟 (แก้ไข!) แสดงราคาที่คำนวณแล้ว --- */}
              <span className={styles.price}>{displayPrice}฿</span>
              
              {/* (แสดงราคาเดิม (ขีดฆ่า) ถ้ามีส่วนลดเท่านั้น) */}
              {displayOldPrice && (
                <span className={styles.oldPrice}>{displayOldPrice}฿</span>
              )}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default ShopProductCard;