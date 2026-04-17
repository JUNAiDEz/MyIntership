// src/pages/Services/Remap/components/ServiceCatalog.jsx
import React, { useState } from 'react';
import styles from './ServiceCatalog.module.css';

const ServiceCatalog = ({ allPackages = [], onOpenModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allPackages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allPackages.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <section className={styles.catalogSection} id="catalog-start">
      <h2 className={styles.relatedTitle}>PRICE LIST</h2>
      <div className="container">
        <div className={styles.catalogGrid}>
          {currentItems.map((item, idx) => {
            const idList = ['1492144534655-ae79c964c9d7','1550355291-bbee04a92027','1503376780353-7e6692767b70'];
            const imgBase = `https://images.unsplash.com/photo-${idList[idx % idList.length]}`;
            const imgSmall = `${imgBase}?w=400&h=300&fit=crop&q=80`;
            const imgLarge = `${imgBase}?w=800&h=600&fit=crop&q=80`;
            // ใช้รูปจากฐานข้อมูลถ้ามี image_url
            const carImg = item.image_url && item.image_url.length > 10 ? item.image_url : imgSmall;
            return (
              <div key={idx} className={styles.servicePackageCard} onClick={() => onOpenModal(item)}>
                <div className={styles.cardImageWrapper}>
                  <img 
                    src={carImg}
                    srcSet={carImg === imgSmall ? `${imgLarge} 800w, ${imgSmall} 400w` : undefined}
                    sizes="(max-width: 600px) 400px, 800px" 
                    alt={item.name} 
                    className={styles.cardImg} 
                    loading="lazy" 
                    decoding="async" 
                    width="400" 
                    height="300" 
                    onError={e => { e.target.src = imgSmall; }}
                  />
                  <div className={styles.cardOverlay}>
                    <span className={styles.viewBtn}>ดูรายละเอียด</span>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.pkgBrand}>{item.brand}</span>
                  <h4 className={styles.pkgModel}>{item.name}</h4>
                  
                  <div className={styles.pkgPriceRow}>
                    <span style={{color:'#888'}}>ราคาเริ่มต้น</span>
                    {/* 🔥 แก้ไขตรงนี้: สั่งให้ตัดคำถ้ามีเครื่องหมาย / */}
                    <div className={styles.pkgMainPrice}>
                      {typeof item.price === 'string' && item.price.includes('/') ? (
                        item.price.split('/').map((p, i) => (
                          <div key={i}>{p.trim()}</div>
                        ))
                      ) : (
                        item.price
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button 
                key={num} 
                className={`${styles.pageBtn} ${currentPage === num ? styles.activePageBtn : ''}`} 
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}
            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceCatalog;