import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormFieldEvent } from '@/types';
// [CHANGE] Use Global Theme
import styles from '../../styles/AdminTheme.module.css';
import { FaEdit, FaSave, FaPlus, FaTimes, FaBuilding, FaPhone, FaUser, FaSearch } from 'react-icons/fa';

// API Environment Variable
const API_URL = import.meta.env.VITE_API_URL || '';

/** Supplier (ผู้จัดจำหน่าย) */
interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

/** ความสัมพันธ์ supplier ที่ผูกกับ variant */
interface VariantSupplierLink {
  supplier_id?: number | string;
  supplier_name?: string;
  Supplier?: { supplier_name?: string };
  [key: string]: unknown;
}

/** variant ของสินค้า */
interface ProductVariant {
  product_variant_id?: number;
  sku?: string;
  ProductVariantSuppliers?: VariantSupplierLink[];
  Suppliers?: VariantSupplierLink[];
  [key: string]: unknown;
}

/** สินค้า (พร้อม variants) จาก inventory endpoint */
interface InventoryProduct {
  id?: number | string;
  product_template_id?: number | string;
  product_name?: string;
  variants?: ProductVariant[];
  [key: string]: unknown;
}

/** ฟอร์มสร้าง supplier ใหม่ */
interface NewSupplierForm {
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
}

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper: Fetch products
const fetchProducts = async (): Promise<InventoryProduct[]> => {
  const res = await fetch(`${API_URL}/api/inventory/products?all=1`, { headers: authHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || []);
};

// Helper: Fetch suppliers
const fetchSuppliers = async (): Promise<Supplier[]> => {
  const res = await fetch(`${API_URL}/api/inventory/suppliers`, { headers: authHeaders() });
  let data: unknown = [];
  try {
    data = await res.json();
  } catch (e) { data = []; }
  if (Array.isArray(data)) return data;
  return (data as { items?: Supplier[] })?.items || [];
};

function ProductSupplierManager() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: fetchProducts,
  });
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['inventory-suppliers'],
    queryFn: fetchSuppliers,
  });
  const loading = productsLoading || suppliersLoading;

  // Search State
  const [search, setSearch] = useState('');

  // Editing State
  const [editProductId, setEditProductId] = useState<number | string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Create Supplier State
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState<NewSupplierForm>({ supplier_name: '', contact_person: '', phone: '', email: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Filter Logic
  const filteredProducts = products.filter((p: InventoryProduct) =>
      (p.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.variants?.[0]?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  // Handlers
  const handleEdit = (productId: number | string, currentSupplierId: number | string) => {
    setEditProductId(productId);
    setSelectedSupplier(currentSupplierId ? String(currentSupplierId) : '');
  };

  const saveMutation = useMutation({
    mutationFn: async (productId: number | string) => {
      const product = products.find((p: InventoryProduct) => p.id === productId || p.product_template_id === productId);
      const variant = product?.variants?.[0];

      if (!variant) {
        throw new Error('ไม่พบ variant ของสินค้า');
      }

      const payload = {
        variants: [
          {
            product_variant_id: variant.product_variant_id,
            supplier_id: selectedSupplier ? Number(selectedSupplier) : null
          }
        ]
      };

      const res = await fetch(`${API_URL}/api/inventory/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
      return result;
    },
    onSuccess: () => {
      setEditProductId(null);
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
    },
    onError: (err: unknown) => {
      console.error('Save error:', err);
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดขณะบันทึก');
    },
  });

  const handleSave = (productId: number | string) => {
    saveMutation.mutate(productId);
  };

  const createSupplierMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/inventory/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(newSupplier)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create');
      }
      return res.json();
    },
    onSuccess: () => {
      setShowCreateSupplier(false);
      setNewSupplier({ supplier_name: '', contact_person: '', phone: '', email: '' });
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    },
  });

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    createSupplierMutation.mutate();
  };

  return (
    <div className={styles.pageContainer}>

      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>Supplier Binding</h2>

        <div className={styles.controls}>
           {/* Search Bar */}
           <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                  className={styles.searchInput}
                  placeholder="Search Product..."
                  value={search}
                  onChange={(e: FormFieldEvent) => setSearch(e.target.value)}
              />
           </div>

           {/* Add Button */}
           <button onClick={() => setShowCreateSupplier(true)} className={styles.addButton}>
              <FaPlus /> New Supplier
           </button>
        </div>
      </div>

      {loading && <p>Loading data...</p>}

      {/* TABLE CARD */}
      {!loading && (
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{width: '40%'}}>Product Name</th>
                  <th style={{width: '40%'}}>Current Supplier</th>
                  <th style={{width: '20%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && <tr><td colSpan={3} style={{textAlign:'center', padding:20}}>No products found.</td></tr>}
                {filteredProducts.map((product: InventoryProduct) => {
                  const variant: ProductVariant = product.variants?.[0] || {};
                  const supplierArr = variant.ProductVariantSuppliers || variant.Suppliers || [];
                  const currentSupplier = supplierArr.length > 0 ? supplierArr[0] : null;

                  const supplierName = currentSupplier?.Supplier?.supplier_name || currentSupplier?.supplier_name || '-';
                  const supplierId = currentSupplier?.supplier_id || '';
                  const productId = (product.product_template_id || product.id)!;

                  const isEditing = editProductId === productId;

                  return (
                    <tr key={productId}>
                      <td>
                          <div style={{fontWeight: 600}}>{product.product_name}</div>
                          <div style={{fontSize: '0.8rem', color: '#666'}}>{variant.sku || '-'}</div>
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className={styles.inlineSelect}
                            value={selectedSupplier}
                            onChange={(e: FormFieldEvent) => setSelectedSupplier(e.target.value)}
                          >
                            <option value=''>-- Select Supplier --</option>
                            {suppliers.map((s: Supplier) => (
                              <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                            ))}
                          </select>
                        ) : (
                          <div style={{display:'flex', alignItems:'center', gap: 6}}>
                             <FaBuilding color="#9ca3af" size={14} />
                             {supplierName !== '-' ? <span style={{fontWeight:500}}>{supplierName}</span> : <span style={{color:'#ccc'}}>Not Assigned</span>}
                          </div>
                        )}
                      </td>
                      <td>
                         <div className={styles.actions}>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleSave(productId)} className={`${styles.iconBtn} ${styles.save}`} title="Save">
                                    <FaSave />
                                </button>
                                <button onClick={() => setEditProductId(null)} className={styles.iconBtn} title="Cancel">
                                    <FaTimes />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleEdit(productId, supplierId)} className={styles.iconBtn} title="Edit Supplier">
                                <FaEdit />
                              </button>
                            )}
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {showCreateSupplier && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
             <div className={styles.modalHeader}>
                 <h3>Add New Supplier</h3>
                 <button onClick={() => setShowCreateSupplier(false)} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
             </div>

             {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

             <form onSubmit={handleCreateSupplier}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Supplier Name *</label>
                  <input
                    className={styles.formInput}
                    required
                    value={newSupplier.supplier_name}
                    onChange={(e: FormFieldEvent) => setNewSupplier(s => ({...s, supplier_name: e.target.value}))}
                    placeholder="Company Name"
                  />
                </div>

                <div style={{display:'flex', gap: 15}}>
                    <div className={styles.formGroup} style={{flex:1}}>
                        <label className={styles.formLabel}>Contact Person</label>
                        <div style={{position:'relative'}}>
                            <FaUser style={{position:'absolute', top:12, left:10, color:'#999', fontSize: 12}} />
                            <input
                                className={styles.formInput}
                                style={{paddingLeft: 30}}
                                value={newSupplier.contact_person}
                                onChange={(e: FormFieldEvent) => setNewSupplier(s => ({...s, contact_person: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup} style={{flex:1}}>
                        <label className={styles.formLabel}>Phone</label>
                        <div style={{position:'relative'}}>
                            <FaPhone style={{position:'absolute', top:12, left:10, color:'#999', fontSize: 12}} />
                            <input
                                className={styles.formInput}
                                style={{paddingLeft: 30}}
                                value={newSupplier.phone}
                                onChange={(e: FormFieldEvent) => setNewSupplier(s => ({...s, phone: e.target.value}))}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={newSupplier.email}
                    onChange={(e: FormFieldEvent) => setNewSupplier(s => ({...s, email: e.target.value}))}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowCreateSupplier(false)} className={styles.btnCancel}>Cancel</button>
                  <button type="submit" disabled={createSupplierMutation.isPending} className={styles.btnSubmit}>
                    {createSupplierMutation.isPending ? 'Saving...' : 'Create Supplier'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductSupplierManager;