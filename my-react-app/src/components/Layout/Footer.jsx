import React from 'react';
import styles from './Footer.module.css';

// Import ไอคอนที่เราจะใช้
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaPinterestP,
  FaGift, FaHeadset, FaUndoAlt, FaLock
} from 'react-icons/fa';

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.container}>
        
        {/* ===== 1. FOOTER MAIN (4 คอลัมน์) ===== */}
        <div className={styles.footerGrid}>
          
          {/* Column 1: ABOUT US */}
          <div className={styles.footerColumn}>
            <h3>ABOUT US</h3>
            <p>
              Corporate clients and leisure travelers has been relying on 
              Groundlink for dependable, safe, and professional chauffeured 
              car and service in major cities across World.
            </p>
            <div className={styles.socialIcons}>
              <a href="https://www.facebook.com/" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://x.com/" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://www.instagram.com/" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://www.pinterest.com/" aria-label="Pinterest"><FaPinterestP /></a>
            </div>
          </div>

          {/* Column 2: MY ACCOUNT */}
          <div className={styles.footerColumn}>
            <h3>MY ACCOUNT</h3>
            <ul className={styles.footerLinks}>
              <li><a href="#">My Account</a></li>
              <li><a href="#">Shopping Cart</a></li>
              <li><a href="#">Login</a></li>
              <li><a href="#">Register</a></li>
              <li><a href="#">Checkout</a></li>
            </ul>
          </div>

          {/* Column 3: RESOURCES */}
          <div className={styles.footerColumn}>
            <h3>RESOURCES</h3>
            <ul className={styles.footerLinks}>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Wishlist</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Frequently</a></li>
            </ul>
          </div>

          {/* Column 4: FIND IT FAST */}
          <div className={styles.footerColumn}>
            <h3>FIND IT FAST</h3>
            <ul className={styles.footerLinks}>
              <li><a href="#">Smartphone ablet</a></li>
              <li><a href="#">Computer Laptop</a></li>
              <li><a href="#">TV & Audio</a></li>
              <li><a href="#">Car Accessories</a></li>
              <li><a href="#">Cameras Photos</a></li>
            </ul>
          </div>
        </div>

        {/* ===== 2. FOOTER FEATURES (แถบล่างสุด) ===== */}
        <div className={styles.footerFeatures}>
          <div className={styles.featureItem}>
            <FaGift size={36} />
            <div className={styles.featureText}>
              <h4>Free Shipping</h4>
              <p>Free shipping over $100</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaHeadset size={36} />
            <div className={styles.featureText}>
              <h4>Support 24/7</h4>
              <p>Contact us 24 hours a day</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaUndoAlt size={36} />
            <div className={styles.featureText}>
              <h4>100% Money Back</h4>
              <p>You have 30 days to return</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FaLock size={36} />
            <div className={styles.featureText}>
              <h4>Payment Secure</h4>
              <p>We ensure secure payment</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;