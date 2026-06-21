import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../../styles/AdminTheme.module.css';
import {
  FaEdit, FaTrash, FaPlus, FaEye, FaStar, FaSearch, FaTimes,
  FaBox, FaList, FaSave, FaCamera
} from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import { API_URL, authFetch } from '../../utils/api';
import { HasPermission } from '../../utils/ProtectedRoute';
import type { FormFieldEvent } from '@/types';

// --- Local types (ตาม field จริงที่หน้านี้ใช้) ---

/** หมวดหมู่บริการแบบ normalize แล้ว (ใช้ใน dropdown) */
interface CategoryOption {
  id: number;
  name: string;
}

/** หนึ่งรายการบริการแบบ normalize แล้ว (จาก queryFn ของ services) */
interface ServiceItem {
  id: number;
  title: string;
  price: number;
  discount_percent: number;
  usage_count: number;
  imageUrl: string;
  is_active: boolean;
  is_popular: boolean;
  category_id?: number;
  category_name: string;
  /** raw object ดิบจาก backend (โครงสร้างไม่ตายตัว) */
  raw: Record<string, unknown>;
}

/** state ของ form สำหรับสร้าง/แก้ไขบริการ */
interface ServiceForm {
  service_name: string;
  slug: string;
  price: string | number;
  discount_percent: string | number;
  category_id: string | number;
  image_url: string;
  description: string;
  is_active: boolean;
  is_popular: boolean;
}

/** state ของ modal บริการ (ใช้ ServiceItem เป็น item) */
interface ServiceModalState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  service: ServiceItem | null;
}

function ServiceManagementPage() {
    const queryClient = useQueryClient();

    // --- Add Category Modal State ---
    const [addCatModal, setAddCatModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addCatError, setAddCatError] = useState('');

    const addCatMutation = useMutation({
      mutationFn: async () => {
        const res = await authFetch(`${API_URL}/api/services/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_name: newCategoryName })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'เพิ่มหมวดหมู่ไม่สำเร็จ');
        return res.json();
      },
      onSuccess: () => {
        setNewCategoryName('');
        setAddCatModal(false);
        queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      },
      onError: (err: unknown) => setAddCatError(err instanceof Error ? err.message : String(err)),
    });

    const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      setAddCatError('');
      addCatMutation.mutate();
    };
  // Placeholder Images
  const PLACEHOLDER_60 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Filter State ---
  const [categoryFilter, setCategoryFilter] = useState('');

  // --- Modal & Form State ---
  const [modal, setModal] = useState<ServiceModalState>({ open: false, mode: 'view', service: null });

  // Form State
  const [createForm, setCreateForm] = useState<ServiceForm>({
    service_name: '',
    slug: '',
    price: '',            // map to base_labor_cost
    discount_percent: '', // map to discount_percent
    category_id: '',
    image_url: '',
    description: '',
    is_active: true,
    is_popular: false
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [createError, setCreateError] = useState('');

  // --- 2. Fetch Categories Dropdown ---
  const { data: categories = [] } = useQuery<CategoryOption[]>({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/services/categories`);
      if (!res.ok) return [];
      const data: unknown = await res.json();
      const rows: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : ((data as { items?: Record<string, unknown>[] })?.items || []);
      return rows.map((c) => ({
        id: Number(c.category_id ?? c.id),
        name: String(c.category_name ?? c.name ?? '')
      }));
    },
  });

  // --- 1. Fetch Services ---
  const { data: services = [], isLoading: loading, error: queryError } = useQuery<ServiceItem[]>({
    queryKey: ['services', debouncedSearch, categories],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      qParams.append('all', '1');
      if (debouncedSearch) qParams.append('search', debouncedSearch);

      const res = await authFetch(`${API_URL}/api/services?${qParams.toString()}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch services');
      }
      const data: unknown = await res.json();

      // Normalize Data
      const items: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : ((data as { items?: Record<string, unknown>[] })?.items || []);
      return items.map((s) => {
        const images = s.images as Array<{ image_url?: string; url?: string }> | undefined;
        const categoryId = s.category_id != null ? Number(s.category_id) : undefined;
        return {
          id: Number(s.service_id ?? s.id),
          title: String(s.service_name ?? s.title ?? 'Untitled'),
          price: s.base_labor_cost ? Number(s.base_labor_cost) : (Number(s.price) || 0),
          discount_percent: Number(s.discount_percent) || 0,
          usage_count: Number(s.usage_count) || 0,
          imageUrl: (images?.[0] && (images[0].image_url || images[0].url)) || '',
          is_active: typeof s.is_active !== 'undefined' ? Boolean(s.is_active) : true,
          is_popular: typeof s.is_popular !== 'undefined' ? Boolean(s.is_popular) : false,
          category_id: categoryId,
          category_name: categories.find((c) => c.id === categoryId)?.name || '-',
          raw: s
        };
      });
    },
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : '';

  // --- 3. Pagination & Filtering ---
  const filteredServices = services.filter((s) => {
      if (categoryFilter) return (Number(s.category_id) === Number(categoryFilter));
      return true;
  });

  const total = filteredServices.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredServices.slice((page - 1) * pageSize, page * pageSize);

  // --- 4. Actions ---

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setImageUploadError('');
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await authFetch(`${API_URL}/api/system/upload`, {
        method: 'POST',
        body: fd
      });
      const data: { url?: string; image_url?: string; message?: string; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');

      setCreateForm((f) => ({ ...f, image_url: data.url || data.image_url || '' }));
    } catch (err) {
      console.error('Upload error', err);
      setImageUploadError((err instanceof Error ? err.message : String(err)) || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        service_name: createForm.service_name,
        slug: createForm.slug,
        description: createForm.description || '',
        category_id: createForm.category_id ? Number(createForm.category_id) : null,
        base_labor_cost: Number(createForm.price) || 0,
        discount_percent: Number(createForm.discount_percent) || 0,
        images: createForm.image_url ? [createForm.image_url] : [],
        is_active: createForm.is_active,
        is_popular: createForm.is_popular
      };

      let url = `${API_URL}/api/services`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.service) {
        url = `${API_URL}/api/services/${modal.service.id}`;
        method = 'PUT';
      }

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch { /* ignore */ }
        try { const j = JSON.parse(errText); errText = j.message || j.error || errText; } catch { /* ignore */ }
        throw new Error(errText || 'Save failed');
      }
      return res.json();
    },
    onSuccess: () => {
      setModal({ open: false, mode: 'view', service: null });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err: unknown) => setCreateError((err instanceof Error ? err.message : String(err)) || 'Error saving service'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    saveMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`${API_URL}/api/services/${id}/hard`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service.');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
    onError: (err: unknown) => alert(err instanceof Error ? err.message : String(err)),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้?')) return;
    deleteMutation.mutate(id);
  };

  // --- 5. Modal Control ---
  const openModal = (mode: ServiceModalState['mode'], service: ServiceItem | null = null) => {
    if ((mode === 'edit' || mode === 'view') && service) {
      const s = service.raw as Record<string, any>;
      setCreateForm({
        service_name: s.service_name || s.title || '',
        slug: s.slug || '', // FIXME: ใส่ค่าว่างป้องกัน undefined
        price: s.base_labor_cost || s.price || '',
        discount_percent: s.discount_percent || 0,
        category_id: s.category_id || '',
        image_url: (s.images && s.images[0] && (s.images[0].image_url || s.images[0].url)) || '',
        description: s.description || '', // FIXME: ใส่ค่าว่างป้องกัน undefined
        is_active: typeof s.is_active !== 'undefined' ? s.is_active : true,
        is_popular: typeof s.is_popular !== 'undefined' ? s.is_popular : false,
      });
    } else if (mode === 'create') {
      setCreateForm({
        service_name: '', slug: '', price: '', discount_percent: '', category_id: '',
        image_url: '', description: '', is_active: true, is_popular: false
      });
      setImageFile(null);
      setImageUploadError('');
      setUploadingImage(false);
    }
    setModal({ open: true, mode, service });
  };

  // Helper สำหรับเปลี่ยนค่า Form
  const handleInputChange = (e: FormFieldEvent) => {
    const { name, value } = e.target;
    if (name === 'is_active' || name === 'is_popular') {
        setCreateForm((prev) => ({ ...prev, [name]: value === 'true' }));
    } else {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getCategoryName = (id: number | string) => categories.find((c) => c.id === Number(id))?.name || '-';

  // --- RENDER ---
  return (
    <div className={styles.pageContainer}>

      {/* HEADER */}
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>Service Management</h2>
            <HasPermission resource="services" action="create">
                <button onClick={() => openModal('create')} className={styles.addButton}>
                <FaPlus /> Add Service
                </button>
            </HasPermission>
        </div>

        {/* --- FILTER BAR (Style แบบ Product) --- */}
        <div className={styles.controls} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {/* Search */}
            <div className={styles.searchWrapper} style={{ flex: 1, minWidth: '200px' }}>
                <FaSearch className={styles.searchIcon} />
                <input
                    className={styles.searchInput}
                    placeholder="Search Service..."
                    value={search}
                    onChange={(e: FormFieldEvent) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Filter: Category + Add Category Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>หมวดหมู่</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e: FormFieldEvent) => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={{ margin: 0, minWidth: '160px' }}
                >
                  <option value="">ทั้งหมด</option>
                  {categories.length === 0 ? (
                    <option disabled>ไม่มีหมวดหมู่</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  )}
                </select>
                <button type="button" onClick={() => setAddCatModal(true)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ffc709', background: '#fffbe7', color: '#bfa600', fontWeight: 'bold', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaPlus /> เพิ่มหมวดหมู่
                </button>
              </div>
            </div>
              {/* --- Add Category Modal --- */}
              {addCatModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 10, padding: 30, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
                    <h3 style={{ margin: 0, marginBottom: 15, fontWeight: 700, fontSize: 18 }}>เพิ่มหมวดหมู่ใหม่</h3>
                    <form onSubmit={handleAddCategory}>
                      <input type="text" value={newCategoryName} onChange={(e: FormFieldEvent) => setNewCategoryName(e.target.value)} placeholder="ชื่อหมวดหมู่" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 12 }} autoFocus />
                      {addCatError && <div style={{ color: 'red', fontSize: 13, marginBottom: 8 }}>{addCatError}</div>}
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setAddCatModal(false)} style={{ padding: '7px 18px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                        <button type="submit" disabled={addCatMutation.isPending} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#ffc709', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>{addCatMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading && <p>Loading services...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* GRID VIEW (Style ใกล้เคียง Product) */}
      {!loading && !error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
            padding: '10px 0'
          }}>
            {visible.length === 0 && <div style={{gridColumn: '1 / -1', textAlign:'center', padding: '30px'}}>No services found.</div>}

            {visible.map((s) => (
                <div key={s.id}
                    style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        position: 'relative'
                    }}
                    onClick={() => openModal('view', s)}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {/* Status Badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        {s.is_popular && <FaStar style={{color: '#ffc107', marginRight: 5, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'}} />}
                        <span style={{
                            background: s.is_active ? '#4CAF50' : '#9ca3af',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Image */}
                    <div style={{
                        height: '200px',
                        background: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <img
                            src={s.imageUrl ? (s.imageUrl.startsWith('http') ? s.imageUrl : `${API_URL}${s.imageUrl}`) : PLACEHOLDER_60}
                            alt={s.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
                        />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {s.category_name}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>{s.title}</h3>

                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                             <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000' }}>฿{s.price.toLocaleString()}</div>
                                {s.discount_percent > 0 && <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>- {s.discount_percent}%</div>}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className={styles.footer}>
            <div>Total {total} items</div>
            <div className={styles.pagination}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={styles.pageBtn}>Prev</button>
              <span style={{margin:'0 8px', fontWeight:600}}>Page {page} / {pageCount}</span>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className={styles.pageBtn}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* --- UNIFIED SERVICE MODAL (Style แบบ Product) --- */}
      {modal.open && (
        <ServiceDetailModal
            modal={modal}
            setModal={setModal}
            createForm={createForm}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleImageUpload={handleImageUpload}
            uploadingImage={uploadingImage}
            categories={categories}
            PLACEHOLDER_60={PLACEHOLDER_60}
            API_URL={API_URL}
            createLoading={saveMutation.isPending}
            createError={createError}
            handleDelete={handleDelete}
        />
      )}
    </div>
  );
}

// --- NEW UNIFIED COMPONENT: ServiceDetailModal ---
interface ServiceDetailModalProps {
    modal: ServiceModalState;
    setModal: React.Dispatch<React.SetStateAction<ServiceModalState>>;
    createForm: ServiceForm;
    handleInputChange: (e: FormFieldEvent) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleImageUpload: (file: File | undefined) => void;
    uploadingImage: boolean;
    categories: CategoryOption[];
    PLACEHOLDER_60: string;
    API_URL: string;
    createLoading: boolean;
    createError: string;
    handleDelete: (id: number) => void;
}

function ServiceDetailModal({
    modal, setModal, createForm, handleInputChange, handleSubmit,
    handleImageUpload, uploadingImage, categories,
    PLACEHOLDER_60, API_URL, createLoading, createError, handleDelete
}: ServiceDetailModalProps) {
    const [tab, setTab] = useState('info');
    const isEditing = modal.mode === 'edit' || modal.mode === 'create';

    // Styles match ProductDetailModal
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: isEditing ? '#fff' : '#f9fafb',
        fontSize: '0.95rem',
        color: '#1f2937',
        pointerEvents: isEditing ? 'auto' : 'none',
        boxSizing: 'border-box',
        height: '42px'
    };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' };
    const textareaStyle: React.CSSProperties = { ...inputStyle, height: 'auto', minHeight: '80px' };

    return (
        <div className={styles.modalBackdrop} style={{ backdropFilter: 'blur(5px)' }} onClick={(e: React.MouseEvent<HTMLDivElement>) => { if(e.target === e.currentTarget) setModal({...modal, open: false}); }}>
            <div style={{
                background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px',
                overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.3s ease-out',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
                {/* 1. Header (Black) */}
                <div style={{ background: '#000', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                            {createForm.service_name || (modal.mode === 'create' ? 'เพิ่มบริการใหม่' : 'รายละเอียดบริการ')}
                        </h2>
                        {modal.service && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 4 }}>ID: {modal.service.id}</div>}
                    </div>
                    <button onClick={() => setModal({ ...modal, open: false })} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><FaTimes /></button>
                </div>

                {/* 2. Tabs Buttons */}
                <div style={{ padding: '15px 20px 0 20px', display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button style={{ flex: 1, background: tab === 'info' ? '#ffc709' : '#fff', border: tab === 'info' ? 'none' : '1px solid #eee', borderRadius: '8px', padding: '10px', fontWeight: 'bold', color: tab === 'info' ? '#000' : '#888', cursor: 'pointer' }} onClick={() => setTab('info')}>
                        <FaBox style={{marginRight: 6}} /> ข้อมูลบริการ
                    </button>
                    {!isEditing && modal.mode !== 'create' && (
                        <button style={{ flex: 1, background: tab === 'log' ? '#ffc709' : '#fff', border: tab === 'log' ? 'none' : '1px solid #eee', borderRadius: '8px', padding: '10px', fontWeight: 'bold', color: tab === 'log' ? '#000' : '#888', cursor: 'pointer' }} onClick={() => setTab('log')}>
                            <FaList style={{marginRight: 6}} /> ประวัติ (จำลอง)
                        </button>
                    )}
                </div>

                {/* 3. Content Area */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {createError && <div style={{ color: 'red', marginBottom: 15, fontSize: '0.9rem' }}>{createError}</div>}
                    {uploadingImage && <div style={{ color: '#eab308', fontSize: '0.9rem', marginBottom: 10 }}>Uploading image...</div>}

                    {tab === 'info' ? (
                        <form onSubmit={handleSubmit}>
                            {/* Image Section */}
                            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '100%', height: 220, background: '#f3f4f6', borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={createForm.image_url ? (createForm.image_url.startsWith('http') ? createForm.image_url : `${API_URL}${createForm.image_url}`) : PLACEHOLDER_60}
                                        alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                    {isEditing && (
                                        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
                                            <label style={{ background: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FaCamera /> เปลี่ยนรูป
                                                <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e.target.files?.[0])} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Inputs Grid */}
                            <div style={{ display: 'grid', gap: 15 }}>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                    <div>
                                        <label style={labelStyle}>ชื่อบริการ</label>
                                        <input style={inputStyle} name="service_name" value={createForm.service_name || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Slug</label>
                                        <input style={inputStyle} name="slug" value={createForm.slug || ''} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                    <div>
                                        <label style={labelStyle}>หมวดหมู่</label>
                                        <select style={inputStyle} name="category_id" value={createForm.category_id || ''} onChange={handleInputChange}>
                                            <option value="">เลือกหมวดหมู่</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>ราคา (บาท)</label>
                                        <input type="number" style={inputStyle} name="price" value={createForm.price || ''} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                    <div>
                                        <label style={labelStyle}>สถานะ</label>
                                        <select style={inputStyle} name="is_active" value={createForm.is_active === true ? 'true' : 'false'} onChange={handleInputChange} disabled={!isEditing}>
                                            <option value="true">ใช้งาน (Active)</option>
                                            <option value="false">ปิดใช้งาน (Inactive)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>ยอดนิยม</label>
                                        <select style={inputStyle} name="is_popular" value={createForm.is_popular === true ? 'true' : 'false'} onChange={handleInputChange} disabled={!isEditing}>
                                            <option value="true">ยอดนิยม</option>
                                            <option value="false">ทั่วไป</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>ส่วนลด (%)</label>
                                    <input type="number" style={inputStyle} name="discount_percent" value={createForm.discount_percent || ''} onChange={handleInputChange} />
                                </div>

                                <div>
                                    <label style={labelStyle}>รายละเอียดเพิ่มเติม</label>
                                    <textarea style={textareaStyle} name="description" rows={3} value={createForm.description || ''} onChange={handleInputChange} />
                                </div>

                            </div>

                            {/* Footer Buttons */}
                            <div style={{ marginTop: 25, paddingTop: 20, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                {modal.mode === 'edit' && (
                                     <button type="button" onClick={() => { if(modal.service && window.confirm('ยืนยันลบ?')) { handleDelete(modal.service.id); setModal({...modal, open:false}); } }} style={{ padding: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <FaTrash /> ลบ
                                     </button>
                                )}
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                                    {isEditing ? (
                                        <>
                                            <button type="button" onClick={() => modal.mode === 'create' ? setModal({...modal, open: false}) : setModal({...modal, mode: 'view'})} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                                            <button type="submit" disabled={createLoading || uploadingImage} style={{ padding: '10px 30px', borderRadius: 8, border: 'none', background: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', gap: 5 }}>
                                                <FaSave /> {createLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <HasPermission resource="services" action="update">
                                                <button type="button" onClick={() => setModal({...modal, mode: 'edit'})} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ffc709', background: '#fffbe7', color: '#bfa600', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', gap: 5 }}>
                                                    <FaEdit /> แก้ไข
                                                </button>
                                            </HasPermission>
                                            <button type="button" onClick={() => setModal({...modal, open: false})} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                                                ปิดหน้าต่าง
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div style={{textAlign:'center', color:'#999', marginTop:30}}>
                            <p>ยังไม่มีประวัติการแก้ไขสำหรับบริการนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ServiceManagementPage;