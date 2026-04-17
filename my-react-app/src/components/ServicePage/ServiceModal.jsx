// src/pages/Services/Remap/components/ServiceModal.jsx
import React from 'react';
import styles from './ServiceModal.module.css';

const ServiceModal = ({ isOpen, data, onClose }) => {
  if (!isOpen || !data) return null;

  // 🔥 1. เพิ่มฟังก์ชันแยกข้อความด้วยเครื่องหมายแอ๋ว /
  let priceList = [];
  if (typeof data.price === 'string') {
    priceList = data.price.split('/');
  } else if (typeof data.price === 'number') {
    priceList = [data.price.toLocaleString()];
  } else if (Array.isArray(data.price)) {
    priceList = data.price.map(p => String(p));
  } else if (data.price) {
    priceList = [String(data.price)];
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.closeBtn} onClick={onClose}>&times;</span>
        
        <div className={styles.modalHeader}>
          <span className={styles.modalBrand}>{data.brand}</span>
          <h3>{data.name}</h3>
        </div>

        <div className={styles.modalBody}>
          
          {/* 🔥 2. ส่วนที่แก้ไข: เปลี่ยนจากบรรทัดเดียว เป็นกล่องราคาที่ดูดีขึ้น */}
          <div className={styles.priceBoxContainer}>
            <label className={styles.priceLabel}>ราคาค่าบริการ</label>
            <div className={styles.priceListWrapper}>
              {priceList.map((p, index) => (
                <div key={index} className={styles.priceRow}>
                   {/* จุดกลมสีเหลืองนำหน้า */}
                   <span className={styles.priceBullet}></span>
                   <span className={styles.priceText}>{p.trim()}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 🔥 จบส่วนแก้ไข */}

          <div className={styles.modalOptionGroup}>
            <h4>รายละเอียด</h4>
            <div className={styles.modalRow}>
              <span>Stage</span>
              <span className={styles.val}>{data.stage || 'Standard'}</span>
            </div>
             {/* คุณสามารถเพิ่ม row อื่นๆ ได้ที่นี่ เช่น ระยะเวลาประกัน */}
          </div>

          {data.note && (
            <div className={styles.modalNote}>
              <strong>หมายเหตุ:</strong> {data.note}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCloseModal} onClick={onClose}>ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;