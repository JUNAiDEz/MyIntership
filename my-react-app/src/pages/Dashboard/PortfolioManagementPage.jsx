import React, { useState, useMemo } from 'react';
import styles from './ManagementPage.module.css';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function PortfolioManagementPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [modal, setModal] = useState({ open: false, mode: 'view', item: null });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(i => `${i.title} ${i.date}`.toLowerCase().includes(q));
  }, [items, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (mode, item = null) => setModal({ open: true, mode, item });
  const closeModal = () => setModal({ open: false, mode: 'view', item: null });

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการผลงานของร้าน</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="ค้นหาผลงาน..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ padding: '6px 8px' }} />
          <button onClick={() => openModal('create')} className={styles.addButton}><FaPlus /> เพิ่มผลงาน</button>
        </div>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>รูป</th>
            <th>ชื่อผลงาน</th>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>ไม่พบผลงาน</td></tr>}
          {visible.map(i => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td><div style={{ width: 60, height: 40, background: '#eef2f5', borderRadius: 6 }} /></td>
              <td>{i.title}</td>
              <td>{i.date}</td>
              <td>{i.status ? <span className={styles.statusActive}>แสดง</span> : <span className={styles.statusInactive}>ซ่อน</span>}</td>
              <td>
                <button onClick={() => openModal('view', i)} className={styles.actionButtonView}><FaEye /></button>
                <button onClick={() => openModal('edit', i)} className={styles.actionButton}><FaEdit /></button>
                <button onClick={() => alert('ลบ: ' + i.id)} className={styles.actionButtonDelete}><FaTrash /></button>
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

      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>{modal.mode === 'create' ? 'เพิ่มผลงานใหม่' : modal.mode === 'edit' ? 'แก้ไขผลงาน' : 'ดูผลงาน'}</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>ชื่อผลงาน</label>
                <input type="text" defaultValue={modal.item?.title || ''} />
                <label>วันที่</label>
                <input type="date" defaultValue={modal.item?.date || ''} />
                <label>คำอธิบาย</label>
                <textarea defaultValue={modal.item?.description || ''} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={closeModal} className={styles.btnSecondary}>ปิด</button>
              {modal.mode !== 'view' && <button className={styles.btnPrimary}>บันทึก</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
