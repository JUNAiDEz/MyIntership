import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const API_URL = import.meta.env.VITE_API_URL;

interface FaqItem {
  id: number | string;
  category?: string;
  question?: string;
  answer?: string;
  slug?: string;
}

interface FAQDetailPageProps {
  onLogout?: () => void;
}

const btnPrimaryCls =
  'flex cursor-pointer items-center justify-center rounded-[30px] border-2 border-accent bg-transparent px-[30px] py-2.5 text-base font-bold text-accent transition-all duration-300 hover:-translate-y-[3px] hover:bg-accent hover:text-black hover:shadow-[0_8px_20px_rgba(255,199,9,0.3)]';

export default function FAQDetailPage({ onLogout }: FAQDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState<FaqItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherFaqs, setOtherFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/faq?slug=${slug}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setFaq(result.data[0]);
        } else {
          setFaq(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
      });

    fetch(`${API_URL}/api/faq?active=true&limit=8`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setOtherFaqs(result.data.filter((f: FaqItem) => f.slug !== slug));
        } else {
          setOtherFaqs([]);
        }
      })
      .catch(() => setOtherFaqs([]));
  }, [slug]);

  const BackButton = () => (
    <button className={btnPrimaryCls} onClick={() => navigate('/faq')}>
      ← กลับหน้ารวม FAQ
    </button>
  );

  const wrapperCls = 'min-h-screen bg-[#050505] pb-[50px] text-white';
  const mainCls = 'relative mx-auto max-w-[900px] px-5 pb-5 pt-[60px]';
  const stateContainerCls = 'flex min-h-[50vh] flex-col items-center justify-center text-center';

  if (loading) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className={mainCls}>
          <div className={stateContainerCls}>
            <div className="mb-5 h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-[#222] border-t-accent"></div>
            <h2 className="font-semibold text-[#aaa]">กำลังโหลดข้อมูล...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className={mainCls}>
          <div className={stateContainerCls}>
            <h2 className="mb-5 text-[1.8rem] font-extrabold text-[#ef4444]">{error}</h2>
            <BackButton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!faq) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className={mainCls}>
          <div className={stateContainerCls}>
            <h2 className="m-0 text-[1.8rem] font-extrabold text-white md:text-[2.2rem]">ไม่พบคำถามที่คุณค้นหา</h2>
            <p className="mb-[25px] mt-2.5 text-[1.1rem] text-[#888]">ข้อมูลอาจถูกลบหรือย้ายไปแล้ว</p>
            <BackButton />
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

        {/* Main Content Card */}
        <div className="mb-[60px] overflow-hidden rounded-2xl border border-[#333] bg-[rgba(20,20,20,0.95)] shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-[10px]">
          <div className="border-b-2 border-accent bg-[rgba(10,10,10,0.5)] p-[40px_50px_30px] max-md:p-[30px_20px_20px]">
            <span className="mb-[15px] inline-block rounded-[30px] bg-gradient-to-br from-accent to-[#eaa800] px-[18px] py-1.5 text-[0.85rem] font-extrabold tracking-[1px] text-black">
              {faq.category || 'ทั่วไป'}
            </span>
            <h1 className="m-0 text-[1.8rem] font-extrabold leading-[1.4] text-white md:text-[2.2rem]">{faq.question}</h1>
          </div>
          <div className="p-[40px_50px] max-md:p-[30px_20px]">
            <div className="mb-10 text-[1.15rem] leading-[1.9] text-[#ccc]">{faq.answer}</div>
            <div className="flex justify-start border-t border-[#333] pt-[30px]">
              <BackButton />
            </div>
          </div>
        </div>

        {/* Other FAQs Section */}
        {otherFaqs.length > 0 && (
          <section className="mb-[60px]">
            <h2 className="mb-[30px] flex items-center gap-[15px] text-[1.8rem] font-extrabold text-white before:inline-block before:h-[30px] before:w-1.5 before:rounded before:bg-accent before:content-['']">
              คำถามอื่นๆ ที่น่าสนใจ
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
              {otherFaqs.map((f) => (
                <div
                  key={f.id}
                  className="group flex cursor-pointer flex-col justify-between rounded-xl border border-[#222] bg-[#111] p-[25px_20px] shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                  onClick={() => navigate(`/faq/${f.slug}`)}
                >
                  <div>
                    <div className="mb-[15px] line-clamp-3 text-[1.1rem] font-bold leading-[1.5] text-white transition-colors group-hover:text-accent">{f.question}</div>
                    <div className="text-[0.85rem] font-semibold uppercase tracking-[0.5px] text-[#888]">{f.category || 'ทั่วไป'}</div>
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
