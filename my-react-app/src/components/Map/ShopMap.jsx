import React, { useEffect, useRef } from 'react';
import styles from './ShopMap.module.css';

// Simple script loader that avoids adding the same script twice
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // already added, wait until google.maps available
      const check = () => {
        if (window.google && window.google.maps) return resolve();
        setTimeout(check, 100);
      };
      return check();
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

/**
 * ShopMap
 * Props:
 * - lat, lng: number (required if using Google Maps JS API)
 * - zoom: number (default 15)
 * - address: string (used for iframe fallback)
 * - markerTitle: string
 * - className: extra className for outer wrapper
 * - height: css height (e.g. '300px')
 */
export default function ShopMap({
  lat = 13.736717,
  lng = 100.523186,
  zoom = 15,
  address = '',
  markerTitle = 'GT7 Motor',
  className = '',
  height = '320px',
}) {
  const mapEl = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let map;
    let marker;

    if (!apiKey) return; // no API key -> fallback to iframe

    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    let cancelled = false;

    loadScript(src)
      .then(() => {
        if (cancelled) return;
        if (!mapEl.current) return;
        const center = { lat: Number(lat), lng: Number(lng) };
        map = new window.google.maps.Map(mapEl.current, {
          center,
          zoom,
          disableDefaultUI: false,
        });

        marker = new window.google.maps.Marker({
          position: center,
          map,
          title: markerTitle,
        });
      })
      .catch((err) => {
        // script load failed - nothing to do, iframe fallback will show
        // console.warn('Google Maps script failed to load', err);
      });

    return () => {
      cancelled = true;
      // try to remove marker/map references
      if (marker) marker.setMap(null);
      map = null;
    };
  }, [apiKey, lat, lng, zoom, markerTitle]);

  // If no API key, render an iframe fallback using address or lat/lng
  if (!apiKey) {
    const src = address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

    return (
      <div className={`${styles.mapWrapper} ${className}`} style={{ height }}>
        <iframe
          title="Shop location"
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className={`${styles.mapWrapper} ${className}`} style={{ height }}>
      <div ref={mapEl} className={styles.mapInner} />
    </div>
  );
}
