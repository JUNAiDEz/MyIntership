import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const API_URL = import.meta.env.VITE_API_URL;

interface BlogPost {
  id: number | string;
  title?: string;
  description?: string;
  content?: string;
  image_url?: string;
  author?: string;
  published_at?: string;
  slug?: string;
}

interface BlogDetailPageProps {
  onLogout?: () => void;
}

const btnPrimaryCls =
  'cursor-pointer rounded-[30px] border-2 border-accent bg-transparent px-[30px] py-3 text-base font-bold text-accent transition-all duration-300 hover:-translate-y-[3px] hover:bg-accent hover:text-black hover:shadow-[0_8px_20px_rgba(255,199,9,0.3)]';
const wrapperCls = 'min-h-screen bg-[#050505] text-white';
const stateContainerCls = 'flex min-h-[60vh] flex-col items-center justify-center text-center';

export default function BlogDetailPage({ onLogout }: BlogDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherBlogs, setOtherBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    fetch(`${API_URL}/api/blog?slug=${slug}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setBlog(result.data[0]);
        } else {
          setBlog(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });

    fetch(`${API_URL}/api/blog?published=true&limit=4`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setOtherBlogs(result.data.filter((b: BlogPost) => b.slug !== slug).slice(0, 3));
        } else {
          setOtherBlogs([]);
        }
      })
      .catch(() => setOtherBlogs([]));
  }, [slug]);

  if (loading) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className="relative mx-auto max-w-[1000px] px-5">
          <div className={stateContainerCls}>
            <div className="mb-[25px] h-[60px] w-[60px] animate-spin rounded-full border-[6px] border-[#222] border-t-accent"></div>
            <h2 className="font-bold text-white">กำลังเตรียมบทความ...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={wrapperCls}>
        <Header onLogout={onLogout} />
        <main className="relative mx-auto max-w-[1000px] px-5">
          <div className={stateContainerCls}>
            <h2 className="mb-5 text-[2rem] font-extrabold text-[#ef4444]">{error || 'ไม่พบบทความนี้'}</h2>
            <button className={btnPrimaryCls} onClick={() => navigate('/blog')}>← กลับหน้ารวมบทความ</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <Header onLogout={onLogout} />

      {/* Hero Banner */}
      <div className="relative h-[45vh] max-h-[500px] min-h-[350px] w-full overflow-hidden bg-black">
        <img
          src={blog.image_url || 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?q=80&w=1920&auto=format&fit=crop'}
          alt={blog.title}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[rgba(5,5,5,0.8)] via-[20%] to-transparent"></div>
      </div>

      <main className="relative z-[2] mx-auto -mt-[150px] max-w-[1000px] px-5">
        {/* Main Article Card */}
        <article className="mb-[60px] overflow-hidden rounded-2xl border border-[#333] bg-[rgba(17,17,17,0.95)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-[10px]">
          <div className="p-[30px_20px] md:p-[50px_60px]">

            {/* Meta Info */}
            <div className="mb-[25px] flex flex-wrap items-center gap-[15px] text-[0.95rem] text-[#aaa]">
              <div className="rounded-[30px] bg-gradient-to-br from-accent to-[#eaa800] px-4 py-1.5 text-[0.85rem] font-extrabold tracking-[1px] text-black">GT7 BLOG</div>
              {blog.published_at && (
                <span>
                  {new Date(blog.published_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
              {blog.author && <span className="font-semibold text-white">BY {blog.author}</span>}
            </div>

            <h1 className="m-0 mb-[25px] text-[2.5rem] font-extrabold leading-[1.3] text-white">{blog.title}</h1>

            {blog.description && (
              <div className="mb-10 rounded-r-xl border-l-[6px] border-accent bg-accent/10 p-[20px_25px] text-[1.15rem] text-[#ddd]">
                <p>{blog.description}</p>
              </div>
            )}

            <div
              className="mb-[50px] text-[1.1rem] leading-[1.9] text-[#ccc] [&_h2]:mb-[15px] [&_h2]:mt-10 [&_h2]:font-bold [&_h2]:text-accent [&_h3]:mb-[15px] [&_h3]:mt-10 [&_h3]:font-bold [&_h3]:text-accent [&_img]:my-[30px] [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-[#333] [&_img]:shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />

            <div className="flex justify-start border-t border-[#333] pt-[30px]">
              <button className={btnPrimaryCls} onClick={() => navigate('/blog')}>← กลับไปหน้าบทความทั้งหมด</button>
            </div>
          </div>
        </article>

        {/* Other Blogs Section */}
        {otherBlogs.length > 0 && (
          <section className="mb-20">
            <div className="mb-[30px] flex items-center gap-5">
              <h2 className="m-0 text-[1.8rem] font-black text-white">บทความอื่นๆ ที่น่าสนใจ</h2>
              <div className="h-0.5 flex-1 bg-[#333]"></div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[30px]">
              {otherBlogs.map((b) => (
                <div
                  key={b.id}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#111] shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                  onClick={() => navigate(`/blog/${b.slug}`)}
                >
                  <div className="relative h-[200px] w-full overflow-hidden">
                    <img
                      src={b.image_url || 'https://images.unsplash.com/photo-1632823470937-f1e87c487244?q=80&w=600&auto=format&fit=crop'}
                      alt={b.title}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-[600ms] group-hover:scale-110 group-hover:opacity-100"
                    />
                    <div className="absolute bottom-[15px] right-[15px] translate-y-2.5 rounded-[20px] border border-accent bg-black px-3.5 py-1.5 text-[0.8rem] font-bold text-accent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">อ่านต่อ</div>
                  </div>
                  <div className="flex flex-1 flex-col p-[25px_20px]">
                    <div className="mb-3 flex items-center gap-2.5 text-[0.85rem] font-medium text-[#888]">
                      <span className="font-bold text-accent">{b.author || 'GT7 Admin'}</span>
                      <span>•</span>
                      <span>{b.published_at ? new Date(b.published_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : 'ล่าสุด'}</span>
                    </div>
                    <div className="line-clamp-2 text-[1.2rem] font-extrabold leading-[1.4] text-white transition-colors group-hover:text-accent">{b.title}</div>
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
