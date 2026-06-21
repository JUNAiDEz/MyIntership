// src/pages/Dashboard/MaintenanceManagement/FluidChangeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
// [CHANGE] ใช้ไฟล์ Theme กลาง
import styles from '../../../styles/AdminTheme.module.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaWrench, FaBoxOpen, FaCar, FaTags } from 'react-icons/fa';
// import DashboardNavbar from '../../../components/DashboardNavbar'; // ลบออกถ้ามี Layout หลักแล้ว
import type { AdminBrand, AdminCarModel, PricingRow, FormFieldEvent } from '@/types';

interface PricingForm {
  id: number | null | undefined;
  brand_id: string | number;
  car_model_id: string | number | undefined;
  price: string | number | undefined;
  note: string | undefined;
  img: string | undefined;
}

// รูปร่างข้อมูล group ที่ API คืนมา (ก่อน flatten)
interface PricingGroup {
  brand?: string;
  models?: PricingRow[];
}

export default function FluidChangeManagementPage() {
  // --- State ---
  const queryClient = useQueryClient();
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [models, setModels] = useState<AdminCarModel[]>([]);

  // UI State
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit' }>({ open: false, mode: 'create' });

  const [formData, setFormData] = useState<PricingForm>({
    id: null,
    brand_id: '',
    car_model_id: '',
    price: '',
    note: '',
    img: ''
  });

  // --- Fetch Data (React Query) ---
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['fluid-change-pricing-admin'],
    queryFn: async () => {
      const res = await api.apiGet<PricingGroup[]>('/api/services/fluid-change/pricing');
      const flat: PricingRow[] = [];
      if (Array.isArray(res)) {
        res.forEach((group: PricingGroup) => {
          (group.models || []).forEach((model: PricingRow) => {
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

  // invalidate -> useQuery refetch อัตโนมัติ (list ไม่ค้างหลัง CRUD)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['fluid-change-pricing-admin'] });

  useEffect(() => {
    // Fetch Brands
    const fetchBrands = async () => {
      const res = await api.apiGet<{ data: AdminBrand[] }>('/api/vehicles/master/brands');
      setBrands(res.data || []);
    };
    fetchBrands();
  }, []);

  // Fetch Models when Brand changes
  useEffect(() => {
    if (formData.brand_id) {
      const fetchModels = async () => {
        const res = await api.apiGet<{ data: AdminCarModel[] }>(`/api/vehicles/master/models?brand_id=${formData.brand_id}`);
        setModels(res.data || []);
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [formData.brand_id]);

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: async () => {
      const serviceRes = await api.apiGet<Array<{ service_id: number }>>('/api/services?search=Fluid Change');
      const service = (serviceRes && serviceRes.length > 0) ? serviceRes[0] : null;
      if (!service) {
        throw new Error('ไม่พบบริการ Fluid Change ในระบบ');
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
    onError: (err: unknown) => {
      console.error('Error saving data:', err);
      alert((err instanceof Error ? err.message : null) || 'เกิดข้อผิดพลาด');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (car_model_id: number | undefined) => {
      const serviceRes = await api.apiGet<Array<{ service_id: number }>>('/api/services?search=Fluid Change');
      const service = (serviceRes && serviceRes.length > 0) ? serviceRes[0] : null;
      if (!service) return;
      return api.apiPatch('/api/services/pricing', {
        service_id: service.service_id,
        car_model_id,
        is_active: false
      }, { auth: true });
    },
    onSuccess: refresh,
    onError: (err: unknown) => {
      console.error('Error deleting:', err);
    },
  });

  // --- Handlers ---
  const handleChange = (e: FormFieldEvent) => {
    const { name, value } = e.target;
    setFormData((prev: PricingForm) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.car_model_id || !formData.price) {
      alert('กรุณาเลือกยี่ห้อ/รุ่นรถ และกรอกราคา');
      return;
    }
    saveMutation.mutate();
  };

  const handleEdit = (item: PricingRow) => {
    const brandObj = brands.find((b: AdminBrand) => b.brand_name === item.brand);
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

  const handleDelete = (car_model_id: number | undefined) => {
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
  const filteredItems = items.filter((item: PricingRow) =>
    item.name!.toLowerCase().includes(search.toLowerCase()) ||
    item.brand!.toLowerCase().includes(search.toLowerCase())
  );

  // Helper for Tabs Style
  const tabStyle = (path: string): React.CSSProperties => {
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
    <div className={styles.pageContainer}>

      {/* HEADER & TABS */}
      <div className={styles.header} style={{ display:'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className={styles.title}>Fluid Change Management</h2>
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

          {/* Navigation Tabs (Maintenance Group) */}
          <div style={{ display: 'flex', gap: '5px', borderBottom: '2px solid #e5e7eb', overflowX: 'auto', paddingBottom: 0 }}>
              <a href="/dashboard/pipe-clean-management" style={tabStyle('pipe-clean')}><FaWrench /> Pipe Clean</a>
              <a href="/dashboard/engine-spa-management" style={tabStyle('engine-spa')}><FaBoxOpen /> Engine Spa</a>
              <a href="/dashboard/aircon-management" style={tabStyle('aircon')}><FaCar /> Air-Con</a>
              <a href="/dashboard/fluid-change-management" style={tabStyle('fluid-change')}><FaTags /> Fluid</a>
          </div>
      </div>

      {/* TABLE */}
      {loading ? <p>Loading...</p> : (
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
                          {filteredItems.map((item: PricingRow, idx: number) => (
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
                      <h3>{modal.mode === 'create' ? 'Add Fluid Change Price' : 'Edit Price'}</h3>
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
                              {brands.map((b: AdminBrand) => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
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
                              {models.map((m: AdminCarModel) => <option key={m.car_model_id} value={m.car_model_id}>{m.model_name}</option>)}
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
                              placeholder="e.g. 2500"
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
                              placeholder="e.g. Include oil filter..."
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
  );
}
