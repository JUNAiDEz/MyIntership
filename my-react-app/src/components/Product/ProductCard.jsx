import React, { useState } from 'react';
import styles from './ProductCard.module.css'; // <-- import CSS ของตัวเอง

const API_URL = 'http://127.0.0.1:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  return `${API_URL}${imageUrl}`;
};

// --- 1. 🌟 (ใหม่!) ฟังก์ชันสำหรับคำนวณราคา (คัดลอกจาก ShopProductCard) ---
const calculatePrices = (product) => {
  const originalPrice = parseFloat(product.price) || 0;
  // (ดึง % ส่วนลด (เช่น "10%" หรือ "-15") และแปลงเป็นตัวเลขบวก)
  const discountPercent = Math.abs(parseFloat(product.discount)) || 0;

  let finalPrice = originalPrice; // ราคาที่จะแสดง
  let oldPrice = null; // (ราคาเดิมที่จะขีดฆ่า)

  if (discountPercent > 0 && originalPrice > 0) {
    // ถ้ามีส่วนลด
    finalPrice = originalPrice - (originalPrice * discountPercent / 100);
    oldPrice = originalPrice; // ราคาเดิมจะกลายเป็นราคาที่ถูกขีดฆ่า
  }

  return {
    displayPrice: finalPrice.toFixed(0), // ราคาที่จะแสดง (หลังลด)
    displayOldPrice: oldPrice ? oldPrice.toFixed(0) : null // ราคาเดิม (ก่อนลด)
  };
};


function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImageUrl = getImageUrl(product.imageUrl);

  // --- 2. 🌟 (ใหม่!) เรียกใช้ฟังก์ชันคำนวณราคา ---
  const { displayPrice, displayOldPrice } = calculatePrices(product);

  return (
    <div 
      className={styles.productCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <img src={displayImageUrl} alt={product.title} className={styles.productImage} />
        
        {product.discount && (
          <div className={styles.discountBadge}>
            {product.discount}
          </div>
        )}
      </div>

      <div className={styles.productInfo}>
        <div className={styles.rating}>
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          {/* (แก้ไขเล็กน้อย: เผื่อ reviews เป็น array หรือตัวเลข) */}
          <span>({product.reviews?.length || product.reviews || 0}) Review</span>
        </div>
        <h4 className={styles.productTitle}>{product.title}</h4>
        
        <div className={styles.priceSection}>
          {isHovered ? (
            <button className={styles.addToCartButton}>
              ADD TO CART
            </button>
          ) : (
            // --- 3. 🌟 (แก้ไข!) แสดงราคาที่คำนวณแล้ว ---
            <>
              <span className={styles.productPrice}>{displayPrice}฿</span>
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

export default ProductCard;