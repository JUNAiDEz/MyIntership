import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

// ถ้าไม่ได้ set env ไว้ ให้ใช้ empty string ป้องกัน error
const API_URL = import.meta.env.VITE_API_URL || '';

interface LoginModalProps {
  onClose?: () => void;
}

const inputFormCls =
  'box-border flex h-12 w-full items-center rounded-[10px] border-[1.5px] border-[#ecedec] bg-white px-3 transition-all duration-200 focus-within:border-[#2d79f3] focus-within:shadow-[0_0_0_3px_rgba(45,121,243,0.1)]';
const inputCls = 'ml-2.5 h-full w-full border-none bg-transparent text-sm text-[#333] outline-none';
const labelCls = 'mb-1 block text-sm font-semibold text-[#151717]';
const spanCls = 'cursor-pointer text-[13px] font-semibold text-[#2d79f3]';
const socialBtnCls =
  'flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#ecedec] bg-white text-sm font-medium text-[#333] transition-all duration-200 hover:border-[#d1d1d1] hover:bg-[#f9f9f9] max-[480px]:px-[5px] max-[480px]:text-[13px]';

export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] box-border flex h-screen w-screen items-center justify-center bg-black/50 p-5 backdrop-blur-[3px] max-[480px]:p-[15px]"
      onMouseDown={onClose}
    >
      {/* stopPropagation เพื่อให้คลิกที่กล่องแล้ว Modal ไม่ปิด */}
      <div
        className="relative max-h-[90vh] w-full max-w-[400px] animate-modal-in overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>

          <div>
            <label className={labelCls}>Username or Email</label>
          </div>
          <div className={inputFormCls}>
            <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>
            <input type="text" className={inputCls} placeholder="Enter your Username or Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Password</label>
          </div>
          <div className={inputFormCls}>
            <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path></svg>
            <input type="password" className={inputCls} placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <svg viewBox="0 0 576 512" height="16" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path></svg>
          </div>

          <div className="mt-[5px] flex w-full flex-row items-center justify-between max-[480px]:flex-wrap max-[480px]:gap-2.5">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe" style={{ marginLeft: 6, cursor: 'pointer' }}>Remember me</label>
            </div>
            <span className={spanCls}>Forgot password?</span>
          </div>

          {error && <div className="box-border w-full rounded-lg border border-[#fecaca] bg-[#fee2e2] p-2.5 text-center text-[13px] text-[#b91c1c]">{error}</div>}

          <button
            className="mb-2.5 mt-[15px] h-12 w-full cursor-pointer rounded-[10px] border-none bg-[#151717] text-[15px] font-semibold text-white transition-[transform,background-color] duration-100 hover:bg-[#252727] active:scale-[0.98]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <p className="my-[5px] text-center text-sm text-[#666]">Don't have an account? <span className={spanCls}>Sign Up</span></p>

          <div className="relative my-3 text-center">
            <span className="bg-white px-2.5 text-xs uppercase tracking-[1px] text-[#999]">Or With</span>
          </div>

          <div className="mt-[5px] flex w-full flex-row items-center justify-between max-[480px]:flex-wrap max-[480px]:gap-2.5">
            <button type="button" className={socialBtnCls} onClick={() => alert('google')}>
              <svg version="1.1" width="20" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512"><path style={{ fill: '#FBBB00' }} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"/></svg>
              Google
            </button>
            <button type="button" className={socialBtnCls} onClick={() => alert('facebook')}>
              <svg version="1.1" height="20" width="20" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 22.773 22.773"><g><g><path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"/></g></g></svg>
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ใช้ createPortal ยิงไปที่ document.body โดยตรง
  return createPortal(modalContent, document.body);
}
