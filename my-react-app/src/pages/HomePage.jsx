// src/pages/PublicSite.jsx

import React, { useState, useEffect } from 'react';

import Header from '../components/Layout/Header';
import HeroSection from '../components/PageSections/HeroSection';
import ProductCarousel from '../components/Product/ProductCarousel';
import BlogSection from '../components/Blog/BlogSection';
import Footer from '../components/Layout/Footer';
import PosterCarousel from '../components/PageSections/PosterCarousel';
import CarColorizer from '../components/PageSections/CarColorizer';
import PlaceholderBanner from '../components/PageSections/PlaceholderBanner'; 
import { apiGet } from '../utils/api';
import { getImageUrl } from '../utils/productHelpers';

// (removed mock homepage sections)


function PublicSite({ onLogout }) {
  
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Use central API helper so VITE_API_URL is respected
        const [rawProducts, rawServices] = await Promise.all([
          apiGet('/api/inventory/products?active=true'),
          apiGet('/api/services/services')
        ]);

        const productsList = Array.isArray(rawProducts) ? rawProducts : (rawProducts.items || rawProducts || []);
        const servicesList = Array.isArray(rawServices) ? rawServices : (rawServices.items || rawServices || []);

        const mapProduct = (p) => ({
          id: p.product_template_id || p.id || p.product_id,
          title: p.product_name || p.title || p.name || '',
          imageUrl: getImageUrl((p.images && (p.images[0]?.image_url || p.images[0]?.url)) || p.imageUrl || p.image_url || ''),
          price: Number(p.variants?.[0]?.unit_price ?? p.price ?? p.base_price ?? 0) || 0,
          discount: p.discount || p.discount_text || '',
          raw: p
        });

        const mapService = (s) => ({
          id: s.service_id || s.id,
          title: s.service_name || s.title || s.name || '',
          imageUrl: getImageUrl((s.images && (s.images[0]?.image_url || s.images[0]?.url)) || s.imageUrl || s.image_url || ''),
          price: Number(s.base_labor_cost ?? s.price ?? (s.pricings && s.pricings[0]?.price) ?? 0) || 0,
          discount: s.discount || '',
          raw: s
        });

        const pickPopular = (arr, mapFn, flags = ['is_popular', 'is_featured', 'popular']) => {
          const mapped = arr.map(mapFn);
          const flagged = arr.map((src, i) => ({ src, mapped: mapped[i] })).filter(({ src }) => flags.some(f => src && (src[f] === true || src[f] === 1 || src[f] === '1'))).map(x => x.mapped);
          if (flagged.length > 0) return flagged.slice(0, 8);
          return mapped.slice(0, 8);
        };

        const popularP = pickPopular(productsList, mapProduct);
        const popularS = pickPopular(servicesList, mapService);

        setPopularProducts(popularP);
        setPopularServices(popularS);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoadingError(error?.message || String(error));
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="App">
      <Header onLogout={onLogout} />
      <HeroSection />
      
      <PosterCarousel />
      
      <CarColorizer />
      
      <PlaceholderBanner />

      <div className="main-container">
        
        {/* === 🌟 ส่วนนี้จะแสดงเฉพาะสินค้าที่กด "ดาว" (Popular) แล้วเท่านั้น === */}
        {popularServices.length > 0 && (
             <ProductCarousel 
             title="บริการยอดนิยม" 
             items={popularServices} 
           />
        )}

        {popularProducts.length > 0 && (
            <ProductCarousel 
            title="สินค้ายอดนิยม" 
            items={popularProducts}
          />
        )}
       {/* =========================================================== */}

        {loadingError && (
          <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
            Failed to load popular items: {loadingError}
          </div>
        )}
        
        <BlogSection />
      </div>

      <Footer />
    </div>
  );
}

export default PublicSite;