import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

// ใช้ Helper จากไฟล์กลาง (ถ้ามี) หรือใช้ฟังก์ชันด้านล่าง
// import { getImageUrl } from '../utils/productHelpers'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Helper function (กรณีไม่ได้ import มา)
const getImageUrl = (img) => {
  if (!img) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${API_URL}${img}`;
};

// ฟังก์ชันคำนวณราคา
const calculatePrices = (product) => {
  // รองรับทั้ง field 'price' และ 'unit_price' (เผื่อมาจาก structure ต่างกัน)
  const originalPrice = parseFloat(product.price || product.unit_price || 0);
  
  // รองรับ discount ทั้งแบบตัวเลขและ string (เช่น "10%")
  let discountVal = product.discount || 0;
  if (typeof discountVal === 'string') {
      discountVal = parseFloat(discountVal.replace('%', ''));
  }
  const discountPercent = Math.abs(discountVal);

  let finalPrice = originalPrice;
  let oldPrice = null;

  if (discountPercent > 0 && originalPrice > 0) {
    finalPrice = originalPrice - (originalPrice * discountPercent / 100);
    oldPrice = originalPrice;
  }

  return {
    displayPrice: finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    displayOldPrice: oldPrice ? oldPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : null,
    discountPercent
  };
};

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  // ดึงรูปภาพ (รองรับ structure หลายแบบ)
  const imageSource = product.images?.[0]?.image_url || product.imageUrl || product.image_url || '';
  const displayImageUrl = getImageUrl(imageSource);

  // คำนวณราคา
  const { displayPrice, displayOldPrice, discountPercent } = calculatePrices(product);

  // สร้าง Link URL (ใช้ slug ถ้ามี ถ้าไม่มีใช้ id)
  const productLink = product.slug ? `/shop/${product.slug}` : `/shop/${product.id || product.product_template_id}`;

  return (
    <div 
      className={styles.productCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. ส่วนรูปภาพ (คลิกแล้วไปหน้าสินค้า) */}
      <Link to={productLink} className={styles.imageContainer}>
        <img src={displayImageUrl} alt={product.title || product.product_name} className={styles.productImage} loading="lazy" />
        
        {discountPercent > 0 && (
          <div className={styles.discountBadge}>
            -{discountPercent}%
          </div>
        )}
      </Link>

      {/* 2. ส่วนข้อมูลสินค้า */}
      <div className={styles.productInfo}>
        <div className={styles.rating}>
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span className={styles.reviewCount}>
             ({product.reviews?.length || 0} Reviews)
          </span>
        </div>
        
        <Link to={productLink} style={{textDecoration:'none'}}>
            <h4 className={styles.productTitle}>
                {product.title || product.product_name || 'สินค้าไม่มีชื่อ'}
            </h4>
        </Link>
        
        <div className={styles.priceSection}>
          {isHovered ? (
            // ปุ่ม Add to Cart (อาจจะเปลี่ยนเป็น Link ไปหน้าสินค้าก็ได้)
            <Link to={productLink} style={{width:'100%'}}>
                <button className={styles.addToCartButton}>
                VIEW DETAILS
                </button>
            </Link>
          ) : (
            // แสดงราคา
            <div style={{display:'flex', alignItems:'baseline'}}>
              <span className={styles.productPrice}>{displayPrice}฿</span>
              {displayOldPrice && (
                <span className={styles.oldPrice}>{displayOldPrice}฿</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;