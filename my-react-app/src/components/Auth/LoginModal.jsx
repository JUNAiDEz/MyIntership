import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // 1. Import createPortal
import { useNavigate } from 'react-router-dom';
import styles from './LoginModal.module.css';

// ถ้าไม่ได้ set env ไว้ ให้ใช้ empty string ป้องกัน error
const API_URL = import.meta.env.VITE_API_URL || '';

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Store token and user
      const token = data.token || data.accessToken || data.access_token || '';
      const user = data.user || data;
      if (token) localStorage.setItem('adminToken', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      // Check role
      const role = user?.role || (user?.roles && (Array.isArray(user.roles) ? user.roles[0] : user.roles));
      const hasAdmin = (role && (role === 'admin' || role === 'administrator')) || (user?.roles && user.roles.includes && user.roles.includes('admin'));
      
      if (onClose) onClose(); // ปิด Modal ก่อนเปลี่ยนหน้า

      if (hasAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  // 2. สร้างตัวแปรเก็บ JSX ของ Modal
  const modalContent = (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      {/* stopPropagation เพื่อให้คลิกที่กล่องแล้ว Modal ไม่ปิด */}
      <div className={styles.modalBox} onMouseDown={(e) => e.stopPropagation()}>
        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles['flex-column']}>
            <label>Username or Email</label>
          </div>
          <div className={styles.inputForm}>
            <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>
            <input type="text" className={styles.input} placeholder="Enter your Username or Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className={styles['flex-column']}>
            <label>Password</label>
          </div>
          <div className={styles.inputForm}>
            <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path></svg>
            <input type="password" className={styles.input} placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <svg viewBox="0 0 576 512" height="16" xmlns="http://www.w3.org/2000/svg" style={{cursor: 'pointer'}}><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path></svg>
          </div>

          <div className={styles['flex-row']}>
            <div style={{display:'flex', alignItems:'center'}}>
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe" style={{ marginLeft: 6, cursor:'pointer' }}>Remember me</label>
            </div>
            <span className={styles.span}>Forgot password?</span>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button className={styles['button-submit']} type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <p className={styles.p}>Don't have an account? <span className={styles.span}>Sign Up</span></p>

          <div className={styles.dividerContainer}>
            <span className={styles.p + ' ' + styles.line}>Or With</span>
          </div>

          <div className={styles['flex-row']}>
            <button type="button" className={styles.btn + ' ' + styles.google} onClick={() => alert('google')}>
              <svg version="1.1" width="20" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512"><path style={{fill:'#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"/></svg>
              Google
            </button>
            <button type="button" className={styles.btn + ' ' + styles.apple} onClick={() => alert('facebook')}>
              <svg version="1.1" height="20" width="20" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 22.773 22.773"><g><g><path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"/></g></g></svg>
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 3. ใช้ createPortal ยิงไปที่ document.body โดยตรง
  return createPortal(modalContent, document.body);
}