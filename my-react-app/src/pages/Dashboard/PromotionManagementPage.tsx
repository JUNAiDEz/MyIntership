import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
import styles from '../../styles/AdminTheme.module.css';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaTimes,
  FaTag,
  FaSearch,
  FaCalendarAlt
} from 'react-icons/fa';
import { HasPermission } from '../../utils/ProtectedRoute';
import type { FormFieldEvent } from '@/types';

const getToken = () => localStorage.getItem('adminToken');

// Helper: Format DateTime for <input type="datetime-local">
const formatDateTimeForInput = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  return isoString.substring(0, 16);
};

// Helper: Format Date for Display
const formatDateDisplay = (isoString: string | null | undefined): string => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// --- Local types (backend ส่ง field alias ไม่ตายตัว — ใช้ optional + index signature) ---
type ItemType = 'service' | 'product_variant';

interface PromoVariant {
  product_variant_id?: number | string;
  id?: number | string;
  variant_name?: string;
  sku?: string;
  stock?: number | string;
  [key: string]: unknown;
}

interface MasterProduct {
  id?: number | string;
  product_template_id?: number | string;
  product_name?: string;
  title?: string;
  imageUrl?: string;
  images?: { image_url?: string }[];
  variants?: PromoVariant[];
  [key: string]: unknown;
}

interface MasterService {
  id?: number | string;
  service_id?: number | string;
  service_name?: string;
  title?: string;
  imageUrl?: string;
  images?: { image_url?: string }[];
  [key: string]: unknown;
}

/** รายละเอียดที่ backend อาจแนบมากับ item (optional) */
interface PromoItemDetails {
  variant_name?: string;
  service_name?: string;
  name?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

interface PromoItem {
  item_id: number | string;
  item_type: ItemType;
  item_details?: PromoItemDetails;
}

/** โครงสร้าง promotion ดิบจาก backend ก่อน normalize */
interface RawPromotion {
  promotion_id?: number;
  id?: number;
  promotion_name?: string;
  title?: string;
  description?: string;
  promotion_type?: string;
  discount_value?: number | string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  imageUrl?: string;
  is_active?: boolean;
  items?: PromoItem[];
  slug?: string;
  [key: string]: unknown;
}

/** promotion หลัง normalize (รูปที่ component ใช้จริง) */
interface PromotionRow {
  id: number;
  title: string;
  description?: string;
  type: string;
  price: number;
  start_date?: string;
  end_date?: string;
  imageUrl: string;
  is_active: boolean;
  items: PromoItem[];
  raw: RawPromotion;
}

type ModalMode = 'create' | 'edit' | 'view';

interface PromoModalState {
  open: boolean;
  mode: ModalMode;
  promotion: PromotionRow | null;
}

interface CreateForm {
  title: string;
  slug: string;
  description: string;
  promotion_type: string;
  promotion_price: number | string;
  start_date: string;
  end_date: string;
  imageUrl: string;
  items: PromoItem[];
}

function PromotionManagementPage() {
  const queryClient = useQueryClient();
  const PLACEHOLDER_60 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [togglingIds, setTogglingIds] = useState<number[]>([]);

  // --- Filter State ---
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- Modal & Form State ---
  const [modal, setModal] = useState<PromoModalState>({ open: false, mode: 'view', promotion: null });

  const [createForm, setCreateForm] = useState<CreateForm>({
    title: '',              // map to promotion_name
    slug: '',               // manual slug
    description: '',
    promotion_type: 'FIXED_AMOUNT', // ENUM('PERCENT', 'FIXED_AMOUNT', 'BUNDLE')
    promotion_price: '',    // map to discount_value
    start_date: '',
    end_date: '',
    imageUrl: '',           // map to image_url
    items: []               // Array of { item_id, item_type (product_variant/service) }
  });

  // --- Item Selection State ---
  const [selServiceId, setSelServiceId] = useState('');
  const [selProductId, setSelProductId] = useState('');
  const [selVariantId, setSelVariantId] = useState('');
  const [selProductObj, setSelProductObj] = useState<MasterProduct | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createError, setCreateError] = useState('');

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // --- 1. Fetch Promotions ---
  const { data: promotions = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['promotions', debouncedSearch],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      qParams.append('all', '1');
      if (debouncedSearch) qParams.append('search', debouncedSearch);

      const res = await fetch(`${API_URL}/api/sales/promotions?${qParams.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch promotions');

      const data: unknown = await res.json();
      const items: RawPromotion[] = Array.isArray(data)
        ? (data as RawPromotion[])
        : ((data as { items?: RawPromotion[] }).items || []);

      return items.map((p): PromotionRow => ({
        id: (p.promotion_id || p.id) as number,
        title: p.promotion_name || p.title || 'Untitled',
        description: p.description,
        type: p.promotion_type || 'FIXED_AMOUNT',
        price: Number(p.discount_value) || 0,
        start_date: p.start_date,
        end_date: p.end_date,
        imageUrl: p.image_url || p.imageUrl || '',
        is_active: typeof p.is_active !== 'undefined' ? p.is_active : true,
        items: p.items || [],
        raw: p
      }));
    },
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : '';

  // --- 2. Fetch Master Data ---
  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['promotion-master-products'],
    queryFn: async () => {
      const pRes = await fetch(`${API_URL}/api/inventory/products?all=1`, { headers });
      if (!pRes.ok) return [] as MasterProduct[];
      const pData: unknown = await pRes.json();
      return (Array.isArray(pData) ? pData : (pData as { items?: MasterProduct[] }).items || []) as MasterProduct[];
    },
  });
  const { data: allServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['promotion-master-services'],
    queryFn: async () => {
      const sRes = await fetch(`${API_URL}/api/services?all=1`, { headers });
      if (!sRes.ok) return [] as MasterService[];
      const sData: unknown = await sRes.json();
      return (Array.isArray(sData) ? sData : (sData as { items?: MasterService[] }).items || []) as MasterService[];
    },
  });
  const masterLoading = productsLoading || servicesLoading;

  // --- 3. Filtering & Pagination ---
  const filteredPromotions = promotions.filter((p) => {
    let typeOk = true;
    let statusOk = true;

    if (typeFilter) typeOk = p.type === typeFilter;
    if (statusFilter) {
        const isActive = statusFilter === 'active';
        statusOk = p.is_active === isActive;
    }

    return typeOk && statusOk;
  });

  const total = filteredPromotions.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredPromotions.slice((page - 1) * pageSize, page * pageSize);

  // --- 4. Helpers ---
  const getItemDisplayName = (item: PromoItem): string => {
    if (item.item_details) {
      if (item.item_type === 'product_variant') return item.item_details.variant_name || item.item_details.name || '';
      return item.item_details.service_name || item.item_details.name || '';
    }

    if (item.item_type === 'service') {
      const s = allServices.find((x) => (x.service_id || x.id) == item.item_id);
      return s ? `[Service] ${s.service_name || s.title}` : `Service #${item.item_id}`;
    }

    if (item.item_type === 'product_variant') {
      for (const p of allProducts) {
        const v = p.variants?.find((v) => (v.product_variant_id || v.id) == item.item_id);
        if (v) return `[Product] ${p.product_name || p.title} - ${v.variant_name || v.sku}`;
      }
      return `Variant #${item.item_id}`;
    }
    return `Unknown #${item.item_id}`;
  };

  const getItemImageUrl = (item: PromoItem): string => {
    let url = '';
    if (item.item_details?.imageUrl) url = item.item_details.imageUrl;
    else if (item.item_type === 'service') {
      const s = allServices.find((x) => (x.service_id || x.id) == item.item_id);
      if (s) url = (s.images && s.images[0]?.image_url) || s.imageUrl || '';
    }
    else if (item.item_type === 'product_variant') {
       const p = allProducts.find((prod) => prod.variants?.some((v) => (v.product_variant_id || v.id) == item.item_id));
       if(p) url = (p.images && p.images[0]?.image_url) || p.imageUrl || '';
    }
    if (!url) return PLACEHOLDER_60;
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  // --- 5. Item Selection Logic ---
  const resetSelection = () => {
    setSelServiceId('');
    setSelProductId('');
    setSelVariantId('');
    setSelProductObj(null);
  };

  const handleAddItem = () => {
    let newItem: PromoItem | null = null;

    if (selServiceId) {
      newItem = { item_id: parseInt(selServiceId), item_type: 'service' };
    } else if (selProductId) {
      const hasVariants = (selProductObj?.variants?.length ?? 0) > 0;
      if (hasVariants && selVariantId) {
        newItem = { item_id: parseInt(selVariantId), item_type: 'product_variant' };
      } else if (!hasVariants) {
         alert("Product has no variants. Please check product data.");
         return;
      }
    }

    if (!newItem) return alert("Please select an item.");

    const itemToAdd = newItem;
    const exists = createForm.items.find((i) => i.item_id === itemToAdd.item_id && i.item_type === itemToAdd.item_type);
    if (exists) return alert("Item already added.");

    setCreateForm((prev) => ({ ...prev, items: [...prev.items, itemToAdd] }));
    resetSelection();
  };

  const handleRemoveItem = (index: number) => {
    setCreateForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // --- 6. Form Actions ---
  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/api/system/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: fd
      });
      const data: { url?: string; image_url?: string; message?: string } = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setCreateForm((prev) => ({ ...prev, imageUrl: data.url || data.image_url || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        promotion_name: createForm.title,
        slug: createForm.slug,
        description: createForm.description,
        promotion_type: createForm.promotion_type,
        discount_value: parseFloat(String(createForm.promotion_price)) || 0,
        start_date: createForm.start_date ? new Date(createForm.start_date).toISOString() : null,
        end_date: createForm.end_date ? new Date(createForm.end_date).toISOString() : null,
        image_url: createForm.imageUrl,
        items: createForm.items.map((i) => ({
            item_id: i.item_id,
            item_type: i.item_type
        }))
      };

      let url = `${API_URL}/api/sales/promotions`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.promotion) {
        url = `${API_URL}/api/sales/promotions/${modal.promotion.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData: { message?: string } = await res.json();
        throw new Error(errData.message || 'Failed to save promotion');
      }
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (err: unknown) => setCreateError(err instanceof Error ? err.message : String(err)),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError('');
    saveMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_URL}/api/sales/promotions/${id}`, { method: 'DELETE', headers });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    onError: () => alert('Failed to delete'),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    deleteMutation.mutate(id);
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ id, current }: { id: number; current: boolean }) => {
      await fetch(`${API_URL}/api/sales/promotions/${id}/toggle_status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !current })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
    onError: (err: unknown) => console.error(err),
  });

  const toggleActive = (id: number, current: boolean) => {
    if (togglingIds.includes(id)) return;
    setTogglingIds((prev) => [...prev, id]);
    toggleMutation.mutate({ id, current }, {
      onSettled: () => setTogglingIds((prev) => prev.filter((x) => x !== id)),
    });
  };

  // --- 7. Modal ---
  const openModal = (mode: ModalMode, promo: PromotionRow | null = null) => {
    if (mode === 'edit' && promo) {
      setCreateForm({
        title: promo.title,
        slug: promo.raw?.slug || '',
        description: promo.description || '',
        promotion_type: promo.type || 'FIXED_AMOUNT',
        promotion_price: promo.price,
        start_date: formatDateTimeForInput(promo.start_date),
        end_date: formatDateTimeForInput(promo.end_date),
        imageUrl: promo.imageUrl,
        items: promo.items || []
      });
    } else if (mode === 'create') {
      setCreateForm({
        title: '', slug: '', description: '', promotion_type: 'FIXED_AMOUNT', promotion_price: '',
        start_date: '', end_date: '', imageUrl: '', items: []
      });
      setImageFile(null);
    }
    resetSelection();
    setCreateError('');
    setModal({ open: true, mode, promotion: promo });
  };

  const closeModal = () => setModal({ open: false, mode: 'view', promotion: null });

  // --- Render ---
  return (
    <div className={styles.pageContainer}>

      {/* Header & Controls */}
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>Promotion Management</h2>
            <HasPermission resource="promotions" action="create">
                <button onClick={() => openModal('create')} className={styles.addButton}>
                <FaPlus /> Create Promotion
                </button>
            </HasPermission>
        </div>

        {/* --- FILTER BAR --- */}
        <div className={styles.controls} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>

            {/* Search */}
            <div className={styles.searchWrapper} style={{ flex: 1, minWidth: '200px' }}>
                <FaSearch className={styles.searchIcon} />
                <input
                    className={styles.searchInput}
                    placeholder="Search Promotion..."
                    value={search}
                    onChange={(e: FormFieldEvent) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>Promotion Type</label>
                <select
                    className={styles.filterSelect}
                    value={typeFilter}
                    onChange={(e: FormFieldEvent) => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '160px' }}
                >
                    <option value="">All Types</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                    <option value="PERCENT">Percentage</option>
                    <option value="BUNDLE">Bundle</option>
                </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>Status</label>
                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e: FormFieldEvent) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '140px' }}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Grid View (Card Style) */}
      {!loading && !error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            padding: '10px 0'
          }}>
            {visible.length === 0 && <div style={{gridColumn: '1 / -1', textAlign:'center', padding: '30px'}}>No promotions found.</div>}

            {visible.map((p) => (
               <div key={p.id} style={{
                 background: '#fff',
                 borderRadius: '12px',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                 overflow: 'hidden',
                 border: '1px solid #f0f0f0',
                 display: 'flex',
                 flexDirection: 'column',
                 position: 'relative',
                 transition: 'transform 0.2s',
               }}
               onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'translateY(-4px)'}
               onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                  {/* Status Badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                     <span style={{
                       background: p.is_active ? '#4CAF50' : '#e5e7eb',
                       color: p.is_active ? '#fff' : '#888',
                       padding: '4px 10px',
                       borderRadius: '20px',
                       fontSize: '0.75rem',
                       fontWeight: 'bold',
                       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                     }}>
                       {p.is_active ? 'Active' : 'Inactive'}
                     </span>
                  </div>

                  {/* Image Area */}
                  <div style={{
                    height: '180px',
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`) : PLACEHOLDER_60}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Content Area */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     {/* Type Badge */}
                     <div style={{ marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            background: p.type === 'PERCENT' ? '#e0f2fe' : (p.type === 'BUNDLE' ? '#f3e8ff' : '#dcfce7'),
                            color: p.type === 'PERCENT' ? '#0369a1' : (p.type === 'BUNDLE' ? '#7e22ce' : '#15803d'),
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600
                        }}>
                            {p.type === 'PERCENT' ? 'Percent %' : p.type === 'BUNDLE' ? 'Bundle' : 'Fixed Amount'}
                        </span>
                     </div>

                     <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', fontWeight: 600, color: '#333', lineHeight: 1.4, flex: 1 }}>{p.title}</h3>

                     {/* Price & Date */}
                     <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
                            {p.type === 'PERCENT' ? `${p.price}% OFF` : `฿${p.price.toLocaleString()} OFF`}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt size={12} />
                            <span>{formatDateDisplay(p.start_date)} - {formatDateDisplay(p.end_date)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{
                    borderTop: '1px solid #f0f0f0',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fafafa'
                  }}>
                    <div style={{display:'flex', gap: '8px'}}>
                        <button onClick={() => openModal('view', p)} className={styles.iconBtn} title="View"><FaEye /></button>

                        <HasPermission resource="promotions" action="update">
                           <button onClick={() => openModal('edit', p)} className={styles.iconBtn} title="Edit"><FaEdit /></button>
                        </HasPermission>

                        <HasPermission resource="promotions" action="delete">
                           <button onClick={() => handleDelete(p.id)} className={`${styles.iconBtn} ${styles.delete}`} title="Delete"><FaTrash /></button>
                        </HasPermission>
                    </div>

                    <div>
                        <HasPermission resource="promotions" action="update">
                            <label className={styles.toggleSwitch} title="Toggle Active">
                                <input
                                    type="checkbox" checked={!!p.is_active}
                                    onChange={() => toggleActive(p.id, p.is_active)}
                                    disabled={togglingIds.includes(p.id)}
                                />
                                <span className={styles.toggleSlider} />
                            </label>
                        </HasPermission>
                    </div>
                  </div>
               </div>
            ))}
          </div>

          {/* Pagination */}
          <div className={styles.footer}>
            <div>Total {total} items</div>
            <div className={styles.pagination}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={styles.pageBtn}>Prev</button>
              <span style={{margin: '0 8px', fontWeight: 600}}>Page {page} / {pageCount}</span>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className={styles.pageBtn}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ width: '800px', maxWidth: '95%' }}>
            <div className={styles.modalHeader}>
                <h3>
                    {modal.mode === 'create' ? 'Create Promotion' :
                    modal.mode === 'edit' ? 'Edit Promotion' : 'Promotion Details'}
                </h3>
                <button onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{display:'flex', gap: 20, flexDirection: 'row', flexWrap: 'wrap'}}>
                {/* Left Column */}
                <div style={{flex:1, minWidth: '300px'}}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Promotion Name</label>
                      <input
                        className={styles.formInput} value={createForm.title} required disabled={modal.mode === 'view'}
                        onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Slug (URL)</label>
                      <input
                        className={styles.formInput} value={createForm.slug} required={true} disabled={modal.mode === 'view'}
                        onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
                        placeholder="e.g. summer-sale-2024"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Type</label>
                        <select
                            className={styles.formSelect} value={createForm.promotion_type} disabled={modal.mode === 'view'}
                            onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, promotion_type: e.target.value }))}
                        >
                            <option value="FIXED_AMOUNT">Fixed Amount (THB)</option>
                            <option value="PERCENT">Percent (%)</option>
                            <option value="BUNDLE">Bundle Price</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Value/Price</label>
                        <input
                          className={styles.formInput} type="number" value={createForm.promotion_price} required disabled={modal.mode === 'view'}
                          onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, promotion_price: e.target.value }))}
                        />
                      </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea
                      className={styles.formTextarea} rows={4} value={createForm.description} disabled={modal.mode === 'view'}
                      onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div style={{flex:1, minWidth: '300px'}}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Start Date</label>
                            <input
                                className={styles.formInput} type="datetime-local" value={createForm.start_date} disabled={modal.mode === 'view'}
                                onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, start_date: e.target.value }))}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>End Date</label>
                            <input
                                className={styles.formInput} type="datetime-local" value={createForm.end_date} disabled={modal.mode === 'view'}
                                onChange={(e: FormFieldEvent) => setCreateForm((f) => ({ ...f, end_date: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Image</label>
                        <div style={{display:'flex', gap: 10}}>
                             {createForm.imageUrl && (
                                <img
                                    src={createForm.imageUrl.startsWith('http') ? createForm.imageUrl : `${API_URL}${createForm.imageUrl}`}
                                    alt="preview" style={{width: 80, height: 80, objectFit:'cover', borderRadius:8, border:'1px solid #eee'}}
                                />
                            )}
                            {modal.mode !== 'view' && (
                                <div style={{flex:1}}>
                                    <input type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e.target.files?.[0])} style={{marginBottom:5, fontSize:'0.9rem'}} />
                                    {uploadingImage && <div style={{color:'#eab308', fontSize:'0.8rem'}}>Uploading...</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>

              <hr style={{margin:'20px 0', border:0, borderTop:'1px dashed #eee'}} />

              {/* Items Section */}
              <div className={styles.formGroup}>
                <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'1rem'}}><FaTag /> Associated Items ({createForm.items.length})</h4>

                {/* Selected List */}
                <div style={{maxHeight:150, overflowY:'auto', border:'1px solid #e5e7eb', borderRadius:8, padding:10, marginBottom:15, background:'#f9fafb'}}>
                    {createForm.items.length === 0 && <div style={{color:'#999', fontStyle:'italic', fontSize:'0.9rem'}}>No items added.</div>}
                    {createForm.items.map((item, idx: number) => (
                        <div key={idx} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px dashed #e5e7eb'}}>
                            <div style={{display:'flex', alignItems:'center', gap:10}}>
                                <img src={getItemImageUrl(item)} style={{width:32, height:32, objectFit:'cover', borderRadius:4, border:'1px solid #ddd'}} alt="" />
                                <span style={{fontSize:'0.9rem', color:'#374151'}}>{getItemDisplayName(item)}</span>
                            </div>
                            {modal.mode !== 'view' && (
                                <button type="button" onClick={() => handleRemoveItem(idx)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><FaTimes /></button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Form */}
                {modal.mode !== 'view' && (
                    <div style={{display:'flex', gap:10, alignItems:'flex-end', background:'#f3f4f6', padding:15, borderRadius:8, flexWrap:'wrap'}}>
                        <div style={{flex:1, minWidth: '150px'}}>
                            <label className={styles.formLabel} style={{fontSize:'0.8rem'}}>Add Service</label>
                            <select className={styles.formSelect} value={selServiceId} disabled={masterLoading || !!selProductId} onChange={(e: FormFieldEvent) => { setSelServiceId(e.target.value); setSelProductId(''); }}>
                                <option value="">-- Select Service --</option>
                                {allServices.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.title}</option>)}
                            </select>
                        </div>
                        <div style={{flex:1, minWidth: '150px'}}>
                            <label className={styles.formLabel} style={{fontSize:'0.8rem'}}>Or Add Product</label>
                            <select className={styles.formSelect} value={selProductId} disabled={masterLoading || !!selServiceId} onChange={(e: FormFieldEvent) => {
                                const val = e.target.value;
                                setSelProductId(val);
                                setSelServiceId('');
                                setSelVariantId('');
                                setSelProductObj(allProducts.find((p) => (p.id || p.product_template_id) == val) ?? null);
                            }}>
                                <option value="">-- Select Product --</option>
                                {allProducts.map((p) => <option key={String(p.id)} value={String(p.id)}>{p.title}</option>)}
                            </select>
                        </div>
                        {(selProductObj?.variants?.length ?? 0) > 0 && (
                            <div style={{flex:1, minWidth: '150px'}}>
                                <label className={styles.formLabel} style={{fontSize:'0.8rem'}}>Variant</label>
                                <select className={styles.formSelect} value={selVariantId} onChange={(e: FormFieldEvent) => setSelVariantId(e.target.value)}>
                                    <option value="">-- Select Variant --</option>
                                    {selProductObj?.variants?.map((v) => (
                                        <option key={String(v.product_variant_id || v.id)} value={String(v.product_variant_id || v.id)}>
                                            {v.variant_name} (Stock: {v.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button type="button" onClick={handleAddItem} className={styles.btnSubmit} style={{padding:'8px 12px', height:'fit-content', marginBottom:1}}><FaPlus /></button>
                    </div>
                )}
              </div>

              {createError && <div className={styles.errorMessage}>{createError}</div>}

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.btnCancel}>
                    {modal.mode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modal.mode !== 'view' && (
                    <button type="submit" className={styles.btnSubmit} disabled={saveMutation.isPending || uploadingImage}>
                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionManagementPage;