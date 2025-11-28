import React, { useState, useMemo, useEffect } from 'react';
import styles from './ManagementPage.module.css';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import api from '../../utils/api';

export default function CarManagementPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [modal, setModal] = useState({ open: false, mode: 'view', item: null });
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // load models and brands
    const load = async () => {
      try {
        const models = await api.apiGet('/api/vehicles/master/models');
        const list = Array.isArray(models) ? models : [];
        setItems(list.map(m => ({
          id: m.car_model_id || m.id,
          brand: (m.CarBrand && (m.CarBrand.brand_name || m.CarBrand.brand_name)) || m.brand_name || m.brand_id,
          brand_id: m.brand_id,
          model: m.model_name,
          type: m.car_size,
          year: m.model_year,
          raw: m
        })));
      } catch (e) {
        console.error('Failed to load models', e);
      }
      try {
        const b = await api.apiGet('/api/vehicles/master/brands');
        setBrands(Array.isArray(b) ? b : []);
      } catch (e) {
        console.error('Failed to load brands', e);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(i => `${i.brand || ''} ${i.model || ''} ${i.type || ''} ${i.year || ''}`.toLowerCase().includes(q));
  }, [items, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (mode, item = null) => setModal({ open: true, mode, item });
  const closeModal = () => setModal({ open: false, mode: 'view', item: null });

  const refreshList = async () => {
    const models = await api.apiGet('/api/vehicles/master/models').catch(() => []);
    const list = Array.isArray(models) ? models : [];
    // Map DB codes to user-friendly labels for display
    const codeToLabel = {
      'Sedan': 'Sedan',
      'Sendan': 'Sendan',
      'Hatchback': 'Hatchback',
      'Coupe': 'Coupe',
      'Convertible': 'Convertible',
      'Station Wagon': 'Station Wagon',
      'Van': 'Van',
      'Sport Car': 'Sport Car',
      'SUV': 'SUV',
      'Truck': 'Truck'
    };
    setItems(list.map(m => ({
      id: m.car_model_id || m.id,
      brand: (m.CarBrand && (m.CarBrand.brand_name || m.CarBrand.brand_name)) || m.brand_name || m.brand_id,
      brand_id: m.brand_id,
      model: m.model_name,
      type: codeToLabel[m.car_size] || m.car_size,
      year: m.model_year,
      raw: m
    })));
  };

  const handleDelete = async (id) => {
    if (!confirm('ต้องการลบรายการนี้ ใช่หรือไม่?')) return;
    try {
      await api.apiDelete(`/api/vehicles/master/models/${id}`, { auth: true });
      await refreshList();
    } catch (err) {
      alert('ไม่สามารถลบได้: ' + (err?.message || err));
    }
  };

  const handleSave = async (form) => {
    // simple validation
    if (!form.brand_id) return alert('กรุณาเลือกยี่ห้อ');
    if (!form.model_name || !String(form.model_name).trim()) return alert('กรุณากรอกรุ่น');

    setSaving(true);
    setErrorMessage('');
    try {
      // Map user-friendly type labels back to DB enum codes when saving
      const labelToCode = {
        'Sedan': 'Sedan',
        'Sendan': 'Sendan',
        'Hatchback': 'Hatchback',
        'Coupe': 'Coupe',
        'Convertible': 'Convertible',
        'Station Wagon': 'Station Wagon',
        'Van': 'Van',
        'Sport Car': 'Sport Car',
        'SUV': 'SUV',
        'Truck': 'Truck'
      };
      const payload = { ...form, car_size: (form.car_size && labelToCode[form.car_size]) ? labelToCode[form.car_size] : form.car_size };
      if (modal.mode === 'create') {
        await api.apiPost('/api/vehicles/master/models', payload, { auth: true });
      } else if (modal.mode === 'edit' && modal.item) {
        await api.apiPut(`/api/vehicles/master/models/${modal.item.car_model_id || modal.item.id}`, payload, { auth: true });
      }
      closeModal();
      await refreshList();
    } catch (err) {
      console.error('Save error', err);
      setErrorMessage('บันทึกไม่สำเร็จ: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  // form state for modal
  const [formBrandId, setFormBrandId] = useState('');
  const [formModelName, setFormModelName] = useState('');
  const [formYearValue, setFormYearValue] = useState('');
  const [formTypeValue, setFormTypeValue] = useState('Sendan');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (modal.open && modal.item) {
      setFormBrandId(modal.item.brand_id || modal.item.raw?.brand_id || '');
      setFormModelName(modal.item.model || modal.item.raw?.model_name || '');
      setFormYearValue(modal.item.year || modal.item.raw?.model_year || '');
      setFormTypeValue(modal.item.type || modal.item.raw?.car_size || 'Sendan');
    }
    if (modal.open && modal.mode === 'create') {
      setFormBrandId(brands[0]?.brand_id || brands[0]?.brandId || '');
      setFormModelName('');
      setFormYearValue('');
      setFormTypeValue('Sendan');
    }
  }, [modal, brands]);

  return (
    <div className={styles.content}>
      <div className={styles.productHeader}>
        <h2 className={styles.contentTitle}>จัดการข้อมูลรถยนต์</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="ค้นหารถยนต์..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ padding: '6px 8px' }} />
          <button onClick={() => openModal('create')} className={styles.addButton}><FaPlus /> เพิ่มรถ</button>
        </div>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>รูป</th>
            <th>ยี่ห้อ</th>
            <th>รุ่น</th>
            <th>ประเภท</th>
            <th>ปี</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>ไม่พบข้อมูล</td></tr>}
          {visible.map(i => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td><div style={{ width: 60, height: 40, background: '#eef2f5', borderRadius: 6 }} /></td>
              <td>{i.brand}</td>
              <td>{i.model}</td>
              <td>{i.type || '-'}</td>
              <td>{i.year || '-'}</td>
              <td>{/* CarModel has no status field, leave placeholder */}<span className={styles.statusActive}>แสดง</span></td>
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

      {/* simple modal stub */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
                <h3>{modal.mode === 'create' ? 'เพิ่มรุ่นรถใหม่' : modal.mode === 'edit' ? 'แก้ไขรุ่นรถ' : 'ดูรายละเอียดรุ่นรถ'}</h3>
                <div className={styles.formBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>ยี่ห้อ</label>
                      <select value={formBrandId} onChange={(e) => setFormBrandId(e.target.value)}>
                        <option value="">-- เลือกยี่ห้อ --</option>
                        {brands.map(b => <option key={b.brand_id || b.id} value={b.brand_id || b.id}>{b.brand_name || b.name}</option>)}
                      </select>
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>ประเภท</label>
                      <select value={formTypeValue} onChange={(e) => { console.log('form type onChange ->', e.target.value); setFormTypeValue(e.target.value); }}>
                        <option value="">-- เลือกประเภท --</option>
                        <option value="Sendan">Sendan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Station Wagon">Station Wagon</option>
                        <option value="Van">Van</option>
                        <option value="Sport Car">Sport Car</option>
                        <option value="SUV">SUV</option>
                        <option value="Truck">Truck</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>รุ่น</label>
                      <input type="text" value={formModelName} onChange={(e) => setFormModelName(e.target.value)} />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>ปี</label>
                      <input type="number" value={formYearValue} onChange={(e) => setFormYearValue(e.target.value)} />
                    </div>
                  </div>
                </div>
                {errorMessage && <div className={styles.errorMessage} style={{ marginTop: 8 }}>{errorMessage}</div>}
                <div className={styles.modalActions}>
                  <button onClick={closeModal} className={styles.btnSecondary} disabled={saving}>ปิด</button>
                  {modal.mode !== 'view' && <button onClick={() => { const payload = { brand_id: formBrandId, model_name: formModelName, model_year: formYearValue ? Number(formYearValue) : null, car_size: formTypeValue }; try { console.log('handleSave payload ->', JSON.stringify(payload)); } catch(e) { console.log('handleSave payload ->', payload); } handleSave(payload); }} className={styles.btnPrimary} disabled={saving}>{saving ? 'บันทึก...' : 'บันทึก'}</button>}
                </div>
              </div>
        </div>
      )}
    </div>
  );
}
