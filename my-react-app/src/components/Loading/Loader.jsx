import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ size = 64, className = '' }) => {
  const style = { '--loader-size': `${size}px` };

  return (
    <div className={`${styles.loader} ${className}`} style={style} role="status" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={styles.circle}>
          <div className={styles.dot} />
          <div className={styles.outline} />
        </div>
      ))}
    </div>
  );
};

export default Loader;
