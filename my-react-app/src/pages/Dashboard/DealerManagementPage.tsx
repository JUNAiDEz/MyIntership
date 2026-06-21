import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../../styles/AdminTheme.module.css'; // ปรับ Path ให้ตรงกับโปรเจกต์ของคุณ
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaCamera, FaImage } from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
import { HasPermission } from '../../utils/ProtectedRoute';

// 🔥 Import DashboardHeader เข้ามาใช้งาน
import DashboardHeader from '../../components/DashboardHeader';

const getToken = () => localStorage.getItem('adminToken');

// รับ props onLogout มาเผื่อส่งต่อให้ Header
export default function DealerManagementPage({ onLogout }: { onLogout?: () => void }) {
  const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dy='.3em' fill='%239ca3af' font-size='12' text-anchor='middle'>No Image</text></svg>";

  const queryClient = useQueryClient();

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Modal & Form State ---
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', dealer: null });

  const [createForm, setCreateForm] = useState<any>({
    name: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- Headers Helper ---
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }), []);

  // --- Helper: Convert File to Base64 ---
  const convertToBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  // --- 1. Fetch Data ---
  const { data: dealers = [], isLoading: loading } = useQuery({
    queryKey: ['dealers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/dealers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch dealers');
      const result = await res.json();
      // เรียงลำดับตาม display_order จากน้อยไปมาก
      return (Array.isArray(result) ? result : result.data || []).sort((a: any, b: any) => a.display_order - b.display_order);
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['dealers'] });

  // --- 2. Filter & Pagination ---
  const filteredDealers = dealers.filter((d: any) => {
    if (!debouncedSearch) return true;
    return d.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const total = filteredDealers.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredDealers.slice((page - 1) * pageSize, page * pageSize);

  // --- 3. Actions ---
  const handleImageUpload = async (file: any) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const base64 = await convertToBase64(file);
      setCreateForm((prev: any) => ({ ...prev, image_url: base64 }));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการแปลงรูปภาพ');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: createForm.name,
        image_url: createForm.image_url,
        display_order: Number(createForm.display_order),
        is_active: createForm.is_active
      };

      let url = `${API_URL}/api/dealers`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.dealer) {
        url = `${API_URL}/api/dealers/${modal.dealer.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const errData = await res.json();
         throw new Error(errData.message || errData.error || 'บันทึกไม่สำเร็จ');
      }
      return res.json();
    },
    onSuccess: () => { refresh(); closeModal(); },
    onError: (err: any) => setCreateError(err instanceof Error ? err.message : String(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      const res = await fetch(`${API_URL}/api/dealers/${id}`, { method: 'DELETE', headers });
      if(!res.ok) throw new Error('ลบไม่สำเร็จ');
      return res.json();
    },
    onSuccess: refresh,
    onError: (err: any) => alert(err instanceof Error ? err.message : String(err)),
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.name.trim()) {
      setCreateError("กรุณากรอกชื่อตัวแทนจำหน่าย/แบรนด์");
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = (id: any) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตัวแทนจำหน่ายรายนี้?')) return;
    deleteMutation.mutate(id);
  };

  const openModal = (mode: any, item: any = null) => {
    if (mode === 'create') {
      setCreateForm({
        name: '',
        image_url: '',
        display_order: dealers.length > 0 ? dealers[dealers.length - 1].display_order + 1 : 0,
        is_active: true
      });
    } else if (item) {
      setCreateForm({
        name: item.name || '',
        image_url: item.image_url || '',
        display_order: item.display_order || 0,
        is_active: typeof item.is_active !== 'undefined' ? item.is_active : true
      });
    }
    setCreateError('');
    setModal({ open: true, mode, dealer: item });
  };

  const closeModal = () => setModal({ open: false, mode: 'view', dealer: null });

  // --- Render ---
  return (
    // เพิ่ม div คลุมทั้งหมด เพื่อให้จัดวาง Header ไว้บนสุดได้
    <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>

      {/* 🔥 เรียกใช้ Component Header สีดำตรงนี้ 🔥 */}
      <DashboardHeader onLogout={onLogout} />

      <div className={styles.pageContainer} style={{ flex: 1 }}>
        {/* HEADER ของหน้า Dealer */}
        <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.title}>Dealer Management</h2>
              {/* คุณสามารถเปลี่ยน resource name ให้ตรงกับระบบสิทธิ์ของคุณได้ */}
              <HasPermission resource="dealer" action="create">
                <button onClick={() => openModal('create')} className={styles.addButton}>
                  <FaPlus /> เพิ่มแบรนด์
                </button>
              </HasPermission>
          </div>

          {/* SEARCH BAR */}
          <div className={styles.controls} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <div className={styles.searchWrapper} style={{ flex: 1, minWidth: '200px' }}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                      className={styles.searchInput}
                      placeholder="ค้นหาชื่อแบรนด์..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
              </div>
          </div>
        </div>

        {loading && <p style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</p>}

        {/* GRID VIEW */}
        {!loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', padding: '10px 0' }}>
              {visible.length === 0 && <div style={{gridColumn: '1 / -1', textAlign:'center', padding: '30px', background: '#fff', borderRadius: '8px'}}>ไม่พบข้อมูลตัวแทนจำหน่าย</div>}

              {visible.map((d: any) => (
                <div key={d.id}
                  onClick={() => openModal('edit', d)}
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
                      cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {/* Status Badge */}
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                      <span style={{
                        background: d.is_active ? '#4CAF50' : '#e5e7eb',
                        color: d.is_active ? '#fff' : '#888',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {d.is_active ? 'แสดง' : 'ซ่อน'}
                      </span>
                    </div>

                    {/* Logo Image */}
                    <div style={{
                        height: '140px',
                        background: '#1a1a1a', // พื้นหลังสีเข้มเพื่อให้เห็นโลโก้ใสสีขาวได้ชัด
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <img
                          src={d.image_url || PLACEHOLDER_IMG}
                          alt={d.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f0f0f0' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>
                          {d.name}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          ลำดับการแสดงผล: <strong style={{ color: '#000' }}>{d.display_order}</strong>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div style={{
                        padding: '10px 16px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        background: '#fafafa'
                    }}>
                        <HasPermission resource="dealer" action="update">
                          <button onClick={(e) => { e.stopPropagation(); openModal('edit', d); }} className={styles.iconBtn} title="แก้ไข"><FaEdit /></button>
                        </HasPermission>
                        <HasPermission resource="dealer" action="delete">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className={`${styles.iconBtn} ${styles.delete}`} title="ลบ"><FaTrash /></button>
                        </HasPermission>
                    </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className={styles.footer}>
              <div>Total {total} brands</div>
              <div className={styles.pagination}>
                <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                <span style={{margin:'0 8px', fontWeight:600}}>Page {page} / {pageCount}</span>
                <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</button>
              </div>
            </div>
          </>
        )}

        {/* --- Modal Form --- */}
        {modal.open && (
          <div className={styles.modalBackdrop} style={{ backdropFilter: 'blur(5px)' }} onClick={e => { if(e.target === e.currentTarget) closeModal(); }}>

            <div style={{
                background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px',
                overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.3s ease-out',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh', margin: 'auto'
            }}>

              {/* 1. Header (Black) แบบเดียวกับหน้า Product */}
              <div style={{ background: '#000', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                          {modal.mode === 'create' ? 'เพิ่มแบรนด์ Dealer' : 'แก้ไขข้อมูลแบรนด์'}
                      </h2>
                      {modal.mode !== 'create' && createForm.name && (
                          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 4 }}>Brand: {createForm.name}</div>
                      )}
                  </div>
                  <button type="button" onClick={closeModal} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <FaTimes />
                  </button>
              </div>

              {/* 2. Content Area */}
              <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                  {createError && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '6px', fontSize: '0.9rem' }}>{createError}</div>}

                  <form onSubmit={handleSubmit}>

                    <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                      <label className={styles.formLabel}>ชื่อแบรนด์ *</label>
                      <input
                        className={styles.formInput} type="text" value={createForm.name} required
                        onChange={e => setCreateForm({...createForm, name: e.target.value})}
                        placeholder="ex. BILSTEIN, Brembo"
                      />
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                      <label className={styles.formLabel}>โลโก้ (Logo)</label>

                      {/* Image Preview Box */}
                      <div style={{ width: '100%', height: '120px', background: '#1a1a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
                          {createForm.image_url ? (
                              <img src={createForm.image_url} alt="Logo Preview" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                          ) : (
                              <div style={{ color: '#666', textAlign: 'center' }}>
                                  <FaImage size={30} style={{ marginBottom: 5 }} />
                                  <div style={{ fontSize: '0.8rem' }}>No Logo Uploaded</div>
                              </div>
                          )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffc709', color: '#000', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                              <FaCamera /> {createForm.image_url ? 'เปลี่ยนรูปโลโก้' : 'อัปโหลดโลโก้'}
                              <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0]); }} disabled={uploadingImage} style={{ display: 'none' }} />
                          </label>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                              *แนะนำขนาดรูปภาพ 225x225 px
                          </span>
                      </div>
                      {uploadingImage && <div style={{ marginTop: 5, fontSize: '0.85rem', color: '#666' }}>กำลังประมวลผล...</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel}>ลำดับการแสดงผล (ยิ่งน้อยยิ่งขึ้นก่อน)</label>
                          <input
                              className={styles.formInput} type="number" value={createForm.display_order} required
                              onChange={e => setCreateForm({...createForm, display_order: e.target.value})}
                          />
                        </div>

                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel}>สถานะการแสดงผล</label>
                          <select
                              className={styles.formInput}
                              value={createForm.is_active === true ? 'true' : 'false'}
                              onChange={e => setCreateForm({...createForm, is_active: e.target.value === 'true'})}
                          >
                              <option value="true">แสดงผล (Active)</option>
                              <option value="false">ซ่อน (Inactive)</option>
                          </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                      <button type="button" onClick={closeModal} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                          ยกเลิก
                      </button>
                      <button type="submit" disabled={saveMutation.isPending || uploadingImage} style={{ padding: '8px 25px', borderRadius: '6px', border: 'none', background: '#000', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                          {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                      </button>
                    </div>
                  </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}