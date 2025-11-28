import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './YellowNavbar.module.css';
import LoginModal from '../Auth/LoginModal';

const YellowNavbar = () => {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();

  useEffect(() => {
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


      <button className={styles.button} aria-label="User" onClick={() => requireLogin('/dashboard')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
          <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"></path>
        </svg>
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default YellowNavbar;
