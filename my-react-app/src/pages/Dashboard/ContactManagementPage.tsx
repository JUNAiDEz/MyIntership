import { useState, useMemo, useEffect } from 'react';
import type { FormFieldEvent } from '@/types';
import styles from './ManagementPage.module.css'; // ใช้ CSS ร่วมกัน
import { FaEye, FaTrash, FaCheckCircle, FaEnvelopeOpen, FaSearch } from 'react-icons/fa';
import { API_URL, authFetch } from '../../utils/api'; // ใช้ API Config กลาง
import { HasPermission } from '../../utils/ProtectedRoute';

/** สถานะของข้อความติดต่อ */
type ContactStatus = 'Pending' | 'Read' | 'Replied';

/** หนึ่งข้อความติดต่อ ตาม field จริงจาก backend/mock */
interface ContactMessage {
  contact_id: number;
  name: string;
  phone_number?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

/** สถิติข้อความติดต่อ */
interface ContactStats {
  total: number;
  pending: number;
  read: number;
  replied: number;
}

/** state ของ modal รายละเอียดข้อความ */
interface ContactModalState {
  open: boolean;
  message: ContactMessage | null;
}

export default function ContactManagementPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<ContactStats>({ total: 0, pending: 0, read: 0, replied: 0 });
  const pageSize = 10;
  const [modal, setModal] = useState<ContactModalState>({ open: false, message: null });

  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/api/contact?limit=1000`);

      // กรณี Backend ยังไม่พร้อม ให้ใช้ Mock Data
      if (!response.ok) {
         // throw new Error(`HTTP ${response.status}`);
         console.warn("API Contact not ready, using mock data.");
         const mockData: ContactMessage[] = [
            { contact_id: 1, name: 'สมชาย ใจดี', phone_number: '0812345678', subject: 'สอบถามราคาล้างแอร์', message: 'รถ Toyota Vios ปี 2012 ล้างแบบไม่ถอดตู้ราคาเท่าไหร่ครับ', status: 'Pending', created_at: '2023-10-25T10:30:00' },
            { contact_id: 2, name: 'Anna Smith', phone_number: '0998887777', subject: 'Appointment Request', message: 'I would like to book a service for oil change.', status: 'Read', created_at: '2023-10-24T14:15:00' },
            { contact_id: 3, name: 'วิชัย', phone_number: '0899999999', subject: 'เปลี่ยนยาง', message: 'มียางขอบ 18 แนะนำไหมครับ', status: 'Replied', created_at: '2023-10-20T09:00:00' },
         ];
         setMessages(mockData);
         setStats({ total: 3, pending: 1, read: 1, replied: 1 });
         return;
      }

      const result = await response.json() as { success?: boolean; data?: ContactMessage[] };
      if (result.success && result.data) {
        const sortedMessages = [...result.data].sort((a: ContactMessage, b: ContactMessage) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/contact/stats`);
      if (response.ok) {
        const result = await response.json() as { success?: boolean; data?: ContactStats };
        if (result.success && result.data) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateStatus = async (id: number, newStatus: ContactStatus) => {
    // Mock Update
    setMessages(prev => prev.map((m: ContactMessage) => m.contact_id === id ? { ...m, status: newStatus } : m));

    /* API Real Implementation
    try {
      const response = await fetch(`${API_URL}/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
    */
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('ต้องการลบข้อความนี้ใช่หรือไม่?')) return;

    // Mock Delete
    setMessages(prev => prev.filter((m: ContactMessage) => m.contact_id !== id));

    /* API Real Implementation
    try {
      const response = await fetch(`${API_URL}/api/contact/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    */
  };

  const openModal = (message: ContactMessage) => {
    setModal({ open: true, message });
    // Mark as read when opened
    if (message.status === 'Pending') {
      updateStatus(message.contact_id, 'Read');
    }
  };

  const closeModal = () => {
    setModal({ open: false, message: null });
  };

  const filtered = useMemo(() => {
    let result = messages;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((m: ContactMessage) => m.status === filterStatus);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m: ContactMessage) =>
        m.name.toLowerCase().includes(q) ||
        (m.phone_number && m.phone_number.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q)) ||
        m.message.toLowerCase().includes(q)
      );
    }

    return result;
  }, [messages, search, filterStatus]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getStatusColor = (status: ContactStatus) => {
    switch(status) {
      case 'Pending': return styles.statusPending;
      case 'Read': return styles.statusRead;
      case 'Replied': return styles.statusReplied;
      default: return '';
    }
  };

  const getStatusText = (status: ContactStatus) => {
    switch(status) {
      case 'Pending': return 'รอดำเนินการ';
      case 'Read': return 'อ่านแล้ว';
      case 'Replied': return 'ตอบกลับแล้ว';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if(!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการข้อความติดต่อ</h2>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center', border:'1px solid #eee' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>ข้อความทั้งหมด</div>
        </div>
        <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', textAlign: 'center', border:'1px solid #ffeeba' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#856404' }}>{stats.pending}</div>
          <div style={{ color: '#856404', fontSize: '0.9rem' }}>รอดำเนินการ</div>
        </div>
        <div style={{ background: '#d1ecf1', padding: '20px', borderRadius: '8px', textAlign: 'center', border:'1px solid #bee5eb' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0c5460' }}>{stats.read}</div>
          <div style={{ color: '#0c5460', fontSize: '0.9rem' }}>อ่านแล้ว</div>
        </div>
        <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', textAlign: 'center', border:'1px solid #c3e6cb' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#155724' }}>{stats.replied}</div>
          <div style={{ color: '#155724', fontSize: '0.9rem' }}>ตอบกลับแล้ว</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{position:'relative', flex: 1, maxWidth: 300}}>
             <input
                placeholder="ค้นหา ชื่อ, เบอร์, ข้อความ..."
                value={search}
                onChange={(e: FormFieldEvent) => { setSearch(e.target.value); setPage(1); }}
                className={styles.searchInput}
                style={{width: '100%', paddingLeft: 35}}
            />
            <FaSearch style={{position:'absolute', left:10, top:10, color:'#999'}}/>
        </div>

        <select
          value={filterStatus}
          onChange={(e: FormFieldEvent) => { setFilterStatus(e.target.value as ContactStatus | 'all'); setPage(1); }}
          className={styles.select}
          style={{width: 'auto'}}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="Pending">รอดำเนินการ</option>
          <option value="Read">อ่านแล้ว</option>
          <option value="Replied">ตอบกลับแล้ว</option>
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลด...</div>}

      {!loading && (
        <>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>วันที่</th>
                <th>ชื่อ</th>
                <th>เบอร์โทร</th>
                <th>หัวข้อ</th>
                <th>ข้อความ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center' }}>ไม่พบข้อความ</td></tr>
              )}
              {visible.map((msg: ContactMessage) => (
                <tr key={msg.contact_id} style={{ backgroundColor: msg.status === 'Pending' ? '#fffbf2' : 'transparent' }}>
                  <td style={{ fontSize: '0.85rem', whiteSpace:'nowrap' }}>{formatDate(msg.created_at)}</td>
                  <td style={{fontWeight:500}}>{msg.name}</td>
                  <td>{msg.phone_number || '-'}</td>
                  <td>{msg.subject || '-'}</td>
                  <td style={{ maxWidth: '250px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color:'#555' }}>
                      {msg.message}
                    </div>
                  </td>
                  <td>
                    <span className={getStatusColor(msg.status)}>
                      {getStatusText(msg.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:5}}>
                        <button
                        onClick={() => openModal(msg)}
                        className={styles.actionButtonView}
                        title="ดูรายละเอียด"
                        >
                        <FaEye />
                        </button>

                        {msg.status === 'Pending' && (
                        <HasPermission resource="contact" action="update">
                          <button
                              onClick={() => updateStatus(msg.contact_id, 'Read')}
                              className={styles.actionButton}
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                          >
                              <FaEnvelopeOpen />
                          </button>
                        </HasPermission>
                        )}

                        {msg.status !== 'Replied' && (
                        <HasPermission resource="contact" action="update">
                          <button
                              onClick={() => updateStatus(msg.contact_id, 'Replied')}
                              className={styles.actionButton}
                              title="ทำเครื่องหมายว่าตอบกลับแล้ว"
                              style={{ color: '#28a745' }}
                          >
                              <FaCheckCircle />
                          </button>
                        </HasPermission>
                        )}

                        <HasPermission resource="contact" action="delete">
                          <button
                          onClick={() => handleDelete(msg.contact_id)}
                          className={styles.actionButtonDelete}
                          title="ลบ"
                          >
                          <FaTrash />
                          </button>
                        </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.paginationWrapper}>
             <div>รวม {total} รายการ</div>
             <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>ก่อนหน้า</button>
                <div>หน้า {page} / {pageCount}</div>
                <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>ถัดไป</button>
             </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {modal.open && modal.message && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <h3>รายละเอียดข้อความ</h3>

            <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
                <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', paddingBottom:10 }}>
                     <div>
                        <div style={{fontSize:'0.9rem', color:'#888'}}>ผู้ส่ง</div>
                        <div style={{fontSize:'1.1rem', fontWeight:'bold'}}>{modal.message.name}</div>
                        <div style={{color:'#007bff'}}>{modal.message.phone_number || '-'}</div>
                     </div>
                     <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'0.9rem', color:'#888'}}>วันที่</div>
                        <div>{formatDate(modal.message.created_at)}</div>
                        <div style={{marginTop:5}}>
                            <span className={getStatusColor(modal.message.status)}>
                                {getStatusText(modal.message.status)}
                            </span>
                        </div>
                     </div>
                </div>

                <div>
                    <div style={{fontSize:'0.9rem', color:'#888', marginBottom:5}}>หัวข้อ</div>
                    <div style={{fontWeight:600, fontSize:'1.1rem'}}>{modal.message.subject || '-'}</div>
                </div>

                <div>
                    <div style={{fontSize:'0.9rem', color:'#888', marginBottom:5}}>ข้อความ</div>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                        border: '1px solid #eee'
                    }}>
                        {modal.message.message}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 25 }}>
              {modal.message.status !== 'Replied' && (
                  <button
                    onClick={() => {
                      if (modal.message) updateStatus(modal.message.contact_id, 'Replied');
                      closeModal();
                    }}
                    className={styles.btnPrimary}
                    style={{ background: '#28a745' }}
                  >
                    <FaCheckCircle /> ทำเครื่องหมายว่าตอบแล้ว
                  </button>
              )}
              <button onClick={closeModal} className={styles.btnSecondary}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}