import React, { useState, useEffect, useRef, useMemo } from 'react';
// [CHANGE] Use Global Theme
import styles from '../../styles/AdminTheme.module.css';
import { FaVideo, FaPlay, FaStop, FaSync, FaExclamationTriangle, FaCircle } from 'react-icons/fa';

const API_BASE = 'https://apitop.gt7dev.com';

const LiveStreamPage = () => {
  const videoRef = useRef<any>(null);
  const hlsRef = useRef<any>(null);

  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [streamUrl, setStreamUrl] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = useMemo(() => ({ 'Content-Type': 'application/json' }), []);

  // Load cameras on mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cameras`);
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลกล้องได้');
      const data = await res.json();
      setCameras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const startStream = async () => {
    if (!selectedCameraId) {
      alert('กรุณาเลือกกล้องก่อน');
      return;
    }

    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cameras/${selectedCameraId}/start`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('ไม่สามารถเริ่มสตรีมได้');
      const data = await res.json();
      setStreamUrl(`${API_BASE}${data.hls}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopStream = async () => {
    if (!selectedCameraId) return;

    try {
      await fetch(`${API_BASE}/api/cameras/${selectedCameraId}/stop`, {
        method: 'POST',
        headers
      });
      setStreamUrl(null);

      // Cleanup HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Cleanup video element
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    } catch (err) {
      console.error('Stop stream error:', err);
    }
  };

  // Initialize HLS when streamUrl changes
  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;

    // Check if browser supports native HLS
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
    } else {
      // Use HLS.js for other browsers
      const loadHls = async () => {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(videoRef.current);
          hlsRef.current = hls;
        }
      };

      loadHls();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  const selectedCamera = cameras.find((c: any) => c.id === selectedCameraId);

  return (
    <div className={styles.pageContainer}>

      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <h2 className={styles.title}>CCTV Live Stream</h2>
            <div style={{fontSize:'0.9rem', color:'#666', marginTop:5}}>
                RTSP to HLS Viewer
            </div>
        </div>

        <button
          className={styles.btnSecondary}
          onClick={loadCameras}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FaSync className={loading ? 'fa-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh Cameras'}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20, alignItems: 'start' }}>

        {/* --- LEFT: Controls --- */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 15, borderBottom: '2px solid #ffc709', paddingBottom: 5 }}>Control Panel</h3>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Camera</label>
                <select
                    className={styles.formSelect}
                    value={selectedCameraId}
                    onChange={(e: any) => setSelectedCameraId(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- Select Camera --</option>
                    {cameras.map((cam: any) => (
                    <option key={cam.id} value={cam.id}>
                        {cam.name} ({cam.ip_address || 'N/A'})
                    </option>
                    ))}
                </select>
            </div>

            {selectedCamera && (
                <div style={{ background: '#f9fafb', padding: 15, borderRadius: 6, border: '1px solid #eee', marginBottom: 20, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>Status:</span>
                        {Number(selectedCamera.is_active) ? (
                            <span className={styles.statusActive}><FaCircle size={8} /> Active</span>
                        ) : (
                            <span className={styles.statusInactive}><FaCircle size={8} /> Disabled</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>IP Address:</span>
                        <span>{selectedCamera.ip_address || '-'}</span>
                    </div>
                    <div style={{ marginBottom: 5 }}>
                        <span style={{ fontWeight: 600 }}>RTSP URL:</span>
                    </div>
                    <div style={{ wordBreak: 'break-all', color: '#666', background: '#fff', padding: 5, borderRadius: 4, border: '1px dashed #ccc', fontSize: '0.8rem' }}>
                        {selectedCamera.rtsp_url}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
                <button
                    className={styles.btnSubmit}
                    onClick={startStream}
                    disabled={!selectedCameraId || !!streamUrl}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                    <FaPlay /> Start
                </button>
                <button
                    className={styles.btnCancel}
                    onClick={stopStream}
                    disabled={!streamUrl}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: streamUrl ? '#fee2e2' : '#f3f4f6', color: streamUrl ? '#ef4444' : '#9ca3af', borderColor: streamUrl ? '#fecaca' : '#e5e7eb' }}
                >
                    <FaStop /> Stop
                </button>
            </div>
        </div>

        {/* --- RIGHT: Video Player --- */}
        <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {streamUrl ? (
                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            ) : (
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <FaVideo size={60} style={{ marginBottom: 20, opacity: 0.5 }} />
                    <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Ready to stream</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Select a camera and press Start</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default LiveStreamPage;