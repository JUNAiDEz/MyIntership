// src/components/PageSections/PartnerSection.jsx

import React, { useState, useEffect } from 'react';
import styles from './PartnerSection.module.css';
import { API_URL } from '../../utils/api'; // ⚠️ เช็ค Path นี้ให้ตรงกับที่เก็บไฟล์ api.js ของคุณด้วยนะครับ

function PartnerSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // รูปภาพสำรองกรณีไม่ได้อัปโหลดรูป
  const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='none'><text x='50%' y='50%' dy='.3em' fill='%23ffffff' font-size='14' text-anchor='middle'>No Logo</text></svg>";

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dealers`);
        if (!res.ok) throw new Error('Failed to fetch dealers');
        const data = await res.json();
        
        // ตรวจสอบรูปแบบข้อมูลที่ Backend ส่งมา
        const dealerList = Array.isArray(data) ? data : data.data || [];

        // กรองเฉพาะตัวที่ is_active เป็น true และเรียงลำดับตาม display_order จากน้อยไปมาก
        const activeDealers = dealerList
          .filter(dealer => dealer.is_active)
          .sort((a, b) => a.display_order - b.display_order);

        setPartners(activeDealers);
      } catch (error) {
        console.error('Error fetching dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  return (
    <div className={styles.partnerWrapper}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>DEALER</h2>
        <p className={styles.sectionSubtitle}>ตัวแทนจัดจำหน่ายผลิตภัณฑ์ชั้นนำ</p>
      </div>

      <div className={styles.glassBox}>
        {loading ? (
           // แสดงข้อความโหลดชั่วคราว (คุณสามารถเปลี่ยนเป็น Spinner สวยๆ ได้)
          <div style={{ gridColumn: '1 / -1', color: 'var(--text-main)', textAlign: 'center' }}>
            กำลังโหลดรายชื่อตัวแทนจำหน่าย...
          </div>
        ) : partners.length > 0 ? (
          partners.map((partner) => (
            <div key={partner.id} className={styles.logoItem} title={partner.name}>
              <img 
                // เช็คว่ารูปเป็น Base64, URL เต็ม หรือ Path ของ Server
                src={partner.image_url ? (partner.image_url.startsWith('http') || partner.image_url.startsWith('data:') ? partner.image_url : `${API_URL}${partner.image_url}`) : PLACEHOLDER_IMG} 
                alt={partner.name} 
                className={styles.logoImg} 
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', textAlign: 'center' }}>
            ยังไม่มีข้อมูลตัวแทนจำหน่าย
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerSection;