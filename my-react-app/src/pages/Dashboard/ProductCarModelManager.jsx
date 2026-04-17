import React, { useState, useEffect } from 'react';
import styles from './ProductManagementPage.module.css';
import { API_URL } from '../../utils/api';

function ProductCarModelManager({ productTemplateId, onClose }) {
  const [carModels, setCarModels] = useState([]); // All car models
  const [linked, setLinked] = useState([]); // Linked car models with price
  const [editBuffer, setEditBuffer] = useState({}); // { [car_model_id]: { price, note } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch all car models
  useEffect(() => {
    const fetchCarModels = async () => {
      const res = await fetch(`${API_URL}/api/vehicles/master/models`);
      const data = await res.json();
      setCarModels(Array.isArray(data.data) ? data.data : []);
    };
    fetchCarModels();
  }, []);

  // Fetch linked car models for this product
  useEffect(() => {
    const fetchLinked = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/product-car-model/by-product/${productTemplateId}`);
        const data = await res.json();
        setLinked(Array.isArray(data.data) ? data.data : []);
        // Reset editBuffer
        setEditBuffer({});
      } catch (err) {
        setError('โหลดข้อมูลรุ่นรถที่ผูกไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    if (productTemplateId) fetchLinked();
  }, [productTemplateId]);

  // Add or update link (save to backend)
  const handleSave = async (car_model_id) => {
    setSaving(true);
    setError('');
    try {
      const { price, note } = editBuffer[car_model_id] || {};
      await fetch(`${API_URL}/api/products/product-car-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_template_id: productTemplateId, car_model_id, price, note })
      });
      // Refresh
      const res = await fetch(`${API_URL}/api/products/product-car-model/by-product/${productTemplateId}`);
      const data = await res.json();
      setLinked(Array.isArray(data.data) ? data.data : []);
      setEditBuffer(prev => ({ ...prev, [car_model_id]: undefined }));
    } catch (err) {
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // Remove link
  const handleDelete = async (car_model_id) => {
    setSaving(true);
    setError('');
    try {
      await fetch(`${API_URL}/api/products/product-car-model`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_template_id: productTemplateId, car_model_id })
      });
      setLinked(linked.filter(l => l.car_model_id !== car_model_id));
    } catch (err) {
      setError('ลบไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // UI
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{ minWidth: 480 }}>
        <h3>จัดการราคาสินค้าต่อรุ่นรถ</h3>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 10 }}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>รุ่นรถ</th>
                <th>ราคา</th>
                <th>หมายเหตุ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {linked.map(l => {
                const buffer = editBuffer[l.car_model_id] || {};
                const price = buffer.price !== undefined ? buffer.price : l.price || '';
                const note = buffer.note !== undefined ? buffer.note : l.note || '';
                const isDirty = (buffer.price !== undefined && buffer.price !== l.price) || (buffer.note !== undefined && buffer.note !== l.note);
                return (
                  <tr key={l.car_model_id}>
                    <td>{carModels.find(m => m.car_model_id === l.car_model_id)?.model_name || l.car_model_id}</td>
                    <td>
                      <input
                        type="number"
                        value={price}
                        style={{ width: 90 }}
                        onChange={e => {
                          const val = e.target.value;
                          setEditBuffer(prev => ({
                            ...prev,
                            [l.car_model_id]: { ...prev[l.car_model_id], price: val }
                          }));
                        }}
                        disabled={saving}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={note}
                        style={{ width: 120 }}
                        onChange={e => {
                          const val = e.target.value;
                          setEditBuffer(prev => ({
                            ...prev,
                            [l.car_model_id]: { ...prev[l.car_model_id], note: val }
                          }));
                        }}
                        disabled={saving}
                      />
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleSave(l.car_model_id)} disabled={saving || !isDirty}>บันทึก</button>
                      <button onClick={() => handleDelete(l.car_model_id)} disabled={saving}>ลบ</button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4}>
                  <select id="add-car-model" style={{ width: 200 }}
                    onChange={e => {
                      const val = e.target.value;
                      if (val) handleSave(Number(val), '', '');
                      e.target.value = '';
                    }}
                    disabled={saving}
                  >
                    <option value="">+ เพิ่มรุ่นรถ</option>
                    {carModels.filter(m => !linked.some(l => l.car_model_id === m.car_model_id)).map(m => (
                      <option key={m.car_model_id} value={m.car_model_id}>{m.model_name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} className={styles.btnSecondary}>ปิด</button>
        </div>
      </div>
    </div>
  );
}

export default ProductCarModelManager;
