// หมายเหตุ: หน้ารายละเอียดรถขนาดใหญ่ (gallery/variants/services) → คง ServiceCards.module.css (ตาม MIGRATION_PLAYBOOK)
import { useEffect, useState } from 'react';
import useCarModelsByBrand from '../hooks/useCarModelsByBrand';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { apiGet } from '@/utils/api';

const API_URL = import.meta.env.VITE_API_URL;

// .btnChangeModel
const btnChangeModelCls =
  'flex items-center gap-2 rounded-lg bg-[#ffc709] px-4 py-2 text-[0.95rem] font-bold text-black no-underline transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_15px_rgba(255,199,9,0.3)]';

// .btnSiblingModel
const btnSiblingModelCls =
  'rounded-[20px] border border-[#444] bg-transparent px-3.5 py-1.5 text-[0.85rem] font-semibold text-[#aaa] no-underline transition-all duration-300 hover:border-[#ffc709] hover:bg-[rgba(255,199,9,0.1)] hover:text-[#ffc709]';

// .variantRow
const variantRowCls =
  'flex items-center justify-between rounded-xl border border-[#222] bg-[#111] px-5 py-[15px] transition-all duration-300 hover:border-[#444] hover:bg-[#151515]';

// .serviceCard
const serviceCardCls =
  'group flex flex-col justify-between rounded-xl border border-[#222] bg-[#111] p-[25px] no-underline shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-[0.4s] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2 hover:border-[#ffc709] hover:shadow-[0_15px_30px_rgba(255,199,9,0.2)]';

// .btnSecondary
const btnSecondaryCls =
  'mt-5 rounded-[30px] border-2 border-[#ffc709] bg-transparent px-6 py-2.5 font-bold text-[#ffc709] no-underline transition-all duration-300 hover:bg-[#ffc709] hover:text-black';

const fetchVehicleBySlug = async (slug?: string): Promise<any | null> => {
  try {
    const response = await fetch(`${API_URL}/api/vehicles/master/models/slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return result.data;
  } catch { /* not found */ }
  return null;
};

interface VehicleDisplayData {
  title: string;
  description: string;
  variants: any[];
  images: string[];
  note?: string;
}

function VehicleDetailPage({ onLogout }: { onLogout?: () => void }) {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      const data = await fetchVehicleBySlug(slug);
      setVehicle(data);
      setLoading(false);

      if (data && data.car_model_id) {
        // ⚡ ยิงครั้งเดียว — backend รวมราคาบริการทุกชนิดของรถรุ่นนี้ให้แล้ว (เดิมยิง 18 requests)
        try {
          const servicesRes = await apiGet<any>(`/api/services/pricing/by-car-model/${encodeURIComponent(String(data.car_model_id))}`);
          setRelatedServices(Array.isArray(servicesRes) ? servicesRes : []);
        } catch (e) {
          console.error('Error fetching services', e);
          setRelatedServices([]);
        }
      } else {
        setRelatedServices([]);
      }
    };
    loadVehicle();
  }, [slug]);

  let displayData: VehicleDisplayData | null = null;
  let brandId: number | string | null = null;

  if (vehicle) {
    const images = Array.isArray(vehicle.images) && vehicle.images.length > 0
      ? vehicle.images.map((img: any) => img.url || img.image_url)
      : [vehicle.image_url || '/images/no-image.png'];
    const brandName = vehicle.brand?.brand_name || '';
    const modelName = vehicle.model_name || '';
    const title = [brandName, modelName].filter(Boolean).join(' ');
    brandId = vehicle.brand_id;

    displayData = {
      title: title || '-',
      description: vehicle.description || '',
      variants: vehicle.variants || [],
      images,
      note: vehicle.note,
    };
  }

  const { models: brandModels } = useCarModelsByBrand(brandId);

  useEffect(() => {
    if (displayData && displayData.images.length > 0) {
      setActiveImage(displayData.images[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#050505] text-white">
      <div className="mb-5 h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-[#222] border-t-[#ffc709]"></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>
  );

  if (!displayData) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#050505] text-white">
      <h2>ไม่พบข้อมูลรถ</h2>
      <Link to="/vehicle-models" className={btnSecondaryCls}>กลับไปหน้ารุ่นรถ</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{displayData.title} | GT7 Motor</title>
        <meta name="description" content={displayData.description || ''} />
      </Helmet>
      <Header onLogout={onLogout} />

      <div className="min-h-screen bg-[#050505] px-5 pt-10 pb-20 text-white">
        <div className="mx-auto max-w-[1200px]">

          <nav className="mb-[30px] flex items-center gap-2.5 text-[0.95rem] text-[#888]">
            <Link to="/" className="font-medium text-[#ffc709] no-underline transition-colors duration-300 hover:text-white hover:underline">หน้าแรก</Link>
            <span className="text-[#555]">/</span>
            <Link to="/car" className="font-medium text-[#ffc709] no-underline transition-colors duration-300 hover:text-white hover:underline">รุ่นรถทั้งหมด</Link>
            <span className="text-[#555]">/</span>
            <span className="font-bold text-white">{displayData.title}</span>
          </nav>

          <div className="mb-[60px] grid grid-cols-2 gap-[50px] rounded-[20px] border border-[#333] bg-[rgba(17,17,17,0.95)] p-10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-[10px] max-[992px]:grid-cols-1 max-[992px]:gap-[30px] max-[992px]:p-[25px]">

            {/* Gallery Section */}
            <div>
              <div className="group mb-[15px] flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <img src={activeImage || '/images/no-image.png'} alt={displayData.title} className="h-full w-full object-cover transition-transform duration-[0.4s] group-hover:scale-105" />
              </div>
              {displayData.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-[5px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#333]">
                  {displayData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`h-[60px] w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-[#111] transition-all duration-300 hover:opacity-100 ${activeImage === img ? 'border-[#ffc709] opacity-100 shadow-[0_0_10px_rgba(255,199,9,0.4)]' : 'border-transparent opacity-60'}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`view ${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div>
              <h1 className="m-0 mb-5 text-[2.5rem] font-black uppercase leading-[1.2] text-white">{displayData.title}</h1>

              <div className="mb-[30px] rounded-xl border border-[#333] bg-[rgba(0,0,0,0.4)] p-5">
                <div className="mb-[15px] flex items-center justify-between">
                  <Link to="/vehicle-models" className={btnChangeModelCls}>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </span>
                    <span>เลือกรถรุ่นอื่น</span>
                  </Link>
                  <span className="text-[0.9rem] text-[#888]">ไม่ใช่รุ่นที่คุณต้องการ?</span>
                </div>

                {brandModels && brandModels.length > 1 && (
                  <div className="flex flex-wrap gap-2.5">
                    {brandModels
                      .filter((m: any) => m.car_model_id !== vehicle?.car_model_id)
                      .map((m: any) => (
                        <Link key={m.car_model_id} to={`/vehicle/${m.slug}`} className={btnSiblingModelCls}>
                          {m.model_name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              {displayData.description && (
                <>
                  <p className="mb-[25px] text-[1.1rem] leading-[1.8] text-[#ccc]">{displayData.description}</p>
                  <div className="my-[30px] h-px bg-[#333]"></div>
                </>
              )}

              {displayData.variants.length > 0 && (
                <div>
                  <h4 className="mb-5 text-[1.2rem] font-extrabold uppercase tracking-[1px] text-[#ffc709]">ตัวเลือกที่มีจำหน่าย</h4>
                  <div className="flex flex-col gap-[15px]">
                    {displayData.variants.map((v, i) => (
                      <div className={variantRowCls} key={i}>
                        <div className="flex flex-col gap-[5px]">
                          <span className="text-[1.1rem] font-bold text-white">{v.variant_name || 'Standard'}</span>
                          {v.sku && <span className="inline-block w-fit rounded bg-[#333] px-2 py-0.5 text-[0.75rem] text-[#aaa]">SKU: {v.sku}</span>}
                        </div>
                        <div className="flex flex-col items-end gap-2.5">
                          <div className="flex items-baseline gap-[5px]">
                            <span className="text-[1.4rem] font-black text-[#ffc709]">{Number(v.unit_price).toLocaleString()}</span>
                            <span className="text-[0.9rem] font-medium text-[#888]">บาท</span>
                          </div>
                          <button className="cursor-pointer rounded-lg border-none bg-white px-5 py-2 font-extrabold text-black transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:bg-[#ffc709] disabled:cursor-not-allowed disabled:bg-[#333] disabled:text-[#666]" disabled={v.stock_quantity === 0}>
                            {v.stock_quantity > 0 ? 'สนใจจอง' : 'สินค้าหมด'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="mt-5">
            <div className="mb-[30px] flex items-center gap-5">
              <h4 className="m-0 text-[1.5rem] font-extrabold text-white">บริการแนะนำสำหรับรุ่นนี้</h4>
              <div className="h-0.5 flex-1 bg-[#ffc709]"></div>
            </div>

            {relatedServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#333] bg-[#111] p-10 text-center text-[1.1rem] text-[#888]">ยังไม่มีบริการเพิ่มเติมสำหรับรุ่นนี้</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {relatedServices
                  .filter((s) => s.car_model_id === vehicle?.car_model_id && (s.stage || s.name) !== displayData!.title)
                  .map((s, index) => (
                    <Link key={s.id || index} to={`/services/${s.service_slug || s.slug || s.stage || s.name}`} className={serviceCardCls}>
                      <div>
                        <div className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[rgba(255,199,9,0.1)] text-[#ffc709] transition-all duration-300 group-hover:bg-[#ffc709] group-hover:text-black">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        </div>
                        <h5 className="m-0 mb-2.5 text-[1.2rem] font-extrabold text-white">{s.stage || s.name}</h5>
                        <p className="m-0 mb-5 text-[1.1rem] font-bold text-[#ccc]">
                          {s.price ? Number(s.price).toLocaleString() : '-'}
                          <span className="text-[0.8rem] text-[#888]"> THB</span>
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-[#333] pt-[15px] text-[0.95rem] font-semibold text-[#ffc709]">
                        <span>ดูรายละเอียด</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-[5px]">&rarr;</span>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default VehicleDetailPage;
