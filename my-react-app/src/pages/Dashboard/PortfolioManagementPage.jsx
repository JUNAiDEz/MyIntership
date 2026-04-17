import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from '../../styles/AdminTheme.module.css'; 
import { FaEdit, FaTrash, FaPlus, FaEye, FaStar, FaTimes, FaSearch, FaImages } from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import { API_URL } from '../../utils/api';
import { HasPermission } from '../../utils/ProtectedRoute';

const getToken = () => localStorage.getItem('adminToken');

export default function PortfolioManagementPage() {
  const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='%23f3f4f6'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dy='.3em' fill='%239ca3af' font-size='12' text-anchor='middle'>No Image</text></svg>";

  // --- Main State ---
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- Master Data ---
  const [categories, setCategories] = useState([]);
  const [carModels, setCarModels] = useState([]);
  
  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Filter State ---
  const [categoryFilter, setCategoryFilter] = useState('');
  const [carModelFilter, setCarModelFilter] = useState('');

  // --- Modal & Form State ---
  const [modal, setModal] = useState({ open: false, mode: 'view', portfolio: null });
  
  // Form State (Map to DB: PortfolioProjects)
  const [createForm, setCreateForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    car_model_id: '',
    completion_date: '',
    is_featured: false,
    is_active: true,
    gallery_images: [], // Array of { image_url, caption }
    category_ids: []    // Array of category_id
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // --- Headers Helper ---
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }), []);

  // --- 1. Fetch Data ---
  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams();
      qParams.append('all', '1');
      if (debouncedSearch) qParams.append('search', debouncedSearch);
      
      const res = await fetch(`${API_URL}/api/portfolio/projects?${qParams.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch projects');
      
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data || []; 

      setPortfolios(items.map(p => ({
        ...p,
        category_names: p.categories?.map(c => c.category_name).join(', ') || '-',
        car_model_name: p.car_model ? `${p.car_model.CarBrand?.brand_name || ''} ${p.car_model.model_name}` : '-'
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, headers]);

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, modelsRes] = await Promise.all([
          fetch(`${API_URL}/api/portfolio/categories`, { headers }),
          fetch(`${API_URL}/api/vehicles/master/models`, { headers }) 
        ]);
        
        if (catRes.ok) {
            const catData = await catRes.json();
            setCategories(Array.isArray(catData) ? catData : catData.data || []);
        }

        if (modelsRes.ok) {
            const modelsData = await modelsRes.json();
            const models = Array.isArray(modelsData) ? modelsData : modelsData.data || [];
            
            const formattedModels = models.map(model => ({
              car_model_id: model.car_model_id,
              model_name: model.model_name,
              brand_name: model.brand?.brand_name || model.Brand?.brand_name || '',
              display_name: `${model.brand?.brand_name || model.Brand?.brand_name || ''} ${model.model_name}`.trim()
            }));
            
            setCarModels(formattedModels);
        }
      } catch (err) {
        console.error('Failed to fetch dropdowns', err);
      }
    };
    fetchDropdowns();
  }, [headers]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // --- 2. Filter & Pagination Logic ---
  const filteredPortfolios = portfolios.filter(p => {
      let catOk = true;
      let modelOk = true;

      // Category Filter (Check if project has selected category id)
      if (categoryFilter) {
          catOk = p.categories?.some(c => (c.portfolio_category_id || c.category_id) === Number(categoryFilter));
      }

      // Car Model Filter
      if (carModelFilter) {
          modelOk = Number(p.car_model_id) === Number(carModelFilter);
      }

      return catOk && modelOk;
  });

  const total = filteredPortfolios.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredPortfolios.slice((page - 1) * pageSize, page * pageSize);

  // --- 3. Actions ---
  
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch(`${API_URL}/api/system/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && (data.url || data.image_url)) {
        setCreateForm(prev => ({ ...prev, cover_image_url: data.url || data.image_url }));
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (file) => {
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/api/system/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            const url = data.url || data.image_url;
            setCreateForm(prev => ({
                ...prev,
                gallery_images: [...prev.gallery_images, { image_url: url, caption: '' }]
            }));
        }
      } catch(err) { console.error(err); alert('Gallery upload failed'); }
  };

  const handleRemoveGalleryImage = (index) => {
    setCreateForm(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryToggle = (id) => {
    setCreateForm(prev => {
      const exists = prev.category_ids.includes(id);
      return {
        ...prev,
        category_ids: exists 
          ? prev.category_ids.filter(c => c !== id)
          : [...prev.category_ids, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.title || createForm.title.trim() === "") {
      setCreateError("Please enter project title");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        title: createForm.title,
        slug: createForm.slug,
        description: createForm.description,
        cover_image_url: createForm.cover_image_url,
        car_model_id: createForm.car_model_id ? Number(createForm.car_model_id) : null,
        completion_date: createForm.completion_date || null,
        is_featured: createForm.is_featured,
        is_active: createForm.is_active,
        category_ids: createForm.category_ids,
        gallery_images: createForm.gallery_images
      };

      let url = `${API_URL}/api/portfolio/projects`;
      let method = 'POST';

      if (modal.mode === 'edit' && modal.portfolio) {
        url = `${API_URL}/api/portfolio/projects/${modal.portfolio.project_id || modal.portfolio.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
         const errData = await res.json();
         throw new Error(errData.message || 'Save failed');
      }

      closeModal();
      fetchPortfolios();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`${API_URL}/api/portfolio/projects/${id}`, { method: 'DELETE', headers });
      if(!res.ok) throw new Error('Delete failed');
      fetchPortfolios();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 4. Modal Helper ---
  const openModal = (mode, item = null) => {
    if (mode === 'create') {
      setCreateForm({
        title: '',
        slug: '',
        description: '',
        cover_image_url: '',
        car_model_id: '',
        completion_date: new Date().toISOString().split('T')[0],
        is_featured: false,
        is_active: true,
        gallery_images: [],
        category_ids: []
      });
    } else if (item) {
      setCreateForm({
        title: item.title || '',
        slug: item.slug || '',
        description: item.description || '',
        cover_image_url: item.cover_image_url || '',
        car_model_id: item.car_model_id || '',
        completion_date: item.completion_date ? item.completion_date.split('T')[0] : '',
        is_featured: !!item.is_featured,
        is_active: typeof item.is_active !== 'undefined' ? item.is_active : true,
        gallery_images: item.gallery || [], 
        category_ids: item.categories?.map(c => c.portfolio_category_id || c.category_id) || []
      });
    }
    setCreateError('');
    setModal({ open: true, mode, portfolio: item });
  };

  const closeModal = () => setModal({ open: false, mode: 'view', portfolio: null });

  // --- Render ---
  return (
    <div className={styles.pageContainer}>
      
      {/* HEADER */}
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>Portfolio Management</h2>
            <HasPermission resource="portfolio" action="create">
                <button onClick={() => openModal('create')} className={styles.addButton}>
                <FaPlus /> Add Project
                </button>
            </HasPermission>
        </div>
        
        {/* --- FILTER BAR --- */}
        <div className={styles.controls} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Search */}
            <div className={styles.searchWrapper} style={{ flex: 1, minWidth: '200px' }}>
                <FaSearch className={styles.searchIcon} />
                <input
                    className={styles.searchInput}
                    placeholder="Search Projects..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>หมวดหมู่</label>
                <select
                    className={styles.filterSelect}
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '160px' }}
                >
                    <option value="">ทั้งหมด</option>
                    {categories.map(cat => (
                        <option key={cat.portfolio_category_id || cat.id} value={cat.portfolio_category_id || cat.id}>
                            {cat.category_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Car Model Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>รุ่นรถ</label>
                <select
                    className={styles.filterSelect}
                    value={carModelFilter}
                    onChange={e => { setCarModelFilter(e.target.value); setPage(1); }}
                    style={{ margin: 0, minWidth: '160px' }}
                >
                    <option value="">ทั้งหมด</option>
                    {carModels.map(model => (
                        <option key={model.car_model_id} value={model.car_model_id}>
                            {model.display_name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      
      {/* GRID VIEW */}
      {!loading && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px',
            padding: '10px 0'
          }}>
            {visible.length === 0 && <div style={{gridColumn: '1 / -1', textAlign:'center', padding: '30px'}}>No projects found.</div>}
            
            {visible.map((p) => (
                <div key={p.project_id || p.id} 
                    onClick={() => openModal('view', p)}
                    style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {/* Status Badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        <span style={{ 
                            background: p.is_active ? '#4CAF50' : '#e5e7eb',
                            color: p.is_active ? '#fff' : '#888',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Image */}
                    <div style={{ 
                        height: '180px', 
                        background: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #f0f0f0',
                        overflow: 'hidden'
                    }}>
                        <img 
                            src={p.cover_image_url ? (p.cover_image_url.startsWith('http') ? p.cover_image_url : `${API_URL}${p.cover_image_url}`) : PLACEHOLDER_IMG} 
                            alt={p.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                         {/* Category Badge */}
                         <div style={{ marginBottom: '6px' }}>
                             <span style={{ 
                                fontSize: '0.75rem', 
                                background: '#f3f4f6', 
                                color: '#666', 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                             }}>
                                 {p.category_names}
                             </span>
                         </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: '#333', lineHeight: 1.4, flex: 1 }}>
                                {p.title}
                            </h3>
                            {p.is_featured && <FaStar color="#FFC709" title="Featured" style={{ marginTop: 2, flexShrink: 0 }} />}
                        </div>

                        {/* Car Model & Date */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                             <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>
                                 {p.car_model_name}
                             </div>
                             <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', alignItems: 'center', gap: 5 }}>
                                 <span>{p.completion_date ? new Date(p.completion_date).toLocaleDateString('th-TH') : '-'}</span>
                                 {p.gallery?.length > 0 && (
                                     <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                                         <FaImages /> {p.gallery.length}
                                     </span>
                                 )}
                             </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div style={{ 
                        borderTop: '1px solid #f0f0f0', 
                        padding: '10px 16px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#fafafa'
                    }}>
                        <button onClick={(e) => { e.stopPropagation(); openModal('view', p); }} className={styles.iconBtn} title="View"><FaEye /></button>
                        
                        <HasPermission resource="portfolio" action="update">
                            <button onClick={(e) => { e.stopPropagation(); openModal('edit', p); }} className={styles.iconBtn} title="Edit"><FaEdit /></button>
                        </HasPermission>
                        
                        <HasPermission resource="portfolio" action="delete">
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(p.project_id || p.id); }} className={`${styles.iconBtn} ${styles.delete}`} title="Delete"><FaTrash /></button>
                        </HasPermission>
                    </div>
                </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className={styles.footer}>
            <div>Total {total} items</div>
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span style={{margin:'0 8px', fontWeight:600}}>Page {page} / {pageCount}</span>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* --- Modal --- */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ width: '900px', maxWidth: '95%' }}>
            <div className={styles.modalHeader}>
                <h3>
                {modal.mode === 'create' ? 'Create Project' : modal.mode === 'edit' ? 'Edit Project' : 'Project Details'}
                </h3>
                <button onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
            </div>
            
            {createError && <div className={styles.errorMessage}>{createError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
                
                {/* Left Column: Info */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Project Title *</label>
                      <input 
                        className={styles.formInput} type="text" value={createForm.title} required disabled={modal.mode === 'view'}
                        onChange={e => setCreateForm({...createForm, title: e.target.value})}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Slug (URL)</label>
                      <input
                        className={styles.formInput}
                        type="text"
                        value={createForm.slug}
                        disabled={modal.mode === 'view'}
                        onChange={e => setCreateForm({ ...createForm, slug: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                        placeholder="e.g. my-portfolio-project"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Categories</label>
                        <div style={{ border: '1px solid #d1d5db', padding: 10, borderRadius: 6, maxHeight: 150, overflowY: 'auto', background: modal.mode==='view'?'#f9f9f9':'#fff' }}>
                            {categories.map((cat) => (
                                <label key={cat.portfolio_category_id || cat.id} style={{display:'flex', alignItems:'center', gap:8, marginBottom:5, cursor: modal.mode==='view'?'default':'pointer'}}>
                                    <input 
                                            type="checkbox" 
                                            checked={createForm.category_ids.includes(cat.portfolio_category_id || cat.id)}
                                            onChange={() => handleCategoryToggle(cat.portfolio_category_id || cat.id)}
                                            disabled={modal.mode === 'view'}
                                    />
                                    <span style={{fontSize:'0.9rem'}}>{cat.category_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Car Model</label>
                        <select 
                            className={styles.formSelect} 
                            value={createForm.car_model_id}
                            onChange={e => setCreateForm({...createForm, car_model_id: e.target.value})}
                            disabled={modal.mode === 'view'}
                        >
                            <option value="">-- General / None --</option>
                            {carModels.map((c) => (
                                <option key={c.car_model_id || c.id} value={c.car_model_id || c.id}>
                                    {c.display_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Completion Date</label>
                        <input 
                            className={styles.formInput} type="date" 
                            value={createForm.completion_date} 
                            onChange={e => setCreateForm({...createForm, completion_date: e.target.value})}
                            disabled={modal.mode === 'view'}
                        />
                    </div>

                    <div className={styles.formGroup} style={{flexDirection:'row', gap:20, marginTop:10}}>
                        <label style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}>
                            <input 
                                type="checkbox" checked={createForm.is_featured} 
                                onChange={e => setCreateForm({...createForm, is_featured: e.target.checked})}
                                disabled={modal.mode === 'view'}
                            /> 
                            <span style={{fontSize:'0.9rem'}}>Featured Project</span>
                        </label>
                        <label style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}>
                            <input 
                                type="checkbox" checked={createForm.is_active} 
                                onChange={e => setCreateForm({...createForm, is_active: e.target.checked})}
                                disabled={modal.mode === 'view'}
                            /> 
                            <span style={{fontSize:'0.9rem'}}>Active (Show)</span>
                        </label>
                    </div>
                </div>

                {/* Right Column: Images */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Cover Image</label>
                        {modal.mode !== 'view' && (
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} disabled={uploadingImage} style={{marginBottom:5, fontSize:'0.85rem'}} />
                        )}
                        {createForm.cover_image_url && (
                            <img 
                                src={createForm.cover_image_url.startsWith('http') ? createForm.cover_image_url : `${API_URL}${createForm.cover_image_url}`} 
                                alt="Cover" 
                                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', marginTop:5 }} 
                            />
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Gallery Images ({createForm.gallery_images.length})</label>
                        {modal.mode !== 'view' && (
                            <div style={{marginBottom:10}}>
                                <label className={styles.btnCancel} style={{padding:'6px 12px', fontSize:'0.8rem', cursor:'pointer', display:'inline-block'}}>
                                    <FaPlus /> Upload More
                                    <input type="file" accept="image/*" multiple onChange={e => handleGalleryUpload(e.target.files[0])} style={{display:'none'}} />
                                </label>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns:'repeat(auto-fill, minmax(70px, 1fr))', gap: 8, border:'1px solid #e5e7eb', padding:10, borderRadius:6, maxHeight:200, overflowY:'auto' }}>
                            {createForm.gallery_images.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', height: 70 }}>
                                    <img 
                                            src={img.image_url.startsWith('http') ? img.image_url : `${API_URL}${img.image_url}`} 
                                            alt="gal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius:4, border: '1px solid #eee' }} 
                                    />
                                    {modal.mode !== 'view' && (
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveGalleryImage(idx)}
                                            style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', boxShadow:'0 1px 2px rgba(0,0,0,0.2)' }}
                                        ><FaTimes size={10}/></button>
                                    )}
                                </div>
                            ))}
                            {createForm.gallery_images.length === 0 && <span style={{gridColumn:'1/-1', color:'#999', fontSize:'0.8rem', textAlign:'center', padding:10}}>No additional images</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        <textarea 
                            className={styles.formTextarea} rows={4} 
                            value={createForm.description} 
                            onChange={e => setCreateForm({...createForm, description: e.target.value})}
                            disabled={modal.mode === 'view'}
                        />
                    </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.btnCancel}>
                    {modal.mode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modal.mode !== 'view' && (
                    <button type="submit" className={styles.btnSubmit} disabled={createLoading || uploadingImage}>
                        {createLoading ? 'Saving...' : 'Save Project'}
                    </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}