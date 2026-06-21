import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { FaArrowRight, FaQuestionCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface FaqItem {
  id: number | string;
  category?: string;
  question?: string;
  answer?: string;
  slug?: string;
  sort_order?: number;
}

interface FAQPageProps {
  onLogout?: () => void;
}

const cardCls =
  "group relative flex min-h-[auto] flex-col justify-between overflow-hidden rounded-md border border-[#222] border-l-[3px] border-l-[#333] bg-[#111] p-[30px] no-underline transition-all duration-300 before:absolute before:right-0 before:top-0 before:h-[100px] before:w-[100px] before:[background:repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)] before:[clip-path:polygon(0_0,100%_0,100%_100%)] before:content-[''] hover:-translate-y-[5px] hover:border-[#444] hover:border-l-accent hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:min-h-[220px]";

export default function FAQPage({ onLogout }: FAQPageProps) {
  const [faqData, setFaqData] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const seo = {
    title: 'FAQ | GT7 MOTORSPORT คำถามที่พบบ่อย',
    description: 'ศูนย์รวมข้อมูลและคำถามที่พบบ่อยเกี่ยวกับบริการ สินค้า และการปรับแต่งรถยนต์จาก GT7 Motor',
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faq?active=true&limit=1000`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        const slugify = (text: string | undefined, id: number | string) => {
          return (text?.toString().toLowerCase()
            .replace(/[^a-z0-9ก-๙\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') || 'faq-' + id) + (id ? '-' + id : '');
        };

        const sortedFaqs: FaqItem[] = [...result.data].sort((a, b) => a.sort_order - b.sort_order).map((faq) => ({
          ...faq,
          slug: faq.slug || slugify(faq.question, faq.id),
        }));
        setFaqData(sortedFaqs);

        const uniqueCategories = ['All', ...new Set(sortedFaqs.map((item) => item.category || 'General'))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const filteredFaqs = selectedCategory === 'All'
    ? faqData
    : faqData.filter((item) => (item.category || 'General') === selectedCategory);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="min-h-screen bg-[#050505] pb-[60px] text-white">
        <Header onLogout={onLogout} />

        {/* Hero Section */}
        <div className="relative mb-[50px] flex h-[250px] flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')] bg-cover bg-center text-center md:h-[350px]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-[#050505]"></div>
          <div className="relative z-[2] px-5">
            <h1 className="m-0 text-[2.5rem] font-black italic uppercase text-white [text-shadow:0_0_20px_rgba(0,0,0,0.8)] md:text-[3.5rem]">KNOWLEDGE <span className="text-accent">BASE</span></h1>
            <p className="mt-2.5 max-w-[600px] text-[1.1rem] text-[#ccc]">
              ศูนย์รวมข้อมูลทางเทคนิค คำแนะนำการบริการ และคำถามที่พบบ่อย <br />
              เพื่อความมั่นใจสูงสุดในการใช้บริการกับเรา
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-10 flex flex-wrap justify-center gap-[15px] px-5">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`cursor-pointer rounded border border-[#333] bg-[#111] px-[25px] py-2.5 text-[0.9rem] font-medium uppercase tracking-[1px] text-[#888] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-white ${selectedCategory === category ? '!border-accent !bg-accent font-bold !text-black shadow-[0_0_15px_rgba(255,199,9,0.3)]' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'All' ? 'ALL TOPICS' : category.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FAQ Grid Cards */}
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-[25px] px-5 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => (
              <Link key={item.id} to={`/faq/${item.slug}`} className={cardCls}>

                <div className="relative z-[2]">
                  <span className="mb-[15px] inline-block rounded-sm border border-accent px-2 py-0.5 text-[0.75rem] uppercase tracking-[1px] text-accent">
                    {item.category || 'General'}
                  </span>

                  <h3 className="m-0 mb-[15px] text-[1.25rem] font-semibold leading-[1.4] text-white">
                    {item.question}
                  </h3>

                  <p className="m-0 line-clamp-3 text-[0.95rem] leading-[1.6] text-[#aaa]">
                    {item.answer}
                  </p>
                </div>

                <div className="relative z-[2] mt-5 inline-flex items-center text-[0.9rem] font-semibold uppercase text-accent transition-all group-hover:tracking-[1px] group-hover:[text-shadow:0_0_10px_rgba(255,199,9,0.5)]">
                  READ ANSWER <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-[5px]" />
                </div>

              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-[#333] p-[50px] text-center text-[1.1rem] text-[#666]">
              <FaQuestionCircle size={40} className="mb-[15px] inline-block text-[#333]" />
              <p>No FAQs found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
