import React, { useState, useMemo, useEffect } from 'react';


import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import ServiceModal from '../../components/ServicePage/ServiceModal';
import styles from '../../components/ServicePage/ServicePageLayout.module.css';
import PageBuilder from '../../components/DynamicRenderer/PageBuilder';

// 1. เพิ่ม Default Parameter { adminData = {} } เพื่อป้องกันค่า undefined


function ServicePreview() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // ดึงข้อมูลล่าสุดจาก localStorage (ที่ ServicePreviewManagementPage แก้ไข)
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const local = localStorage.getItem('servicePreviewConfig');
      if (local) {
        setAdminData(JSON.parse(local));
      } else {
        setAdminData(null);
      }
    } catch (e) {
      setError('ไม่สามารถอ่านข้อมูลจาก localStorage');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center', color: '#666' }}>Loading preview...</div>;
  }
  if (error) {
    return <div style={{ padding: 50, textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }
  if (!adminData?.layout) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
        <h3>กำลังรอข้อมูล Preview...</h3>
        <p>กรุณาตรวจสอบการส่งข้อมูล adminData</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        {/* ใช้ PageBuilder เพื่อ render layout แบบ dynamic เหมือนหน้า Management */}
        <PageBuilder layoutData={adminData.layout || []} />
      </main>
      <Footer />
      <ServiceModal
        isOpen={showModal}
        data={modalData}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default ServicePreview;