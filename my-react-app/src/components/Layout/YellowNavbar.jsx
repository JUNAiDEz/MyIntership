import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './YellowNavbar.module.css';
import LoginModal from '../Auth/LoginModal';

const YellowNavbar = () => {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const location = useLocation();

  useEffect(() => {
    // Check login status and decode token to get role
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
    
    if (token) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    
    // If redirected with ?login=1, open the login modal automatically
    if (location && location.search && location.search.includes('login=1')) {
      setShowLogin(true);
      // remove query param without adding history entry
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const requireLogin = (targetPath) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setShowLogin(true);
      return false;
    }
    if (targetPath) navigate(targetPath);
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      setShowUserMenu(!showUserMenu);
    } else {
      requireLogin('/dashboard');
    }
  };

  return (
    <div className={styles.buttonContainer} aria-hidden={false}>
      <button className={styles.button} aria-label="Like" onClick={() => requireLogin('/dashboard')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <button className={styles.button} aria-label="Cart" onClick={() => requireLogin('/shop')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </button>


      <div className={styles.userButtonWrapper}>
        <button className={styles.button} aria-label="User" onClick={handleUserClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
            <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"></path>
          </svg>
        </button>

        {isLoggedIn && showUserMenu && (
          <div className={styles.userDropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.userAvatar}>
                {userRole === 'Admin' ? 'A' : userRole === 'HighestAdmin' ? 'H' : 'U'}
              </div>
              <span className={styles.userName}>{userRole || 'User'}</span>
            </div>
            <div className={styles.dropdownDivider}></div>
            
            {/* แสดงเมนู Dashboard สำหรับ Admin และ HighestAdmin */}
            {(userRole === 'Admin' || userRole === 'HighestAdmin') && (
              <button className={styles.dropdownItem} onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                แดชบอร์ด
              </button>
            )}
            
            <button className={styles.dropdownItem} onClick={() => { navigate('/'); setShowUserMenu(false); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              ข้อมูลส่วนตัว
            </button>
            <div className={styles.dropdownDivider}></div>
            <button className={styles.dropdownItem} onClick={handleLogout} style={{ color: '#ff4d4f' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default YellowNavbar;
