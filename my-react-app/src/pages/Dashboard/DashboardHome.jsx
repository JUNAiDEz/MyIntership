import React from 'react';
import styles from './Dashboard.module.css'; // <-- ใช้ CSS หลักของ Dashboard
import { FaSearch } from 'react-icons/fa';

// Mock Data สำหรับตาราง
const mockOrderItems = [
  { id: 1, name: 'น้ำมัน MOYIF', qty: 1, discount: 0, price: 20.00 },
  { id: 2, name: 'โช้ค REVO 4X4 8 นิ้ว', qty: 1, discount: 0, price: 750.00 },
  { id: 3, name: 'มือเปิด REVO-VIGO YDBHBRTMX', qty: 1, discount: 0, price: 100.00 },
];

// นี่คือเนื้อหา "หน้าแรก" ของ Dashboard (เดิมคือ DashboardContent)
function DashboardHome() {
  return (
    <div className={styles.content}>
      <h2 className={styles.contentTitle}>บาร์โค้ดสินค้า:</h2>
      
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input type="text" placeholder="บาร์โค้ด หรือ ชื่อสินค้า" />
          <button><FaSearch /></button>
        </div>
      </div>

      {/* Main Grid (2 Columns) */}
      <div className={styles.mainGrid}>
        
        {/* Left Column (Customer Info) */}
        <div className={styles.leftColumn}>
          <div className={styles.buttonGroup}>
            <button className={styles.btnRed}>ยกเลิก</button>
            <button className={styles.btnGreen}>ยืนยันพิมพ์ (Yes)</button>
          </div>
          <button className={styles.btnBlueFull}><FaSearch /> เพิ่มชื่อลูกค้า</button>
          
          <div className={styles.formSection}>
            <label>ชื่อ-นามสกุล</label>
            <input type="text" value="นายทดสอบ ผู้ใช้ระบบ" readOnly />
            <label>เบอร์โทรศัพท์</label>
            <input type="text" value="0982627145" readOnly />
            <label>ที่อยู่</label>
            <input type="text" />
            <label>จังหวัด</label>
            <input type="text" />
            <label>อำเภอ/เขต</label>
            <input type="text" />
            <label>ตำบล/แขวง</label>
            <input type="text" />
            <label>รหัสไปรษณีย์</label>
            <input type="text" />
          </div>
        </div>

        {/* Right Column (Order Table) */}
        <div className={styles.rightColumn}>
          <div className={styles.alertBox}>
            <strong>แต้มคงเหลือ</strong>
            <p>128,838.0 GT7 Coins</p>
            <span className={styles.alertWarning}>ส่วนลดพิเศษลูกค้ารายนี้เท่านั้น</span>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>รายการสินค้า</th>
                  <th>จำนวน</th>
                  <th>ส่วนลด</th>
                  <th>ราคา</th>
                </tr>
              </thead>
              <tbody>
                {mockOrderItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.discount.toFixed(2)}</td>
                    <td>{item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className={styles.textRight}>รวมสุทธิ</td>
                  <td>870.00</td>
                </tr>
                <tr>
                  <td colSpan="3" className={styles.textRed}>ยอดสุทธิหลังหักส่วนลด</td>
                  <td className={styles.textRight}>-5428.69</td>
                  <td className={styles.textRed}>870.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className={styles.formSection}>
            <label>หมายเหตุ:</label>
            <input type="text" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
