import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

// Simple script loader that avoids adding the same script twice
function loadScript(src: string): Promise<void> {
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

interface ShopMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  address?: string;
  markerTitle?: string;
  className?: string;
  height?: string;
}

/**
 * ShopMap — แสดงแผนที่ร้าน (Google Maps JS API ถ้ามี key, ไม่งั้น fallback เป็น iframe)
 */
export default function ShopMap({
  lat = 13.736717,
  lng = 100.523186,
  zoom = 15,
  address = '',
  markerTitle = 'GT7 Motor',
  className = '',
  height = '320px',
}: ShopMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let map: any;
    let marker: any;

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
      .catch(() => {
        // script load failed - iframe fallback will show
      });

    return () => {
      cancelled = true;
      if (marker) marker.setMap(null);
      map = null;
    };
  }, [apiKey, lat, lng, zoom, markerTitle]);

  const wrapperCls = `w-full overflow-hidden rounded-md bg-[#f0f0f0] shadow-[0_1px_4px_rgba(0,0,0,0.15)] max-[480px]:rounded-none ${className}`;

  // If no API key, render an iframe fallback using address or lat/lng
  if (!apiKey) {
    const src = address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

    return (
      <div className={wrapperCls} style={{ height }}>
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
    <div className={wrapperCls} style={{ height }}>
      <div ref={mapEl} className="h-full w-full" />
    </div>
  );
}
