import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './ManagementPage.module.css';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// API endpoint
const API_URL = import.meta.env.VITE_API_URL;

// Helper: Fetch all FAQs from API
const fetchFaqs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/faq?limit=1000`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error('API error:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

export default function FAQManagementPage(){
  const queryClient = useQueryClient();
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const faqs = await fetchFaqs();
      return [...faqs].sort((a: any, b: any) => a.id - b.id);
    },
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', item: null });

  // Form state
  const [formData, setFormData] = useState<any>({
    question: '',
    answer: '',
    category: '',
    sort_order: 0,
    is_active: true,
    slug: '' // เพิ่ม slug ใน state
  });

  // invalidate -> useQuery refetch อัตโนมัติ (list ไม่ค้างหลัง CRUD)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['faqs'] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { question, answer, category, sort_order, is_active, slug } = formData;
      const body = JSON.stringify({
        question: question.trim(), answer: answer.trim(), category: category.trim(),
        sort_order: parseInt(sort_order) || 0, is_active, slug: slug.trim() || undefined,
      });
      const isEdit = modal.mode === 'edit';
      const url = isEdit ? `${API_URL}/api/faq/${modal.item.id}` : `${API_URL}/api/faq`;
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!res.ok) throw new Error('Failed to save FAQ');
      return res.json();
    },
    onSuccess: () => { refresh(); closeModal(); },
    onError: (e: any) => alert('เกิดข้อผิดพลาด: ' + (e?.message || e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      const res = await fetch(`${API_URL}/api/faq/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      return res.json();
    },
    onSuccess: refresh,
    onError: (e: any) => alert('เกิดข้อผิดพลาดในการลบ: ' + (e?.message || e)),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: any) => {
      const res = await fetch(`${API_URL}/api/faq/${id}/toggle-active`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to toggle status');
      return res.json();
    },
    onSuccess: refresh,
    onError: () => alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ'),
  });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i: any) => `${i.question} ${i.category}`.toLowerCase().includes(q));
  }, [items, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (mode: any, item: any = null) => {
    if (mode === 'create') {
      setFormData({
        question: '',
        answer: '',
        category: '',
        sort_order: items.length,
        is_active: true,
        slug: ''
      });
    } else if ((mode === 'edit' || mode === 'view') && item) {
      setFormData({
        question: item.question,
        answer: item.answer,
        category: item.category || '',
        sort_order: item.sort_order || 0,
        is_active: item.is_active !== undefined ? item.is_active : true,
        slug: item.slug || ''
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        category: '',
        sort_order: 0,
        is_active: true,
        slug: ''
      });
    }
    setModal({ open: true, mode, item });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'view', item: null });
    setFormData({
      question: '',
      answer: '',
      category: '',
      sort_order: 0,
      is_active: true,
      slug: ''
    });
  };

  const handleSave = () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('กรุณากรอกคำถามและคำตอบ');
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = (id: any) => {
    if (!confirm('ต้องการลบคำถามนี้ใช่หรือไม่?')) return;
    deleteMutation.mutate(id);
  };

  const toggleStatus = (id: any, _currentStatus?: any) => {
    toggleMutation.mutate(id);
  };

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการคำถามที่พบบ่อย (FAQ)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="ค้นหา FAQ..." value={search} onChange={(e: any) => { setSearch(e.target.value); setPage(1); }} style={{ padding: '6px 8px' }} />
          <button onClick={() => openModal('create')} className={styles.addButton}><FaPlus /> เพิ่ม FAQ</button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลด...</div>}

      {!loading && (
        <>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>คำถาม</th>
                <th>หมวด</th>
                <th>ลำดับ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>ไม่พบคำถาม</td></tr>}
              {visible.map((i: any) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.question}</td>
                  <td>{i.category || '-'}</td>
                  <td>{i.sort_order}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(i.id, i.is_active)}
                      className={i.is_active ? styles.statusActive : styles.statusInactive}
                      style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      {i.is_active ? 'แสดง' : 'ซ่อน'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openModal('view', i)} className={styles.actionButtonView}><FaEye /></button>
                    <button onClick={() => openModal('edit', i)} className={styles.actionButton}><FaEdit /></button>
                    <button onClick={() => handleDelete(i.id)} className={styles.actionButtonDelete}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>{modal.mode === 'create' ? 'เพิ่มคำถาม' : modal.mode === 'edit' ? 'แก้ไขคำถาม' : 'ดูคำถาม'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label>คำถาม *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e: any) => setFormData({...formData, question: e.target.value})}
                  disabled={modal.mode === 'view'}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label>คำตอบ *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e: any) => setFormData({...formData, answer: e.target.value})}
                  disabled={modal.mode === 'view'}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }}
                />
              </div>

              <div>
                <label>หมวดหมู่</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                  disabled={modal.mode === 'view'}
                  placeholder="เช่น บริการ, การชำระเงิน, ทั่วไป"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label>ลำดับการแสดง</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e: any) => setFormData({...formData, sort_order: e.target.value})}
                  disabled={modal.mode === 'view'}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label>Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e: any) => setFormData({...formData, slug: e.target.value})}
                  disabled={modal.mode === 'view'}
                  placeholder="เช่น frequently-asked-question"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e: any) => setFormData({...formData, is_active: e.target.checked})}
                  disabled={modal.mode === 'view'}
                />
                <label htmlFor="is_active" style={{ margin: 0 }}>แสดงในหน้าเว็บ</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={closeModal} className={styles.btnSecondary}>ปิด</button>
              {modal.mode !== 'view' && (
                <button onClick={handleSave} className={styles.btnPrimary} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'กำลังบันทึก...' : modal.mode === 'create' ? 'สร้าง' : 'บันทึก'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
