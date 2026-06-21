import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { apiGet } from '@/utils/api';

interface PortfolioDetailPageProps {
  onLogout?: () => void;
}

/** category ดิบจาก backend (key ไม่ตายตัว) */
interface RawCategory {
  portfolio_category_id?: number | string;
  id?: number | string;
  category_name?: string;
  title?: string;
}

/** รูปใน gallery อาจเป็น string ตรงๆ หรือ object { image_url } */
type RawGalleryItem = string | { image_url?: string };

/** project ดิบจาก /api/portfolio/projects */
interface RawProject {
  project_id?: number | string;
  id?: number | string;
  slug?: string;
  title?: string;
  completion_date?: string;
  year?: number | string;
  car_model?: { model_name?: string };
  model?: string;
  cover_image_url?: string;
  image?: string;
  description?: string;
  summary?: string;
  categories?: RawCategory[];
  services?: RawCategory[];
  gallery?: RawGalleryItem[];
}

interface PortfolioResponse {
  success?: boolean;
  data?: RawProject[];
}

/** หมวดบริการที่ map แล้ว (ใช้แสดงในหน้า) */
interface ProjectService {
  id?: number | string;
  title?: string;
}

/** ผลงานที่ map แล้วสำหรับแสดงรายละเอียด */
interface CarDetail {
  id?: number | string;
  slug?: string;
  title?: string;
  year?: number | string;
  model?: string;
  image?: string;
  summary?: string;
  services: ProjectService[];
  gallery: string[];
}

const btnPrimaryCls =
  'flex cursor-pointer items-center justify-center rounded-[30px] border-2 border-accent bg-transparent px-[30px] py-3 text-base font-bold text-accent transition-all duration-300 hover:-translate-y-[3px] hover:bg-accent hover:text-black hover:shadow-[0_8px_20px_rgba(255,199,9,0.3)]';
const wrapperCls = 'min-h-screen bg-[#050505] pb-[50px] text-white';
const mainCls = 'relative mx-auto max-w-[1000px] p-[40px_20px]';

export default function PortfolioDetailPage({ onLogout }: PortfolioDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherProjects, setOtherProjects] = useState<RawProject[]>([]);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    apiGet<PortfolioResponse>(`/api/portfolio/projects?slug=${slug}`)
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const p = res.data[0];
          setCar({
            id: p.project_id || p.id,
            slug: p.slug,
            title: p.title,
            year: p.completion_date ? new Date(p.completion_date).getFullYear() : p.year,
            model: p.car_model?.model_name || p.model,
            image: p.cover_image_url || p.image,
            summary: p.description || p.summary,
            services: (p.categories || p.services || []).map((c: RawCategory) => ({ id: c.portfolio_category_id || c.id, title: c.category_name || c.title })),
            gallery: (p.gallery || []).map((g: RawGalleryItem) => (typeof g === 'string' ? g : g.image_url || '')),
          });
        } else {
          setCar(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setCar(null);
        setLoading(false);
      });

    apiGet<PortfolioResponse>('/api/portfolio/projects?limit=4')
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setOtherProjects(res.data.filter((p: RawProject) => p.slug !== slug).slice(0, 3));
        } else {
          setOtherProjects([]);
        }
      })
      .catch(() => setOtherProjects([]));
  }, [slug]);

  if (loading) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className={mainCls}>
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="mb-5 h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-[#222] border-t-accent"></div>
            <h2 className="font-semibold text-[#aaa]">กำลังโหลดผลงาน...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className={mainCls}>
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <h2 className="mb-5 text-[1.8rem] font-extrabold text-[#ef4444]">ไม่พบผลงานนี้</h2>
            <button className={btnPrimaryCls} onClick={() => navigate('/portfolio')}>← กลับหน้ารวมผลงาน</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <Header onLogout={onLogout} />
      <main className={mainCls}>

        {/* Main Detail Card */}
        <div className="mb-[60px] overflow-hidden rounded-2xl border border-[#333] bg-[rgba(17,17,17,0.95)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-[10px]">
          {/* Top Image Area */}
          <div className="group relative h-[35vh] max-h-[600px] min-h-[250px] w-full overflow-hidden bg-black after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[150px] after:bg-gradient-to-t after:from-[#111111] after:to-transparent after:content-[''] md:h-[55vh] md:min-h-[400px]">
            <img src={car.image} alt={car.title} className="h-full w-full object-cover opacity-85 transition-transform duration-[800ms] group-hover:scale-105" />
            <div className="absolute bottom-[15px] right-[15px] z-[2] rounded-[30px] bg-gradient-to-br from-accent to-[#eaa800] px-6 py-2 text-[0.9rem] font-extrabold tracking-[1px] text-black shadow-[0_8px_20px_rgba(0,0,0,0.5)] md:bottom-[30px] md:right-[30px] md:text-[1.1rem]">
              {car.model} | {car.year}
            </div>
          </div>

          <div className="relative z-[2] p-[30px_20px] md:p-[40px_60px_50px]">
            <h1 className="m-0 mb-5 text-[1.8rem] font-extrabold leading-[1.3] text-white md:text-[2.5rem]">{car.title}</h1>

            <div className="mb-[30px] h-1 w-20 rounded-sm bg-accent"></div>

            <p className="mb-10 text-[1.15rem] leading-[1.8] text-[#ccc]">{car.summary}</p>

            {/* Services Tags */}
            <div className="mb-[50px]">
              <h4 className="mb-[15px] text-[1.1rem] font-extrabold uppercase tracking-[1px] text-accent">SERVICES PERFORMED</h4>
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {car.services.map((s: ProjectService) => (
                  <li key={s.id} className="rounded-lg border border-[#444] bg-white/5 px-[18px] py-2 text-[0.95rem] font-medium text-[#eee] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:text-accent">{s.title}</li>
                ))}
              </ul>
            </div>

            {/* Gallery Grid */}
            {car.gallery && car.gallery.length > 0 && (
              <div className="mb-[50px]">
                <h4 className="mb-[15px] text-[1.1rem] font-extrabold uppercase tracking-[1px] text-accent">PROJECT GALLERY</h4>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[15px]">
                  {car.gallery.map((img: string, i: number) => (
                    <div key={i} className="group/g aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-[#333]">
                      <img src={img} alt={`${car.title} ${i + 1}`} className="h-full w-full object-cover opacity-85 transition-all duration-[400ms] group-hover/g:scale-110 group-hover/g:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-start border-t border-[#333] pt-[30px]">
              <button className={btnPrimaryCls} onClick={() => navigate('/portfolio')}>← ดูผลงานทั้งหมด</button>
            </div>
          </div>
        </div>

        {/* Other Projects Grid */}
        {otherProjects.length > 0 && (
          <section className="mb-[60px]">
            <h2 className="mb-[30px] flex items-center gap-[15px] text-[1.8rem] font-extrabold text-white before:inline-block before:h-[30px] before:w-1.5 before:rounded before:bg-accent before:content-['']">
              ผลงานอื่นๆ ที่น่าสนใจ
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[25px]">
              {otherProjects.map((p) => (
                <div
                  key={p.id}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#111] shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                  onClick={() => navigate(`/portfolio/${p.slug}`)}
                >
                  <div className="relative h-[220px] w-full overflow-hidden">
                    <img
                      src={p.cover_image_url || p.image || 'https://via.placeholder.com/348x228'}
                      alt={p.title}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-[600ms] group-hover:scale-110 group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-[25px_20px]">
                    <div className="mb-2.5 line-clamp-2 text-[1.2rem] font-extrabold leading-[1.4] text-white transition-colors group-hover:text-accent">{p.title}</div>
                    <div className="text-[0.9rem] font-semibold uppercase tracking-[0.5px] text-[#888]">{p.car_model?.model_name || p.model}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
