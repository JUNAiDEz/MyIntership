
import styles from '../../components/ServicePage/ServicePageLayout.module.css';
import PageBuilder from '../../components/DynamicRenderer/PageBuilder';
import Footer from '../../components/Layout/Footer';

import React, { useState, useEffect } from 'react';


const DEFAULT_CONFIG = {
  title: "ชื่อบริการใหม่",
  description: "คำอธิบายบริการสำหรับ SEO",
  heroImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600",
  layout: [
    {
      type: 'HERO',
      props: { title: 'WELCOME TO GT7', subtitle: 'บริการระดับพรีเมียม', bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600' }
    }
  ],
  pricingData: [],
  relatedLinks: [
    { label: 'HOME', sub: 'กลับหน้าหลัก', path: '/' }
  ]
};

// แนะนำให้ตั้งค่า Base URL ของ Backend ไว้ที่นี่ (ตัวอย่างเช่น port 5000)
const API_BASE_URL = 'https://apigame.gt7dev.com/api/service-preview'; 

const ServicePreviewManagementPage = () => {
  const [adminConfig, setAdminConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync adminConfig to localStorage for real-time preview
  useEffect(() => {
    if (adminConfig) {
      localStorage.setItem('servicePreviewConfig', JSON.stringify(adminConfig));
    }
  }, [adminConfig]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ดึงข้อมูล Config ของ ID 1
        const res = await fetch(`${API_BASE_URL}/1`);
        
        // ถ้าขึ้น Unexpected token '<' แสดงว่า URL ผิด หรือ Server ส่งหน้า HTML กลับมา
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลจาก Server ได้');
        
        const data = await res.json();
        // ตรวจสอบโครงสร้างข้อมูลที่มาจาก Controller (page_config)
        setAdminConfig(data.page_config || DEFAULT_CONFIG);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addSection = (type) => {
    let newProps = {};
    if (type === 'HERO') newProps = { title: 'หัวข้อใหม่', subtitle: 'รายละเอียด...', bgImage: '' };
    if (type === 'REVIEWS') newProps = { reviewItems: [] };
    if (type === 'MAP') newProps = { address: 'Bangkok', height: '400px' };
    if (type === 'PRICING') newProps = {};
    setAdminConfig({
      ...adminConfig,
      layout: [...(Array.isArray(adminConfig.layout) ? adminConfig.layout : []), { type, props: newProps }]
    });
  };

  const updateSectionProps = (index, newProps) => {
    const newLayout = [...adminConfig.layout];
    newLayout[index].props = { ...newLayout[index].props, ...newProps };
    setAdminConfig({ ...adminConfig, layout: newLayout });
  };

  const removeSection = (index) => {
    const newLayout = adminConfig.layout.filter((_, i) => i !== index);
    setAdminConfig({ ...adminConfig, layout: newLayout });
  };

  const saveData = async () => {
    try {
      // ดึง Token จาก localStorage (ที่เก็บไว้ตอน Login)
      const token = localStorage.getItem('adminToken');
      // ...removed log...

      const res = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST', // เปลี่ยนเป็น POST ตาม Backend
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ส่ง Token ไปให้ Middleware ตรวจสอบ
        },
        body: JSON.stringify({ 
          service_id: 1, // กำหนด ID ที่ต้องการบันทึก
          page_config: adminConfig 
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      alert('บันทึกโครงสร้างหน้า Preview เรียบร้อย!');
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>ข้อผิดพลาด: {error}</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ส่วน Editor ด้านซ้าย */}
      <div style={{ width: '400px', backgroundColor: '#f4f4f4', padding: '20px', overflowY: 'auto', borderRight: '2px solid #ddd' }}>
        <h2 style={{ marginBottom: '20px' }}>🛠 Page Editor</h2>
        
        <div style={{ marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px' }}>
          <h4>Global Settings</h4>
          <label>Page Title:</label>
          <input
            type="text"
            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            value={adminConfig.title || ''}
            onChange={(e) => setAdminConfig({ ...adminConfig, title: e.target.value })}
          />
        </div>
        
        <hr />
        <h4 style={{ marginTop: '20px' }}>Sections Management</h4>
        
        {adminConfig.layout && adminConfig.layout.map((section, index) => (
          <div key={index} style={{ background: '#333', color: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{section.type} #{index + 1}</strong>
              <button onClick={() => removeSection(index)} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>ลบ</button>
            </div>
            
            {section.type === 'HERO' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Title"
                  style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  value={section.props.title}
                  onChange={(e) => updateSectionProps(index, { title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Subtitle"
                  style={{ width: '100%', padding: '5px' }}
                  value={section.props.subtitle}
                  onChange={(e) => updateSectionProps(index, { subtitle: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => addSection('HERO')} style={{ padding: '10px', cursor: 'pointer' }}>+ Add Hero</button>
          <button onClick={() => addSection('REVIEWS')} style={{ padding: '10px', cursor: 'pointer' }}>+ Add Reviews</button>
          <button onClick={() => addSection('MAP')} style={{ padding: '10px', cursor: 'pointer' }}>+ Add Map</button>
          <button onClick={() => addSection('PRICING')} style={{ padding: '10px', cursor: 'pointer' }}>+ Add Pricing</button>
          <button onClick={() => addSection('CATALOG')} style={{ padding: '10px', cursor: 'pointer' }}>+ Add Catalog</button>
        </div>

        <button
          style={{ width: '100%', marginTop: '30px', padding: '15px', backgroundColor: '#ffcc00', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}
          onClick={saveData}
        >
          PUBLISH / SAVE CHANGES
        </button>
      </div>

      {/* ส่วน Preview ด้านขวา (Dynamic) */}
      <div className={styles.pageContainer} style={{ flex: 1, backgroundColor: '#fff', overflowY: 'auto' }}>
        <div style={{ padding: '10px', background: '#eee', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          LIVE PREVIEW MODE
        </div>
        <PageBuilder layoutData={adminConfig.layout || []} pricingData={adminConfig.pricingData || []} />
        <Footer />
      </div>
    </div>
  );
};

export default ServicePreviewManagementPage;