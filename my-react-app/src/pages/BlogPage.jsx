import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import BlogCard from '../components/Blog/BlogCard';
import styles from './BlogPage.module.css';
import { FaSearch } from 'react-icons/fa';

// API endpoint
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'gt7_blog_posts';

// Helper: Slugify function
const slugify = (title, id) => {
  return (
    title?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'blog-' + id
  ) + (id ? '-' + id : '');
};

// Helper: Load from localStorage
const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const blogs = JSON.parse(stored);
      return blogs
        .filter(blog => blog.is_published)
        .map(blog => ({
          id: blog.id,
          date: blog.published_at ? new Date(blog.published_at).getDate().toString() : '',
          month: blog.published_at ? new Date(blog.published_at).toLocaleString('en-US', { month: 'short' }) : '',
          fullDate: blog.published_at ? new Date(blog.published_at).toLocaleDateString('th-TH') : '',
          author: blog.author,
          title: blog.title,
          description: blog.description || '',
          imageUrl: blog.image_url || 'https://via.placeholder.com/800x600',
          slug: blog.slug || slugify(blog.title, blog.id)
        }));
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Helper: Fetch published blogs from API
const fetchPublishedBlogs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/blog?published=true&limit=1000`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data.map(blog => ({
        id: blog.id,
        date: blog.published_at ? new Date(blog.published_at).getDate().toString() : '',
        month: blog.published_at ? new Date(blog.published_at).toLocaleString('en-US', { month: 'short' }) : '',
        fullDate: blog.published_at ? new Date(blog.published_at).toLocaleDateString('th-TH') : '',
        author: blog.author,
        title: blog.title,
        description: blog.description || '',
        imageUrl: blog.image_url || 'https://via.placeholder.com/800x600',
        slug: blog.slug || slugify(blog.title, blog.id)
      }));
    }
    
    console.warn('API returned no data, using localStorage');
    return loadFromLocalStorage();
  } catch (error) {
    console.warn('API unavailable, using localStorage:', error.message);
    return loadFromLocalStorage();
  }
};

function BlogPage({ onLogout }) {
  const seo = {
    title: 'BLOG | GT7 MOTORSPORT บทความและข่าวสาร',
    description: 'อัปเดตข่าวสารวงการรถยนต์ เทคนิคการแต่งรถ และโปรโมชั่นจาก GT7 Motor',
    url: 'https://front.gt7dev.com/blog',
    image: 'https://front.gt7dev.com/og-image-blog.jpg'
  };
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch blogs on mount
  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      const blogs = await fetchPublishedBlogs();
      // Sort by ID descending (Latest first) just in case
      const sortedBlogs = blogs.sort((a, b) => b.id - a.id);
      setBlogData(sortedBlogs);
      setLoading(false);
    };
    loadBlogs();
  }, []);

  // Filter blogs based on search term (เพิ่ม Optional Chaining ?. ป้องกัน Error)
  const filteredBlogs = blogData.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Logic การแสดงผลใหม่ (แก้บั๊ก Search) ---
  // ถ้ามี Search Term: ไม่ต้องแยก Featured, แสดงทั้งหมดใน Grid เลย
  // ถ้าไม่มี Search Term: แยกตัวแรกเป็น Featured, ที่เหลือลง Grid
  const isSearching = searchTerm.length > 0;
  
  const featuredBlog = !isSearching && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const displayBlogs = isSearching ? filteredBlogs : filteredBlogs.slice(1);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <div className={styles.pageWrapper}>
        <Header onLogout={onLogout} />
        
        <div className={styles.container}>
          
          {/* Header & Search */}
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>
              <span>NEWS & UPDATE</span>
              GT7 JOURNAL
            </h1>
            
            <div className={styles.searchSection}>
              <input 
                type="text" 
                placeholder="ค้นหาบทความ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <FaSearch style={{position:'absolute', right:15, top:12, color:'#666'}} />
            </div>
          </div>

          {loading && (
            <div className={styles.loadingState}>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loading && filteredBlogs.length === 0 && (
            <div className={styles.emptyState}>
              <p>ไม่พบบทความที่คุณค้นหา</p>
            </div>
          )}

          {/* Featured Post Section (แสดงเฉพาะตอนไม่ได้ค้นหา) */}
          {!loading && featuredBlog && (
             <Link to={`/blog/${featuredBlog.slug}`} style={{textDecoration:'none'}}>
                <div className={styles.featuredWrapper}>
                    <img 
                      src={featuredBlog.imageUrl} 
                      alt={featuredBlog.title} 
                      className={styles.featuredImage} 
                    />
                    <div className={styles.featuredOverlay}>
                        <span className={styles.badge}>LATEST STORY</span>
                        <h2 className={styles.featuredTitle}>{featuredBlog.title}</h2>
                        <div className={styles.featuredMeta}>
                            <span>By {featuredBlog.author || 'GT7 Admin'}</span>
                            <span>•</span>
                            <span>{featuredBlog.fullDate}</span>
                        </div>
                        <p className={styles.featuredDesc}>{featuredBlog.description}</p>
                    </div>
                </div>
             </Link>
          )}

          {/* Blog Grid (แสดงผลลัพธ์ที่เหลือ หรือผลการค้นหาทั้งหมด) */}
          {!loading && displayBlogs.length > 0 && (
            <>
              <h3 className={styles.sectionHeading}>
                 {isSearching ? `ผลการค้นหา (${displayBlogs.length})` : 'บทความย้อนหลัง'}
              </h3>
              
              <div className={styles.blogGrid}>
                {displayBlogs.map((blog) => (
                  <div key={blog.id} className={styles.blogCardWrapper}>
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              {!isSearching && (
                <div className={styles.blogCount}>
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