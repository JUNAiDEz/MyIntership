import React, { useState, useEffect, useMemo, useCallback } from 'react';
// ⬇️ เปิดการ import Header/Footer ของคุณ
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from './PortfolioPage.module.css';

// --- (ข้อมูลจำลอง - แก้ไข URL รูปภาพแล้ว) ---
const mockCars = [
  {
    id: 1,
    title: 'Toyota Supra - Project A',
    year: 2019,
    model: 'A90',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'แต่งเต็มทั้งเครื่อง เบรก และท่อ ติดตั้งระบบ Remap และ Custom Exhaust',
    services: [ {id:201, title:'Remap'}, {id:301, title:'Custom Exhaust'}, {id:101, title:'Brake Upgrade'}, {id:402, title:'Wheels & Tyres'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=Supra-1','https://placehold.co/300x200/95a5a6/FFF?text=Supra-2']
  },
  {
    id: 2,
    title: 'Honda Civic - Track Setup',
    year: 2021,
    model: 'FK8',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'เซ็ตช่วงล่างและยางสำหรับสนาม เสริมความแข็งแรงและการยึดเกาะ',
    services: [ {id:401, title:'Suspension'}, {id:402, title:'Wheels & Tyres'}, {id:101, title:'Brake Upgrade'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=Civic-1']
  },
  {
    id: 3,
    title: 'Isuzu D-Max - Work Rig',
    year: 2020,
    model: 'D-Max',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'ติดตั้งอุปกรณ์และชุดแต่งสำหรับงานหนัก เช่น ช่วงล่างยกสูง, รีโมทสตาร์ท และชุดไฟส่องสว่าง พร้อมบริการบำรุงรักษาครบวงจร',
    services: [ {id:401, title:'Suspension'}, {id:502, title:'Remote Control'}, {id:601, title:'Lighting'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=D-Max-1']
  },
  {
    id: 4,
    title: 'Mercedes-Benz C-Class - Elegance Tune',
    year: 2022,
    model: 'W206',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'อัพเกรดสมรรถนะเครื่องยนต์ด้วยการ Remap ECU พร้อมชุดท่อไอเสีย Custom Made เพื่อเสียงที่นุ่มลึกและอัตราเร่งที่ดีขึ้น',
    services: [ {id:201, title:'Remap'}, {id:301, title:'Custom Exhaust'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=Benz-1', 'https://placehold.co/300x200/2c3e50/FFF?text=Benz-2']
  },
  {
    id: 5,
    title: 'Nissan GTR R35 - Performance Build',
    year: 2023,
    model: 'R35',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'ปรับจูนเครื่องยนต์ใหม่หมด, ติดตั้งเทอร์โบขนาดใหญ่, และระบบเบรกสมรรถนะสูง เพื่อการขับขี่ที่เหนือชั้นทั้งบนถนนและสนามแข่ง',
    services: [ {id:201, title:'Remap'}, {id:301, title:'Custom Exhaust'}, {id:101, title:'Brake Upgrade'}, {id:202, title:'Turbo Upgrade'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=GTR-1', 'https://placehold.co/300x200/c0392b/FFF?text=GTR-2', 'https://placehold.co/300x200/c0392b/FFF?text=GTR-3']
  },
  {
    id: 6,
    title: 'Ford Ranger - Off-Road Ready',
    year: 2021,
    model: 'Ranger',
    image: 'https://placehold.co/600x400/95a5a6/FFF?text=600x400',
    summary: 'ยกสูง, ติดตั้งโช้คอัพ Off-Road, ยาง Mud-Terrain, และกันชนหน้า-หลังเหล็ก เพื่อการผจญภัยในทุกเส้นทาง',
    services: [ {id:401, title:'Suspension'}, {id:402, title:'Wheels & Tyres'}, {id:602, title:'Off-Road Accessories'} ],
    gallery: ['https://placehold.co/300x200/95a5a6/FFF?text=Ranger-1', 'https://placehold.co/300x200/27ae60/FFF?text=Ranger-2']
  }
];

// ⬇️ --- สร้าง COMPONENT ที่ขาดหายไป (แต่ลบ Header/Footer จำลองออก) --- ⬇️

// 1. (ลบ Header จำลองออก)
// 2. (ลบ Footer จำลองออก)

// 3. สร้าง PortfolioFilter (ที่หายไป)
const PortfolioFilter = ({ services, activeFilter, onFilterChange }) => (
  <div className={styles.filterBar}>
    {services.map(service => (
      <button
        key={service}
        className={activeFilter === service ? styles.filterActive : styles.filterButton}
        onClick={() => onFilterChange(service)}
      >
        {service}
      </button>
    ))}
  </div>
);

// 4. สร้าง CarCard (ที่หายไป)
const CarCard = ({ car, onSelect }) => (
  <div className={styles.card} onClick={() => onSelect(car)}>
    <img src={car.image} alt={car.title} className={styles.cardImage} />
    <div className={styles.cardBody}>
      <h4 className={styles.cardTitle}>{car.title}</h4>
      <p className={styles.cardSummary}>{car.summary.substring(0, 70)}...</p>
      <span className={styles.btnPrimary}>ดูรายละเอียด</span>
    </div>
  </div>
);

// 5. สร้าง PortfolioDetail (ที่หายไป)
const PortfolioDetail = ({ car, onClose }) => {
  // ถ้าไม่มีรถถูกเลือก ให้แสดงข้อความ
  if (!car) {
    return (
      <div className={`${styles.detail} ${styles.detailEmpty}`}>
        <p>คลิกที่รถเพื่อดูรายละเอียดผลงาน</p>
      </div>
    );
  }

  // ถ้ามีรถถูกเลือก ให้แสดงรายละเอียด
  return (
    <div className={styles.detail}>
      <button onClick={onClose} className={styles.closeButton}>&times; ปิด</button>
      <img src={car.image} alt={car.title} className={styles.detailImage} />
      <h3 className={styles.detailTitle}>{car.title} ({car.model} - {car.year})</h3>
      <p>{car.summary}</p>
      
      <h4 className={styles.serviceHeader}>บริการที่ทำ:</h4>
      <ul className={styles.serviceList}>
        {car.services.map(s => <li key={s.id}>{s.title}</li>)}
      </ul>
      
      <h4 className={styles.serviceHeader}>แกลเลอรี:</h4>
      <div className={styles.gallery}>
        {car.gallery.map((img, index) => (
          <img key={index} src={img} alt={`gallery ${index+1}`} />
        ))}
      </div>
    </div>
  );
};
// ⬆️ --- จบส่วน COMPONENT ที่ขาดหายไป --- ⬆️


export default function PortfolioPage({ onLogout }){
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // 1. (จำลอง) การดึงข้อมูล
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setCars(mockCars);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 2. สร้างลิสต์ของ "บริการ" ทั้งหมดที่ไม่ซ้ำกันสำหรับตัวกรอง
  const allServices = useMemo(() => {
    const services = new Set();
    cars.forEach(car => {
      car.services.forEach(service => services.add(service.title));
    });
    // เรียงตามตัวอักษร
    return ['All', ...Array.from(services).sort()];
  }, [cars]);

  // 3. กรองรถตาม "activeFilter"
  const filteredCars = useMemo(() => {
    if (activeFilter === 'All') {
      return cars;
    }
    return cars.filter(car =>
      car.services.some(service => service.title === activeFilter)
    );
  }, [cars, activeFilter]);

  // 4. ฟังก์ชันสำหรับเลือก/ปิด การแสดงรายละเอียด
  const handleSelectCar = useCallback((car) => {
    setSelectedCar(car);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedCar(null);
  }, []);

  return (
    <div className="App">
      {/* ⬇️ โค้ดนี้จะเรียก Header จากไฟล์ import ของคุณ ⬇️ */}
      <Header onLogout={onLogout} />

      <main className={styles.pageWrapper}>
        <div className={styles.header}>
          <h2>ผลงานรถยนต์ของเรา</h2>
          <p className={styles.lead}>ตัวอย่างผลงานการปรับแต่ง, ซ่อมบำรุง, และติดตั้งอุปกรณ์ ที่เราภาคภูมิใจ</p>
        </div>

        <PortfolioFilter
          services={allServices}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className={`${styles.layout} ${selectedCar ? styles.showDetail : ''}`}>
          <div className={styles.list}>
            {loading && <p className={styles.loadingMessage}>กำลังโหลดผลงาน...</p>}
            {!loading && filteredCars.length === 0 && (
              <div className={styles.emptyFilterResult}>
                <p>ไม่พบผลงานที่ตรงกับตัวกรองนี้</p>
                <button onClick={() => setActiveFilter('All')} className={styles.btnSecondary}>แสดงทั้งหมด</button>
              </div>
            )}
            {!loading && filteredCars.map(car => (
              <div key={car.id} className={styles.cardWrap}>
                <CarCard car={car} onSelect={handleSelectCar} />
              </div>
            ))}
          </div>

        </div>
        <PortfolioDetail car={selectedCar} onClose={handleCloseDetail} />
      </main>

      {/* ⬇️ โค้ดนี้จะเรียก Footer จากไฟล์ import ของคุณ ⬇️ */}
      <Footer />
    </div>
  );
}