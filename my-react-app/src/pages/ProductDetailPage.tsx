// หมายเหตุ: หน้ารายละเอียดสินค้าขนาดใหญ่ (gallery/variants/reviews) → แปลงเป็น Tailwind v4 แล้ว
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaStar, FaCommentDots, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getImageUrl } from '@/utils/productHelpers';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const API_URL = import.meta.env.VITE_API_URL;

// ปุ่มสั่งซื้อใน variant card
const btnVariantBuyCls =
  'cursor-pointer rounded-lg border-0 bg-accent px-6 py-2.5 font-extrabold text-black transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:bg-text-main enabled:hover:text-bg-main disabled:cursor-not-allowed disabled:bg-themed disabled:text-text-muted max-[576px]:w-full';

// ปุ่มหลัก (สั่งซื้อทันที) เต็มความกว้าง
const btnPrimaryFullCls =
  'w-full cursor-pointer rounded-xl border-2 border-text-main bg-text-main px-4 py-4 text-[1.2rem] font-extrabold uppercase text-bg-main transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_10px_30px_rgba(255,199,9,0.3)]';

// ปุ่มเปิด/ปิดรีวิว (base)
const btnReviewToggleBaseCls =
  'flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-transparent px-3 py-3.5 text-base font-semibold transition-all duration-300';

// การ์ดสินค้าที่เกี่ยวข้อง
const relatedCardCls =
  'group flex flex-col overflow-hidden rounded-xl border border-themed bg-bg-card no-underline shadow-[var(--card-shadow)] transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-2 hover:border-accent';

interface MockReview {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

// ---- local types สำหรับ response ของหน้านี้ ----
interface ProductVariant {
  variant_name?: string;
  sku?: string;
  unit_price?: number | string;
  stock_quantity?: number;
  [key: string]: unknown;
}

interface ProductImageLike {
  image_url?: string;
  url?: string;
  is_primary?: boolean;
}

interface ProductDetail {
  id?: number | string;
  product_template_id?: number | string;
  slug?: string;
  title?: string;
  product_name?: string;
  description?: string;
  price?: number | string;
  img?: string;
  image_url?: string;
  images?: ProductImageLike[];
  variants?: ProductVariant[];
  note?: string | null;
  product_template?: ProductDetail;
  _source?: 'products' | 'productCarModel';
  [key: string]: unknown;
}

interface PromotionLine {
  product_variant_id?: number | string;
  service_id?: number | string;
  discounted_price?: number | string;
}

interface PromotionItem {
  promotion_id?: number | string;
  promotion_name?: string;
  description?: string;
  discount_value?: number | string;
  promotion_type?: string;
  products?: PromotionLine[];
  services?: PromotionLine[];
  [key: string]: unknown;
}

const MOCK_REVIEWS: MockReview[] = [
  { id: 1, user: 'Pichai S.', rating: 5, date: '2 วันที่แล้ว', comment: 'สินค้าคุณภาพดีมากครับ จัดส่งไว แพ็คของมาแน่นหนา' },
  { id: 2, user: 'Somsak K.', rating: 4, date: '1 สัปดาห์ที่แล้ว', comment: 'ใช้งานได้ดีครับ คุ้มราคา แนะนำเลย' },
  { id: 3, user: 'Anna W.', rating: 5, date: '2 สัปดาห์ที่แล้ว', comment: 'ชอบมากค่ะ ตรงปก บริการดี' },
];

interface DisplayData {
  title: string;
  description?: string;
  price?: number | string;
  variants: ProductVariant[];
  images: string[];
  note?: string | null;
}

const fetchPromotionsByProduct = async (productId: number | string): Promise<PromotionItem[]> => {
  try {
    const res = await fetch(`${API_URL}/api/promotions/by-product/${productId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch {
    return [];
  }
};

const fetchProductBySlug = async (slug?: string): Promise<ProductDetail | null> => {
  try {
    const response = await fetch(`${API_URL}/api/inventory/products/slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return { ...result.data, _source: 'products' };
  } catch { /* try next */ }

  try {
    const response = await fetch(`${API_URL}/api/products/product-car-model/by-slug/${slug}`);
    if (!response.ok) throw new Error('Not found');
    const result = await response.json();
    if (result.success && result.data) return { ...result.data, _source: 'productCarModel' };
  } catch { /* not found */ }

  return null;
};

function ProductDetailPage({ onLogout }: { onLogout?: () => void }) {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await fetchProductBySlug(slug);
      setProduct(data);
      setLoading(false);
      window.scrollTo(0, 0);
      setShowReviews(false);
      if (data && (data.product_template_id || data.id)) {
        const promos = await fetchPromotionsByProduct(data.product_template_id || data.id || '');
        setPromotions(promos);
      } else {
        setPromotions([]);
      }
    };
    loadProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`${API_URL}/api/inventory/products?limit=10`);
        if (res.ok) {
          const data = await res.json();
          const items: ProductDetail[] = Array.isArray(data) ? data : (data.items || []);
          const filtered = items.filter((item) => item.slug !== slug).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (slug) fetchRelated();
  }, [slug]);

  let displayData: DisplayData | null = null;
  if (product) {
    if (product._source === 'products') {
      const rawImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images.map((img) => getImageUrl(img.image_url || img.url))
        : [getImageUrl(product.image_url || product.img)];

      displayData = {
        title: product.title || product.product_name || '',
        description: product.description,
        price: product.price,
        variants: product.variants || [],
        images: rawImages,
        note: null,
      };
    } else if (product._source === 'productCarModel') {
      const pt: ProductDetail = product.product_template || {};
      const rawImages = Array.isArray(pt.images) && pt.images.length > 0
        ? pt.images.map((img) => getImageUrl(img.image_url || img.url))
        : [getImageUrl(pt.image_url)];

      displayData = {
        title: pt.product_name || '-',
        description: pt.description || '-',
        price: product.price,
        variants: pt.variants || [],
        images: rawImages,
        note: product.note,
      };
    }
  }

  useEffect(() => {
    if (displayData && displayData.images.length > 0) {
      setActiveImage(displayData.images[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-bg-main text-text-main">
      <div className="mb-5 h-[50px] w-[50px] animate-spin rounded-full border-[5px] border-themed border-t-accent"></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>
  );

  if (!displayData) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-bg-main text-text-main">
      <h2>ไม่พบสินค้านี้</h2>
      <Link to="/shop" className="mt-5 rounded-[30px] border-2 border-accent bg-transparent px-6 py-2.5 font-bold text-text-accent no-underline transition-all duration-300 hover:bg-accent hover:text-black">กลับไปหน้าสินค้า</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{displayData.title} | GT7 Motor</title>
        <meta name="description" content={displayData.description || ''} />
      </Helmet>
      <Header onLogout={onLogout} />

      <div className="min-h-screen bg-bg-main px-5 pb-20 pt-10 text-text-main transition-colors duration-300">
        <div className="mx-auto max-w-[1200px]">

          <nav className="mb-[30px] flex items-center gap-2.5 text-[0.95rem] text-text-muted">
            <Link to="/" className="font-medium text-text-accent no-underline transition-colors duration-300 hover:text-text-main hover:underline">หน้าแรก</Link>
            <span className="text-themed">/</span>
            <Link to="/shop" className="font-medium text-text-accent no-underline transition-colors duration-300 hover:text-text-main hover:underline">สินค้าทั้งหมด</Link>
            <span className="text-themed">/</span>
            <span className="font-bold text-text-main">{displayData.title}</span>
          </nav>

          <div className="mb-[50px] grid grid-cols-1 gap-[50px] rounded-[20px] border border-themed bg-bg-card p-10 shadow-[var(--card-shadow)] backdrop-blur-[10px] transition-[background-color,border-color,box-shadow] duration-300 max-[992px]:gap-10 max-[992px]:p-[25px] min-[992px]:grid-cols-2">
            {/* Left: Gallery */}
            <div className="flex flex-col gap-[15px]">
              <div className="group flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-themed bg-bg-main">
                <img src={activeImage || '/images/no-image.png'} alt={displayData.title} className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.08] group-hover:opacity-100" />
              </div>
              {displayData.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-[5px]">
                  {displayData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-bg-main transition-all duration-300 hover:opacity-100 ${activeImage === img ? 'border-accent opacity-100' : 'border-transparent opacity-60'}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`view ${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              <h1 className="m-0 mb-[15px] text-[2.5rem] font-black uppercase leading-[1.2] text-text-main">{displayData.title}</h1>
              <div className="mb-5">
                {displayData.variants.length > 0 ? (
                  <div>
                    <span className="mr-[15px] text-[1.1rem] text-text-muted">ราคาเริ่มต้น:</span>
                    <span className="text-[2.8rem] font-black text-text-accent">{Number(displayData.variants[0].unit_price).toLocaleString()}</span>
                    <span className="ml-2 text-[1.2rem] font-semibold text-text-muted">THB</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[2.8rem] font-black text-text-accent">{displayData.price ? Number(displayData.price).toLocaleString() : '-'}</span>
                    <span className="ml-2 text-[1.2rem] font-semibold text-text-muted">THB</span>
                  </div>
                )}
              </div>
              <div className="my-[30px] h-px bg-themed"></div>
              <div>
                <h4 className="mb-[15px] text-[1.2rem] font-extrabold uppercase text-text-accent">รายละเอียดสินค้า</h4>
                <p className="mb-[25px] text-[1.05rem] leading-[1.8] text-text-muted">{displayData.description}</p>
                {displayData.note && <div className="rounded-[0_8px_8px_0] border-l-4 border-accent bg-[rgba(255,199,9,0.1)] px-5 py-[15px] text-[0.95rem] leading-[1.6] text-text-main"><strong>หมายเหตุ:</strong> {displayData.note}</div>}
              </div>

              {displayData.variants.length > 0 && (
                <div className="mt-[30px]">
                  <h4 className="mb-5 text-[1.2rem] font-extrabold uppercase text-text-accent">รายละเอียดตัวเลือกสินค้า</h4>
                  <div className="mb-10 flex flex-col gap-[15px]">
                    {displayData.variants.map((v, i) => (
                      <div className="flex items-center justify-between rounded-xl border border-themed bg-bg-main p-5 transition-all duration-300 hover:border-accent hover:bg-bg-card max-[576px]:flex-col max-[576px]:items-start max-[576px]:gap-[15px]" key={i}>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <span className="text-[1.1rem] font-bold text-text-main">{v.variant_name || 'ไม่มีชื่อ'}</span>
                          {v.sku && <span className="w-fit rounded bg-themed px-2 py-[3px] text-[0.75rem] text-text-muted">SKU: {v.sku}</span>}
                        </div>
                        <div className="mr-[25px] flex flex-col items-end justify-center max-[576px]:mr-0 max-[576px]:items-start">
                          <span className="text-[1.4rem] font-extrabold text-text-accent">{Number(v.unit_price).toLocaleString()} <span className="text-[0.9rem] font-normal text-text-muted">บาท</span></span>
                          {typeof v.stock_quantity !== 'undefined' && (
                            <span className={v.stock_quantity > 0 ? 'mt-1 text-[0.85rem] font-semibold text-[#10b981]' : 'mt-1 text-[0.85rem] font-semibold text-[#ef4444]'}>
                              {v.stock_quantity > 0 ? `สต็อก: ${v.stock_quantity}` : 'หมดสต็อก'}
                            </span>
                          )}
                        </div>
                        <div className="max-[576px]:w-full">
                          <button className={btnVariantBuyCls} disabled={v.stock_quantity === 0}>สั่งซื้อ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="mt-auto flex flex-col gap-[15px] pt-[30px]">
                <button className={btnPrimaryFullCls}>สั่งซื้อสินค้าทันที</button>

                <button
                  className={`${btnReviewToggleBaseCls} ${showReviews ? 'border border-solid border-accent text-text-accent' : 'border border-dashed border-themed text-text-muted hover:border-accent hover:bg-[rgba(255,199,9,0.05)] hover:text-text-main'}`}
                  onClick={() => setShowReviews(!showReviews)}
                >
                  <FaCommentDots />
                  <span>{showReviews ? 'ซ่อนรีวิว' : `อ่านรีวิวจากผู้ใช้งาน (${MOCK_REVIEWS.length})`}</span>
                  {showReviews ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* โปรโมชั่นที่เกี่ยวข้อง */}
          {promotions.length > 0 && (
            <div>
              <h3>โปรโมชั่นที่เกี่ยวข้อง</h3>
              <div>
                {promotions.map((promo) => (
                  <div key={promo.promotion_id}>
                    <div>{promo.promotion_name}</div>
                    <div>{promo.description}</div>
                    <div>ส่วนลด: {promo.discount_value} {promo.promotion_type === 'PERCENT' ? '%' : 'บาท'}</div>
                    {promo.products && promo.products.length > 0 && (
                      <div>
                        <strong>สินค้าที่ร่วมรายการ:</strong>
                        <ul>
                          {promo.products.map((p) => (
                            <li key={p.product_variant_id}>รหัสสินค้า: {p.product_variant_id} ราคาหลังลด: {p.discounted_price}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {promo.services && promo.services.length > 0 && (
                      <div>
                        <strong>บริการที่ร่วมรายการ:</strong>
                        <ul>
                          {promo.services.map((s) => (
                            <li key={s.service_id}>บริการ: {s.service_id} ราคาหลังลด: {s.discounted_price}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รีวิว */}
          {showReviews && (
            <div className="mb-[60px] animate-fade-in-down rounded-2xl border border-themed bg-bg-card p-10 shadow-[var(--card-shadow)]">
              <h3 className="mb-[30px] border-l-[5px] border-accent pl-[15px] text-[1.6rem] font-extrabold text-text-main">ความคิดเห็นจากลูกค้า</h3>
              <div className="grid grid-cols-1 gap-5">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="rounded-xl border border-themed bg-bg-main p-[25px]">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[1.1rem] font-bold text-text-main">{review.user}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} color={i < review.rating ? '#ffc709' : '#e5e7eb'} size={14} />
                        ))}
                      </div>
                    </div>
                    <div className="mb-[15px] text-[0.85rem] text-text-muted">{review.date}</div>
                    <p className="m-0 text-[1.05rem] leading-[1.7] text-text-muted">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-[30px]">
              <h3 className="mb-[30px] flex items-center gap-[15px] text-[1.8rem] font-extrabold text-text-main before:inline-block before:h-[30px] before:w-1.5 before:rounded-[3px] before:bg-accent before:content-['']">สินค้าอื่นๆ ที่น่าสนใจ</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[25px]">
                {relatedProducts.map((item) => {
                  const imgUrl = (item.images && item.images.length > 0) ? item.images[0].image_url : (item.image_url || '/images/no-image.png');
                  const price = item.variants && item.variants.length > 0 ? item.variants[0].unit_price : item.price;
                  return (
                    <Link to={`/product/${item.slug}`} key={item.id || item.product_template_id} className={relatedCardCls}>
                      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-bg-main">
                        <img src={getImageUrl(imgUrl)} alt={item.product_name} className="h-full w-full object-cover opacity-90 transition-transform duration-[600ms] group-hover:scale-110 group-hover:opacity-100" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h4 className="m-0 mb-[15px] line-clamp-2 text-[1.15rem] font-bold leading-[1.4] text-text-main transition-colors duration-300 group-hover:text-text-accent">{item.product_name}</h4>
                        <div className="mt-auto text-[1.3rem] font-extrabold text-text-accent">{price ? `฿${Number(price).toLocaleString()}` : 'สอบถามราคา'}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetailPage;
