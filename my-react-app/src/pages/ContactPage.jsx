import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ShopMap from '../components/Map/ShopMap'; // ใช้ Component เดิมของคุณได้เลย
import styles from './ContactPage.module.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebookF, FaLine, FaInstagram } from 'react-icons/fa'; // ต้องลง react-icons เพิ่มถ้ายังไม่มี

const API_URL = import.meta.env.VITE_API_URL;

export default function ContactPage({ onLogout }) {
  const seo = {
    title: 'CONTACT US | GT7 MOTORSPORT',
    description: 'ติดต่อเรา นัดหมายบริการ หรือสอบถามข้อมูลเพิ่มเติม ทีมงาน GT7 Motor ยินดีให้บริการ',
    url: 'https://front.gt7dev.com/contact',
    image: 'https://front.gt7dev.com/og-image-contact.jpg'
  };

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      setError('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', phone_number: '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.message || 'ไม่สามารถส่งข้อความได้ในขณะนี้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <Header onLogout={onLogout} />

      {/* Hero Header */}
      <div className={styles.heroHeader}>
         <div className={styles.heroOverlay}></div>
         <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>GET IN <span>TOUCH</span></h1>
            <p className={styles.heroSubtitle}>เราพร้อมให้คำปรึกษาและบริการที่ดีที่สุดสำหรับรถของคุณ</p>
         </div>
      </div>

      <div className={styles.container}>
        <div className={styles.gridWrapper}>
          
          {/* Left Column: Contact Info */}
          <div className={styles.infoBox}>
            <h2 className={styles.infoTitle}>Contact Information</h2>
            
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FaMapMarkerAlt /></div>
              <div className={styles.infoContent}>
                <h4>LOCATION</h4>
                <p>GT7 MOTORSPORT (สำนักงานใหญ่)<br/>52/8 ถนนสายไหม แขวงสายไหม<br/>เขตสายไหม กรุงเทพฯ 10220</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FaPhoneAlt /></div>
              <div className={styles.infoContent}>
                <h4>PHONE</h4>
                <p>02-999-9999 (Office)<br/>081-888-8888 (Hotline)</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FaEnvelope /></div>
              <div className={styles.infoContent}>
                <h4>EMAIL</h4>
                <p>info@gt7motor.com<br/>support@gt7motor.com</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FaClock /></div>
              <div className={styles.infoContent}>
                <h4>OPENING HOURS</h4>
                <p>จันทร์ - เสาร์: 09:00 - 18:00 น.<br/>อาทิตย์: ปิดทำการ</p>
              </div>
            </div>

            <div className={styles.socialLinks}>
               <a href="#" className={styles.socialIcon}><FaFacebookF /></a>
               <a href="#" className={styles.socialIcon}><FaLine /></a>
               <a href="#" className={styles.socialIcon}><FaInstagram /></a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.formBox}>
            <h2 className={styles.infoTitle} style={{borderBottom:'none', marginBottom:'20px'}}>SEND MESSAGE</h2>
            
            {success && <div className={styles.successMsg}>✓ ส่งข้อความเรียบร้อยแล้ว! เจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้</div>}
            {error && <div className={styles.errorMsg}>⚠ {error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>YOUR NAME *</label>
                <input 
                  type="text" 
                  name="name" 
                  className={styles.input} 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>PHONE NUMBER</label>
                <input 
                  type="tel" 
                  name="phone_number" 
                  className={styles.input} 
                  value={formData.phone_number} 
                  onChange={handleChange} 
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>SUBJECT</label>
                <input 
                  type="text" 
                  name="subject" 
                  className={styles.input} 
                  value={formData.subject} 
                  onChange={handleChange} 
                  placeholder="เรื่องที่ต้องการติดต่อ"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>MESSAGE *</label>
                <textarea 
                  name="message" 
                  className={styles.textarea} 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="รายละเอียดข้อความ..."
                ></textarea>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Map Section */}
        <div className={styles.mapSection}>
           <h2 className={styles.mapTitle}>OUR LOCATION</h2>
           <div className={styles.mapWrapper}>
             <ShopMap 
               lat={13.913889}
               lng={100.651944}
               zoom={16}
               markerTitle="GT7 MOTOR"
               address="52/8 ถนนสายไหม แขวงสายไหม เขตสายไหม กรุงเทพมหานคร 10220"
               height="100%"
             />
           </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}