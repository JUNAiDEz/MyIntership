import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'; 

import './index.css'; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import HomePage from './pages/HomePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ShopPage from './pages/ShopPage';
import OurService from './pages/servicePages/OurService';
import PipeClean from './pages/servicePages/Maintenance/PipeClean';
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
import PortfolioPage from './pages/PortfolioPage';
import FAQPage from './pages/FAQPage';
import VehicleModelsPage from './pages/VehicleModelsPage';

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

  return (
    <Routes>
      {/* Route: Login removed — use LoginModal from the header (YellowNavbar) for login */}

      {/* Route: Dashboard (ป้องกัน) */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute token={token}>
            <DashboardPage onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />

         <Route 
        path="/shop" 
        element={<ShopPage onLogout={handleLogout} />} 
      /> 

      {/* Route: Services */}
      <Route 
        path="/ourservices" 
        element={<OurService onLogout={handleLogout} />} 
      />

      {/* Route สำหรับหน้าล้างท่อ */}
      <Route 
        path="/services/pipe-cleaning" 
        element={<PipeClean onLogout={handleLogout} />} 
      />

     {/* Route สำหรับหน้าล้างท่อ */}
      <Route 
        path="/services/fluid-change" 
        element={<FluidChange onLogout={handleLogout} />} 
      />

     {/* Route สำหรับหน้าล้างท่อ */}
      <Route 
        path="/services/engine-spa" 
        element={<EngineSpa onLogout={handleLogout} />} 
      />

     {/* Route สำหรับหน้าล้างท่อ */}
      <Route 
        path="/services/air-con" 
        element={<AirCon onLogout={handleLogout} />} 
      />

     {/* Route สำหรับหน้าล้างท่อ */}
      <Route 
        path="/services/shock-absorber" 
        element={<ShockAbsorber onLogout={handleLogout} />} 
      />     

      <Route 
        path="/services/wheels-tyres" 
        element={<WheelsTires onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/film-protect" 
        element={<FilmProtect onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/sticker" 
        element={<Sticker onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/boost-gauge" 
        element={<BoostGauge onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/exhaust" 
        element={<Exhaust onLogout={handleLogout} />} 
      />

      <Route 
        path="/product/gt7" 
        element={<Gt7 onLogout={handleLogout} />} 
      />

      <Route 
        path="/product/step-1" 
        element={<Step1 onLogout={handleLogout} />} 
      />

      <Route 
        path="/product/nano" 
        element={<Nano onLogout={handleLogout} />} 
      />

      <Route 
        path="/product/mmax" 
        element={<Mmax onLogout={handleLogout} />} 
      />

      <Route 
        path="/product/perfume" 
        element={<Perfume onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/alignment" 
        element={<Alignment onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/ball-joints" 
        element={<BallJoints onLogout={handleLogout} />} 
      />

      {/* New Service Routes */}
      <Route 
        path="/services/suspension" 
        element={<Suspension onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/remap" 
        element={<Remap onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/custom-exhaust" 
        element={<CustomExhaust onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/turbo-inter" 
        element={<TurboInter onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/valve-service" 
        element={<ValveService onLogout={handleLogout} />} 
      />

      <Route 
        path="/services/remote-control" 
        element={<RemoteControl onLogout={handleLogout} />} 
      />

      {/* Route: หน้าเว็บหลัก (HomePage) */}
      <Route 
        path="/" 
        element={<HomePage onLogout={handleLogout} />} 
      />

      {/* Route: Portfolio / Our Cars */}
      <Route
        path="/portfolio"
        element={<PortfolioPage onLogout={handleLogout} />}
      />

      {/* Route: FAQ */}
      <Route
        path="/faq"
        element={<FAQPage onLogout={handleLogout} />}
      />

      {/* Route: Promotions */}
      <Route
        path="/promotions"
        element={<PromotionPage onLogout={handleLogout} />}
      />

      {/* Route: Vehicle models selector */}
      <Route
        path="/car"
        element={<VehicleModelsPage onLogout={handleLogout} />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;