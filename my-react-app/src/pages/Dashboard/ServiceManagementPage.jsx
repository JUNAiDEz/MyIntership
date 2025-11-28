import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './ManagementPage.module.css'; // ใช้ CSS เดียวกับ Product
import { FaEdit, FaTrash, FaPlus, FaEye, FaStar } from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
const getToken = () => localStorage.getItem('adminToken');

function ServiceManagementPage() {
  // Fallback Images
  const PLACEHOLDER_60 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
  const PLACEHOLDER_160 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";

  // --- Main State ---
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Modal & Form State ---
  const [modal, setModal] = useState({ open: false, mode: 'view', service: null });
  
  // Form State (Map ให้ตรงกับ Service Model)
  const [createForm, setCreateForm] = useState({
    service_name: '',
    price: '',         // map to base_labor_cost
    usage_count: '',
    category_id: '',
    image_url: '',
    description: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // --- Dropdowns & Toggles ---
  const [categories, setCategories] = useState([]);
  const [togglingIds, setTogglingIds] = useState([]);

  // --- Headers Helper ---
  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // --- 1. Fetch Services ---
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // ส่งทั้ง search และ all=1 เพื่อดึงทั้งหมดรวมตัวที่ซ่อน
      const qParams = new URLSearchParams();
      qParams.append('all', '1');
      if (debouncedSearch) qParams.append('search', debouncedSearch);

      const res = await fetch(`${API_URL}/api/services/services?${qParams.toString()}`, { headers });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch services');
      }
      const data = await res.json();

      // Normalize Data
      const items = Array.isArray(data) ? data : data.items || [];
      const mapped = items.map((s) => ({
        id: s.service_id || s.id,
        title: s.service_name || s.title || 'Untitled',
        // Service Model uses base_labor_cost
        price: s.base_labor_cost ? Number(s.base_labor_cost) : (Number(s.price) || 0),
        usage_count: s.usage_count || 0,
        imageUrl: (s.images && s.images[0] && (s.images[0].image_url || s.images[0].url)) || '',
        is_active: typeof s.is_active !== 'undefined' ? s.is_active : true,
        is_popular: typeof s.is_popular !== 'undefined' ? s.is_popular : false,
        raw: s // เก็บ Raw data ไว้ใช้ตอน Edit/View
      }));

      setServices(mapped);
    } catch (err) {
      console.error('fetchServices error', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, headers]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // --- 2. Fetch Categories Dropdown ---
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services/categories`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : data.items || []).map(c => ({ 
            id: c.category_id || c.id, 
            name: c.category_name || c.name 
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Fetch categories failed', err);
      }
    };
    fetchCats();
  }, [headers]);

  // --- 3. Pagination Calculation ---
  const total = services.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = services.slice((page - 1) * pageSize, page * pageSize);

  // --- 4. Actions: Create / Edit / Delete / Toggle ---

  // Handle Image Upload
  const handleImageUpload = async (file) => {
    if (!file) return;
    setImageFile(file);
    setImageUploadError('');
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/api/system/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');
      
      setCreateForm(f => ({ ...f, image_url: data.url || data.image_url }));
    } catch (err) {
      console.error('Upload error', err);
      setImageUploadError(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Create & Update Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      // Prepare Payload
      const payload = {
        service_name: createForm.service_name,
        description: createForm.description || '',
        category_id: createForm.category_id ? Number(createForm.category_id) : null,
        base_labor_cost: Number(createForm.price) || 0,
        usage_count: Number(createForm.usage_count) || 0,
        images: createForm.image_url ? [createForm.image_url] : []
      };

      let url = `${API_URL}/api/services/services`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.service) {
        url = `${API_URL}/api/services/services/${modal.service.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch (e) {}
        try { const j = JSON.parse(errText); errText = j.message || j.error || errText; } catch (e) {}
        throw new Error(errText || 'Save failed');
      }

      // Success
      setModal({ open: false, mode: 'view', service: null });
      await fetchServices();
    } catch (err) {
      setCreateError(err.message || 'Error saving service');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้? การกระทำนี้ไม่สามารถยกเลิกได้')) return;
    try {
      const res = await fetch(`${API_URL}/api/services/services/${id}/hard`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete service.');
      await fetchServices();
    } catch (err) {
      alert(err.message);
    }
  };

  const togglePopular = async (id, current) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/toggle_popular`, {
        method: 'PATCH',
        headers
      });
      if (!res.ok) throw new Error('Toggle popular failed');
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (id, current) => {
    if (togglingIds.includes(id)) return;
    setTogglingIds(ids => [...ids, id]);
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/toggle_status`, {
        method: 'PATCH',
        headers
      });
      if (!res.ok) throw new Error('Toggle status failed');
      await fetchServices();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    } finally {
      setTogglingIds(ids => ids.filter(x => x !== id));
    }
  };

  // --- 5. Modal Control ---
  const openModal = (mode, service = null) => {
    if (mode === 'edit' && service && service.raw) {
      const s = service.raw;
      // Populate form for Edit
      setCreateForm({
        service_name: s.service_name || s.title || '',
        price: s.base_labor_cost || s.price || '',
        usage_count: s.usage_count || 0,
        category_id: s.category_id || '',
        image_url: (s.images && s.images[0] && (s.images[0].image_url || s.images[0].url)) || '',
        description: s.description || ''
      });
    } else if (mode === 'create') {
      // Reset form for Create
      setCreateForm({ service_name: '', price: '', usage_count: '', category_id: '', image_url: '', description: '' });
      setImageFile(null);
      setImageUploadError('');
      setUploadingImage(false);
    }
    setModal({ open: true, mode, service });
  };

  const closeModal = () => setModal({ open: false, mode: 'view', service: null });

  // --- RENDER ---
  return (
    <div className={styles.content}>
      {/* HEADER */}
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการบริการ</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="ค้นหาบริการ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: '6px 8px' }}
          />
          <button onClick={() => openModal('create')} className={styles.addButton}>
            <FaPlus /> เพิ่มบริการ
          </button>
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading && <p>Loading services...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* TABLE */}
      {!loading && !error && (
        <>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>รูป</th>
                <th>ชื่อบริการ</th>
                <th>ราคา (ค่าแรง)</th>
                <th>จำนวนใช้</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td></tr>
              )}
              {visible.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <img 
                      src={s.imageUrl ? (s.imageUrl.startsWith('http') ? s.imageUrl : `${API_URL}${s.imageUrl}`) : PLACEHOLDER_60}
                      alt={s.title} 
                      className={styles.productTableImage} 
                    />
                  </td>
                  <td>{s.title}</td>
                  <td>{Number(s.price).toLocaleString()}</td>
                  <td>{s.usage_count}</td>
                  <td>
                    {s.is_active ? 
                      <span className={styles.statusActive}>แสดง</span> : 
                      <span className={styles.statusInactive}>ซ่อน</span>
                    }
                  </td>
                  <td>
                    <button 
                        onClick={() => togglePopular(s.id, s.is_popular)} 
                        className={styles.actionButton} 
                        title={s.is_popular ? 'ยกเลิกยอดนิยม' : 'ตั้งเป็นยอดนิยม'}
                    >
                      <FaStar style={{ color: s.is_popular ? '#f6c400' : undefined }} />
                    </button>
                    
                    {/* Toggle Switch Style แบบ Product */}
                    <label className={styles.toggleSwitch} title={s.is_active ? 'แสดงบนหน้าเว็บ' : 'ซ่อนจากหน้าเว็บ'}>
                      <input 
                        type="checkbox" 
                        checked={!!s.is_active} 
                        onChange={() => toggleActive(s.id, s.is_active)} 
                        disabled={togglingIds.includes(s.id)} 
                      />
                      <span className={styles.toggleSlider} />
                    </label>

                    <button onClick={() => openModal('view', s)} className={styles.actionButtonView}><FaEye /></button>
                    <button onClick={() => openModal('edit', s)} className={styles.actionButton}><FaEdit /></button>
                    <button onClick={() => handleDelete(s.id)} className={styles.actionButtonDelete}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <div>รวม {total} รายการ</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>ก่อนหน้า</button>
              <div>หน้า {page} / {pageCount}</div>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>ถัดไป</button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CREATE / EDIT */}
      {modal.open && (modal.mode === 'create' || modal.mode === 'edit') && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>{modal.mode === 'create' ? 'เพิ่มบริการใหม่' : 'แก้ไขบริการ'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              
              <input
                type="text"
                placeholder="ชื่อบริการ"
                value={createForm.service_name}
                onChange={e => setCreateForm(f => ({ ...f, service_name: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="ราคา (ค่าแรงเริ่มต้น)"
                  value={createForm.price}
                  onChange={e => setCreateForm(f => ({ ...f, price: e.target.value }))}
                  required
                />
                <input
                  type="number"
                  placeholder="จำนวนการใช้งาน (ครั้ง)"
                  value={createForm.usage_count}
                  onChange={e => setCreateForm(f => ({ ...f, usage_count: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <select 
                    value={createForm.category_id} 
                    onChange={e => setCreateForm(f => ({ ...f, category_id: e.target.value }))}
                    style={{ flex: 1 }}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                  />
                  {createForm.image_url && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <img 
                        src={createForm.image_url.startsWith('http') ? createForm.image_url : `${API_URL}${createForm.image_url}`} 
                        alt="preview" 
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} 
                      />
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{createForm.image_url.split('/').pop()}</div>
                    </div>
                  )}
                </div>
              </div>

              <textarea
                placeholder="รายละเอียดบริการ..."
                value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
              />

              {createError && <div className={styles.errorMessage}>{createError}</div>}
              {uploadingImage && <div style={{ color: '#0ea5e9', fontWeight: 600 }}>กำลังอัปโหลดรูป...</div>}
              {imageUploadError && <div className={styles.errorMessage}>{imageUploadError}</div>}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ยกเลิก</button>
                <button type="submit" className={styles.btnPrimary} disabled={createLoading || uploadingImage}>
                  {createLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ONLY */}
      {modal.open && modal.mode === 'view' && modal.service && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>ดูข้อมูลบริการ</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: '0 0 160px' }}>
                  <img 
                    src={modal.service.imageUrl ? (modal.service.imageUrl.startsWith('http') ? modal.service.imageUrl : `${API_URL}${modal.service.imageUrl}`) : PLACEHOLDER_160} 
                    alt={modal.service.title} 
                    style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }} 
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="text" value={modal.service.title} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={`ราคา: ${Number(modal.service.price).toLocaleString()}`} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', flex: 1 }} />
                    <input type="text" value={`ใช้ไป: ${modal.service.usage_count} ครั้ง`} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', width: 140 }} />
                  </div>
                  <select value={modal.service.raw?.category_id || ''} disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                     <option>{modal.service.raw?.category_name || modal.service.raw?.category_id || '-- หมวดหมู่ --'}</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea value={modal.service.raw?.description || '-'} readOnly disabled rows={4} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', boxSizing: 'border-box', background: 'var(--bg-muted)' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ปิด</button>
                <button type="button" onClick={() => openModal('edit', modal.service)} className={styles.btnPrimary}>แก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceManagementPage;