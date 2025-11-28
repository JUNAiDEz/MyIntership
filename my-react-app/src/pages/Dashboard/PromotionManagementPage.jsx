import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
import styles from './ManagementPage.module.css'; // ใช้ CSS ร่วมกัน
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaEye, 
  FaListUl, 
  FaTimes 
} from 'react-icons/fa';

const getToken = () => localStorage.getItem('adminToken');


// Helper: Format DateTime for <input type="datetime-local">
const formatDateTimeForInput = (isoString) => {
  if (!isoString) return '';
  // ตัดส่วนวินาทีและ Timezone ออกเพื่อให้ลงกับ Input (YYYY-MM-DDThh:mm)
  return isoString.substring(0, 16); 
};

// Helper: Format Date for Table Display
const formatTableDate = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

function PromotionManagementPage() {
  // Fallback Images
  const PLACEHOLDER_60 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
  const PLACEHOLDER_160 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";

  // --- Main Data State ---
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Master Data (Products & Services for Dropdowns) ---
  const [allProducts, setAllProducts] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [togglingIds, setTogglingIds] = useState([]);

  // --- Modal & Form State ---
  const [modal, setModal] = useState({ open: false, mode: 'view', promotion: null });
  
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    promotion_price: '',
    start_date: '',
    end_date: '',
    imageUrl: '',
    items: [] // Array of { item_id, item_type }
  });

  // --- Item Selection State (ภายใน Modal) ---
  const [selServiceId, setSelServiceId] = useState('');
  const [selProductId, setSelProductId] = useState('');
  const [selVariantId, setSelVariantId] = useState('');
  // Helper object เพื่อดูข้อมูล Product ที่เลือก (เช่น variants)
  const [selProductObj, setSelProductObj] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- Headers Helper ---
  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // --- 1. Fetch Promotions ---
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qParams = new URLSearchParams();
      qParams.append('all', '1'); // เอามาทั้งหมดรวมที่ปิดใช้งาน
      if (debouncedSearch) qParams.append('search', debouncedSearch);

      const res = await fetch(`${API_URL}/api/sales/promotions?${qParams.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch promotions');
      
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      
      const mapped = items.map(p => ({
        id: p.promotion_id || p.id,
        title: p.promotion_name || p.title || 'Untitled',
        price: p.discount_value ?? p.promotion_price ?? 0,
        start_date: p.start_date,
        end_date: p.end_date,
        imageUrl: p.image_url || p.imageUrl || '',
        is_active: p.is_active ?? true,
        items: p.items || [],
        raw: p
      }));

      setPromotions(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, headers]);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  // --- 2. Fetch Master Data (Products/Services) ---
  // โหลดครั้งเดียวตอน Mount หรือตอนเปิด Modal ก็ได้ (เลือกโหลดตอน Mount เพื่อความไว)
  useEffect(() => {
    const fetchMasters = async () => {
      setMasterLoading(true);
      try {
        // Products
        const pRes = await fetch(`${API_URL}/api/inventory/products`, { headers });
        if (pRes.ok) {
          const data = await pRes.json();
          setAllProducts(Array.isArray(data) ? data : data.items || []);
        }
        // Services
        const sRes = await fetch(`${API_URL}/api/services/services?all=1`, { headers });
        if (sRes.ok) {
          const data = await sRes.json();
          setAllServices(Array.isArray(data) ? data : data.items || []);
        }
      } catch (e) {
        console.error("Error fetching master data", e);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, [headers]);

  // --- 3. Pagination ---
  const total = promotions.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = promotions.slice((page - 1) * pageSize, page * pageSize);

  // --- 4. Helpers for Items Display ---
  const getItemDisplayName = (item) => {
    // กรณีมี details จาก Backend
    if (item.item_details) {
      if (item.item_type === 'product_variant') return item.item_details.variant_name || item.item_details.title;
      return item.item_details.title || item.item_details.service_name;
    }
    // กรณีเพิ่งเพิ่มใหม่ (ค้นจาก State)
    if (item.item_type === 'service') {
      const s = allServices.find(x => (x.service_id || x.id) == item.item_id);
      return s ? `[บริการ] ${s.title || s.service_name}` : `Service #${item.item_id}`;
    }
    if (item.item_type === 'product') {
      const p = allProducts.find(x => (x.product_template_id || x.id) == item.item_id);
      return p ? `[สินค้า] ${p.title || p.product_name}` : `Product #${item.item_id}`;
    }
    if (item.item_type === 'product_variant') {
      // ต้องวนหาใน Product ทั้งหมด
      for (const p of allProducts) {
        const v = p.variants?.find(v => (v.product_variant_id || v.id) == item.item_id);
        if (v) return `[ย่อย] ${p.title} - ${v.variant_name}`;
      }
      return `Variant #${item.item_id}`;
    }
    return `Item #${item.item_id}`;
  };

  const getItemImageUrl = (item) => {
    let url = '';
    // Check Backend details
    if (item.item_details && item.item_details.imageUrl) {
      url = item.item_details.imageUrl;
    } 
    // Check State lookup
    else if (item.item_type === 'service') {
      const s = allServices.find(x => (x.service_id || x.id) == item.item_id);
      if (s) url = (s.images && s.images[0]?.url) || s.imageUrl;
    }
    else if (item.item_type === 'product') {
      const p = allProducts.find(x => (x.product_template_id || x.id) == item.item_id);
      if (p) url = (p.images && p.images[0]?.url) || p.imageUrl;
    }
    else if (item.item_type === 'product_variant') {
        // Use parent image
        const p = allProducts.find(prod => prod.variants?.some(v => (v.product_variant_id || v.id) == item.item_id));
        if(p) url = (p.images && p.images[0]?.url) || p.imageUrl;
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
    let newItem = null;

    if (selServiceId) {
      newItem = { item_id: parseInt(selServiceId), item_type: 'service' };
    } else if (selProductId) {
      const hasVariants = selProductObj?.variants?.length > 0;
      if (hasVariants && selVariantId) {
        newItem = { item_id: parseInt(selVariantId), item_type: 'product_variant' };
      } else if (!hasVariants) {
        newItem = { item_id: parseInt(selProductId), item_type: 'product' };
      }
    }

    if (!newItem) return alert("กรุณาเลือกข้อมูลให้ครบถ้วน");

    // Check Duplicate
    const exists = createForm.items.find(i => i.item_id === newItem.item_id && i.item_type === newItem.item_type);
    if (exists) return alert("ไอเทมนี้มีอยู่แล้วในรายการ");

    setCreateForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    resetSelection();
  };

  const handleRemoveItem = (index) => {
    setCreateForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // --- 6. Form Actions (Submit / Delete / Toggle) ---
  const handleImageUpload = async (file) => {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setCreateForm(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error(err);
      setCreateError('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const payload = {
        title: createForm.title,
        description: createForm.description,
        promotion_price: parseFloat(createForm.promotion_price) || 0,
        start_date: createForm.start_date ? new Date(createForm.start_date).toISOString() : null,
        end_date: createForm.end_date ? new Date(createForm.end_date).toISOString() : null,
        imageUrl: createForm.imageUrl,
        // Send only id/type to backend
        items: createForm.items.map(i => ({ item_id: i.item_id, item_type: i.item_type }))
      };

      let url = `${API_URL}/api/sales/promotions`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.promotion) {
        url = `${API_URL}/api/sales/promotions/${modal.promotion.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save');
      }

      closeModal();
      fetchPromotions();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบโปรโมชั่นนี้?')) return;
    try {
      const res = await fetch(`${API_URL}/api/sales/promotions/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      fetchPromotions();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (id, current) => {
    if (togglingIds.includes(id)) return;
    setTogglingIds(prev => [...prev, id]);
    try {
      await fetch(`${API_URL}/api/sales/promotions/${id}/toggle_status`, { method: 'PATCH', headers });
      fetchPromotions();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingIds(prev => prev.filter(x => x !== id));
    }
  };

  // --- 7. Modal Control ---
  const openModal = (mode, promo = null) => {
    if (mode === 'edit' && promo) {
      setCreateForm({
        title: promo.title,
        description: promo.raw.description || '',
        promotion_price: promo.price,
        start_date: formatDateTimeForInput(promo.start_date),
        end_date: formatDateTimeForInput(promo.end_date),
        imageUrl: promo.imageUrl,
        items: promo.items || []
      });
    } else if (mode === 'create') {
      setCreateForm({
        title: '', description: '', promotion_price: '', start_date: '', end_date: '', imageUrl: '', items: []
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
    <div className={styles.content}>
      {/* Header */}
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการโปรโมชั่น</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="ค้นหาโปรโมชั่น..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: '6px 8px' }}
          />
          <button onClick={() => openModal('create')} className={styles.addButton}>
            <FaPlus /> เพิ่มโปรโมชั่น
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>รูป</th>
                <th>ชื่อโปรโมชั่น</th>
                <th>ราคา (บาท)</th>
                <th>เริ่ม</th>
                <th>สิ้นสุด</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td></tr>}
              {visible.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <img 
                      src={p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`) : PLACEHOLDER_60}
                      alt={p.title} className={styles.productTableImage} 
                    />
                  </td>
                  <td>{p.title}</td>
                  <td>{Number(p.price).toLocaleString()}</td>
                  <td>{formatTableDate(p.start_date)}</td>
                  <td>{formatTableDate(p.end_date)}</td>
                  <td>
                    {p.is_active ? 
                      <span className={styles.statusActive}>แสดง</span> : 
                      <span className={styles.statusInactive}>ซ่อน</span>
                    }
                  </td>
                  <td>
                     <label className={styles.toggleSwitch} title="เปิด/ปิด การแสดงผล">
                        <input 
                          type="checkbox" 
                          checked={!!p.is_active} 
                          onChange={() => toggleActive(p.id, p.is_active)} 
                          disabled={togglingIds.includes(p.id)} 
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                      <button onClick={() => openModal('view', p)} className={styles.actionButtonView}><FaEye /></button>
                      <button onClick={() => openModal('edit', p)} className={styles.actionButton}><FaEdit /></button>
                      <button onClick={() => handleDelete(p.id)} className={styles.actionButtonDelete}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <div>รวม {total} รายการ</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>ก่อนหน้า</button>
              <div>หน้า {page} / {pageCount}</div>
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>ถัดไป</button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Create / Edit / View */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalContent} ${styles.modalLarge}`}>
            <h3>
                {modal.mode === 'create' ? 'เพิ่มโปรโมชั่นใหม่' : 
                 modal.mode === 'edit' ? 'แก้ไขโปรโมชั่น' : 'ดูรายละเอียดโปรโมชั่น'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formBody}>
                {/* Column Left */}
                <div className={styles.formColumnLeft}>
                  <div className={styles.formGroup}>
                    <label>ชื่อโปรโมชั่น</label>
                    <input 
                      type="text" value={createForm.title} required disabled={modal.mode === 'view'}
                      onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ราคาโปรโมชั่น (บาท)</label>
                    <input 
                      type="number" value={createForm.promotion_price} required disabled={modal.mode === 'view'}
                      onChange={e => setCreateForm(f => ({ ...f, promotion_price: e.target.value }))} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>รายละเอียด</label>
                    <textarea 
                      rows={4} value={createForm.description} disabled={modal.mode === 'view'}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Column Right */}
                <div className={styles.formColumnRight}>
                  <div className={styles.formGroup}>
                    <label>วันที่เริ่ม</label>
                    <input 
                      type="datetime-local" value={createForm.start_date} required disabled={modal.mode === 'view'}
                      onChange={e => setCreateForm(f => ({ ...f, start_date: e.target.value }))} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>วันที่สิ้นสุด</label>
                    <input 
                      type="datetime-local" value={createForm.end_date} required disabled={modal.mode === 'view'}
                      onChange={e => setCreateForm(f => ({ ...f, end_date: e.target.value }))} 
                    />
                  </div>
                  
                  {/* Image Section */}
                  {modal.mode !== 'view' && (
                      <div className={styles.formGroup}>
                        <label>รูปภาพ</label>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} />
                      </div>
                  )}
                  <div className={styles.formGroup}>
                     {createForm.imageUrl && (
                        <img 
                          src={createForm.imageUrl.startsWith('http') ? createForm.imageUrl : `${API_URL}${createForm.imageUrl}`} 
                          alt="preview" className={styles.formImagePreview} 
                        />
                     )}
                  </div>
                </div>
              </div>

              {/* Item Management Section */}
              <hr className={styles.divider} />
              <div className={styles.itemManagementSection}>
                <h4><FaListUl /> รายการสินค้า/บริการในโปรโมชั่น ({createForm.items.length})</h4>
                
                {/* List Items */}
                <div className={styles.itemListContainer}>
                    {createForm.items.length === 0 && <p style={{ color: '#999' }}>ยังไม่มีรายการ</p>}
                    <ul className={styles.itemList}>
                        {createForm.items.map((item, idx) => (
                            <li key={idx}>
                                <img src={getItemImageUrl(item)} alt="item" className={styles.itemImage} />
                                <span>{getItemDisplayName(item)}</span>
                                {modal.mode !== 'view' && (
                                    <button type="button" onClick={() => handleRemoveItem(idx)} className={styles.itemRemoveButton}>
                                        <FaTimes />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Add Item Form */}
                {modal.mode !== 'view' && (
                    <div className={styles.addItemContainer}>
                        <div className={styles.addItemForm}>
                            <select 
                                value={selServiceId} 
                                disabled={masterLoading || !!selProductId}
                                onChange={e => { setSelServiceId(e.target.value); setSelProductId(''); }}
                            >
                                <option value="">-- เลือกบริการ --</option>
                                {allServices.map(s => <option key={s.id} value={s.id || s.service_id}>{s.title || s.service_name}</option>)}
                            </select>
                        </div>
                        
                        <div className={styles.addItemForm}>
                            <select 
                                value={selProductId} 
                                disabled={masterLoading || !!selServiceId}
                                onChange={e => {
                                    const pid = e.target.value;
                                    setSelProductId(pid);
                                    setSelServiceId('');
                                    setSelVariantId('');
                                    const prod = allProducts.find(p => (p.id || p.product_template_id) == pid);
                                    setSelProductObj(prod);
                                }}
                            >
                                <option value="">-- เลือกสินค้า --</option>
                                {allProducts.map(p => <option key={p.id} value={p.id || p.product_template_id}>{p.title || p.product_name}</option>)}
                            </select>
                        </div>

                        {/* Variant Select (Show if product has variants) */}
                        {selProductObj?.variants?.length > 0 && (
                            <div className={styles.addItemForm}>
                                <select value={selVariantId} onChange={e => setSelVariantId(e.target.value)}>
                                    <option value="">-- เลือกตัวเลือกย่อย --</option>
                                    {selProductObj.variants.map(v => (
                                        <option key={v.id} value={v.id || v.product_variant_id}>
                                            {v.variant_name} (คงเหลือ: {v.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="button" onClick={handleAddItem} className={styles.btnPrimary} style={{ height: 'fit-content', alignSelf: 'flex-end' }}>
                            <FaPlus /> เพิ่ม
                        </button>
                    </div>
                )}
              </div>

              {/* Footer Actions */}
              {createError && <div className={styles.errorMessage}>{createError}</div>}
              {uploadingImage && <div style={{ color: '#0ea5e9' }}>กำลังอัปโหลดรูป...</div>}
              
              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>
                    {modal.mode === 'view' ? 'ปิด' : 'ยกเลิก'}
                </button>
                {modal.mode !== 'view' && (
                    <button type="submit" className={styles.btnPrimary} disabled={createLoading || uploadingImage}>
                        {createLoading ? 'บันทึก...' : 'บันทึก'}
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