import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { allPromotionsData, type PromotionItem, type PromoLineItem } from './PromotionPage';
import { apiGet } from '@/utils/api';

interface PromotionDetailPageProps {
  onLogout?: () => void;
}

const btnPrimaryCls =
  'inline-flex cursor-pointer items-center justify-center border-2 border-black bg-black px-8 py-4 text-base font-extrabold uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-black hover:shadow-[5px_5px_0px_rgba(0,0,0,0.2)]';
const wrapperCls = 'flex min-h-screen flex-col bg-[#fafafa]';

function PromotionDetailPage({ onLogout }: PromotionDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<PromotionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiGet<(PromotionItem & { message?: string }) | null>(`/api/sales/promotions/slug/${slug}`)
      .then((data) => {
        if (data && !data.message) {
          if (isMounted) setPromotion(data);
        } else {
          const mockPromo = allPromotionsData.find((promo) => promo.slug === slug || promo.id === slug);
          if (isMounted) setPromotion(mockPromo || null);
        }
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        const mockPromo = allPromotionsData.find((promo) => promo.slug === slug || promo.id === slug);
        setPromotion(mockPromo || null);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className="flex w-full flex-1 justify-center p-[3rem_1rem_5rem]">
          <div className="flex w-full flex-col items-center justify-center p-[8rem_1rem] text-center">
            <div className="mb-6 h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-[#eee] border-t-accent"></div>
            <h2 className="font-bold text-[#6b7280]">กำลังโหลดโปรโมชั่น...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className="flex w-full flex-1 justify-center p-[3rem_1rem_5rem]">
          <div className="flex w-full flex-col items-center justify-center p-[8rem_1rem] text-center">
            <h2 className="mb-6 text-[1.5rem] font-black text-black">ไม่พบโปรโมชั่นนี้</h2>
            <button className={btnPrimaryCls} onClick={() => navigate('/promotions')}>← กลับหน้าโปรโมชั่น</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const items = Array.isArray(promotion.items) ? promotion.items : [];
  const bannerImageUrl = promotion.bannerImageUrl || promotion.image_url || 'https://via.placeholder.com/800x400?text=Promotion';
  const description = promotion.description || promotion.promotion_name || '';
  const originalPrice = promotion.originalPrice || promotion.discount_value || '';
  const discountPrice = promotion.discountPrice || '';
  const title = promotion.promotion_name || promotion.title || 'รายละเอียดโปรโมชั่น';

  return (
    <>
      <Helmet>
        <title>{title} | GT7 Motor</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className="flex w-full flex-1 justify-center p-[3rem_1rem_5rem]">

          <div className="relative w-full max-w-[900px] overflow-hidden border border-black bg-white shadow-[10px_10px_0px_#000] before:absolute before:left-0 before:top-0 before:z-10 before:h-1.5 before:w-full before:bg-accent before:content-['']">
            {/* Image Section */}
            <div className="relative w-full border-b-2 border-black bg-black">
              <img src={bannerImageUrl} alt={title} className="block h-auto max-h-[400px] w-full object-cover opacity-95" />
              <div className="absolute bottom-0 right-0 border-l-2 border-t-2 border-black bg-accent px-6 py-2 text-[1.1rem] font-black tracking-[0.05em] text-black">PROMOTION</div>
            </div>

            <div className="p-[2rem_1.5rem] md:p-12">
              <div className="mb-8">
                <h1 className="m-0 text-[1.75rem] font-black uppercase leading-[1.1] tracking-[-0.02em] text-black md:text-[2.5rem]">{title}</h1>
                <div className="mt-4 h-2 w-[60px] bg-accent"></div>
              </div>

              <div className="mb-12 border-l-4 border-[#eee] pl-4 text-[1.1rem] leading-[1.6] text-[#374151]">
                {description}
              </div>

              {/* Items Grid */}
              <div className="mb-12 border border-dashed border-black bg-[#fafafa] p-8">
                <h4 className="mb-6 flex items-center text-[1.25rem] font-extrabold uppercase text-black before:mr-2.5 before:inline-block before:h-3 before:w-3 before:border before:border-black before:bg-accent before:content-['']">INCLUDED ITEMS</h4>
                <div className="grid grid-cols-1 gap-4 min-[481px]:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                  {items.length === 0 && <p className="text-[#6b7280]">ไม่มีข้อมูลรายการสินค้า</p>}
                  {items.map((item: PromoLineItem, idx: number) => (
                    <div className="group border border-black bg-white transition-all duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#000]" key={idx}>
                      <div className="flex flex-col items-center p-4 text-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="mb-2.5 h-[60px] w-[60px] border border-[#ddd] bg-white object-cover" />
                        ) : (
                          <div className="mb-2.5 flex h-[60px] w-[60px] items-center justify-center border border-[#ccc] bg-[#eee] text-[0.8rem] font-bold">IMG</div>
                        )}
                        <div>
                          <span className="mb-1 block text-base font-bold leading-[1.2] text-black">{item.name}</span>
                          <span className="rounded-sm bg-[#eee] px-1.5 py-0.5 text-[0.75rem] font-semibold uppercase text-[#6b7280]">{item.type === 'product' ? 'PRODUCT' : 'SERVICE'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex flex-wrap items-center justify-between gap-6 border-t-2 border-black pt-8 max-md:flex-col max-md:items-stretch max-md:text-center">
                <div className="flex items-baseline gap-4 max-md:justify-center">
                  {originalPrice && (
                    <span className="text-[1.1rem] font-medium text-[#6b7280] line-through">{Number(originalPrice).toLocaleString()}฿</span>
                  )}
                  {discountPrice && (
                    <span className="text-[2rem] font-black leading-none text-[#d32f2f] [text-shadow:2px_2px_0px_#fecaca]">{Number(discountPrice).toLocaleString()}฿</span>
                  )}
                </div>
                <button onClick={() => navigate('/promotions')} className={btnPrimaryCls}>← กลับหน้ารวม</button>
              </div>

            </div>
          </div>

        </main>
        <Footer />
      </div>
    </>
  );
}

export default PromotionDetailPage;
