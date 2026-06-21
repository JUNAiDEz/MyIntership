import type { ReactNode } from 'react';
import { usePermissions } from './usePermissions';
import type { Permission } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  resource: string;
  action?: string;
}

// Component สำหรับป้องกันหน้าที่ต้องการสิทธิ์
export const ProtectedRoute = ({ children, resource, action = 'read' }: ProtectedRouteProps) => {
  const { hasPermission, userRole, loading } = usePermissions();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '16px',
        color: '#666',
      }}>
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  // HighestAdmin เข้าได้ทุกหน้า
  if (userRole === 'HighestAdmin') {
    return children;
  }

  // ตรวจสอบสิทธิ์
  if (!hasPermission(resource, action)) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
        <h2 style={{ color: '#ff4d4f', marginBottom: '12px' }}>ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
          คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          ต้องการสิทธิ์: <strong>{resource}.{action}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '24px',
            padding: '10px 24px',
            background: '#ffc709',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ← กลับ
        </button>
      </div>
    );
  }

  return children;
};

interface HasPermissionProps {
  resource: string;
  action?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

// Component สำหรับซ่อน/แสดง Element ตามสิทธิ์
export const HasPermission = ({ resource, action = 'read', children, fallback = null }: HasPermissionProps) => {
  const { hasPermission, userRole } = usePermissions();

  if (userRole === 'HighestAdmin') {
    return children;
  }

  if (!hasPermission(resource, action)) {
    return fallback;
  }

  return children;
};

interface HasAnyPermissionProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Component สำหรับซ่อน/แสดง Element ถ้ามีสิทธิ์อย่างใดอย่างหนึ่ง
export const HasAnyPermission = ({ permissions, children, fallback = null }: HasAnyPermissionProps) => {
  const { hasAnyPermission, userRole } = usePermissions();

  if (userRole === 'HighestAdmin') {
    return children;
  }

  if (!hasAnyPermission(permissions)) {
    return fallback;
  }

  return children;
};
