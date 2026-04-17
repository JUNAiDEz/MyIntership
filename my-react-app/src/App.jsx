import FAQManagementPage from './pages/Dashboard/FAQManagementPage';
  {/* Route: FAQ Management (Dashboard) */}
  <Route path="/dashboard/faq-management" element={<FAQManagementPage />} />
import FAQDetailPage from './pages/FAQDetailPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';
import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'; 

import './index.css'; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Import ScrollToTop Component
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import FloatingMenu from './components/FloatingMenu';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductSupplierManager from './pages/Dashboard/ProductSupplierManager';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OurService from './pages/servicePages/OurService';
import PipeClean from './pages/servicePages/Maintenance/PipeClean';
import PipeCleanTest from './pages/servicePages/Maintenance/PipeCleanTest';
import FluidChange from './pages/servicePages/Maintenance/FluidChange';
import EngineSpa from './pages/servicePages/Maintenance/EngineSpa';
import AirCon from './pages/servicePages/Maintenance/AirCon';
import ShockAbsorber from './pages/servicePages/Fitment/ShockAbsorber';
import WheelsTires from './pages/servicePages/Fitment/WheelsTires';
import Alignment from './pages/servicePages/Fitment/Alignment';
import BallJoints from './pages/servicePages/Fitment/BallJoints';
import FilmProtect from './pages/servicePages/WrapCar/FilmProtect';
import Sticker from './pages/servicePages/WrapCar/Sticker';
import BoostGauge from './pages/servicePages/WrapCar/BoostGauge';
import Exhaust from './pages/servicePages/WrapCar/Exhaust';
import Gt7 from './pages/servicePages/Product/Gt7';
import Step1 from './pages/servicePages/Product/Step1';
import Nano from './pages/servicePages/Product/Nano';
import Mmax from './pages/servicePages/Product/Mmax';
import Perfume from './pages/servicePages/Product/Perfume';
import Suspension from './pages/servicePages/Fitment/Suspension';
import Remap from './pages/servicePages/Upgrade/Remap';
import CustomExhaust from './pages/servicePages/Upgrade/CustomExhaust';
import TurboInter from './pages/servicePages/Upgrade/TurboInter';
import ValveService from './pages/servicePages/Upgrade/ValveService';
import RemoteControl from './pages/servicePages/Upgrade/RemoteControl';
import PromotionPage from './pages/PromotionPage';
import PromotionDetailPage from './pages/PromotionDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import FAQPage from './pages/FAQPage';
import VehicleModelsPage from './pages/VehicleModelsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import VehicleDetailPage from './pages/VehicleDetailPage';

import ServicePreview from './pages/Dashboard/ServicePreview';
import ServicePreviewManagementPage from './pages/Dashboard/ServicePreviewManagementPage';
import PipeCleanManagementPage from './pages/Dashboard/MaintenanceManagement/PipeCleanManagementPage';
import AlignmentManagementPage from './pages/Dashboard/FitmentManagement/AlignmentManagementPage';
import BallJointsManagementPage from './pages/Dashboard/FitmentManagement/BallJointsManagementPage';
import ShockAbsorberManagementPage from './pages/Dashboard/FitmentManagement/ShockAbsorberManagementPage';

import WheelsTiresManagementPage from './pages/Dashboard/FitmentManagement/WheelsTiresManagementPage';
import SuspensionManagementPage from './pages/Dashboard/FitmentManagement/SuspensionManagementPage';
import CustomExhaustManagementPage from './pages/Dashboard/UpgradeManagement/CustomExhaustManagementPage';
import RemapManagementPage from './pages/Dashboard/UpgradeManagement/RemapManagementPage';
import RemoteControlManagementPage from './pages/Dashboard/UpgradeManagement/RemoteControlManagementPage';
import TurboInterManagementPage from './pages/Dashboard/UpgradeManagement/TurboInterManagementPage';
import ValveServiceManagementPage from './pages/Dashboard/UpgradeManagement/ValveServiceManagementPage';
import BoostGaugeManagementPage from './pages/Dashboard/WrapCarManagement/BoostGaugeManagementPage';
import ExhaustManagementPage from './pages/Dashboard/WrapCarManagement/ExhaustManagementPage';

import FilmProtectManagementPage from './pages/Dashboard/WrapCarManagement/FilmProtectManagementPage';
import StickerManagementPage from './pages/Dashboard/WrapCarManagement/StickerManagementPage';
import DealerManagementPage from './pages/Dashboard/DealerManagementPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  const handleLoginSuccess = (receivedToken) => {
    localStorage.setItem('adminToken', receivedToken);
    setToken(receivedToken);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/');
  };

  // ข้อมูลจำลองสำหรับหน้า Preview
  const previewMockData = {
    title: "Exhaust Service Preview",
    description: "บริการติดตั้งท่อไอเสียแต่ง ท่อสแตนเลส ไทเทเนียม พร้อมปรับเสียงและสมรรถนะ โดยช่างผู้เชี่ยวชาญ",
    heroImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600",
    layout: [
      { 
        type: 'HERO', 
        props: { 
          title: 'EXHAUST SERVICE', 
          subtitle: 'ติดตั้งท่อไอเสีย เพิ่มแรงม้า ปรับเสียง', 
          bgImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600' 
        } 
      },
      {
        type: 'REVIEWS',
        props: {
          reviewItems: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000', title: 'งานติดตั้งท่อ HKS', desc: 'ติดตั้งตรงรุ่น เสียงนุ่มแน่น' },
            { type: 'video', videoId: 'QwZT7T-TXT0', title: 'รีวิวเสียงท่อ', desc: 'ทดสอบเสียงหลังติดตั้งเสร็จ' }
          ]
        }
      },
      { type: 'MAP', props: {} }
    ],
    pricingData: [
      { 
        brand: 'HKS', 
        models: [ 
          { name: 'HKS Hi-Power', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600', price: '12,000.-', stage: 'Stainless', note: 'เสียงนุ่ม ทนทาน' } 
        ] 
      }
    ],
    relatedLinks: [
      { label: 'FLUID CHANGE', sub: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
      { label: 'ENGINE SPA', sub: 'สปาเครื่องยนต์', path: '/services/engine-spa' }
    ]
  };

  return (
    <>
      <ScrollToTop />
      <FloatingMenu />
      <div className="p-4">
        <Routes>
          {/* Route: Fluid Change Management (shortcut) */}
          {/* Route: Dashboard (ป้องกัน) */}
          <Route 
            path="/dashboard/*"
            element={
              <ProtectedRoute token={token}>
                <DashboardPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          {/* Route สำหรับหน้าผูกสินค้า-ซัพพายเออร์ */}
          <Route 
            path="/dashboard/product-supplier-manager"
            element={
              <ProtectedRoute token={token}>
                <ProductSupplierManager />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/shop" 
            element={<ShopPage onLogout={handleLogout} />} 
          />
          <Route 
            path="/shop/:slug" 
            element={<ProductDetailPage onLogout={handleLogout} />} 
          />

          {/* Route: Services */}
          <Route 
            path="/ourservices" 
            element={<OurService onLogout={handleLogout} />} 
          />

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

          {/* Film Protect Management Page Route */}
          <Route path="/dashboard/film-protect-management" element={<ProtectedRoute token={token}><FilmProtectManagementPage /></ProtectedRoute>} />
          {/* Sticker Management Page Route */}
          <Route path="/dashboard/sticker-management" element={<ProtectedRoute token={token}><StickerManagementPage /></ProtectedRoute>} />
          <Route path="/services/turbo-inter" element={<TurboInter onLogout={handleLogout} />} />
          <Route path="/services/valve-service" element={<ValveService onLogout={handleLogout} />} />

          <Route path="/services/remote-control" element={<RemoteControl onLogout={handleLogout} />} />
          {/* Route: PipeCleanTest */}
          <Route path="/services/pipe-clean-test" element={<PipeCleanTest onLogout={handleLogout} />} />

          {/* Route: Product */}
          <Route path="/product/gt7" element={<Gt7 onLogout={handleLogout} />} />
          <Route path="/product/step-1" element={<Step1 onLogout={handleLogout} />} />
          <Route path="/product/nano" element={<Nano onLogout={handleLogout} />} />
          <Route path="/product/mmax" element={<Mmax onLogout={handleLogout} />} />
          <Route path="/product/perfume" element={<Perfume onLogout={handleLogout} />} />

          {/* Route: Main Pages */}
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

          {/* Route: ServicePreview (Dashboard) พร้อมส่ง Mock Data */}
          <Route
            path="/dashboard/service-preview"
            element={<ServicePreview adminData={previewMockData} />}
          />


          {/* Route: ServicePreviewManagementPage (Dashboard) */}
          <Route
            path="/dashboard/service-preview-management"
            element={<ServicePreviewManagementPage />}
          />

          {/* Route: PipeCleanManagementPage (Dashboard) */}
          <Route
            path="/dashboard/pipe-clean-management"
            element={<PipeCleanManagementPage />}
          />

          {/* Route: Alignment Management (Dashboard) */}
          <Route path="/dashboard/alignment-management" element={<AlignmentManagementPage />} />

          {/* Route: Ball Joints Management (Dashboard) */}
          <Route path="/dashboard/ball-joints-management" element={<BallJointsManagementPage />} />

          {/* Route: Shock Absorber Management (Dashboard) */}
          <Route path="/dashboard/shock-absorber-management" element={<ShockAbsorberManagementPage />} />

          {/* Route: Wheels & Tires Management (Dashboard) */}
          <Route path="/dashboard/wheels-tires-management" element={<WheelsTiresManagementPage />} />

          {/* Route: Suspension Management (Dashboard) */}
          <Route path="/dashboard/suspension-management" element={<SuspensionManagementPage />} />


          {/* Route: Custom Exhaust Management (Dashboard) */}
          <Route path="/dashboard/custom-exhaust-management" element={<CustomExhaustManagementPage />} />

          {/* Route: Remap Management (Dashboard) */}
          <Route path="/dashboard/remap-management" element={<RemapManagementPage />} />

          {/* Route: Remote Control Management (Dashboard) */}
          <Route path="/dashboard/remote-control-management" element={<RemoteControlManagementPage />} />

          {/* Route: Turbo Inter Management (Dashboard) */}
          <Route path="/dashboard/turbo-inter-management" element={<TurboInterManagementPage />} />

          {/* Route: Valve Service Management (Dashboard) */}
          <Route path="/dashboard/valve-service-management" element={<ValveServiceManagementPage />} />
          
          {/* Route: Boost Gauge Management (Dashboard) */}
          <Route path="/dashboard/boost-gauge-management" element={<BoostGaugeManagementPage />} />
          {/* Route: Exhaust Management (Dashboard) */}
          <Route path="/dashboard/exhaust-management" element={<ExhaustManagementPage />} />

          <Route path="/dashboard/dealer-management" element={<ProtectedRoute token={token}><DealerManagementPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;