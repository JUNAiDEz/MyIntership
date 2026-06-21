import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../../styles/AdminTheme.module.css';
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes, FaSearch, FaCar } from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
import { HasPermission } from '../../utils/ProtectedRoute';

const getToken = () => localStorage.getItem('adminToken');

// --- ฟังก์ชันแก้บั๊ก Base64 (คงเดิม) ---
const sanitizeBase64 = (str: any) => {
  if (!str) return '';
  let clean = str.trim();
  if (clean.startsWith('data:')) {
    const commaIndex = clean.indexOf(',');
    if (commaIndex !== -1) {
      const header = clean.substring(0, commaIndex + 1);
      let content = clean.substring(commaIndex + 1);
      if (content.includes(':')) {
        content = content.split(':')[0];
      }
      content = content.split(' ')[0];
      return header + content;
    }
  }
  return clean.split(' ')[0];
};

function CarManagementPage() {
  const PLACEHOLDER_CAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dy='.3em' fill='%239ca3af' font-size='12' text-anchor='middle'>No Image</text></svg>";

  const queryClient = useQueryClient();

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Filter State ---
  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // --- Modal & Form ---
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', car: null });

  // Form State
  const [createForm, setCreateForm] = useState<any>({
    brand_id: '',
    model_name: '',
    model_year: '',
    car_size: 'SEDAN', // Default
    image_url: ''
  });

  const [imageFile, setImageFile] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [createError, setCreateError] = useState('');

  // --- Headers ---
  const headers = useMemo(() => {
    const h: any = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // --- 1. Fetch Data ---
  const brandsQuery = useQuery({
    queryKey: ['car-brands'],
    queryFn: async () => {
      const brandRes = await fetch(`${API_URL}/api/vehicles/master/brands`, { headers });
      if (!brandRes.ok) throw new Error('ไม่สามารถโหลดยี่ห้อรถได้');
      const brandData = await brandRes.json();
      return brandData.data || [];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const modelRes = await fetch(`${API_URL}/api/vehicles/master/models`, { headers });
      if (!modelRes.ok) throw new Error('ไม่สามารถโหลดรุ่นรถได้');
      const modelData = await modelRes.json();
      return (modelData.data || []).map((car: any) => ({
        id: car.car_model_id,
        brand_id: car.brand_id,
        brand_name: car.brand?.brand_name || 'Unknown',
        model: car.model_name,
        year: car.model_year,
        size: car.car_size,
        imageUrl: car.image_url ? sanitizeBase64(car.image_url) : ''
      }));
    },
  });

  const brands: any[] = brandsQuery.data || [];
  const cars: any[] = carsQuery.data || [];
  const loading = brandsQuery.isLoading || carsQuery.isLoading;
  const error = brandsQuery.error || carsQuery.error
    ? ((brandsQuery.error || carsQuery.error) instanceof Error
        ? (brandsQuery.error || carsQuery.error)!.message
        : 'โหลดข้อมูลไม่สำเร็จ')
    : '';

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['cars'] });

  // --- 2. Filter & Pagination Logic ---

  // Calculate Available Years for Filter Dropdown
  const availableYears = useMemo(() => {
    const years = cars.map((c: any) => c.year).filter((y: any) => y); // Get valid years
    return [...new Set(years)].sort((a: any, b: any) => b - a); // Unique & Descending
  }, [cars]);

  const filteredCars = cars.filter((c: any) => {
    let searchOk = true;
    let brandOk = true;
    let typeOk = true;
    let yearOk = true;

    // Search (Name or Brand)
    if (debouncedSearch) {
        const lower = debouncedSearch.toLowerCase();
        searchOk = c.model.toLowerCase().includes(lower) || c.brand_name.toLowerCase().includes(lower);
    }

    // Brand Filter
    if (brandFilter) {
        brandOk = Number(c.brand_id) === Number(brandFilter);
    }

    // Type Filter
    if (typeFilter) {
        typeOk = c.size === typeFilter;
    }

    // Year Filter
    if (yearFilter) {
        yearOk = Number(c.year) === Number(yearFilter);
    }

    return searchOk && brandOk && typeOk && yearOk;
  });

  const total = filteredCars.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredCars.slice((page - 1) * pageSize, page * pageSize);

  // --- 3. Actions ---
  const handleImageUpload = async (file: any) => {
    if (!file) return;
    setImageFile(file);
    setImageUploadError('');
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateForm((prev: any) => ({ ...prev, image_url: reader.result }));
        setUploadingImage(false);
      };
      reader.onerror = (err: any) => {
        setImageUploadError('อัปโหลดรูปไม่สำเร็จ: ' + err.message);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setImageUploadError('อัปโหลดรูปไม่สำเร็จ: ' + (err instanceof Error ? err.message : String(err)));
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brand_id: Number(createForm.brand_id),
        model_name: createForm.model_name,
        model_year: createForm.model_year ? Number(createForm.model_year) : null,
        car_size: createForm.car_size,
        image_url: createForm.image_url ? sanitizeBase64(createForm.image_url) : ''
      };

      let url = `${API_URL}/api/vehicles/master/models`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.car) {
        url = `${API_URL}/api/vehicles/master/models/${modal.car.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'บันทึกไม่สำเร็จ');
      return result;
    },
    onSuccess: () => { refresh(); setModal({ open: false, mode: 'view', car: null }); },
    onError: (err: any) => setCreateError(err instanceof Error ? err.message : String(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      const res = await fetch(`${API_URL}/api/vehicles/master/models/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'ลบไม่สำเร็จ');
      return result;
    },
    onSuccess: refresh,
    onError: (err: any) => alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err))),
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCreateError('');
    saveMutation.mutate();
  };

  const handleDelete = (id: any) => {
    if (!window.confirm('ยืนยันการลบข้อมูลรถยนต์?')) return;
    deleteMutation.mutate(id);
  };

  // --- 4. Modal Control ---
  const openModal = (mode: any, car: any = null) => {
    if ((mode === 'edit' || mode === 'view') && car) {
      setCreateForm({
        brand_id: car.brand_id || '',
        model_name: car.model || '',
        model_year: car.year || '',
        car_size: car.size || 'SEDAN',
        image_url: car.imageUrl || ''
      });
    } else if (mode === 'create') {
      setCreateForm({
        brand_id: brands.length > 0 ? brands[0].brand_id : '',
        model_name: '', model_year: '', car_size: 'SEDAN', image_url: ''
      });
      setImageFile(null);
    }
    setCreateError('');
    setModal({ open: true, mode, car });
  };

  const closeModal = () => setModal({ open: false, mode: 'view', car: null });

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>Car Model Management</h2>
            <HasPermission resource="cars" action="create">
                <button onClick={() => openModal('create')} className={styles.addButton}>
                <FaPlus /> Add Car
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
                    placeholder="Search Brand, Model..."
                    value={search}
                    onChange={(e: any) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Brand Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>แบรนด์</label>
                <select
                    className={styles.filterSelect}
                    value={brandFilter}
                    onChange={(e: any) => { setBrandFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '150px' }}
                >
                    <option value="">ทั้งหมด</option>
                    {brands.map((b: any) => (
                        <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                    ))}
                </select>
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>ประเภท</label>
                <select
                    className={styles.filterSelect}
                    value={typeFilter}
                    onChange={(e: any) => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '150px' }}
                >
                    <option value="">ทั้งหมด</option>
                    <option value="SEDAN">SEDAN</option>
                    <option value="SUV">SUV / PPV</option>
                    <option value="PICKUP">PICKUP</option>
                    <option value="HATCHBACK">HATCHBACK</option>
                    <option value="VAN">VAN</option>
                    <option value="COUPE">COUPE</option>
                    <option value="WAGON">WAGON</option>
                </select>
            </div>

            {/* Year Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>ปี</label>
                <select
                    className={styles.filterSelect}
                    value={yearFilter}
                    onChange={(e: any) => { setYearFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '120px' }}
                >
                    <option value="">ทั้งหมด</option>
                    {availableYears.map((y: any) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* GRID VIEW */}
      {!loading && !error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            padding: '10px 0'
          }}>
            {visible.length === 0 && <div style={{gridColumn: '1 / -1', textAlign:'center', padding: '30px'}}>No cars found.</div>}

            {visible.map((c: any) => (
                <div key={c.id}
                    onClick={() => openModal('view', c)} /* เพิ่ม onClick ให้การ์ด */
                    style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s',
                        cursor: 'pointer' /* เพิ่ม cursor pointer */
                  }}
                  onMouseEnter={(e: any) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {/* Image */}
                    <div style={{
                        height: '160px',
                        background: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #f0f0f0',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={(() => {
                                if (!c.imageUrl || c.imageUrl === '') return PLACEHOLDER_CAR;
                                if (c.imageUrl.startsWith('http')) return c.imageUrl;
                                if (c.imageUrl.startsWith('data:image')) {
                                    return sanitizeBase64(c.imageUrl);
                                }
                                return `${API_URL}${c.imageUrl}`;
                            })()}
                            alt={c.model}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.target.src = PLACEHOLDER_CAR; }}
                        />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                         {/* Brand Badge */}
                         <div style={{ marginBottom: '6px' }}>
                             <span style={{
                                fontSize: '0.75rem',
                                color: '#666',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: 600
                             }}>
                                 {c.brand_name}
                             </span>
                         </div>

                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', fontWeight: 600, color: '#333', lineHeight: 1.4, flex: 1 }}>{c.model}</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                             <div style={{display:'flex', gap: 6}}>
                                 <span style={{
                                     fontSize: '0.75rem',
                                     background: '#ffc709', /* เปลี่ยนเป็นสีเหลือง */
                                     color: '#000',          /* ตัวหนังสือสีดำ */
                                     padding: '2px 8px',
                                     borderRadius: '4px',
                                     fontWeight: 600
                                 }}>
                                     {c.size}
                                 </span>
                                 <span style={{
                                     fontSize: '0.75rem',
                                     background: '#f3f4f6',
                                     color: '#374151',
                                     padding: '2px 8px',
                                     borderRadius: '4px'
                                 }}>
                                     {c.year || 'N/A'}
                                 </span>
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
                            {/* เพิ่ม e.stopPropagation() ที่ปุ่มต่างๆ */}
                            <button onClick={(e: any) => { e.stopPropagation(); openModal('view', c); }} className={styles.iconBtn} title="View"><FaEye /></button>

                            <HasPermission resource="cars" action="update">
                                <button onClick={(e: any) => { e.stopPropagation(); openModal('edit', c); }} className={styles.iconBtn} title="Edit"><FaEdit /></button>
                            </HasPermission>

                            <HasPermission resource="cars" action="delete">
                                <button onClick={(e: any) => { e.stopPropagation(); handleDelete(c.id); }} className={`${styles.iconBtn} ${styles.delete}`} title="Delete"><FaTrash /></button>
                            </HasPermission>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className={styles.footer}>
            <div>Total {total} items</div>
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage((p: any) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span style={{margin:'0 8px', fontWeight:600}}>Page {page} / {pageCount}</span>
              <button className={styles.pageBtn} onClick={() => setPage((p: any) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* MODAL */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
                <h3>
                    {modal.mode === 'create' ? 'Add Car Model' :
                    modal.mode === 'edit' ? 'Edit Car Model' : 'Car Details'}
                </h3>
                <button onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Brand</label>
                  <select
                    className={styles.formSelect}
                    value={createForm.brand_id}
                    onChange={(e: any) => setCreateForm((f: any) => ({ ...f, brand_id: e.target.value }))}
                    disabled={modal.mode === 'view'}
                    required
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map((b: any) => (
                        <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Model Name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={createForm.model_name}
                    onChange={(e: any) => setCreateForm((f: any) => ({ ...f, model_name: e.target.value }))}
                    disabled={modal.mode === 'view'}
                    required
                    placeholder="e.g. Civic, Vios"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Year</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={createForm.model_year}
                    onChange={(e: any) => setCreateForm((f: any) => ({ ...f, model_year: e.target.value }))}
                    disabled={modal.mode === 'view'}
                    placeholder="e.g. 2024"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Body Type</label>
                  <select
                    className={styles.formSelect}
                    value={createForm.car_size}
                    onChange={(e: any) => setCreateForm((f: any) => ({ ...f, car_size: e.target.value }))}
                    disabled={modal.mode === 'view'}
                  >
                    <option value="SEDAN">SEDAN</option>
                    <option value="SUV">SUV / PPV</option>
                    <option value="PICKUP">PICKUP</option>
                    <option value="HATCHBACK">HATCHBACK</option>
                    <option value="VAN">VAN</option>
                    <option value="COUPE">COUPE</option>
                    <option value="WAGON">WAGON</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Car Image</label>
                {modal.mode !== 'view' && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => handleImageUpload(e.target.files[0])}
                        style={{marginBottom: 10, fontSize:'0.9rem'}}
                    />
                )}
                {createForm.image_url && (
                  <img
                    src={
                      createForm.image_url.startsWith('http')
                        ? createForm.image_url
                        : createForm.image_url.startsWith('data:image')
                          ? sanitizeBase64(createForm.image_url)
                          : `${API_URL}${createForm.image_url}`
                    }
                    alt="preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    onError={(e: any) => { e.target.src = PLACEHOLDER_CAR; }}
                  />
                )}
              </div>

              {createError && <div className={styles.errorMessage}>{createError}</div>}
              {uploadingImage && <div style={{ color: '#eab308', marginBottom: 10 }}>Uploading image...</div>}

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

export default CarManagementPage;