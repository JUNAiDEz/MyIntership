import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

interface BlogCardItem {
  slug?: string;
  title?: string;
  imageUrl?: string;
  date?: string | number;
  month?: string;
  author?: string;
  description?: string;
}

interface BlogCardProps {
  blog: BlogCardItem;
}

const socialBtnCls =
  'cursor-pointer border-0 bg-transparent p-0 text-[0.75rem] text-[#555] transition-colors hover:text-black md:text-[0.9rem]';

function BlogCard({ blog }: BlogCardProps) {
  // ตรวจสอบถ้า slide ถูก clone และ aria-hidden ให้ปิด focus
  const parent = typeof window !== 'undefined' ? document.activeElement?.closest('.slick-slide[aria-hidden="true"]') : null;
  const isClonedHidden = parent != null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg border-[1.5px] border-[#eee] bg-white text-inherit no-underline transition-colors duration-300 hover:border-[#ffc107] hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
      <Link
        to={`/blog/${blog.slug}`}
        className="absolute inset-0 z-[1]"
        tabIndex={isClonedHidden ? -1 : 0}
        aria-label={blog.title}
        aria-hidden={isClonedHidden ? 'true' : undefined}
      />
      {/* ส่วนรูปภาพและป้ายวันที่ */}
      <div className="relative">
        <img
          src={blog.imageUrl}
          alt={blog.title ? `${blog.title} - รูปภาพบทความ/ข่าวสาร GT7 Motor` : 'รูปภาพบทความ/ข่าวสาร GT7 Motor'}
          className="block h-[140px] w-full bg-[#d8d8d8] object-cover md:h-[228px]"
        />
        <div className="absolute left-1.5 top-1.5 z-[2] rounded bg-[#ffc107] px-2 py-1 text-center leading-none text-black md:left-[15px] md:top-[15px] md:rounded-[5px] md:px-3 md:py-2">
          <strong className="block text-[0.9rem] md:text-[1.2rem]">{blog.date}</strong>
          <span className="text-[0.6rem] font-bold uppercase md:text-[0.8rem]">{blog.month}</span>
        </div>
      </div>

      {/* ส่วนเนื้อหา */}
      <div className="flex grow flex-col p-2.5 md:p-5">
        <p className="mb-1 text-[0.65rem] uppercase text-[#777] md:mb-2.5 md:text-[0.8rem]">BY: {blog.author}</p>
        <h4 className="mb-1.5 line-clamp-2 text-[0.9rem] font-black leading-[1.3] text-black md:mb-2.5 md:line-clamp-none md:text-[1.1rem] md:leading-[1.4]">{blog.title}</h4>
        <p className="mb-5 hidden text-[0.9rem] leading-[1.5] text-[#555] md:line-clamp-2">{blog.description}</p>
        {/* ส่วน Read More และ Social Icons */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[0.7rem] font-black text-black no-underline md:text-[0.8rem]">READ MORE &rarr;</span>
          <div className="relative z-[2] flex gap-1.5 md:gap-2.5">
            <button type="button" aria-label="Facebook" className={socialBtnCls}><FaFacebookF /></button>
            <button type="button" aria-label="Twitter" className={socialBtnCls}><FaTwitter /></button>
            <button type="button" aria-label="Instagram" className={socialBtnCls}><FaInstagram /></button>
            <button type="button" aria-label="YouTube" className={socialBtnCls}><FaYoutube /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
