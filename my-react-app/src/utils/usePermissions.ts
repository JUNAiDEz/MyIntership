import { useState, useEffect } from 'react';
import { API_URL } from './api';
import type { JwtPayload, Permission } from '@/types';

interface PermissionRow {
  resource: string;
  action: string;
}

export interface UsePermissionsResult {
  permissions: string[];
  loading: boolean;
  userRole: string | null;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (permsList: Permission[]) => boolean;
  canAccessResource: (resource: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

// Hook สำหรับเช็คสิทธิ์ของ User
export const usePermissions = (): UsePermissionsResult => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode token to get user info
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      const userId = payload.id;
      const role = payload.role ?? null;

      setUserRole(role);

      // Fetch user-specific permissions
      const response = await fetch(`${API_URL}/api/auth/users/${userId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as { data?: PermissionRow[] };
        const userPerms = data.data || [];

        // แปลง permissions เป็น array ของ "resource.action"
        const permsList = userPerms.map((p) => `${p.resource}.${p.action}`);
        setPermissions(permsList);
      } else {
        // ถ้าไม่มี user permissions ให้ดึงจาก role
        const roleId = payload.role_id;
        if (roleId) {
          const roleResponse = await fetch(`${API_URL}/api/auth/roles/${roleId}/permissions`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (roleResponse.ok) {
            const roleData = (await roleResponse.json()) as {
              data?: { permissions_table?: PermissionRow[] };
            };
            const rolePerms = roleData.data?.permissions_table || [];
            const permsList = rolePerms.map((p) => `${p.resource}.${p.action}`);
            setPermissions(permsList);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเช็คว่ามีสิทธิ์หรือไม่
  const hasPermission = (resource: string, action: string): boolean => {
    // HighestAdmin มีสิทธิ์ทุกอย่าง
    if (userRole === 'HighestAdmin') return true;

    const permKey = `${resource}.${action}`;
    return permissions.includes(permKey);
  };

  // เช็คว่ามีสิทธิ์อย่างใดอย่างหนึ่งใน array
  const hasAnyPermission = (permsList: Permission[]): boolean => {
    if (userRole === 'HighestAdmin') return true;

    return permsList.some(({ resource, action }) => permissions.includes(`${resource}.${action}`));
  };

  // เช็คว่ามีสิทธิ์ read อย่างน้อย 1 resource
  const canAccessResource = (resource: string): boolean => {
    if (userRole === 'HighestAdmin') return true;

    return permissions.some((p) => p.startsWith(`${resource}.`));
  };

  return {
    permissions,
    loading,
    userRole,
    hasPermission,
    hasAnyPermission,
    canAccessResource,
    refreshPermissions: fetchUserPermissions,
  };
};
