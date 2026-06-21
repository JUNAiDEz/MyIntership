import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormFieldEvent } from '@/types';
import styles from './ProductManagementPage.module.css';
import { API_URL } from '../../utils/api';

/** รุ่นรถใน master data (endpoint /api/vehicles/master/models) */
interface CarModelMaster {
  car_model_id: number;
  model_name: string;
  [key: string]: unknown;
}

/** ความสัมพันธ์ราคาสินค้าต่อรุ่นรถ (endpoint product-car-model) */
interface ProductCarModelLink {
  car_model_id: number;
  price?: number | string;
  note?: string;
  [key: string]: unknown;
}

/** ค่าที่กำลังแก้อยู่ในตาราง (ก่อนบันทึก) */
interface EditBufferEntry {
  price?: number | string;
  note?: string;
}

type EditBuffer = Record<number, EditBufferEntry | undefined>;

interface ProductCarModelManagerProps {
  productTemplateId?: number | string;
  onClose?: () => void;
}

function ProductCarModelManager({ productTemplateId, onClose }: ProductCarModelManagerProps) {
  const queryClient = useQueryClient();
  const [editBuffer, setEditBuffer] = useState<EditBuffer>({}); // { [car_model_id]: { price, note } }
  const [error, setError] = useState('');

  // Fetch all car models
  const { data: carModels = [] } = useQuery<CarModelMaster[]>({
    queryKey: ['vehicle-master-models'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/vehicles/master/models`);
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  // Fetch linked car models for this product
  const { data: linked = [] } = useQuery<ProductCarModelLink[]>({
    queryKey: ['product-car-model', productTemplateId],
    enabled: !!productTemplateId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/products/product-car-model/by-product/${productTemplateId}`);
      const data = await res.json();
      // Reset editBuffer when (re)loading links
      setEditBuffer({});
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  // Add or update link (save to backend)
  const saveMutation = useMutation({
    mutationFn: async (car_model_id: number) => {
      const { price, note } = editBuffer[car_model_id] || {};
      await fetch(`${API_URL}/api/products/product-car-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_template_id: productTemplateId, car_model_id, price, note })
      });
      return car_model_id;
    },
    onSuccess: (car_model_id: number) => {
      setEditBuffer((prev) => ({ ...prev, [car_model_id]: undefined }));
      queryClient.invalidateQueries({ queryKey: ['product-car-model', productTemplateId] });
    },
    onError: () => setError('บันทึกไม่สำเร็จ'),
  });

  const handleSave = (car_model_id: number) => {
    setError('');
    saveMutation.mutate(car_model_id);
  };

  // Remove link
  const deleteMutation = useMutation({
    mutationFn: async (car_model_id: number) => {
      await fetch(`${API_URL}/api/products/product-car-model`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_template_id: productTemplateId, car_model_id })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-car-model', productTemplateId] });
    },
    onError: () => setError('ลบไม่สำเร็จ'),
  });

  const handleDelete = (car_model_id: number) => {
    setError('');
    deleteMutation.mutate(car_model_id);
  };

  const saving = saveMutation.isPending || deleteMutation.isPending;

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
              {linked.map((l: ProductCarModelLink) => {
                const buffer = editBuffer[l.car_model_id] || {};
                const price = buffer.price !== undefined ? buffer.price : l.price || '';
                const note = buffer.note !== undefined ? buffer.note : l.note || '';
                const isDirty = (buffer.price !== undefined && buffer.price !== l.price) || (buffer.note !== undefined && buffer.note !== l.note);
                return (
                  <tr key={l.car_model_id}>
                    <td>{carModels.find((m: CarModelMaster) => m.car_model_id === l.car_model_id)?.model_name || l.car_model_id}</td>
                    <td>
                      <input
                        type="number"
                        value={price}
                        style={{ width: 90 }}
                        onChange={(e: FormFieldEvent) => {
                          const val = e.target.value;
                          setEditBuffer((prev) => ({
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
                        onChange={(e: FormFieldEvent) => {
                          const val = e.target.value;
                          setEditBuffer((prev) => ({
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
                    onChange={(e: FormFieldEvent) => {
                      const val = e.target.value;
                      if (val) handleSave(Number(val));
                      e.target.value = '';
                    }}
                    disabled={saving}
                  >
                    <option value="">+ เพิ่มรุ่นรถ</option>
                    {carModels.filter((m: CarModelMaster) => !linked.some((l: ProductCarModelLink) => l.car_model_id === m.car_model_id)).map((m: CarModelMaster) => (
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
