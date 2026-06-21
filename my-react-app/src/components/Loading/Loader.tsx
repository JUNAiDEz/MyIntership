import type { CSSProperties } from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  size?: number;
  className?: string;
}

// อนิเมชันแบบ custom (keyframes/CSS-var) เก็บไว้ใน Loader.module.css ตามดีไซน์เดิม
const Loader = ({ size = 64, className = '' }: LoaderProps) => {
  const style = { '--loader-size': `${size}px` } as CSSProperties;

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
