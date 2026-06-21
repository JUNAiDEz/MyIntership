import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import BlogCard from '../components/Blog/BlogCard';
import { FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'gt7_blog_posts';

interface BlogItem {
  id: number | string;
  date?: string;
  month?: string;
  fullDate?: string;
  author?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
}

/** blog ดิบจาก API / localStorage (โครงสร้างไม่ตายตัว) */
interface RawBlog {
  id: number | string;
  published_at?: string;
  author?: string;
  title?: string;
  description?: string;
  image_url?: string;
  slug?: string;
  is_published?: boolean;
}

const slugify = (title: string | undefined, id: number | string) => {
  return (
    title?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'blog-' + id
  ) + (id ? '-' + id : '');
};

const mapBlog = (blog: RawBlog): BlogItem => ({
  id: blog.id,
  date: blog.published_at ? new Date(blog.published_at).getDate().toString() : '',
  month: blog.published_at ? new Date(blog.published_at).toLocaleString('en-US', { month: 'short' }) : '',
  fullDate: blog.published_at ? new Date(blog.published_at).toLocaleDateString('th-TH') : '',
  author: blog.author,
  title: blog.title,
  description: blog.description || '',
  imageUrl: blog.image_url || 'https://via.placeholder.com/800x600',
  slug: blog.slug || slugify(blog.title, blog.id),
});

const loadFromLocalStorage = (): BlogItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const blogs: RawBlog[] = JSON.parse(stored);
      return blogs.filter((blog) => blog.is_published).map(mapBlog);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

const fetchPublishedBlogs = async (): Promise<BlogItem[]> => {
  try {
    const response = await fetch(`${API_URL}/api/blog?published=true&limit=1000`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result: { success?: boolean; data?: RawBlog[] } = await response.json();
    if (result.success && result.data) {
      return result.data.map(mapBlog);
    }
    console.warn('API returned no data, using localStorage');
    return loadFromLocalStorage();
  } catch (error) {
    console.warn('API unavailable, using localStorage:', error);
    return loadFromLocalStorage();
  }
};

interface BlogPageProps {
  onLogout?: () => void;
}

// บังคับสไตล์ลง BlogCard (ลูก) ให้เป็นการ์ดโทนดำ — แทน .blogCardWrapper > div !important เดิม
const cardWrapperCls =
  "h-full transition-transform duration-300 hover:-translate-y-2 [&>div]:!rounded-lg [&>div]:!border [&>div]:!border-[#333] [&>div]:!bg-[#1e1e1e] [&>div]:!shadow-[0_4px_20px_rgba(0,0,0,0.3)] [&_a]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-[#bbb] [&_span]:!text-accent";

function BlogPage({ onLogout }: BlogPageProps) {
  const seo = {
    title: 'BLOG | GT7 MOTORSPORT บทความและข่าวสาร',
    description: 'อัปเดตข่าวสารวงการรถยนต์ เทคนิคการแต่งรถ และโปรโมชั่นจาก GT7 Motor',
  };
  const [blogData, setBlogData] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      const blogs = await fetchPublishedBlogs();
      const sortedBlogs = blogs.sort((a, b) => Number(b.id) - Number(a.id));
      setBlogData(sortedBlogs);
      setLoading(false);
    };
    loadBlogs();
  }, []);

  const filteredBlogs = blogData.filter((blog) =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isSearching = searchTerm.length > 0;
  const featuredBlog = !isSearching && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const displayBlogs = isSearching ? filteredBlogs : filteredBlogs.slice(1);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="min-h-screen bg-[#050505] pb-20 text-white">
        <Header onLogout={onLogout} />

        <div className="mx-auto max-w-[1400px] px-5">

          {/* Header & Search */}
          <div className="relative z-[50] mb-[50px] flex flex-wrap items-end justify-between gap-5 border-b border-[#333] py-[30px] md:py-[50px]">
            <h1 className="m-0 text-[2.2rem] font-extrabold italic uppercase leading-none text-white [text-shadow:0_0_10px_rgba(0,0,0,0.5)] md:text-[3rem]">
              <span className="mb-2 block text-base font-semibold not-italic tracking-[2px] text-accent [text-shadow:none]">NEWS &amp; UPDATE</span>
              GT7 JOURNAL
            </h1>

            <div className="relative z-[51] w-full max-w-[400px]">
              <input
                type="text"
                placeholder="ค้นหาบทความ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative z-[52] w-full rounded-md border border-[#444] bg-[#1e1e1e] px-5 py-3.5 pr-[45px] text-base text-white transition-all duration-300 placeholder:text-[#888] focus:border-accent focus:bg-[#252525] focus:shadow-[0_0_15px_rgba(255,199,9,0.15)] focus:outline-none"
              />
              <FaSearch className="absolute right-[15px] top-3 text-[#666]" />
            </div>
          </div>

          {loading && (
            <div className="rounded-lg border border-dashed border-[#333] bg-[#111] py-20 text-center text-[1.2rem] text-[#888]">
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loading && filteredBlogs.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#333] bg-[#111] py-20 text-center text-[1.2rem] text-[#888]">
              <p>ไม่พบบทความที่คุณค้นหา</p>
            </div>
          )}

          {/* Featured Post */}
          {!loading && featuredBlog && (
            <Link to={`/blog/${featuredBlog.slug}`} className="no-underline">
              <div className="group relative z-[1] mb-[70px] h-[450px] cursor-pointer overflow-hidden rounded-xl border border-[#333] shadow-[0_20px_40px_rgba(0,0,0,0.6)] md:h-[500px]">
                <img src={featuredBlog.imageUrl} alt={featuredBlog.title} className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.03]" />
                <div className="absolute inset-0 flex h-full flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent p-[25px] md:p-[50px]">
                  <span className="mb-[15px] inline-block w-fit rounded bg-accent px-3.5 py-1.5 text-[0.85rem] font-bold uppercase text-black shadow-[0_2px_10px_rgba(0,0,0,0.3)]">LATEST STORY</span>
                  <h2 className="m-0 mb-[15px] max-w-[900px] text-[1.8rem] font-bold uppercase leading-[1.2] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] md:text-[2.8rem]">{featuredBlog.title}</h2>
                  <div className="flex gap-[15px] text-base font-medium text-[#ddd]">
                    <span>By {featuredBlog.author || 'GT7 Admin'}</span>
                    <span>•</span>
                    <span>{featuredBlog.fullDate}</span>
                  </div>
                  <p className="mt-[15px] line-clamp-2 max-w-[800px] text-base leading-[1.7] text-[#ccc] md:text-[1.15rem]">{featuredBlog.description}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Blog Grid */}
          {!loading && displayBlogs.length > 0 && (
            <>
              <h3 className="mb-10 border-l-[5px] border-accent pl-5 text-[1.8rem] font-extrabold uppercase tracking-[1px] text-white">
                {isSearching ? `ผลการค้นหา (${displayBlogs.length})` : 'บทความย้อนหลัง'}
              </h3>

              <div className="grid grid-cols-1 gap-[30px] md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
                {displayBlogs.map((blog) => (
                  <div key={blog.id} className={cardWrapperCls}>
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              {!isSearching && (
                <div className="mt-[50px] border-t border-[#222] pt-5 text-right text-base font-medium text-[#888]">
                  Showing {displayBlogs.length} Articles
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}

export default BlogPage;
