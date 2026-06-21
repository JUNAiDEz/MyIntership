// src/components/Blog/BlogSection.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { apiGet } from '@/utils/api';

interface BlogItem {
  id: number | string;
  slug?: string;
  title?: string;
  image_url?: string;
  published_at?: string;
}

function BlogSection() {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blog', 'home-latest'],
    queryFn: async () => {
      const response = await apiGet<{ data?: BlogItem[] }>('/api/blog?published=true&limit=3');
      return response?.data ?? [];
    },
  });

  if (isLoading) return <div style={{ color: '#aaa', textAlign: 'center' }}>กำลังโหลดบทความ...</div>;
  if (blogs.length === 0) return null; // ซ่อนไปเลยถ้าไม่มีบทความ

  return (
    <div className="mx-auto max-w-[1400px] px-[30px] lg:px-2.5">

      {/* ส่วนหัว */}
      <div className="mb-[30px] flex items-center justify-between border-b border-themed pb-[15px] transition-colors md:items-end">
        <h2 className="m-0 border-l-[5px] border-accent pl-[15px] text-[1.5rem] font-extrabold italic uppercase leading-none text-text-main transition-colors md:text-[2rem]">บทความ</h2>
        <Link
          to="/blog"
          className="whitespace-nowrap rounded-[20px] border border-text-accent px-[15px] py-1.5 text-[0.9rem] font-semibold text-text-accent no-underline transition-all duration-300 hover:bg-text-accent hover:text-bg-main hover:shadow-[0_0_15px_rgba(255,199,9,0.4)]"
        >
          READ MORE
        </Link>
      </div>

      {/* กริดบทความ: มือถือเลื่อนแนวนอน, แท็บเล็ต 3 คอลัมน์, จอใหญ่ auto-fit */}
      <div className="flex snap-x snap-mandatory flex-nowrap gap-[15px] overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0 lg:[grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] lg:gap-[30px]">
        {blogs.map((blog) => {
          // ดึงวันที่มาสร้างเป็นป้าย Badge สีเหลืองสวยๆ
          const dateObj = new Date(blog.published_at ?? '');
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('en-US', { month: 'short' });

          return (
            <Link
              to={`/blog/${blog.slug || blog.id}`}
              key={blog.id}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#222] bg-[#111] no-underline shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] max-md:flex-[0_0_280px] max-md:snap-start"
            >
              <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-black md:h-[220px]">
                <img
                  src={blog.image_url || 'https://via.placeholder.com/400x250'}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* ป้ายวันที่มุมซ้ายบน */}
                {blog.published_at && (
                  <div className="absolute left-2.5 top-2.5 rounded bg-accent px-2.5 py-[5px] text-center font-extrabold leading-[1.1] text-black shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    <span className="block text-[1.2rem]">{day}</span>
                    <span className="block text-[0.75rem] uppercase">{month}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="m-0 mb-[15px] line-clamp-2 text-[1.2rem] font-semibold leading-[1.4] text-white">{blog.title}</h3>

                {/* ปุ่มอ่านเพิ่มเติม (ดันลงล่างสุดด้วย mt-auto) */}
                <div className="mt-auto flex items-center gap-2 text-[0.9rem] font-semibold uppercase text-[#aaa] transition-colors group-hover:text-accent">
                  อ่านเพิ่มเติม <FaArrowRight />
                </div>
              </div>

            </Link>
          );
        })}
      </div>

    </div>
  );
}

export default BlogSection;
