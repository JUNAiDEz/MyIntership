import React, { useState, useMemo } from 'react';
import styles from './ManagementPage.module.css';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function FAQManagementPage(){
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [modal, setModal] = useState({ open: false, mode: 'view', item: null });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(i => `${i.question} ${i.category}`.toLowerCase().includes(q));
  }, [items, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (mode, item = null) => setModal({ open: true, mode, item });
  const closeModal = () => setModal({ open: false, mode: 'view', item: null });

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการคำถามที่พบบ่อย (FAQ)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="ค้นหา FAQ..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ padding: '6px 8px' }} />
          <button onClick={() => openModal('create')} className={styles.addButton}><FaPlus /> เพิ่ม FAQ</button>
        </div>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>คำถาม</th>
            <th>หมวด</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>ไม่พบคำถาม</td></tr>}
          {visible.map(i => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.question}</td>
              <td>{i.category}</td>
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
            <h3>{modal.mode === 'create' ? 'เพิ่มคำถาม' : modal.mode === 'edit' ? 'แก้ไขคำถาม' : 'ดูคำถาม'}</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>คำถาม</label>
                <input type="text" defaultValue={modal.item?.question || ''} />
                <label>คำตอบ</label>
                <textarea defaultValue={modal.item?.answer || ''} />
                <label>หมวด</label>
                <input type="text" defaultValue={modal.item?.category || ''} />
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
