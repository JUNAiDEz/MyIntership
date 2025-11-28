import React from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './FAQPage.module.css';

const faqData = [
  { id:1, q: 'วิธีการจองบริการทำได้อย่างไร?', a: 'คุณสามารถติดต่อผ่านหน้า ติดต่อเรา หรือโทรศัพท์/ไลน์ที่ปรากฏในหน้าเว็บ' },
  { id:2, q: 'รับประกันงานบริการหรือไม่?', a: 'งานบริการบางรายการมีการรับประกันตามเงื่อนไขของประเภทบริการ โปรดสอบถามเจ้าหน้าที่' },
  { id:3, q: 'สามารถนำรถเข้าซ่อมโดยไม่ต้องนัดหมายได้หรือไม่?', a: 'แนะนำให้จองล่วงหน้าเพื่อความสะดวก แต่ในบางกรณีสามารถนำรถเข้ารับบริการได้แบบ walk-in ขึ้นกับคิว' },
  { id:4, q: 'ชำระเงินด้วยบัตรเครดิต/เดบิตได้หรือไม่?', a: 'รับได้ในบางสาขา กรุณาตรวจสอบกับพนักงานก่อนเข้ารับบริการ' }
];

export default function FAQPage({ onLogout }){
  return (
    <div className="App">
      <Header onLogout={onLogout} />

      <div className="main-container">
        <div className={styles.header}><h2>คำถามที่พบบ่อย (FAQ)</h2></div>
        <div className={styles.list}>
          {faqData.map(item => (
            <details key={item.id} className={styles.item}>
              <summary className={styles.q}>{item.q}</summary>
              <div className={styles.a}>{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
