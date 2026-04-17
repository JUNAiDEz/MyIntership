import React, { useState, useEffect, useMemo } from 'react';
import styles from '../../styles/AdminTheme.module.css'; 
import { FaEdit, FaTrash, FaPlus, FaEye, FaBan, FaCheckCircle, FaLock, FaSave, FaTimes, FaSearch, FaUserShield, FaUserCog, FaUsers } from 'react-icons/fa';
import { API_URL } from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';

const getToken = () => localStorage.getItem('adminToken');

const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.role_name || payload.roleName;
  } catch (error) {
    return null;
  }
};

function UserManagementPage() {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'userPermissions' | 'permissions'
  
  // --- Main State ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);

  // --- UI Controls ---
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Modal & Form ---
  const [modal, setModal] = useState({ open: false, mode: 'view', user: null });
  const [createForm, setCreateForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '',
    phone_number: '', position: '', role_id: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- Permission States ---
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState([]);
  const [editingUserPermissions, setEditingUserPermissions] = useState(false);
  const [savingUserPerm, setSavingUserPerm] = useState(false);

  const [showCreatePermModal, setShowCreatePermModal] = useState(false);
  const [permForm, setPermForm] = useState({ resource: '', action: '', description: '' });
  const [permLoading, setPermLoading] = useState(false);

  const headers = useMemo(() => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [roleRes, userRes, permRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/roles`, { headers }),
        fetch(`${API_URL}/api/auth/employees`, { headers }),
        fetch(`${API_URL}/api/auth/permissions`, { headers })
      ]);

      if (roleRes.ok) setRoles(await roleRes.json());
      if (userRes.ok) setUsers(await userRes.json());
      if (permRes.ok) {
          const data = await permRes.json();
          setPermissions(data.data || data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const role = getUserRole();
    setUserRole(role);
    fetchData(); 
  }, []);

  // --- 2. Filtering & Pagination ---
  const filteredUsers = users.filter(u => {
      let searchOk = true;
      let roleOk = true;

      if (debouncedSearch) {
          const lower = debouncedSearch.toLowerCase();
          searchOk = u.first_name?.toLowerCase().includes(lower) || 
                     u.last_name?.toLowerCase().includes(lower) || 
                     u.User?.username?.toLowerCase().includes(lower);
      }

      if (roleFilter) {
          roleOk = Number(u.User?.role_id) === Number(roleFilter);
      }

      return searchOk && roleOk;
  });

  const total = filteredUsers.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visible = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // --- 3. Actions ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      const payload = { ...createForm, role_id: Number(createForm.role_id) };
      const res = await fetch(`${API_URL}/api/auth/employees`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create user');
      setModal({ open: false, mode: 'view', user: null });
      fetchData();
    } catch (err) { setCreateError(err.message); } 
    finally { setCreateLoading(false); }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Confirm ${currentStatus ? 'suspend' : 'activate'} user?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/status`, { method: 'PATCH', headers });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) { alert(err.message); }
  };

  // --- Permissions Logic ---
  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/roles/${roleId}/permissions`, { headers });
      if (res.ok) {
          const data = await res.json();
          setSelectedRolePermissions((data.data.permissions_table || []).map(p => p.permission_id));
      }
    } catch (err) { console.error(err); }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    setEditingPermissions(false);
    fetchRolePermissions(roleId);
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/auth/roles/${selectedRoleId}/permissions`, {
        method: 'POST', headers, body: JSON.stringify({ permission_ids: selectedRolePermissions })
      });
      setEditingPermissions(false);
      fetchData();
    } catch (err) { alert(err.message); } 
    finally { setSaving(false); }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/permissions`, { headers });
      if (res.ok) {
          const data = await res.json();
          setSelectedUserPermissions((data.data || []).map(p => p.permission_id));
      }
    } catch (err) { console.error(err); }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setEditingUserPermissions(false);
    fetchUserPermissions(userId);
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUserId) return;
    setSavingUserPerm(true);
    try {
      await fetch(`${API_URL}/api/auth/users/${selectedUserId}/permissions`, {
        method: 'POST', headers, body: JSON.stringify({ permission_ids: selectedUserPermissions })
      });
      setEditingUserPermissions(false);
      fetchData();
    } catch (err) { alert(err.message); } 
    finally { setSavingUserPerm(false); }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    setPermLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/auth/permissions`, { method: 'POST', headers, body: JSON.stringify(permForm) });
        if(res.ok) {
            setShowCreatePermModal(false);
            setPermForm({ resource: '', action: '', description: '' });
            fetchData();
        }
    } catch(err) { alert(err.message); }
    finally { setPermLoading(false); }
  };

  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(perm => {
      if (perm.resource === 'customers') return;
      if (!groups[perm.resource]) groups[perm.resource] = [];
      groups[perm.resource].push(perm);
    });
    return groups;
  }, [permissions]);

  const selectedUser = users.find(u => u.user_id === selectedUserId);
  const selectedRole = roles.find(r => r.role_id === selectedRoleId);

  // --- Modal Helpers ---
  const openModal = (mode, user = null) => {
    if (mode === 'create') {
      setCreateForm({ username: '', email: '', password: '', first_name: '', last_name: '', phone_number: '', position: '', role_id: roles[0]?.role_id || '' });
    }
    setCreateError('');
    setModal({ open: true, mode, user });
  };
  const closeModal = () => setModal({ open: false, mode: 'view', user: null });

  if (userRole && userRole !== 'HighestAdmin') {
    return <div className={styles.pageContainer}><div style={{textAlign:'center', padding:50}}>🚫 Access Denied</div></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.title}>User Management</h2>
            <div style={{display:'flex', gap:10}}>
                {activeTab === 'users' && (
                    <button onClick={() => openModal('create')} className={styles.addButton}>
                        <FaPlus /> Add User
                    </button>
                )}
                {activeTab === 'permissions' && (
                    <button onClick={() => setShowCreatePermModal(true)} className={styles.addButton}>
                        <FaPlus /> New Permission
                    </button>
                )}
            </div>
        </div>

        {/* CONTROLS & TABS */}
        <div className={styles.controls} style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexWrap:'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 15 }}>
            {/* TABS */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setActiveTab('users')} style={{ padding: '8px 16px', border: 'none', background: activeTab === 'users' ? '#ffc709' : '#e5e7eb', color: activeTab === 'users' ? '#000' : '#666', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaUsers /> Users
                </button>
                <button onClick={() => setActiveTab('userPermissions')} style={{ padding: '8px 16px', border: 'none', background: activeTab === 'userPermissions' ? '#ffc709' : '#e5e7eb', color: activeTab === 'userPermissions' ? '#000' : '#666', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaUserCog /> User Perms
                </button>
                <button onClick={() => setActiveTab('permissions')} style={{ padding: '8px 16px', border: 'none', background: activeTab === 'permissions' ? '#ffc709' : '#e5e7eb', color: activeTab === 'permissions' ? '#000' : '#666', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaUserShield /> Roles & Perms
                </button>
            </div>

            {/* SEARCH & FILTERS (Only for Users tab) */}
            {activeTab === 'users' && (
                <div style={{ display: 'flex', gap: 10, flexWrap:'wrap', flex: 1, justifyContent:'flex-end' }}>
                    <div className={styles.searchWrapper} style={{ minWidth: '200px' }}>
                        <FaSearch className={styles.searchIcon} />
                        <input className={styles.searchInput} placeholder="Search Name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <select className={styles.filterSelect} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                        <option value="">All Roles</option>
                        {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                    </select>
                </div>
            )}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* --- CONTENT: USERS GRID --- */}
      {!loading && activeTab === 'users' && (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '10px 0' }}>
                {visible.map(user => (
                    <div key={user.user_id} 
                        style={{
                            background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column',
                            position: 'relative', transition: 'transform 0.2s', cursor: 'pointer'
                        }}
                        onClick={() => openModal('view', user)}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {/* Status Badge */}
                        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                            <span style={{ 
                                background: user.User?.is_active ? '#4CAF50' : '#ef4444',
                                color: '#fff', padding: '4px 10px', borderRadius: '20px',
                                fontSize: '0.75rem', fontWeight: 'bold'
                            }}>
                                {user.User?.is_active ? 'Active' : 'Suspended'}
                            </span>
                        </div>

                        {/* Top Info */}
                        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 15, borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#ffc709', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {user.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.first_name} {user.last_name}</h3>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>@{user.User?.username}</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Role:</span>
                                <span style={{ fontWeight: 600 }}>{user.User?.role?.role_name || '-'}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Position:</span>
                                <span>{user.position || '-'}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Phone:</span>
                                <span>{user.phone_number || '-'}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); openModal('view', user); }} className={styles.iconBtn} title="View"><FaEye /></button>
                            {userRole === 'HighestAdmin' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.user_id, user.User?.is_active); }} 
                                    className={styles.iconBtn}
                                    style={{ color: user.User?.is_active ? '#ef4444' : '#10b981' }}
                                    title={user.User?.is_active ? 'Suspend' : 'Activate'}
                                >
                                    {user.User?.is_active ? <FaBan /> : <FaCheckCircle />}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {visible.length === 0 && <div style={{gridColumn: '1/-1', textAlign:'center', padding:40}}>No users found.</div>}
            </div>
            
            {/* Pagination */}
            <div className={styles.footer}>
                <div>Total {total} users</div>
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    <span style={{margin:'0 8px', fontWeight:600}}>Page {page} / {pageCount}</span>
                    <button className={styles.pageBtn} disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>
        </>
      )}

      {/* --- CONTENT: USER PERMISSIONS --- */}
      {!loading && activeTab === 'userPermissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginTop: 10 }}>
            {/* Left: User List */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 10px 0', padding: '0 10px' }}>Select User</h4>
                {users.map(u => (
                    <div key={u.user_id} 
                        onClick={() => handleUserSelect(u.user_id)}
                        style={{
                            padding: '10px', borderRadius: 6, cursor: 'pointer', marginBottom: 5,
                            background: selectedUserId === u.user_id ? '#fffbeb' : 'transparent',
                            border: selectedUserId === u.user_id ? '1px solid #ffc709' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}
                    >
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {u.first_name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>@{u.User?.username}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right: Permissions */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {!selectedUser ? <div style={{textAlign:'center', color:'#999', marginTop:50}}>Select a user to manage permissions</div> : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}>Permissions: {selectedUser.first_name}</h3>
                            {editingUserPermissions ? (
                                <div style={{display:'flex', gap:10}}>
                                    <button onClick={() => { setEditingUserPermissions(false); fetchUserPermissions(selectedUserId); }} className={styles.btnCancel}>Cancel</button>
                                    <button onClick={handleSaveUserPermissions} className={styles.btnSubmit} disabled={savingUserPerm}>Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setEditingUserPermissions(true)} className={styles.addButton}><FaEdit /> Edit</button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {Object.entries(groupedPermissions).map(([res, perms]) => (
                                <div key={res} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15 }}>
                                    <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{res}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                        {perms.map(p => (
                                            <label key={p.permission_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: editingUserPermissions ? 'pointer' : 'default' }}>
                                                <input type="checkbox" checked={selectedUserPermissions.includes(p.permission_id)} onChange={() => { if(editingUserPermissions) setSelectedUserPermissions(prev => prev.includes(p.permission_id) ? prev.filter(id => id !== p.permission_id) : [...prev, p.permission_id]); }} disabled={!editingUserPermissions} style={{accentColor:'#ffc709'}} />
                                                {p.action}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- CONTENT: ROLE PERMISSIONS --- */}
      {!loading && activeTab === 'permissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginTop: 10 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                <h4 style={{ margin: '0 0 10px 0', padding: '0 10px' }}>Select Role</h4>
                {roles.map(r => (
                    <div key={r.role_id} onClick={() => handleRoleSelect(r.role_id)}
                        style={{
                            padding: '12px', borderRadius: 6, cursor: 'pointer', marginBottom: 5,
                            background: selectedRoleId === r.role_id ? '#fffbeb' : 'transparent',
                            border: selectedRoleId === r.role_id ? '1px solid #ffc709' : '1px solid transparent',
                            fontWeight: selectedRoleId === r.role_id ? 'bold' : 'normal'
                        }}
                    >
                        {r.role_name}
                    </div>
                ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {!selectedRole ? <div style={{textAlign:'center', color:'#999', marginTop:50}}>Select a role</div> : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}>Permissions: {selectedRole.role_name}</h3>
                            {editingPermissions ? (
                                <div style={{display:'flex', gap:10}}>
                                    <button onClick={() => { setEditingPermissions(false); fetchRolePermissions(selectedRoleId); }} className={styles.btnCancel}>Cancel</button>
                                    <button onClick={handleSavePermissions} className={styles.btnSubmit} disabled={saving}>Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setEditingPermissions(true)} className={styles.addButton}><FaEdit /> Edit</button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {Object.entries(groupedPermissions).map(([res, perms]) => (
                                <div key={res} style={{ border: '1px solid #eee', borderRadius: 8, padding: 15 }}>
                                    <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{res}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                        {perms.map(p => (
                                            <label key={p.permission_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: editingPermissions ? 'pointer' : 'default' }}>
                                                <input type="checkbox" checked={selectedRolePermissions.includes(p.permission_id)} onChange={() => { if(editingPermissions) setSelectedRolePermissions(prev => prev.includes(p.permission_id) ? prev.filter(id => id !== p.permission_id) : [...prev, p.permission_id]); }} disabled={!editingPermissions} style={{accentColor:'#ffc709'}} />
                                                {p.action}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- MODALS (Create User / View User / Create Permission) --- */}
      {modal.open && (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <div className={styles.modalHeader}>
                    <h3>{modal.mode === 'create' ? 'Add User' : 'User Details'}</h3>
                    <button onClick={closeModal} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes size={18}/></button>
                </div>
                {modal.mode === 'view' ? (
                    <div style={{ padding: '10px 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 15, marginBottom: 20 }}>
                            <strong>Name:</strong> <span>{modal.user?.first_name} {modal.user?.last_name}</span>
                            <strong>Username:</strong> <span>{modal.user?.User?.username}</span>
                            <strong>Email:</strong> <span>{modal.user?.User?.email || '-'}</span>
                            <strong>Role:</strong> <span>{modal.user?.User?.role?.role_name}</span>
                            <strong>Position:</strong> <span>{modal.user?.position || '-'}</span>
                            <strong>Status:</strong> <span>{modal.user?.User?.is_active ? 'Active' : 'Suspended'}</span>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={closeModal} className={styles.btnCancel}>Close</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {createError && <div className={styles.errorMessage}>{createError}</div>}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Username *</label>
                                <input className={styles.formInput} value={createForm.username} onChange={e => setCreateForm({...createForm, username: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Password *</label>
                                <input className={styles.formInput} type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>First Name *</label>
                                <input className={styles.formInput} value={createForm.first_name} onChange={e => setCreateForm({...createForm, first_name: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Last Name *</label>
                                <input className={styles.formInput} value={createForm.last_name} onChange={e => setCreateForm({...createForm, last_name: e.target.value})} required />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input className={styles.formInput} type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Phone</label>
                                <input className={styles.formInput} value={createForm.phone_number} onChange={e => setCreateForm({...createForm, phone_number: e.target.value})} />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Position</label>
                                <input className={styles.formInput} value={createForm.position} onChange={e => setCreateForm({...createForm, position: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Role *</label>
                                <select className={styles.formSelect} value={createForm.role_id} onChange={e => setCreateForm({...createForm, role_id: e.target.value})} required>
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button type="button" onClick={closeModal} className={styles.btnCancel}>Cancel</button>
                            <button type="submit" className={styles.btnSubmit} disabled={createLoading}>Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* Permission Modal */}
      {showCreatePermModal && (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}><h3>New Permission</h3><button onClick={() => setShowCreatePermModal(false)} style={{background:'none', border:'none', cursor:'pointer'}}><FaTimes/></button></div>
                <form onSubmit={handleCreatePermission}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Resource *</label>
                        <input className={styles.formInput} value={permForm.resource} onChange={e => setPermForm({...permForm, resource: e.target.value})} required placeholder="e.g. products" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Action *</label>
                        <select className={styles.formSelect} value={permForm.action} onChange={e => setPermForm({...permForm, action: e.target.value})} required>
                            <option value="">Select Action</option>
                            <option value="create">create</option><option value="read">read</option><option value="update">update</option><option value="delete">delete</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        <input className={styles.formInput} value={permForm.description} onChange={e => setPermForm({...permForm, description: e.target.value})} />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={() => setShowCreatePermModal(false)} className={styles.btnCancel}>Cancel</button>
                        <button type="submit" className={styles.btnSubmit} disabled={permLoading}>Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;