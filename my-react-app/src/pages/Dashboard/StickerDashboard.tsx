import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../../styles/AdminTheme.module.css';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaCar, FaPalette, FaSearch } from 'react-icons/fa';
import { API_URL } from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';

const STICKER_API_URL = `${API_URL}/api/stickers`;
const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dy='.3em' fill='%239ca3af' font-size='12' text-anchor='middle'>No Image</text></svg>";

// --- Helpers ---
const hexToFilter = (hex: any) => {
  if (!hex) return 'none';
  const hexClean = hex.replace('#', '').toLowerCase();
  const specialColors: any = {
    'ffffff': 'brightness(2) saturate(0)',
    '000000': 'brightness(0.25) contrast(1.2) grayscale(1)',
  };
  if (specialColors[hexClean]) return specialColors[hexClean];

  const r = parseInt(hexClean.substr(0, 2), 16) / 255;
  const g = parseInt(hexClean.substr(2, 2), 16) / 255;
  const b = parseInt(hexClean.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const brightness = (max + min) / 2;

  if (max - min < 0.1) {
    if (brightness > 0.8) return 'brightness(2) saturate(0)';
    if (brightness < 0.2) return 'brightness(0.25) grayscale(1)';
    return `brightness(${brightness.toFixed(1)}) grayscale(1)`;
  }

  let hue = 0;
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
  else hue = (4 + (r - g) / (max - min)) * 60;
  if (hue < 0) hue += 360;

  const hueRotate = Math.round(hue - 30);
  const saturation = Math.round((max - min) / max * 10);
  const brightnessValue = (brightness * 2).toFixed(1);

  return `sepia(1) saturate(${saturation}) hue-rotate(${hueRotate}deg) brightness(${brightnessValue})`;
};

// 🔥 [แก้ไข] ลดความละเอียดภาพลง เพื่อไม่ให้ไฟล์ใหญ่เกิน Nginx Limit (1MB)
const compressImage = (file: any, callback: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx: any = canvas.getContext('2d');
        // ปรับลดจาก 800 เหลือ 500
        const MAX_WIDTH = 500; const MAX_HEIGHT = 500;
        let width = img.width; let height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
        else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const isPNG = file.type === 'image/png';
        // ปรับ Quality ให้เหลือ 0.6 เพื่อให้ไฟล์ Base64 เล็กที่สุด
        const base64String = isPNG ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.6);
        callback(base64String);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

const ImageInputBox = ({ label, field, preview, onChange }: { label?: any; field?: any; preview?: any; onChange?: any }) => (
    <div style={{ flex: 1, border: '1px solid #e5e7eb', padding: 10, borderRadius: 6, background: '#f9fafb' }}>
        <label style={{ fontSize:'0.8rem', marginBottom:8, display: 'block', fontWeight: 'bold', color: '#374151' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 60, height: 60, background: '#fff', border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={preview || PLACEHOLDER_IMG} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={(e) => onChange(e, field)} style={{ fontSize: '0.8rem', width: '100%' }} />
            </div>
        </div>
    </div>
);

// Helper: Fetch cars
const fetchCars = async (): Promise<any[]> => {
  const response = await fetch(`${STICKER_API_URL}/cars`);
  if (!response.ok) throw new Error('Failed to fetch cars');
  return response.json();
};

// Helper: Fetch colors
const fetchColors = async (): Promise<any[]> => {
  const response = await fetch(`${STICKER_API_URL}/colors`);
  if (!response.ok) throw new Error('Failed to fetch colors');
  return response.json();
};

function StickerDashboard() {
  const queryClient = useQueryClient();

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['sticker-cars'],
    queryFn: fetchCars,
  });
  const { data: colors = [], isLoading: colorsLoading } = useQuery({
    queryKey: ['sticker-colors'],
    queryFn: fetchColors,
  });
  const loading = carsLoading || colorsLoading;

  const [activeTab, setActiveTab] = useState('cars');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [modal, setModal] = useState<any>({ open: false, type: 'car', mode: 'create', data: null });

  const initialCarState: any = {
    name: '', description: '',
    base_image: null,        paint_image: null,
    base_door_image: null,   paint_door_image: null,
    base_fender_image: null, paint_fender_image: null,
    base_trunk_image: null,  paint_trunk_image: null,
    base_hood_image: null,   paint_hood_image: null,
    base_roof_image: null,   paint_roof_image: null,
  };

  const [carForm, setCarForm] = useState<any>(initialCarState);
  const [previews, setPreviews] = useState<any>(initialCarState);

  const [colorForm, setColorForm] = useState<any>({
    name: '', color_code: '#000000', color_id: '', css_filter: 'none', display_order: 0
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredCars = cars.filter((c: any) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const filteredColors = colors.filter((c: any) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || c.color_id.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const handleCarFileChange = (e: any, field: any) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviews((prev: any) => ({ ...prev, [field]: objectUrl }));

      setUploadingImage(true);
      compressImage(file, (base64String: any) => {
        setCarForm((prev: any) => ({ ...prev, [field]: base64String }));
        setUploadingImage(false);
      });
    }
  };

  // 🔥 [แก้ไข] เพิ่มการจับ Error ให้ชัดเจน จะได้รู้ว่าติดที่ตรงไหน
  const carSubmitMutation = useMutation({
    mutationFn: async () => {
      const url = modal.mode === 'edit' ? `${STICKER_API_URL}/cars/${modal.data.id}` : `${STICKER_API_URL}/cars`;
      const method = modal.mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(carForm) });

      if (!res.ok) {
        // ดึง Error จาก Backend มาโชว์
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      return res;
    },
    onSuccess: () => {
      alert(modal.mode === 'edit' ? 'อัปเดตข้อมูลรถสำเร็จ!' : 'เพิ่มข้อมูลรถสำเร็จ!');
      queryClient.invalidateQueries({ queryKey: ['sticker-cars'] });
      closeModal();
    },
    onError: (err: any) => {
      console.error(err);
      alert(`บันทึกไม่สำเร็จ!\n\nสาเหตุ: ${err instanceof Error ? err.message : String(err)}\n\n(หากขึ้น Error 413 แปลว่าไฟล์ภาพรวมกันมีขนาดใหญ่เกินไปครับ)`);
    },
  });

  const handleCarSubmit = (e: any) => {
    e.preventDefault();
    if (!carForm.name) return alert('Please enter car name');
    carSubmitMutation.mutate();
  };

  const deleteCarMutation = useMutation({
    mutationFn: async (id: any) => {
      await fetch(`${STICKER_API_URL}/cars/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sticker-cars'] }),
    onError: (err: any) => alert(err instanceof Error ? err.message : String(err)),
  });

  const handleDeleteCar = (id: any) => {
    if (!window.confirm('Delete this car?')) return;
    deleteCarMutation.mutate(id);
  };

  const colorSubmitMutation = useMutation({
    mutationFn: async () => {
      const url = modal.mode === 'edit' ? `${STICKER_API_URL}/colors/${modal.data.id}` : `${STICKER_API_URL}/colors`;
      const method = modal.mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(colorForm) });
      if (!res.ok) throw new Error('Failed');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sticker-colors'] });
      closeModal();
    },
    onError: (err: any) => alert(err instanceof Error ? err.message : String(err)),
  });

  const handleColorSubmit = (e: any) => {
    e.preventDefault();
    if (!colorForm.name || !colorForm.color_id) return alert('Name and ID required');
    colorSubmitMutation.mutate();
  };

  const deleteColorMutation = useMutation({
    mutationFn: async (id: any) => {
      await fetch(`${STICKER_API_URL}/colors/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sticker-colors'] }),
    onError: (err: any) => alert(err instanceof Error ? err.message : String(err)),
  });

  const handleDeleteColor = (id: any) => {
    if (!window.confirm('Delete color?')) return;
    deleteColorMutation.mutate(id);
  };

  const openModal = (type: any, mode: any, data: any = null) => {
    if (type === 'car') {
        if (mode === 'edit' && data) {
            setCarForm({
                name: data.name, description: data.description || '',
                base_image: data.base_image,               paint_image: data.paint_image,
                base_door_image: data.base_door_image,     paint_door_image: data.paint_door_image,
                base_fender_image: data.base_fender_image, paint_fender_image: data.paint_fender_image,
                base_trunk_image: data.base_trunk_image,   paint_trunk_image: data.paint_trunk_image,
                base_hood_image: data.base_hood_image,     paint_hood_image: data.paint_hood_image,
                base_roof_image: data.base_roof_image,     paint_roof_image: data.paint_roof_image,
            });
            setPreviews({
                base_image: data.base_image,               paint_image: data.paint_image,
                base_door_image: data.base_door_image,     paint_door_image: data.paint_door_image,
                base_fender_image: data.base_fender_image, paint_fender_image: data.paint_fender_image,
                base_trunk_image: data.base_trunk_image,   paint_trunk_image: data.paint_trunk_image,
                base_hood_image: data.base_hood_image,     paint_hood_image: data.paint_hood_image,
                base_roof_image: data.base_roof_image,     paint_roof_image: data.paint_roof_image,
            });
        } else {
            setCarForm(initialCarState);
            setPreviews(initialCarState);
        }
    } else if (type === 'color') {
        if (mode === 'edit' && data) {
            setColorForm({ name: data.name, color_code: data.color_code, color_id: data.color_id, css_filter: data.css_filter, display_order: data.display_order });
        } else {
            setColorForm({ name: '', color_code: '#000000', color_id: '', css_filter: 'none', display_order: 0 });
        }
    }
    setModal({ open: true, type, mode, data });
  };

  const closeModal = () => setModal({ open: false, type: 'car', mode: 'create', data: null });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>Sticker Dashboard</h2>
            <button onClick={() => openModal(activeTab === 'cars' ? 'car' : 'color', 'create')} className={styles.addButton}>
                <FaPlus /> Add {activeTab === 'cars' ? 'Car' : 'Color'}
            </button>
         </div>

         <div className={styles.controls} style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setActiveTab('cars'); setSearch(''); }}
                    style={{ padding: '8px 16px', border: 'none', background: activeTab === 'cars' ? '#ffc709' : '#e5e7eb', color: activeTab === 'cars' ? '#000' : '#666', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <FaCar /> Cars
                </button>
                <button onClick={() => { setActiveTab('colors'); setSearch(''); }}
                    style={{ padding: '8px 16px', border: 'none', background: activeTab === 'colors' ? '#ffc709' : '#e5e7eb', color: activeTab === 'colors' ? '#000' : '#666', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <FaPalette /> Colors
                </button>
            </div>

            <div className={styles.searchWrapper} style={{ minWidth: '250px' }}>
                <FaSearch className={styles.searchIcon} />
                <input className={styles.searchInput} placeholder={activeTab === 'cars' ? "Search Car Name..." : "Search Color Name..."} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
         </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && (
        <div style={{ marginTop: 20 }}>
            {activeTab === 'cars' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {filteredCars.map((c: any) => (
                        <div key={c.id} onClick={() => openModal('car', 'edit', c)}
                            style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ height: '160px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0', padding: 10 }}>
                                <img src={c.base_image || c.base_door_image || PLACEHOLDER_IMG} alt={c.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ padding: '16px', flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 5px 0' }}>{c.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description || 'No description'}</p>
                            </div>
                            <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#fafafa' }}>
                                <button onClick={(e) => { e.stopPropagation(); openModal('car', 'edit', c); }} className={styles.iconBtn} title="Edit"><FaEdit /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCar(c.id); }} className={`${styles.iconBtn} ${styles.delete}`} title="Delete"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                    {filteredCars.length === 0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:40, color:'#888'}}>No cars found.</div>}
                </div>
            )}

            {activeTab === 'colors' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {filteredColors.map((c: any) => (
                        <div key={c.id} onClick={() => openModal('color', 'edit', c)}
                            style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', padding: '10px', gap: 15, cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: c.color_code, border: '1px solid #ddd', flexShrink: 0 }}></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{c.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{c.color_code}</div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.color_id}</div>
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <button onClick={(e) => { e.stopPropagation(); openModal('color', 'edit', c); }} className={styles.iconBtn} style={{transform:'scale(0.8)'}}><FaEdit /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteColor(c.id); }} className={`${styles.iconBtn} ${styles.delete}`} style={{transform:'scale(0.8)'}}><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                    {filteredColors.length === 0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:40, color:'#888'}}>No colors found.</div>}
                </div>
            )}
        </div>
      )}

      {/* --- MODAL --- */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: modal.type === 'car' ? '800px' : '500px' }}>
                <div className={styles.modalHeader} style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingBottom: 10, marginBottom: 15, borderBottom: '2px solid #ffc709' }}>
                    <h3>{modal.mode === 'create' ? 'Add' : 'Edit'} {modal.type === 'car' ? 'Car' : 'Color'}</h3>
                    <button type="button" onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
                </div>

                {modal.type === 'car' && (
                    <form onSubmit={handleCarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Car Name *</label>
                                <input className={styles.formInput} value={carForm.name} onChange={e => setCarForm({...carForm, name: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <input className={styles.formInput} value={carForm.description} onChange={e => setCarForm({...carForm, description: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ display:'flex', flexDirection:'column', gap:15, maxHeight: '450px', overflowY: 'auto', paddingRight: 10 }}>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Image (หลัก/กระจก)" field="base_image" preview={previews.base_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Image (Mask สี)" field="paint_image" preview={previews.paint_image} onChange={handleCarFileChange} />
                            </div>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Door (ประตูรถ)" field="base_door_image" preview={previews.base_door_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Door (Mask สี)" field="paint_door_image" preview={previews.paint_door_image} onChange={handleCarFileChange} />
                            </div>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Fender (แก้มข้าง)" field="base_fender_image" preview={previews.base_fender_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Fender (Mask สี)" field="paint_fender_image" preview={previews.paint_fender_image} onChange={handleCarFileChange} />
                            </div>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Trunk (ประตูท้าย)" field="base_trunk_image" preview={previews.base_trunk_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Trunk (Mask สี)" field="paint_trunk_image" preview={previews.paint_trunk_image} onChange={handleCarFileChange} />
                            </div>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Hood (กระโปรงหน้า)" field="base_hood_image" preview={previews.base_hood_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Hood (Mask สี)" field="paint_hood_image" preview={previews.paint_hood_image} onChange={handleCarFileChange} />
                            </div>

                            <div style={{display:'flex', gap:10}}>
                                <ImageInputBox label="Base Roof (หลังคารถ)" field="base_roof_image" preview={previews.base_roof_image} onChange={handleCarFileChange} />
                                <ImageInputBox label="Paint Roof (Mask สี)" field="paint_roof_image" preview={previews.paint_roof_image} onChange={handleCarFileChange} />
                            </div>

                        </div>

                        {uploadingImage && <div style={{color:'#eab308', fontWeight: 'bold'}}>Processing image...</div>}

                        <div className={styles.modalActions} style={{ position: 'sticky', bottom: 0, background: '#fff', paddingTop: 15, marginTop: 10 }}>
                            <button type="button" onClick={closeModal} className={styles.btnCancel}>Cancel</button>
                            <button type="submit" className={styles.btnSubmit} disabled={uploadingImage}><FaSave /> Save Car</button>
                        </div>
                    </form>
                )}

                {modal.type === 'color' && (
                    <form onSubmit={handleColorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Color Name *</label>
                            <input className={styles.formInput} value={colorForm.name} onChange={e => setColorForm({...colorForm, name: e.target.value})} required placeholder="e.g. Red" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Color ID (Unique) *</label>
                            <input className={styles.formInput} value={colorForm.color_id} onChange={e => setColorForm({...colorForm, color_id: e.target.value})} required placeholder="e.g. red" />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup} style={{flex:0.5}}>
                                <label className={styles.formLabel}>Picker</label>
                                <input type="color" value={colorForm.color_code}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setColorForm({...colorForm, color_code: val, css_filter: hexToFilter(val)});
                                    }}
                                    style={{height:38, width:'100%', padding:0, border:'none', cursor:'pointer'}}
                                />
                            </div>
                            <div className={styles.formGroup} style={{flex:1}}>
                                <label className={styles.formLabel}>Hex Code</label>
                                <input className={styles.formInput} value={colorForm.color_code} onChange={e => setColorForm({...colorForm, color_code: e.target.value})} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>CSS Filter</label>
                            <textarea className={styles.formTextarea} rows={3} value={colorForm.css_filter} onChange={e => setColorForm({...colorForm, css_filter: e.target.value})} style={{fontSize:'0.8rem'}} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Order</label>
                            <input type="number" className={styles.formInput} value={colorForm.display_order} onChange={e => setColorForm({...colorForm, display_order: parseInt(e.target.value)})} />
                        </div>

                        <div className={styles.modalActions}>
                            <button type="button" onClick={closeModal} className={styles.btnCancel}>Cancel</button>
                            <button type="submit" className={styles.btnSubmit}><FaSave /> Save Color</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default StickerDashboard;