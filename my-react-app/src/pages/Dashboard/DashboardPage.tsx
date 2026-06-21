import React, { type ReactNode } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import {
  FaBoxOpen, FaWrench, FaCar, FaTags,
  FaImages, FaNewspaper, FaQuestionCircle, FaCommentDots,
  FaUsers, FaArrowRight, FaStore // 🔥 นำเข้า FaStore มาใช้เป็นไอคอน Dealer
} from 'react-icons/fa';
import { ProtectedRoute } from '../../utils/ProtectedRoute';

// ✅ นำเข้า DashboardHeader ที่เราเพิ่งแยกไปเป็น Component
import DashboardHeader from '../../components/DashboardHeader';

// --- Import หน้าจัดการต่างๆ ---
import ProductManagementPage from './ProductManagementPage';
import ProductSupplierManager from './ProductSupplierManager';
import ServiceManagementPage from './ServiceManagementPage';
import ServiceMenuPage from './ServiceMenuPage';
import PromotionManagementPage from './PromotionManagementPage';
import CarManagementPage from './CarManagementPage';
import PortfolioManagementPage from './PortfolioManagementPage';
import ContactManagementPage from './ContactManagementPage';
import BlogManagementPage from './BlogManagementPage';
import StickerDashboard from './StickerDashboard';
import LiveStreamPage from './LiveStreamPage';
import UserManagementPage from './UserManagementPage';
import DealerManagementPage from './DealerManagementPage';

// --- Import หน้า Maintenance ---
import PipeCleanManagementPage from './MaintenanceManagement/PipeCleanManagementPage';
import EngineSpaManagementPage from './MaintenanceManagement/EngineSpaManagementPage';
import FluidChangeManagementPage from './MaintenanceManagement/FluidChangeManagementPage';
import AirConManagementPage from './MaintenanceManagement/AirConManagementPage';

// --- Import หน้า Fitment ---
import AlignmentManagementPage from './FitmentManagement/AlignmentManagementPage';
import BallJointsManagementPage from './FitmentManagement/BallJointsManagementPage';
import ShockAbsorberManagementPage from './FitmentManagement/ShockAbsorberManagementPage';
import WheelsTiresManagementPage from './FitmentManagement/WheelsTiresManagementPage';
import SuspensionManagementPage from './FitmentManagement/SuspensionManagementPage';

// --- Import หน้า Upgrade ---
import CustomExhaustManagementPage from './UpgradeManagement/CustomExhaustManagementPage';
import RemapManagementPage from './UpgradeManagement/RemapManagementPage';
import RemoteControlManagementPage from './UpgradeManagement/RemoteControlManagementPage';
import TurboInterManagementPage from './UpgradeManagement/TurboInterManagementPage';
import ValveServiceManagementPage from './UpgradeManagement/ValveServiceManagementPage';

// --- Import หน้า WrapCar ---
import BoostGaugeManagementPage from './WrapCarManagement/BoostGaugeManagementPage';
import ExhaustManagementPage from './WrapCarManagement/ExhaustManagementPage';
import FilmProtectManagementPage from './WrapCarManagement/FilmProtectManagementPage';
import StickerManagementPage from './WrapCarManagement/StickerManagementPage';

import FAQManagementPage from './FAQManagementPage';

// Placeholder สำหรับหน้าอื่นๆ
const PlaceholderPage = ({ title, icon }: { title?: ReactNode; icon?: ReactNode }) => (
  <div className={styles.placeholderContent}>
    <div className={styles.placeholderIcon}>{icon}</div>
    <h2>{title}</h2>
    <p>ระบบกำลังอยู่ระหว่างการพัฒนา...</p>
  </div>
);

// Card Template (ดีไซน์ใหม่)
interface ServiceCardProps {
  title?: ReactNode;
  desc?: ReactNode;
  icon?: ReactNode;
  link?: string;
  colorClass?: string;
}

function ServiceCard({ title, desc, icon, link, colorClass }: ServiceCardProps) {
  return (
    <Link to={link ?? ''} className={`${styles.serviceCard} ${colorClass ? styles[colorClass] : ''}`}>
      <div className={styles.serviceIconWrapper}>
        {icon}
      </div>
      <div className={styles.serviceContent}>
        <h3 className={styles.serviceTitle}>{title}</h3>
        <p className={styles.serviceDesc}>{desc}</p>
        <span className={styles.serviceLinkText}>จัดการข้อมูล <FaArrowRight size={12} /></span>
      </div>
    </Link>
  );
}

// Alias for reusing the card design
type CardAliasProps = Omit<ServiceCardProps, 'colorClass'>;
const FitmentCard = (props: CardAliasProps) => <ServiceCard {...props} colorClass="cardOrange" />;
const MaintenanceCard = (props: CardAliasProps) => <ServiceCard {...props} colorClass="cardGreen" />;
const UpgradeCard = (props: CardAliasProps) => <ServiceCard {...props} colorClass="cardRed" />;
const WrapCarCard = (props: CardAliasProps) => <ServiceCard {...props} colorClass="cardPurple" />;

// Widget Card Component for Home
interface HomeWidgetProps {
  title?: ReactNode;
  count?: ReactNode;
  icon?: ReactNode;
  color?: string;
  subtext?: ReactNode;
}
const HomeWidget = ({ title, count, icon, color, subtext }: HomeWidgetProps) => (
  <div className={styles.statCard} style={{ borderTopColor: color }}>
    <div className={styles.statContent}>
      <div>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statValue} style={{ color: color }}>{count}</div>
        <p className={styles.statSub}>{subtext}</p>
      </div>
      <div className={styles.statIcon} style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
    </div>
  </div>
);

// Quick Action Card
interface QuickLinkProps {
  to?: string;
  title?: ReactNode;
  icon?: ReactNode;
  color?: string;
}
const QuickLink = ({ to, title, icon, color }: QuickLinkProps) => (
  <Link to={to ?? ''} className={styles.quickLink}>
    <div className={styles.quickLinkIcon} style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      {icon}
    </div>
    <span>{title}</span>
  </Link>
);

function DashboardPage({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className={styles.dashboardLayout}>
      <DashboardHeader onLogout={onLogout} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />

            {/* --- Data Management Routes --- */}
            <Route path="product-supplier-manager" element={<ProductSupplierManager />} />
            <Route path="products" element={
              <ProtectedRoute resource="products" action="read">
                <ProductManagementPage />
              </ProtectedRoute>
            } />

            {/* 🔥 แก้ไข Path ให้ตรงกับที่คุณระบุคือ dealer-management */}
            <Route path="dealer-management" element={
              <ProtectedRoute resource="dealer" action="read">
                <DealerManagementPage />
              </ProtectedRoute>
            } />

            {/* Route ใหม่: เมนูบริการค่าแรง 5 หัวข้อ */}
            <Route path="services" element={<ServiceMenuPage />} />
            <Route path="services/manage" element={<ServiceManagementPage />} />

            {/* จัดการข้อมูลจัดทรง */}
            <Route path="services/fitment" element={
              <div className={styles.sectionPage}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><span className={styles.iconBadge}>🚗</span> จัดการข้อมูลจัดทรง</h2>
                  <p className={styles.sectionSubtitle}>บริหารจัดการข้อมูลช่วงล่าง ล้อ และยาง</p>
                </div>
                <div className={styles.gridContainer}>
                  <FitmentCard title="ศูนย์ล้อ" desc="ตั้งศูนย์ล้อรถยนต์ทุกประเภท" icon={<FaCar size={24} />} link="/dashboard/alignment-management" />
                  <FitmentCard title="ลูกหมาก" desc="จัดการข้อมูลลูกหมากรถยนต์" icon={<FaWrench size={24} />} link="/dashboard/ball-joints-management" />
                  <FitmentCard title="โช้คอัพ" desc="ข้อมูลโช้คอัพและการเปลี่ยน" icon={<FaBoxOpen size={24} />} link="/dashboard/shock-absorber-management" />
                  <FitmentCard title="ล้อและยาง" desc="ข้อมูลล้อและยางรถยนต์" icon={<FaTags size={24} />} link="/dashboard/wheels-tires-management" />
                  <FitmentCard title="ช่วงล่าง" desc="ข้อมูลช่วงล่างและอะไหล่" icon={<FaCar size={24} />} link="/dashboard/suspension-management" />
                </div>
              </div>
            } />

            {/* จัดการข้อมูลบำรุงรักษา */}
            <Route path="services/maintenance" element={
              <div className={styles.sectionPage}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><span className={styles.iconBadge}>🛠️</span> จัดการข้อมูลบำรุงรักษา</h2>
                  <p className={styles.sectionSubtitle}>บริหารจัดการงานซ่อมบำรุงพื้นฐานและของเหลว</p>
                </div>
                <div className={styles.gridContainer}>
                  <MaintenanceCard title="ล้างท่อ" desc="บริการล้างท่อไอดี" icon={<FaWrench size={24} />} link="/dashboard/pipe-clean-management" />
                  <MaintenanceCard title="Engine Spa" desc="บริการฟื้นฟูเครื่องยนต์" icon={<FaBoxOpen size={24} />} link="/dashboard/engine-spa-management" />
                  <MaintenanceCard title="เปลี่ยนของเหลว" desc="น้ำมันเครื่อง เกียร์ เบรค" icon={<FaTags size={24} />} link="/dashboard/fluid-change-management" />
                  <MaintenanceCard title="แอร์" desc="บริการดูแลระบบแอร์รถยนต์" icon={<FaCar size={24} />} link="/dashboard/aircon-management" />
                </div>
              </div>
            } />

            {/* จัดการข้อมูลอัปเกรด */}
            <Route path="services/upgrade" element={
              <div className={styles.sectionPage}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><span className={styles.iconBadge}>🚀</span> จัดการข้อมูลอัปเกรด</h2>
                  <p className={styles.sectionSubtitle}>เพิ่มสมรรถนะเครื่องยนต์และระบบต่างๆ</p>
                </div>
                <div className={styles.gridContainer}>
                  <UpgradeCard title="ท่อไอเสียแต่ง" desc="ท่อแต่งและการติดตั้ง" icon={<FaBoxOpen size={24} />} link="/dashboard/custom-exhaust-management" />
                  <UpgradeCard title="Remap" desc="บริการ Remap ECU" icon={<FaTags size={24} />} link="/dashboard/remap-management" />
                  <UpgradeCard title="Remote Control" desc="คันเร่งไฟฟ้าและรีโมท" icon={<FaCar size={24} />} link="/dashboard/remote-control-management" />
                  <UpgradeCard title="Turbo/Inter" desc="เทอร์โบและอินเตอร์คูลเลอร์" icon={<FaWrench size={24} />} link="/dashboard/turbo-inter-management" />
                  <UpgradeCard title="วาล์ว" desc="ข้อมูลวาล์วและอะไหล่" icon={<FaBoxOpen size={24} />} link="/dashboard/valve-service-management" />
                </div>
              </div>
            } />

            {/* จัดการข้อมูล Wrap/Sticker */}
            <Route path="services/wrapcar" element={
              <div className={styles.sectionPage}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><span className={styles.iconBadge}>🎨</span> จัดการข้อมูล Wrap/Sticker</h2>
                  <p className={styles.sectionSubtitle}>งานตกแต่งภายนอก ฟิล์ม และสติ๊กเกอร์</p>
                </div>
                <div className={styles.gridContainer}>
                  <WrapCarCard title="Boost Gauge" desc="ข้อมูลเกจวัดแรงดัน" icon={<FaTags size={24} />} link="/dashboard/boost-gauge-management" />
                  <WrapCarCard title="Exhaust" desc="ข้อมูลท่อไอเสีย (ตกแต่ง)" icon={<FaBoxOpen size={24} />} link="/dashboard/exhaust-management" />
                  <WrapCarCard title="ฟิล์มกันรอย" desc="บริการฟิล์มกันรอยรถยนต์" icon={<FaCar size={24} />} link="/dashboard/film-protect-management" />
                  <WrapCarCard title="สติ๊กเกอร์" desc="ข้อมูลสติ๊กเกอร์ตกแต่ง" icon={<FaTags size={24} />} link="/dashboard/sticker-management" />
                </div>
              </div>
            } />

            <Route path="promotion" element={
              <ProtectedRoute resource="promotions" action="read">
                <PromotionManagementPage />
              </ProtectedRoute>
            } />
            <Route path="car" element={
              <ProtectedRoute resource="cars" action="read">
                <CarManagementPage />
              </ProtectedRoute>
            } />
            <Route path="sticker" element={
              <ProtectedRoute resource="stickers" action="read">
                <StickerDashboard />
              </ProtectedRoute>
            } />
            <Route path="users" element={<UserManagementPage />} />

            {/* --- Service Sub-Routes --- */}
            <Route path="pipe-clean-management" element={<PipeCleanManagementPage />} />
            <Route path="engine-spa-management" element={<EngineSpaManagementPage />} />
            <Route path="fluid-change-management" element={<FluidChangeManagementPage />} />
            <Route path="aircon-management" element={<AirConManagementPage />} />

            <Route path="alignment-management" element={<AlignmentManagementPage />} />
            <Route path="ball-joints-management" element={<BallJointsManagementPage />} />
            <Route path="shock-absorber-management" element={<ShockAbsorberManagementPage />} />
            <Route path="wheels-tires-management" element={<WheelsTiresManagementPage />} />
            <Route path="suspension-management" element={<SuspensionManagementPage />} />

            <Route path="custom-exhaust-management" element={<CustomExhaustManagementPage />} />
            <Route path="remap-management" element={<RemapManagementPage />} />
            <Route path="remote-control-management" element={<RemoteControlManagementPage />} />
            <Route path="turbo-inter-management" element={<TurboInterManagementPage />} />
            <Route path="valve-service-management" element={<ValveServiceManagementPage />} />

            <Route path="boost-gauge-management" element={<BoostGaugeManagementPage />} />
            <Route path="exhaust-management" element={<ExhaustManagementPage />} />
            <Route path="film-protect-management" element={<FilmProtectManagementPage />} />
            <Route path="sticker-management" element={<StickerManagementPage />} />

            {/* --- Content Management Routes --- */}
            <Route path="portfolio" element={
              <ProtectedRoute resource="portfolio" action="read">
                <PortfolioManagementPage />
              </ProtectedRoute>
            } />
            <Route path="contact" element={
              <ProtectedRoute resource="contact" action="read">
                <ContactManagementPage />
              </ProtectedRoute>
            } />
            <Route path="blog" element={
              <ProtectedRoute resource="blog" action="read">
                <BlogManagementPage />
              </ProtectedRoute>
            } />
            <Route path="livestream" element={
              <ProtectedRoute resource="livestream" action="read">
                <LiveStreamPage />
              </ProtectedRoute>
            } />

            <Route path="faq-management" element={<FAQManagementPage />} />
            <Route path="faq" element={<PlaceholderPage title="จัดการคำถามที่พบบ่อย" icon={<FaQuestionCircle />} />} />
          </Routes>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}

function DashboardHome() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.welcomeSection}>
        <div>
          <h1>สวัสดี, ผู้ดูแลระบบ 👋</h1>
          <p>ยินดีต้อนรับสู่ระบบจัดการ GT7 Motor System ภาพรวมของคุณวันนี้</p>
        </div>
        <div className={styles.dateDisplay}>
          {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <HomeWidget title="คำสั่งซื้อรอตรวจสอบ" count="5" subtext="อัปเดตเมื่อ 5 นาทีที่แล้ว" icon={<FaBoxOpen />} color="#000000" />
        <HomeWidget title="สินค้าใกล้หมด" count="2" subtext="ต้องเติมสต็อกทันที" icon={<FaTags />} color="#000000" />
        <HomeWidget title="นัดหมายวันนี้" count="8" subtext="คิวเต็มช่วงบ่าย" icon={<FaCar />} color="#000000" />
        <HomeWidget title="ข้อความใหม่" count="12" subtext="จากลูกค้าทางหน้าเว็บ" icon={<FaCommentDots />} color="#000000" />
      </div>

      <div className={styles.dashboardContentGrid}>
        {/* Main Actions */}
        <div className={styles.mainActions}>
          <h2 className={styles.sectionHeaderTitle}>เมนูลัดจัดการระบบ</h2>
          <div className={styles.quickLinksGrid}>
             <QuickLink to="/dashboard/products" title="สินค้าอะไหล่" icon={<FaBoxOpen />} color="#000000" />
             <QuickLink to="/dashboard/services/manage" title="บริการ" icon={<FaWrench />} color="#000000" />
             <QuickLink to="/dashboard/promotion" title="โปรโมชั่น" icon={<FaTags />} color="#000000" />
             <QuickLink to="/dashboard/car" title="รุ่นรถยนต์" icon={<FaCar />} color="#000000" />
             <QuickLink to="/dashboard/sticker" title="สติ๊กเกอร์" icon={<FaImages />} color="#000000" />
             <QuickLink to="/dashboard/portfolio" title="ผลงาน" icon={<FaImages />} color="#000000" />
             <QuickLink to="/dashboard/blog" title="บทความ" icon={<FaNewspaper />} color="#000000" />
             <QuickLink to="/dashboard/users" title="ผู้ใช้งาน" icon={<FaUsers />} color="#000000" />

             {/* 🔥 เพิ่มปุ่ม Dealer Management ตรงนี้ 🔥 */}
             <QuickLink to="/dashboard/dealer-management" title="ตัวแทนจำหน่าย" icon={<FaStore />} color="#000000" />
          </div>

          <div className={styles.servicePreviewSection}>
             <h3><FaWrench style={{ marginRight: 8 }}/> หมวดหมู่บริการหลัก</h3>
             <div className={styles.serviceTags}>
                <Link to="/dashboard/services/maintenance" className={styles.serviceTag}>
                  <span className={styles.dot} style={{background: '#d60000'}}></span> ดูแลรักษาเครื่องยนต์
                </Link>
                <Link to="/dashboard/services/fitment" className={styles.serviceTag}>
                  <span className={styles.dot} style={{background: '#d60000'}}></span> จัดทรง
                </Link>
                <Link to="/dashboard/services/upgrade" className={styles.serviceTag}>
                  <span className={styles.dot} style={{background: '#d60000'}}></span> อัพเกรดเครื่องยนต์
                </Link>
                <Link to="/dashboard/services/wrapcar" className={styles.serviceTag}>
                  <span className={styles.dot} style={{background: '#d60000'}}></span> งานประดับยนต์ยนต์ & แร็ปสติ๊กเกอร์
                </Link>
             </div>
          </div>
        </div>

        {/* Side Panel Info */}
        <div className={styles.sidePanel}>
           <div className={styles.infoCard}>
             <h3>สถานะระบบ</h3>
             <ul className={styles.systemStatusList}>
               <li className={styles.statusOk}><span>Database</span> <span>Online</span></li>
               <li className={styles.statusOk}><span>API Server</span> <span>Online</span></li>
               <li className={styles.statusWarning}><span>Image Server</span> <span>High Load</span></li>
             </ul>
           </div>

           <div className={styles.infoCard}>
              <h3>กิจกรรมล่าสุด</h3>
              <ul className={styles.activityList}>
                <li>
                  <span className={styles.time}>10:30</span>
                  <p>Admin เพิ่มสินค้า <b>ล้อแม็ก TE37</b></p>
                </li>
                <li>
                  <span className={styles.time}>09:15</span>
                  <p>User A อัปเดตสถานะงานซ่อม</p>
                </li>
                <li>
                  <span className={styles.time}>08:45</span>
                  <p>ระบบสำรองข้อมูลอัตโนมัติ</p>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>© 2025 GT7 Motor System. All rights reserved.</p>
        <div className={styles.footerLinks}>
           <span>Version 2.5.0</span>
           <span>Support</span>
        </div>
      </div>
    </footer>
  );
}

export default DashboardPage;