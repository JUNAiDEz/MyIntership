import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { apiGet } from '@/utils/api';
import { FaArrowRight } from 'react-icons/fa';

interface ProjectCategory {
  id?: number | string;
  title?: string;
}
interface CarProject {
  id: number | string;
  slug?: string;
  title?: string;
  year?: number | string;
  model?: string;
  image?: string;
  summary?: string;
  services: ProjectCategory[];
}

const PortfolioFilter = ({ services, activeFilter, onFilterChange }: { services: string[]; activeFilter: string; onFilterChange: (s: string) => void }) => (
  <div className="relative z-[2] mb-[50px] flex flex-wrap justify-center gap-[15px] px-5">
    {services.map((service) => (
      <button
        key={service}
        className={
          activeFilter === service
            ? 'cursor-pointer rounded-[30px] border border-accent bg-accent px-[30px] py-2.5 text-[0.9rem] font-bold uppercase text-black shadow-[0_0_15px_rgba(255,199,9,0.4)]'
            : 'cursor-pointer rounded-[30px] border border-[#333] bg-transparent px-[25px] py-2.5 text-[0.9rem] font-medium uppercase text-[#888] transition-all duration-300 hover:border-accent hover:text-white'
        }
        onClick={() => onFilterChange(service)}
      >
        {service}
      </button>
    ))}
  </div>
);

const PortfolioCard = ({ car }: { car: CarProject }) => (
  <Link to={`/portfolio/${car.slug}`} className="group relative block h-[300px] overflow-hidden rounded-lg border border-[#222] bg-[#111] no-underline">
    <img
      src={car.image || 'https://via.placeholder.com/400x300'}
      alt={car.title}
      className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
      loading="lazy"
    />

    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent p-[25px] opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
      <div className="translate-y-0 transition-transform duration-300 md:translate-y-5 md:group-hover:translate-y-0">
        <div className="mb-2.5 flex gap-2">
          {car.services.slice(0, 2).map((s, i) => (
            <span key={i} className="rounded bg-accent px-2 py-[3px] text-[0.7rem] font-bold uppercase text-black">{s.title}</span>
          ))}
        </div>

        <h3 className="m-0 mb-[5px] text-[1.4rem] font-bold leading-[1.2] text-white">{car.title}</h3>
        <span className="mb-[15px] block text-[0.9rem] text-[#aaa]">{car.model} {car.year && `• ${car.year}`}</span>

        <div className="inline-flex items-center gap-[5px] text-[0.9rem] font-semibold uppercase text-accent">VIEW PROJECT <FaArrowRight /></div>
      </div>
    </div>
  </Link>
);

const seo = {
  title: 'PORTFOLIO | GT7 MOTORSPORT ผลงานของเรา',
  description: 'รวมผลงานการปรับแต่ง ซ่อมบำรุง และติดตั้งอุปกรณ์รถยนต์ระดับพรีเมียม',
};

interface PortfolioPageProps {
  onLogout?: () => void;
}

export default function PortfolioPage({ onLogout }: PortfolioPageProps) {
  const [cars, setCars] = useState<CarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    apiGet<any>('/api/portfolio/projects')
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setCars(res.data.map((p: any) => ({
            id: p.project_id || p.id,
            slug: p.slug,
            title: p.title,
            year: p.completion_date ? new Date(p.completion_date).getFullYear() : p.year,
            model: p.car_model?.model_name || p.model || 'Custom Build',
            image: p.cover_image_url || p.image,
            summary: p.description || p.summary || '',
            services: (p.categories || p.services || []).map((c: any) => ({ id: c.portfolio_category_id || c.id, title: c.category_name || c.title })),
          })));
        } else {
          setCars([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setCars([]);
        setLoading(false);
      });
  }, []);

  const allServices = useMemo(() => {
    const services = new Set<string>();
    cars.forEach((car) => {
      car.services.forEach((service) => { if (service.title) services.add(service.title); });
    });
    return ['All', ...Array.from(services).sort()];
  }, [cars]);

  const filteredCars = useMemo(() => {
    if (activeFilter === 'All') return cars;
    return cars.filter((car) => car.services.some((service) => service.title === activeFilter));
  }, [cars, activeFilter]);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="min-h-screen bg-[#050505] pb-[60px] text-white">
        <Header onLogout={onLogout} />

        <main>
          {/* Hero Header */}
          <div className="relative mb-10 flex h-[300px] flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')] bg-cover bg-center text-center md:h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#050505]"></div>
            <div className="relative z-[2] px-5">
              <h1 className="m-0 text-[2.5rem] font-black italic uppercase leading-[1.1] text-white [text-shadow:0_0_20px_rgba(0,0,0,0.8)] md:text-[3.5rem]">OUR <span className="text-accent">MASTERPIECES</span></h1>
              <p className="mt-[15px] max-w-[600px] text-[1.1rem] text-[#ccc]">
                ผลงานความภูมิใจที่เราบรรจงสร้างสรรค์เพื่อรถคันโปรดของคุณ ด้วยมาตรฐานระดับสากลและความใส่ใจในทุกรายละเอียด
              </p>
            </div>
          </div>

          {/* Filters */}
          <PortfolioFilter services={allServices} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

          {/* Grid Layout */}
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-5 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
            {loading && <p className="col-span-full w-full p-[60px] text-center text-[#666]">Loading Projects...</p>}

            {!loading && filteredCars.length === 0 && (
              <div className="col-span-full w-full p-[60px] text-center text-[#666]">
                <p>No projects found in this category.</p>
                <button onClick={() => setActiveFilter('All')} className="mt-2.5 cursor-pointer border border-accent bg-none px-5 py-2 text-accent">
                  View All Projects
                </button>
              </div>
            )}

            {!loading && filteredCars.map((car) => (
              <PortfolioCard key={car.id} car={car} />
            ))}
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}
