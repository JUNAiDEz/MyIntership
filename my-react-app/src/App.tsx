import { useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import './index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Eager (เล็ก + ใช้ทุกหน้า/เป็น guard)
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import FloatingMenu from './components/FloatingMenu';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Loader from './components/Loading/Loader';

// Lazy — แต่ละหน้าโหลดเฉพาะตอนเข้า route นั้น (code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const PromotionPage = lazy(() => import('./pages/PromotionPage'));
const PromotionDetailPage = lazy(() => import('./pages/PromotionDetailPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PortfolioDetailPage = lazy(() => import('./pages/PortfolioDetailPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const FAQDetailPage = lazy(() => import('./pages/FAQDetailPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const VehicleModelsPage = lazy(() => import('./pages/VehicleModelsPage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));

// Service pages
const OurService = lazy(() => import('./pages/servicePages/OurService'));
const PipeClean = lazy(() => import('./pages/servicePages/Maintenance/PipeClean'));
const PipeCleanTest = lazy(() => import('./pages/servicePages/Maintenance/PipeCleanTest'));
const FluidChange = lazy(() => import('./pages/servicePages/Maintenance/FluidChange'));
const EngineSpa = lazy(() => import('./pages/servicePages/Maintenance/EngineSpa'));
const AirCon = lazy(() => import('./pages/servicePages/Maintenance/AirCon'));
const ShockAbsorber = lazy(() => import('./pages/servicePages/Fitment/ShockAbsorber'));
const WheelsTires = lazy(() => import('./pages/servicePages/Fitment/WheelsTires'));
const Alignment = lazy(() => import('./pages/servicePages/Fitment/Alignment'));
const BallJoints = lazy(() => import('./pages/servicePages/Fitment/BallJoints'));
const Suspension = lazy(() => import('./pages/servicePages/Fitment/Suspension'));
const FilmProtect = lazy(() => import('./pages/servicePages/WrapCar/FilmProtect'));
const Sticker = lazy(() => import('./pages/servicePages/WrapCar/Sticker'));
const BoostGauge = lazy(() => import('./pages/servicePages/WrapCar/BoostGauge'));
const Exhaust = lazy(() => import('./pages/servicePages/WrapCar/Exhaust'));
const Remap = lazy(() => import('./pages/servicePages/Upgrade/Remap'));
const CustomExhaust = lazy(() => import('./pages/servicePages/Upgrade/CustomExhaust'));
const TurboInter = lazy(() => import('./pages/servicePages/Upgrade/TurboInter'));
const ValveService = lazy(() => import('./pages/servicePages/Upgrade/ValveService'));
const RemoteControl = lazy(() => import('./pages/servicePages/Upgrade/RemoteControl'));
const Gt7 = lazy(() => import('./pages/servicePages/Product/Gt7'));
const Step1 = lazy(() => import('./pages/servicePages/Product/Step1'));
const Nano = lazy(() => import('./pages/servicePages/Product/Nano'));
const Mmax = lazy(() => import('./pages/servicePages/Product/Mmax'));
const Perfume = lazy(() => import('./pages/servicePages/Product/Perfume'));

// Dashboard (admin) — แยกออกจาก bundle หน้าสาธารณะทั้งหมด
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ProductSupplierManager = lazy(() => import('./pages/Dashboard/ProductSupplierManager'));
const ServicePreview = lazy(() => import('./pages/Dashboard/ServicePreview'));
const ServicePreviewManagementPage = lazy(() => import('./pages/Dashboard/ServicePreviewManagementPage'));
const PipeCleanManagementPage = lazy(() => import('./pages/Dashboard/MaintenanceManagement/PipeCleanManagementPage'));
const AlignmentManagementPage = lazy(() => import('./pages/Dashboard/FitmentManagement/AlignmentManagementPage'));
const BallJointsManagementPage = lazy(() => import('./pages/Dashboard/FitmentManagement/BallJointsManagementPage'));
const ShockAbsorberManagementPage = lazy(() => import('./pages/Dashboard/FitmentManagement/ShockAbsorberManagementPage'));
const WheelsTiresManagementPage = lazy(() => import('./pages/Dashboard/FitmentManagement/WheelsTiresManagementPage'));
const SuspensionManagementPage = lazy(() => import('./pages/Dashboard/FitmentManagement/SuspensionManagementPage'));
const CustomExhaustManagementPage = lazy(() => import('./pages/Dashboard/UpgradeManagement/CustomExhaustManagementPage'));
const RemapManagementPage = lazy(() => import('./pages/Dashboard/UpgradeManagement/RemapManagementPage'));
const RemoteControlManagementPage = lazy(() => import('./pages/Dashboard/UpgradeManagement/RemoteControlManagementPage'));
const TurboInterManagementPage = lazy(() => import('./pages/Dashboard/UpgradeManagement/TurboInterManagementPage'));
const ValveServiceManagementPage = lazy(() => import('./pages/Dashboard/UpgradeManagement/ValveServiceManagementPage'));
const BoostGaugeManagementPage = lazy(() => import('./pages/Dashboard/WrapCarManagement/BoostGaugeManagementPage'));
const ExhaustManagementPage = lazy(() => import('./pages/Dashboard/WrapCarManagement/ExhaustManagementPage'));
const FilmProtectManagementPage = lazy(() => import('./pages/Dashboard/WrapCarManagement/FilmProtectManagementPage'));
const StickerManagementPage = lazy(() => import('./pages/Dashboard/WrapCarManagement/StickerManagementPage'));
const DealerManagementPage = lazy(() => import('./pages/Dashboard/DealerManagementPage'));

// Fallback ระหว่างโหลด chunk
const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader />
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/');
  };

  // ข้อมูลจำลองสำหรับหน้า Preview
  const previewMockData = {
    title: 'Exhaust Service Preview',
    description: 'บริการติดตั้งท่อไอเสียแต่ง ท่อสแตนเลส ไทเทเนียม พร้อมปรับเสียงและสมรรถนะ โดยช่างผู้เชี่ยวชาญ',
    heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600',
    layout: [
      { type: 'HERO', props: { title: 'EXHAUST SERVICE', subtitle: 'ติดตั้งท่อไอเสีย เพิ่มแรงม้า ปรับเสียง', bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600' } },
      { type: 'REVIEWS', props: { reviewItems: [
        { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000', title: 'งานติดตั้งท่อ HKS', desc: 'ติดตั้งตรงรุ่น เสียงนุ่มแน่น' },
        { type: 'video', videoId: 'QwZT7T-TXT0', title: 'รีวิวเสียงท่อ', desc: 'ทดสอบเสียงหลังติดตั้งเสร็จ' },
      ] } },
      { type: 'MAP', props: {} },
    ],
    pricingData: [
      { brand: 'HKS', models: [{ name: 'HKS Hi-Power', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600', price: '12,000.-', stage: 'Stainless', note: 'เสียงนุ่ม ทนทาน' }] },
    ],
    relatedLinks: [
      { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
      { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
    ],
  };

  return (
    <>
      <ScrollToTop />
      <FloatingMenu />
      <div className="p-4">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Dashboard (ป้องกัน) */}
            <Route path="/dashboard/*" element={<ProtectedRoute token={token}><DashboardPage onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/dashboard/product-supplier-manager" element={<ProtectedRoute token={token}><ProductSupplierManager /></ProtectedRoute>} />

            <Route path="/shop" element={<ShopPage onLogout={handleLogout} />} />
            <Route path="/shop/:slug" element={<ProductDetailPage onLogout={handleLogout} />} />

            {/* Services */}
            <Route path="/ourservices" element={<OurService onLogout={handleLogout} />} />
            <Route path="/services/pipe-cleaning" element={<PipeClean onLogout={handleLogout} />} />
            <Route path="/services/fluid-change" element={<FluidChange onLogout={handleLogout} />} />
            <Route path="/services/engine-spa" element={<EngineSpa onLogout={handleLogout} />} />
            <Route path="/services/air-con" element={<AirCon onLogout={handleLogout} />} />
            <Route path="/services/shock-absorber" element={<ShockAbsorber onLogout={handleLogout} />} />
            <Route path="/services/wheels-tyres" element={<WheelsTires onLogout={handleLogout} />} />
            <Route path="/services/film-protect" element={<FilmProtect onLogout={handleLogout} />} />
            <Route path="/services/sticker" element={<Sticker onLogout={handleLogout} />} />
            <Route path="/services/boost-gauge" element={<BoostGauge onLogout={handleLogout} />} />
            <Route path="/services/exhaust" element={<Exhaust onLogout={handleLogout} />} />
            <Route path="/services/alignment" element={<Alignment onLogout={handleLogout} />} />
            <Route path="/services/ball-joints" element={<BallJoints onLogout={handleLogout} />} />
            <Route path="/services/suspension" element={<Suspension onLogout={handleLogout} />} />
            <Route path="/services/remap" element={<Remap onLogout={handleLogout} />} />
            <Route path="/services/custom-exhaust" element={<CustomExhaust onLogout={handleLogout} />} />
            <Route path="/services/turbo-inter" element={<TurboInter onLogout={handleLogout} />} />
            <Route path="/services/valve-service" element={<ValveService onLogout={handleLogout} />} />
            <Route path="/services/remote-control" element={<RemoteControl onLogout={handleLogout} />} />
            <Route path="/services/pipe-clean-test" element={<PipeCleanTest onLogout={handleLogout} />} />

            {/* Product */}
            <Route path="/product/gt7" element={<Gt7 onLogout={handleLogout} />} />
            <Route path="/product/step-1" element={<Step1 onLogout={handleLogout} />} />
            <Route path="/product/nano" element={<Nano onLogout={handleLogout} />} />
            <Route path="/product/mmax" element={<Mmax onLogout={handleLogout} />} />
            <Route path="/product/perfume" element={<Perfume onLogout={handleLogout} />} />

            {/* Main Pages */}
            <Route path="/" element={<HomePage onLogout={handleLogout} />} />
            <Route path="/portfolio" element={<PortfolioPage onLogout={handleLogout} />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetailPage onLogout={handleLogout} />} />
            <Route path="/faq" element={<FAQPage onLogout={handleLogout} />} />
            <Route path="/faq/:slug" element={<FAQDetailPage onLogout={handleLogout} />} />
            <Route path="/promotions" element={<PromotionPage onLogout={handleLogout} />} />
            <Route path="/promotions/:slug" element={<PromotionDetailPage onLogout={handleLogout} />} />
            <Route path="/car" element={<VehicleModelsPage onLogout={handleLogout} />} />
            <Route path="/blog" element={<BlogPage onLogout={handleLogout} />} />
            <Route path="/blog/:slug" element={<BlogDetailPage onLogout={handleLogout} />} />
            <Route path="/contact" element={<ContactPage onLogout={handleLogout} />} />
            <Route path="/vehicle/:slug" element={<VehicleDetailPage onLogout={handleLogout} />} />

            {/* Dashboard sub-pages */}
            <Route path="/dashboard/service-preview" element={<ServicePreview adminData={previewMockData} />} />
            <Route path="/dashboard/service-preview-management" element={<ServicePreviewManagementPage />} />
            <Route path="/dashboard/pipe-clean-management" element={<PipeCleanManagementPage />} />
            <Route path="/dashboard/alignment-management" element={<AlignmentManagementPage />} />
            <Route path="/dashboard/ball-joints-management" element={<BallJointsManagementPage />} />
            <Route path="/dashboard/shock-absorber-management" element={<ShockAbsorberManagementPage />} />
            <Route path="/dashboard/wheels-tires-management" element={<WheelsTiresManagementPage />} />
            <Route path="/dashboard/suspension-management" element={<SuspensionManagementPage />} />
            <Route path="/dashboard/custom-exhaust-management" element={<CustomExhaustManagementPage />} />
            <Route path="/dashboard/remap-management" element={<RemapManagementPage />} />
            <Route path="/dashboard/remote-control-management" element={<RemoteControlManagementPage />} />
            <Route path="/dashboard/turbo-inter-management" element={<TurboInterManagementPage />} />
            <Route path="/dashboard/valve-service-management" element={<ValveServiceManagementPage />} />
            <Route path="/dashboard/boost-gauge-management" element={<BoostGaugeManagementPage />} />
            <Route path="/dashboard/exhaust-management" element={<ExhaustManagementPage />} />
            <Route path="/dashboard/film-protect-management" element={<ProtectedRoute token={token}><FilmProtectManagementPage /></ProtectedRoute>} />
            <Route path="/dashboard/sticker-management" element={<ProtectedRoute token={token}><StickerManagementPage /></ProtectedRoute>} />
            <Route path="/dashboard/dealer-management" element={<ProtectedRoute token={token}><DealerManagementPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
