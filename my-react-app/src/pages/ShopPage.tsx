import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '@/utils/api';
import Header from '../components/Layout/Header';
import Slider from 'react-slick';
import Footer from '../components/Layout/Footer';
import {
  FaChevronRight, FaChevronLeft, FaTools, FaCarBattery, FaCogs, FaOilCan, FaCompactDisc, FaCar,
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

interface ShopProduct {
  id: number | string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  img: string;
  raw: any;
}

const ShopPage = ({ onLogout }: { onLogout?: () => void }) => {
  const categories = [
    { id: 1, name: 'Service Kits', icon: <FaTools /> },
    { id: 2, name: 'Batteries', icon: <FaCarBattery /> },
    { id: 3, name: 'Engine Parts', icon: <FaCogs /> },
    { id: 4, name: 'Engine Oil', icon: <FaOilCan /> },
    { id: 5, name: 'Suspension', icon: <FaCar /> },
    { id: 6, name: 'Brake Discs', icon: <FaCompactDisc /> },
  ];

  const skeletonCount = 8;

  const { data: products = [], isLoading: loading, isError: error } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async (): Promise<ShopProduct[]> => {
      const raw = await apiGet<any>('/api/inventory/products?active=true');
      if (!Array.isArray(raw)) return [];
      return raw.map((item: any) => {
        let img = 'https://pngimg.com/uploads/car_wheel/car_wheel_PNG23316.png';
        if (item.images && item.images.length > 0) {
          const primary = item.images.find((im: any) => im.is_primary);
          img = primary ? primary.image_url : item.images[0].image_url;
        }
        return {
          id: item.product_template_id || item.id,
          name: item.product_name || item.name,
          price: item.price ? `฿${item.price}` : '',
          oldPrice: item.old_price ? `฿${item.old_price}` : '',
          discount: item.discount_percent ? `${item.discount_percent}% OFF` : '',
          img,
          raw: item,
        };
      });
    },
  });

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: true } },
    ],
  };

  const seo = {
    title: 'SHOP | GT7 MOTORSPORT',
    description: 'ศูนย์รวมอะไหล่และอุปกรณ์แต่งรถยนต์ High Performance',
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="bg-bg-main text-text-main min-h-screen [overflow-x:clip] transition-colors duration-300">

        <div className="sticky top-0 z-[9999]">
          <Header onLogout={onLogout} />
        </div>

        {/* --- Hero Section --- */}
        <section
          className="relative"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            padding: '0 5%',
          }}
        >
          <div>
            <h4 style={{ color: '#ffc709', letterSpacing: '2px', fontWeight: 'bold' }}>PREMIUM AUTO PARTS</h4>
            <h1 className="text-[3.5rem] max-md:text-[2rem] font-black italic leading-[1.1] my-2.5 max-md:my-[5px] text-text-main transition-colors duration-300">CUSTOM WIDE <br /><span style={{ color: 'transparent', WebkitTextStroke: '2px #fff' }}>BODY KITS</span></h1>
            <p style={{ color: '#aaa', maxWidth: '500px', marginBottom: '20px' }}>
              ยกระดับสมรรถนะและความสวยงามให้รถของคุณด้วยชุดแต่งระดับโลก จาก GT7 MOTORSPORT ตัวแทนจำหน่ายอย่างเป็นทางการ
            </p>
            <button className="bg-accent text-black font-extrabold uppercase px-[30px] py-3 border-0 cursor-pointer [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] transition-all duration-300 mt-[15px] tracking-[1px] hover:bg-text-main hover:text-bg-main hover:translate-x-[5px] hover:shadow-[0_0_20px_rgba(255,199,9,0.4)]">EXPLORE NOW</button>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-5 relative z-[2]">

          {/* --- Banners Section --- */}
          <section className="shop-banner-slider mt-[-60px] mb-[60px] max-md:mt-[-20px]">
            <Slider {...sliderSettings}>
              <div>
                <div className="h-[280px] max-md:h-[200px] rounded-none mx-2.5 max-md:mx-[5px] flex! items-center p-10 max-md:p-5 relative border border-themed transition-[transform,border-color] duration-300 hover:border-accent" style={{ backgroundImage: `url('/images/FeatureBar/sdw.jpg')`, backgroundSize: 'cover' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40 z-[1]" />
                  <div className="relative z-[2] text-white">
                    <span style={{ color: '#ccc' }}>New Collection</span>
                    <h2 className="text-[2rem] max-md:text-[1.5rem] italic uppercase my-2.5 text-accent">WHEELS</h2>
                    <button className="bg-accent text-black font-extrabold uppercase border-0 cursor-pointer [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] transition-all duration-300 mt-[15px] tracking-[1px] hover:bg-text-main hover:text-bg-main hover:translate-x-[5px] hover:shadow-[0_0_20px_rgba(255,199,9,0.4)]" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>View</button>
                  </div>
                </div>
              </div>
              <div>
                <div className="h-[280px] max-md:h-[200px] rounded-none mx-2.5 max-md:mx-[5px] flex! items-center p-10 max-md:p-5 relative border border-themed transition-[transform,border-color] duration-300 hover:border-accent" style={{ backgroundImage: `url('/images/FeatureBar/turbo.jpg')`, backgroundSize: 'cover' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40 z-[1]" />
                  <div className="relative z-[2] text-white">
                    <span style={{ color: '#ffc709' }}>Limited Offer</span>
                    <h2 className="text-[2rem] max-md:text-[1.5rem] italic uppercase my-2.5 text-accent">TURBO KITS</h2>
                    <button className="bg-accent text-black font-extrabold uppercase border-0 cursor-pointer [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] transition-all duration-300 mt-[15px] tracking-[1px] hover:bg-text-main hover:text-bg-main hover:translate-x-[5px] hover:shadow-[0_0_20px_rgba(255,199,9,0.4)]" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>View</button>
                  </div>
                </div>
              </div>
              <div>
                <div className="h-[280px] max-md:h-[200px] rounded-none mx-2.5 max-md:mx-[5px] flex! items-center p-10 max-md:p-5 relative border border-themed transition-[transform,border-color] duration-300 hover:border-accent" style={{ backgroundImage: `url('/images/FeatureBar/exhaust.jpg')`, backgroundSize: 'cover' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40 z-[1]" />
                  <div className="relative z-[2] text-white">
                    <span style={{ color: '#ccc' }}>Performance</span>
                    <h2 className="text-[2rem] max-md:text-[1.5rem] italic uppercase my-2.5 text-accent">EXHAUST</h2>
                    <button className="bg-accent text-black font-extrabold uppercase border-0 cursor-pointer [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] transition-all duration-300 mt-[15px] tracking-[1px] hover:bg-text-main hover:text-bg-main hover:translate-x-[5px] hover:shadow-[0_0_20px_rgba(255,199,9,0.4)]" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>View</button>
                  </div>
                </div>
              </div>
            </Slider>
          </section>

          {/* --- Shop By Department --- */}
          <section>
            <div className="flex justify-between items-center mb-[30px] pb-2.5 border-b border-themed transition-colors duration-300">
              <h3 className="text-[2rem] max-md:text-[1.5rem] font-bold uppercase italic text-text-main relative pl-[15px] transition-colors duration-300 before:content-[''] before:absolute before:left-0 before:top-[10%] before:h-[80%] before:w-[5px] before:bg-accent before:skew-x-[-10deg]">Shop By <span style={{ color: '#ffc709' }}>Category</span></h3>
              <div className="flex">
                <button className="bg-bg-card border border-[var(--text-accent)] text-text-accent w-10 h-10 ml-2.5 cursor-pointer transition-all duration-300 [clip-path:polygon(10%_0,100%_0,100%_90%,90%_100%,0_100%,0_10%)] hover:bg-[var(--text-accent)] hover:text-bg-main"><FaChevronLeft /></button>
                <button className="bg-bg-card border border-[var(--text-accent)] text-text-accent w-10 h-10 ml-2.5 cursor-pointer transition-all duration-300 [clip-path:polygon(10%_0,100%_0,100%_90%,90%_100%,0_100%,0_10%)] hover:bg-[var(--text-accent)] hover:text-bg-main"><FaChevronRight /></button>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-[60px] max-lg:flex max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:gap-[15px] max-lg:pb-5 max-lg:snap-x max-lg:snap-mandatory max-lg:[scrollbar-width:none] max-lg:[-ms-overflow-style:none] max-lg:[&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="group bg-bg-card border border-themed px-5 py-[30px] text-center cursor-pointer transition-all duration-300 relative overflow-hidden shadow-[var(--card-shadow)] hover:border-accent hover:-translate-y-[5px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] max-lg:flex-[0_0_240px] max-lg:snap-start max-md:flex-[0_0_85%] max-md:snap-center">
                  <div className="text-[3rem] text-text-muted mb-[15px] transition-colors duration-300 group-hover:text-accent group-hover:[text-shadow:0_0_15px_rgba(255,199,9,0.5)]">{cat.icon}</div>
                  <p className="font-semibold uppercase m-0 tracking-[1px] text-text-main">{cat.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --- Latest Products --- */}
          <section>
            <div className="flex justify-between items-center mb-[30px] pb-2.5 border-b border-themed transition-colors duration-300">
              <h3 className="text-[2rem] max-md:text-[1.5rem] font-bold uppercase italic text-text-main relative pl-[15px] transition-colors duration-300 before:content-[''] before:absolute before:left-0 before:top-[10%] before:h-[80%] before:w-[5px] before:bg-accent before:skew-x-[-10deg]">Latest <span style={{ color: '#ffc709' }}>Arrivals</span></h3>
              <div className="flex">
                <Link to="/shop/all" style={{ fontSize: '0.9rem', color: '#fff', textDecoration: 'none', marginRight: '15px' }}>VIEW ALL</Link>
              </div>
            </div>

            {loading && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[25px] pb-20 max-md:grid-cols-1 max-md:gap-5">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} className="bg-bg-card border border-themed flex flex-col relative transition-all duration-300 no-underline shadow-[var(--card-shadow)] max-md:w-full">
                    <div className="w-full h-[250px] bg-themed flex items-center justify-center relative overflow-hidden animate-pulse" />
                    <div className="p-5">
                      <div className="bg-themed animate-pulse" style={{ width: '80%' }} />
                      <div className="bg-themed animate-pulse" style={{ width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[25px] pb-20 max-md:grid-cols-1 max-md:gap-5">
                {products.map((product) => (
                  <Link key={product.id} to={`/shop/${product.raw.slug}`} className="group bg-bg-card border border-themed flex flex-col relative transition-all duration-300 no-underline shadow-[var(--card-shadow)] max-md:w-full hover:border-accent hover:shadow-[0_0_0_1px_var(--accent-color)]">
                    <div className="w-full h-[250px] bg-bg-main flex items-center justify-center relative overflow-hidden transition-colors duration-300">
                      {product.discount && <span className="absolute top-2.5 right-2.5 bg-[#ff0000] text-white px-2 py-1 text-[0.8rem] font-bold skew-x-[-10deg] shadow-[0_2px_5px_rgba(0,0,0,0.5)]">{product.discount}</span>}
                      <div style={{ position: 'absolute', bottom: '10%', width: '70%', height: '20px', background: 'black', filter: 'blur(15px)', opacity: 0.6, borderRadius: '50%' }}></div>
                      <img src={product.img} alt={product.name} className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-[400ms] ease-in-out group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h4 className="text-base text-text-main mt-0 mb-2.5 mx-0 leading-[1.4] h-[42px] overflow-hidden transition-colors duration-300">{product.name}</h4>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-text-accent text-[1.4rem] font-bold transition-colors duration-300">{product.price}</span>
                        {product.oldPrice && <span className="text-text-muted line-through text-[0.9rem] transition-colors duration-300">{product.oldPrice}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>

        <Footer />

      </div>
    </>
  );
};

export default ShopPage;
