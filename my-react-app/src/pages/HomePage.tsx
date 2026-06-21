// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import Header from '../components/Layout/Header';
import HeroSection from '../components/PageSections/HeroSection';
import ProductCarousel from '../components/Product/ProductCarousel';
import BlogSection from '../components/Blog/BlogSection';
import PartnerSection from '../components/PageSections/PartnerSection';
import Footer from '../components/Layout/Footer';
import PosterCarousel from '../components/PageSections/PosterCarousel';
import CarColorizer from '../components/PageSections/CarColorizer';
import AgentChatBot from '../components/AgentChatBot';

import { apiGet } from '@/utils/api';
import { getImageUrl } from '@/utils/productHelpers';
import type { Product } from '@/types';

import { FaTools, FaShieldAlt, FaAward, FaCalendarCheck } from 'react-icons/fa';

interface PublicSiteProps {
  onLogout?: () => void;
}

/** รูปย่อยที่ backend อาจส่งมาในสินค้า/บริการ */
interface RawImage {
  image_url?: string;
  url?: string;
}

/** สินค้าดิบจาก /api/inventory/products (โครงสร้างไม่ตายตัวข้าม endpoint) */
interface RawProduct {
  product_template_id?: number | string;
  id?: number | string;
  product_id?: number | string;
  product_name?: string;
  title?: string;
  name?: string;
  images?: RawImage[];
  imageUrl?: string;
  image_url?: string;
  variants?: { unit_price?: number | string }[];
  price?: number | string;
  base_price?: number | string;
  discount?: number | string;
  discount_text?: string;
}

/** บริการดิบจาก /api/services */
interface RawService {
  service_id?: number | string;
  id?: number | string;
  service_name?: string;
  title?: string;
  name?: string;
  images?: RawImage[];
  imageUrl?: string;
  image_url?: string;
  base_labor_cost?: number | string;
  price?: number | string;
  pricings?: { price?: number | string }[];
  discount?: number | string;
}

/** response ที่อาจเป็น array ตรงๆ หรือห่อด้วย { items } */
interface ListEnvelope<T> {
  items?: T[];
}

const featureCardCls =
  'group relative overflow-hidden rounded-lg border border-themed bg-bg-card p-[30px] shadow-[var(--card-shadow)] transition-all duration-300 hover:-translate-y-2.5 hover:border-accent hover:shadow-[0_10px_30px_rgba(255,199,9,0.15)]';

function PublicSite({ onLogout }: PublicSiteProps) {
  const mapProduct = (p: RawProduct): Product => ({
    id: p.product_template_id || p.id || p.product_id,
    title: p.product_name || p.title || p.name || '',
    imageUrl: getImageUrl((p.images && (p.images[0]?.image_url || p.images[0]?.url)) || p.imageUrl || p.image_url || ''),
    price: Number(p.variants?.[0]?.unit_price ?? p.price ?? p.base_price ?? 0) || 0,
    discount: p.discount || p.discount_text || '',
    raw: p,
  });

  const mapService = (s: RawService): Product => ({
    id: s.service_id || s.id,
    title: s.service_name || s.title || s.name || '',
    imageUrl: getImageUrl((s.images && (s.images[0]?.image_url || s.images[0]?.url)) || s.imageUrl || s.image_url || ''),
    price: Number(s.base_labor_cost ?? s.price ?? (s.pricings && s.pricings[0]?.price) ?? 0) || 0,
    discount: s.discount || '',
    raw: s,
  });

  const { data: popularProducts = [], isError: prodErr } = useQuery({
    queryKey: ['home-products'],
    queryFn: async (): Promise<Product[]> => {
      const raw = await apiGet<RawProduct[] | ListEnvelope<RawProduct>>('/api/inventory/products?active=true');
      const list: RawProduct[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
      return list.map(mapProduct).slice(0, 8);
    },
  });

  const { data: popularServices = [], isError: svcErr } = useQuery({
    queryKey: ['home-services'],
    queryFn: async (): Promise<Product[]> => {
      const raw = await apiGet<RawService[] | ListEnvelope<RawService>>('/api/services');
      const list: RawService[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
      return list.map(mapService).slice(0, 8);
    },
  });

  const loadingError = prodErr || svcErr;

  return (
    <div className="min-h-screen overflow-x-clip bg-bg-main text-text-main transition-colors duration-300">
      <Helmet>
        <title>GT7 Garage | ศูนย์บริการรถยนต์ครบวงจร</title>
        <meta name="description" content="GT7 Garage ศูนย์บริการรถยนต์ครบวงจร บริการแต่งรถ ซ่อมบำรุง เปลี่ยนถ่ายของเหลว..." />
      </Helmet>

      {/* Header แบบ Sticky */}
      <div className="sticky top-0 z-[9999]">
        <Header onLogout={onLogout} />
      </div>

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features Section */}
      <section className="bg-bg-main px-5 py-[60px] text-center transition-colors duration-300">
        <div>
          <h2 className="mb-2.5 text-[2rem] font-extrabold italic uppercase text-text-main transition-colors md:text-[2.5rem]">WHY CHOOSE <span className="text-accent">GT7 MOTOR</span></h2>
          <p className="text-[#aaa]">ทำไมต้องเลือกใช้บริการกับเรา?</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[30px]">
          <div className={featureCardCls}>
            <FaTools className="mb-5 text-5xl text-accent" />
            <h3 className="mb-2.5 text-[1.2rem] font-bold uppercase text-text-main">PROFESSIONAL TEAM</h3>
            <p className="text-[0.9rem] leading-[1.6] text-text-muted">ทีมช่างผู้เชี่ยวชาญ มากประสบการณ์ พร้อมดูแลรถคุณเหมือนรถของเราเอง</p>
          </div>
          <div className={featureCardCls}>
            <FaShieldAlt className="mb-5 text-5xl text-accent" />
            <h3 className="mb-2.5 text-[1.2rem] font-bold uppercase text-text-main">PREMIUM PARTS</h3>
            <p className="text-[0.9rem] leading-[1.6] text-text-muted">ใช้อะไหล่แท้และผลิตภัณฑ์คุณภาพสูงมาตรฐานระดับโลกเท่านั้น</p>
          </div>
          <div className={featureCardCls}>
            <FaAward className="mb-5 text-5xl text-accent" />
            <h3 className="mb-2.5 text-[1.2rem] font-bold uppercase text-text-main">WARRANTY</h3>
            <p className="text-[0.9rem] leading-[1.6] text-text-muted">รับประกันงานซ่อมและอะไหล่ ให้คุณมั่นใจในทุกการขับขี่</p>
          </div>
        </div>
      </section>

      {/* 3. Poster Carousel */}
      <div className="mb-20">
        <PosterCarousel />
      </div>

      {/* 4. Car Colorizer */}
      <div className="mb-20">
        <CarColorizer />
      </div>

      <div className="relative z-[2] pb-[60px]">

        {/* 5. Parallax Call to Action */}
        <section className="my-[60px] flex flex-col items-center justify-center bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80')] bg-cover bg-scroll bg-center px-5 py-[100px] text-center md:bg-fixed">
          <div>
            <h2 className="mb-[15px] text-[2rem] font-black italic uppercase text-white [text-shadow:0_0_20px_rgba(255,199,9,0.5)] md:text-[3rem]">READY TO <span>UPGRADE?</span></h2>
            <p className="mb-[30px] max-w-[700px] text-[1.2rem] text-[#ddd]">ยกระดับสมรรถนะและความสวยงามให้รถของคุณวันนี้ ปรึกษาผู้เชี่ยวชาญของเราได้ฟรี</p>
            <Link to="/contact" className="cursor-pointer border-none bg-accent px-10 py-[15px] text-[1.1rem] font-extrabold uppercase text-black no-underline transition-all duration-300 hover:scale-105 hover:bg-text-main hover:text-bg-main hover:shadow-[0_0_20px_rgba(255,199,9,0.6)] [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
              <FaCalendarCheck className="mr-2.5 inline" /> จองคิวบริการ
            </Link>
          </div>
        </section>

        {/* 6. Popular Services */}
        {popularServices.length > 0 && (
          <div className="mb-[60px] px-5">
            <ProductCarousel title="บริการยอดนิยม" items={popularServices} viewAllLink="/ourservices" />
          </div>
        )}

        {/* 7. Popular Products */}
        {popularProducts.length > 0 && (
          <div className="mb-[60px] px-5">
            <ProductCarousel title="สินค้ายอดนิยม" items={popularProducts} viewAllLink="/shop" />
          </div>
        )}

        {loadingError && (
          <div className="p-5 text-center text-[#ff4444]">
            (ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้)
          </div>
        )}

        {/* 8. Blog Section */}
        <div className="mb-20">
          <BlogSection />
        </div>

        {/* 9. Partner / Dealer Section */}
        <div className="mb-20">
          <PartnerSection />
        </div>

      </div>

      <Footer />
      <AgentChatBot />
    </div>
  );
}

export default PublicSite;
