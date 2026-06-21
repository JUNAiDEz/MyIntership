// src/pages/Dashboard/WrapCarManagement/FilmProtectManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
// ใช้ไฟล์ Theme กลาง
import styles from '../../../styles/AdminTheme.module.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaCar, FaWrench, FaBoxOpen, FaTags } from 'react-icons/fa';

// 🔥 Import DashboardHeader เข้ามาใช้งาน
import DashboardHeader from '../../../components/DashboardHeader';

// รับ props onLogout มาเผื่อใช้งาน
export default function FilmProtectManagementPage({ onLogout }: { onLogout?: () => void }) {
  const queryClient = useQueryClient();

  // --- List (React Query) ---
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['film-protect-pricing'],
    queryFn: async () => {
      const res: any = await api.apiGet('/api/services/film-protect/pricing');
      const flat: any[] = [];
      if (Array.isArray(res)) {
        res.forEach((group: any) => {
          (group.models || []).forEach((model: any) => {
            flat.push({
              brand: group.brand,
              name: model.name,
              price: model.price,
              note: model.note,
              img: model.img,
              car_model_id: model.car_model_id,
              id: model.id
            });
          });
        });
      }
      return flat;
    },
  });

  // --- Brands (React Query) ---
  const { data: brands = [] } = useQuery({
    queryKey: ['vehicle-brands'],
    queryFn: async () => {
      const res: any = await api.apiGet('/api/vehicles/master/brands');
      return res.data || [];
    },
  });

  const [models, setModels] = useState<any[]>([]);

  // UI State
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any>({ open: false, mode: 'create' });

  const [formData, setFormData] = useState<any>({
    id: null,
    brand_id: '',
    car_model_id: '',
    price: '',
    note: '',
    img: ''
  });

  // invalidate -> useQuery refetch อัตโนมัติ (list ไม่ค้างหลัง CRUD)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['film-protect-pricing'] });

  // Fetch Models when Brand changes
  useEffect(() => {
    if (formData.brand_id) {
      const fetchModels = async () => {
        const res: any = await api.apiGet(`/api/vehicles/master/models?brand_id=${formData.brand_id}`);
        setModels(res.data || []);
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [formData.brand_id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const serviceRes: any = await api.apiGet('/api/services?search=Film Protect');
      const service = (serviceRes && serviceRes.length > 0) ? serviceRes[0] : null;
      if (!service) {
        throw new Error('ไม่พบบริการ Film Protect ในระบบ');
      }
      const body = {
        service_id: service.service_id,
        car_model_id: formData.car_model_id,
        price: formData.price,
        note: formData.note
      };
      return api.apiPost('/api/services/pricing', body, { auth: true });
    },
    onSuccess: () => {
      alert(modal.mode === 'edit' ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
      closeModal();
      refresh();
    },
    onError: (e: any) => {
      console.error("Error saving data:", e);
      alert(e?.message || 'เกิดข้อผิดพลาด');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (car_model_id: any) => {
      const serviceRes: any = await api.apiGet('/api/services?search=Film Protect');
      const service = (serviceRes && serviceRes.length > 0) ? serviceRes[0] : null;
      if (!service) return;

      return api.apiPatch('/api/services/pricing', {
        service_id: service.service_id,
        car_model_id,
        is_active: false
      }, { auth: true });
    },
    onSuccess: refresh,
    onError: (e: any) => console.error("Error deleting:", e),
  });

  // --- Handlers ---
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!formData.car_model_id || !formData.price) {
      alert('กรุณาเลือกยี่ห้อ/รุ่นรถ และกรอกราคา');
      return;
    }
    saveMutation.mutate();
  };

  const handleEdit = (item: any) => {
    const brandObj = brands.find((b: any) => b.brand_name === item.brand);
    setFormData({
      id: item.id,
      brand_id: brandObj ? brandObj.brand_id : '',
      car_model_id: item.car_model_id,
      price: item.price,
      note: item.note,
      img: item.img
    });
    setModal({ open: true, mode: 'edit' });
  };

  const handleDelete = (car_model_id: any) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าจะลบรายการนี้?')) {
      deleteMutation.mutate(car_model_id);
    }
  };

  // --- Modal Helpers ---
  const openModal = () => {
    setFormData({ id: null, brand_id: '', car_model_id: '', price: '', note: '', img: '' });
    setModal({ open: true, mode: 'create' });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create' });
  };

  // --- Filtering ---
  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.brand.toLowerCase().includes(search.toLowerCase())
  );

  // Helper for Tabs Style
  const tabStyle = (path: any): React.CSSProperties => {
    const isActive = window.location.pathname.includes(path);
    return {
      padding: '10px 15px',
      border: 'none',
      background: isActive ? '#ffc709' : 'transparent',
      color: isActive ? '#000' : '#6b7280',
      fontWeight: isActive ? '700' : '500',
      borderRadius: '8px 8px 0 0',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
    };
  };

  return (
    // เพิ่ม Layout คลุมทั้งหมด
    <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>

      {/* 🔥 เรียกใช้ Component Header สีดำตรงนี้ 🔥 */}
      <DashboardHeader onLogout={onLogout} />

      <div className={styles.pageContainer} style={{ flex: 1 }}>

        {/* HEADER & TABS */}
        <div className={styles.header} style={{ display:'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className={styles.title}>Film Protect Management</h2>
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Search Brand/Model..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={openModal} className={styles.addButton}>
                        <FaPlus /> Add Pricing
                    </button>
                </div>
            </div>

            {/* Navigation Tabs (WrapCar Group) */}
            <div style={{ display: 'flex', gap: '5px', borderBottom: '2px solid #e5e7eb', overflowX: 'auto', paddingBottom: 0 }}>
                <a href="/dashboard/boost-gauge-management" style={tabStyle('boost-gauge')}><FaTags /> Boost Gauge</a>
                <a href="/dashboard/exhaust-management" style={tabStyle('exhaust')}><FaBoxOpen /> Exhaust</a>
                <a href="/dashboard/film-protect-management" style={tabStyle('film-protect')}><FaCar /> Film Protect</a>
                <a href="/dashboard/sticker-management" style={tabStyle('sticker-management')}><FaTags /> Sticker</a>
            </div>
        </div>

        {/* TABLE */}
        {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p> : (
            <div className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "20%" }}>Brand</th>
                                <th style={{ width: "30%" }}>Model</th>
                                <th style={{ width: "15%" }}>Price</th>
                                <th style={{ width: "25%" }}>Note</th>
                                <th style={{ width: "10%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>No data found.</td></tr>
                            )}
                            {filteredItems.map((item: any, idx: any) => (
                                <tr key={idx}>
                                    <td>{item.brand}</td>
                                    <td>{item.name}</td>
                                    <td style={{ fontWeight: '600' }}>{Number(item.price).toLocaleString()}</td>
                                    <td style={{ color: '#666', fontSize: '0.9rem' }}>{item.note || '-'}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleEdit(item)} className={styles.iconBtn} title="Edit">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(item.car_model_id)} className={`${styles.iconBtn} ${styles.delete}`} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* MODAL */}
        {modal.open && (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h3>{modal.mode === 'create' ? 'Add Film Protect Price' : 'Edit Price'}</h3>
                        <button onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Car Brand</label>
                            <select
                                name="brand_id"
                                className={styles.formSelect}
                                value={formData.brand_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select Brand --</option>
                                {brands.map((b: any) => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Car Model</label>
                            <select
                                name="car_model_id"
                                className={styles.formSelect}
                                value={formData.car_model_id}
                                onChange={handleChange}
                                required
                                disabled={!formData.brand_id}
                            >
                                <option value="">-- Select Model --</option>
                                {models.map((m: any) => <option key={m.car_model_id} value={m.car_model_id}>{m.model_name}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Price (THB)</label>
                            <input
                                type="number"
                                name="price"
                                className={styles.formInput}
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 12000"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Note</label>
                            <input
                                type="text"
                                name="note"
                                className={styles.formInput}
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="e.g. Full front / Whole car"
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button type="button" onClick={closeModal} className={styles.btnCancel}>Cancel</button>
                            <button type="submit" className={styles.btnSubmit} disabled={saveMutation.isPending}>
                                <FaSave /> {modal.mode === 'create' ? 'Save' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}