import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import styles from './ManagementPage.module.css';
import { FaEdit, FaTrash, FaPlus, FaEye, FaStar, FaEyeSlash } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL;
// API base
//const API_URL = 'http://localhost:5000';
const getToken = () => localStorage.getItem('adminToken');

function ProductManagementPage() {
  // Use inline SVG data-URIs as fallbacks to avoid external requests to via.placeholder.com
  const PLACEHOLDER_60 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
  const PLACEHOLDER_160 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI controls
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Modal state (simple view/edit/create stubs)
  const [modal, setModal] = useState({ open: false, mode: 'view', product: null });
  // State สำหรับฟอร์มสร้างสินค้า
  const [createForm, setCreateForm] = useState({
    product_name: '',
    unit_price: '',
    stock_quantity: '',
    category_id: '',
    brand_id: '',
    supplier_id: '',
    image_url: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [togglingIds, setTogglingIds] = useState([]); // ids currently being toggled
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [discount, setDiscount] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  // ฟังก์ชัน handle สร้างสินค้าใหม่
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      // ส่งข้อมูลไป backend
      const body = {
        product_name: createForm.product_name,
        description: createForm.description || '',
        variants: [{
          price: Number(createForm.unit_price),
          stock: Number(createForm.stock_quantity),
          supplier_id: createForm.supplier_id ? Number(createForm.supplier_id) : null
        }],
        category_id: createForm.category_id ? Number(createForm.category_id) : null,
        brand_id: createForm.brand_id ? Number(createForm.brand_id) : null,
        // backend expects an array of URL strings
        images: createForm.image_url ? [createForm.image_url] : []
      };
      const res = await fetch(`${API_URL}/api/inventory/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch (e) {}
        try { const j = JSON.parse(errText); errText = j.message || j.error || errText; } catch (e) {}
        console.error('Create product failed', res.status, errText);
        throw new Error(errText || 'Create failed');
      }
      setModal({ open: false, mode: 'view', product: null });
      setCreateForm({ product_name: '', unit_price: '', stock_quantity: '', category_id: '', brand_id: '', supplier_id: '', image_url: '', description: '' });
      await fetchProducts();
    } catch (err) {
      setCreateError(err.message || 'Create error');
    } finally {
      setCreateLoading(false);
    }
  };

  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Backend currently returns full list; we pass `search` as query if supported
      const q = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await fetch(`${API_URL}/api/inventory/products${q}`, { headers });
      if (res.status === 404) {
        throw new Error('Endpoint not found (404)');
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch products');
      }
      const data = await res.json();

      // Map server fields safely
      const mapped = (Array.isArray(data) ? data : data.items || []).map((p) => ({
        id: p.product_template_id || p.id,
        title: p.product_name || p.title || 'Untitled',
        price: (p.variants && p.variants[0] && p.variants[0].unit_price) || 0,
        stock: (p.variants || []).reduce((s, v) => s + (v.stock_quantity || 0), 0),
        imageUrl: (p.images && p.images[0] && p.images[0].image_url) || p.imageUrl || '',
        is_active: p.is_active ?? true,
        is_popular: p.is_popular ?? false,
        raw: p
      }));

      setProducts(mapped);
    } catch (err) {
      console.error('fetchProducts error', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, headers]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Load dropdown lists for category/brand/supplier (used in create form)
  useEffect(() => {
    const h = { Authorization: `Bearer ${getToken()}` };
    const fetchList = async (url, setter) => {
      try {
        const res = await fetch(`${API_URL}${url}`, { headers: h });
        if (!res.ok) return;
        const data = await res.json();
        setter(data);
      } catch (err) {
        // ignore
      }
    };
    fetchList('/api/inventory/categories', setCategories);
    fetchList('/api/inventory/brands', setBrands);
    fetchList('/api/inventory/suppliers', setSuppliers);
  }, []);

  // Calculate price after discount (simple percentage)
  useEffect(() => {
    const orig = parseFloat(createForm.unit_price) || 0;
    const disc = Math.abs(parseFloat(discount)) || 0;
    if (orig > 0 && disc > 0) {
      setCalculatedPrice(orig - (orig * disc / 100));
    } else {
      setCalculatedPrice(0);
    }
  }, [createForm.unit_price, discount]);

  // Client-side pagination
  const total = products.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = products.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ออกจากฐานข้อมูล? การกระทำนี้ไม่สามารถยกเลิกได้')) return;
    try {
      const res = await fetch(`${API_URL}/api/inventory/products/${id}/hard`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) {
        let text = await res.text().catch(() => 'Failed to delete product.');
        throw new Error(text || 'Failed to delete product.');
      }
      await fetchProducts();
    } catch (err) {
      console.error('delete product error', err);
      alert(err.message || 'ไม่สามารถลบสินค้าได้');
    }
  };

  const togglePopular = async (id, current) => {
    try {
      const res = await fetch(`${API_URL}/api/inventory/products/${id}/flags`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_popular: !current })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Toggle failed');
      }
      await fetchProducts();
    } catch (err) {
      console.error('togglePopular error', err);
      alert(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const toggleActive = async (id, current) => {
    if (togglingIds.includes(id)) return; // already toggling
    setTogglingIds(ids => [...ids, id]);
    try {
      const res = await fetch(`${API_URL}/api/inventory/products/${id}/flags`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_active: !current })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Toggle failed');
      }
      await fetchProducts();
    } catch (err) {
      console.error('toggleActive error', err);
      alert(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    } finally {
      setTogglingIds(ids => ids.filter(x => x !== id));
    }
  };

  // Handle updating an existing product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!modal.product) return;
    const id = modal.product.id;
    setCreateLoading(true);
    setCreateError('');
    try {
      // Build variants payload using first variant as editable shortcut
      const firstVariant = modal.product.raw && modal.product.raw.variants && modal.product.raw.variants[0];
      const variantsPayload = [];
      if (firstVariant) {
        variantsPayload.push({
          id: firstVariant.product_variant_id || firstVariant.id,
          price: Number(createForm.unit_price),
          stock: Number(createForm.stock_quantity),
          supplier_id: createForm.supplier_id ? Number(createForm.supplier_id) : null
        });
      }

      const body = {
        product_name: createForm.product_name,
        description: createForm.description || '',
        variants: variantsPayload,
        category_id: createForm.category_id ? Number(createForm.category_id) : null,
        brand_id: createForm.brand_id ? Number(createForm.brand_id) : null,
        images: createForm.image_url ? [createForm.image_url] : []
      };

      const res = await fetch(`${API_URL}/api/inventory/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch (e) {}
        try { const j = JSON.parse(errText); errText = j.message || j.error || errText; } catch (e) {}
        console.error('Update product failed', res.status, errText);
        throw new Error(errText || 'Update failed');
      }
      setModal({ open: false, mode: 'view', product: null });
      await fetchProducts();
    } catch (err) {
      console.error('edit error', err);
      setCreateError(err.message || 'Update error');
    } finally {
      setCreateLoading(false);
    }
  };

  const openModal = (mode, product = null) => {
    // If opening edit modal, populate the form with existing product data
    if (mode === 'edit' && product && product.raw) {
      const p = product.raw;
      setCreateForm({
        product_name: p.product_name || '',
        unit_price: (p.variants && p.variants[0] && p.variants[0].unit_price) || '',
        stock_quantity: (p.variants && p.variants[0] && p.variants[0].stock_quantity) || '',
        category_id: p.category_id || '',
        brand_id: p.brand_id || '',
        supplier_id: (p.variants && p.variants[0] && p.variants[0].ProductVariantSuppliers && p.variants[0].ProductVariantSuppliers[0] && p.variants[0].ProductVariantSuppliers[0].supplier_id) || '',
        image_url: (p.images && p.images[0] && p.images[0].image_url) || '',
        description: p.description || ''
      });
    } else if (mode === 'create') {
      // Ensure create form is empty when opening create modal
      setCreateForm({ product_name: '', unit_price: '', stock_quantity: '', category_id: '', brand_id: '', supplier_id: '', image_url: '', description: '' });
      setImageFile(null);
      setImageUploadError('');
      setUploadingImage(false);
    }
    setModal({ open: true, mode, product });
  };
  const closeModal = () => setModal({ open: false, mode: 'view', product: null });

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการสินค้า</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="ค้นหาชื่อสินค้า..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: '6px 8px' }}
          />
          <button onClick={() => openModal('create')} className={styles.addButton}><FaPlus /> เพิ่มสินค้า</button>
        </div>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {!loading && !error && (
        <>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>รูป</th>
                <th>ชื่อ</th>
                <th>ราคา</th>
                <th>สต็อก</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>ไม่มีข้อมูล</td></tr>
              )}
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                      <img src={p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`) : PLACEHOLDER_60}
                      alt={p.title} className={styles.productTableImage} />
                  </td>
                  <td>{p.title}</td>
                  <td>{Number(p.price).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td>{p.is_active ? <span className={styles.statusActive}>แสดง</span> : <span className={styles.statusInactive}>ซ่อน</span>}</td>
                  <td>
                      <button onClick={() => togglePopular(p.id, p.is_popular)} className={styles.actionButton} title={p.is_popular ? 'ยกเลิกเป็นสินค้าแนะนำ' : 'ตั้งเป็นสินค้าแนะนำ'}>
                        <FaStar style={{ color: p.is_popular ? '#f6c400' : undefined }} />
                      </button>
                      <label className={styles.toggleSwitch} title={p.is_active ? 'แสดงบนหน้าเว็บ' : 'ซ่อนจากหน้าเว็บ'}>
                        <input type="checkbox" checked={!!p.is_active} onChange={() => toggleActive(p.id, p.is_active)} disabled={togglingIds.includes(p.id)} />
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
            <div>รวม {total} รายการ</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}>ก่อนหน้า</button>
              <div>หน้า {page} / {pageCount}</div>
              <button onClick={() => setPage((s) => Math.min(pageCount, s + 1))} disabled={page >= pageCount}>ถัดไป</button>
            </div>
          </div>
        </>
      )}

      {modal.open && modal.mode === 'create' && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>เพิ่มสินค้าใหม่</h3>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                placeholder="ชื่อสินค้า"
                value={createForm.product_name}
                onChange={e => setCreateForm(f => ({ ...f, product_name: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="ราคา"
                  value={createForm.unit_price}
                  onChange={e => setCreateForm(f => ({ ...f, unit_price: e.target.value }))}
                  required
                />

                <input
                  type="number"
                  placeholder="จำนวนสต็อก"
                  value={createForm.stock_quantity}
                  onChange={e => setCreateForm(f => ({ ...f, stock_quantity: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <select value={createForm.category_id} onChange={e => setCreateForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">-- หมวดหมู่ --</option>
                  {categories.map(c => <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.category_name || c.name}</option>)}
                </select>

                <select value={createForm.brand_id} onChange={e => setCreateForm(f => ({ ...f, brand_id: e.target.value }))}>
                  <option value="">-- แบรนด์ --</option>
                  {brands.map(b => <option key={b.brand_id || b.id} value={b.brand_id || b.id}>{b.brand_name || b.name}</option>)}
                </select>

                <select value={createForm.supplier_id} onChange={e => setCreateForm(f => ({ ...f, supplier_id: e.target.value }))}>
                  <option value="">-- ซัพพลายเออร์ --</option>
                  {suppliers.map(s => <option key={s.supplier_id || s.id} value={s.supplier_id || s.id}>{s.supplier_name || s.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
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
                        if (!res.ok) throw new Error(data.message || 'Upload failed');
                        setCreateForm(f => ({ ...f, image_url: data.url }));
                      } catch (err) {
                        console.error('Upload error', err);
                        setImageUploadError(err.message || 'Upload failed');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                  />
                  {createForm.image_url && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <img src={createForm.image_url.startsWith('http') ? createForm.image_url : `${API_URL}${createForm.image_url}`} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{createForm.image_url.split('/').pop()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="รายละเอียดสินค้า (รายละเอียดเพิ่มเติม)"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                />
              </div>

              {createError && <div className={styles.errorMessage}>{createError}</div>}
              {uploadingImage && <div style={{ color: '#0ea5e9', fontWeight: 600 }}>กำลังอัปโหลดรูป...</div>}
              {imageUploadError && <div className={styles.errorMessage}>{imageUploadError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ยกเลิก</button>
                <button type="submit" className={styles.btnPrimary} disabled={createLoading}>{createLoading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.open && modal.mode === 'view' && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>ดูสินค้า</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: '0 0 160px' }}>
                  <img src={modal.product?.imageUrl ? (modal.product.imageUrl.startsWith('http') ? modal.product.imageUrl : `${API_URL}${modal.product.imageUrl}`) : PLACEHOLDER_160} alt={modal.product?.title} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="text" value={modal.product?.title || ''} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={Number(modal.product?.price || 0).toLocaleString()} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', flex: 1 }} />
                    <input type="text" value={modal.product?.stock ?? ''} readOnly disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', width: 140 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={modal.product?.raw?.category_id || ''} disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', flex: 1 }}>
                      <option>{modal.product?.raw?.category_name || modal.product?.raw?.category_id || '-- หมวดหมู่ --'}</option>
                    </select>
                    <select value={modal.product?.raw?.brand_id || ''} disabled style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border-color)', width: 200 }}>
                      <option>{modal.product?.raw?.brand_name || modal.product?.raw?.brand_id || '-- แบรนด์ --'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <textarea value={modal.product?.raw?.description || '-'} readOnly disabled rows={4} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', boxSizing: 'border-box', background: 'var(--bg-muted)' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ปิด</button>
                <button type="button" onClick={() => { openModal('edit', modal.product); }} className={styles.btnPrimary}>แก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.open && modal.mode === 'edit' && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>แก้ไขสินค้า</h3>
            <form onSubmit={handleEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                placeholder="ชื่อสินค้า"
                value={createForm.product_name}
                onChange={e => setCreateForm(f => ({ ...f, product_name: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="ราคา"
                  value={createForm.unit_price}
                  onChange={e => setCreateForm(f => ({ ...f, unit_price: e.target.value }))}
                  required
                />

                <input
                  type="number"
                  placeholder="จำนวนสต็อก"
                  value={createForm.stock_quantity}
                  onChange={e => setCreateForm(f => ({ ...f, stock_quantity: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <select value={createForm.category_id} onChange={e => setCreateForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">-- หมวดหมู่ --</option>
                  {categories.map(c => <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.category_name || c.name}</option>)}
                </select>

                <select value={createForm.brand_id} onChange={e => setCreateForm(f => ({ ...f, brand_id: e.target.value }))}>
                  <option value="">-- แบรนด์ --</option>
                  {brands.map(b => <option key={b.brand_id || b.id} value={b.brand_id || b.id}>{b.brand_name || b.name}</option>)}
                </select>

                <select value={createForm.supplier_id} onChange={e => setCreateForm(f => ({ ...f, supplier_id: e.target.value }))}>
                  <option value="">-- ซัพพลายเออร์ --</option>
                  {suppliers.map(s => <option key={s.supplier_id || s.id} value={s.supplier_id || s.id}>{s.supplier_name || s.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
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
                        if (!res.ok) throw new Error(data.message || 'Upload failed');
                        setCreateForm(f => ({ ...f, image_url: data.url }));
                      } catch (err) {
                        console.error('Upload error', err);
                        setImageUploadError(err.message || 'Upload failed');
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                  />
                  {createForm.image_url && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <img src={createForm.image_url.startsWith('http') ? createForm.image_url : `${API_URL}${createForm.image_url}`} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{createForm.image_url.split('/').pop()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="รายละเอียดสินค้า (รายละเอียดเพิ่มเติม)"
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                />
              </div>

              {createError && <div className={styles.errorMessage}>{createError}</div>}
              {uploadingImage && <div style={{ color: '#0ea5e9', fontWeight: 600 }}>กำลังอัปโหลดรูป...</div>}
              {imageUploadError && <div className={styles.errorMessage}>{imageUploadError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ยกเลิก</button>
                <button type="submit" className={styles.btnPrimary} disabled={createLoading}>{createLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagementPage;