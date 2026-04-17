import { useState, useEffect } from 'react';
import { API_URL } from './api';

// Hook สำหรับเช็คสิทธิ์ของ User
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      const role = payload.role;
      
      setUserRole(role);

      // Fetch user-specific permissions
      const response = await fetch(`${API_URL}/api/auth/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userPerms = data.data || [];
        
        // แปลง permissions เป็น array ของ "resource.action"
        const permsList = userPerms.map(p => `${p.resource}.${p.action}`);
        setPermissions(permsList);
      } else {
        // ถ้าไม่มี user permissions ให้ดึงจาก role
        const roleId = payload.role_id;
        if (roleId) {
          const roleResponse = await fetch(`${API_URL}/api/auth/roles/${roleId}/permissions`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            const rolePerms = roleData.data?.permissions_table || [];
            const permsList = rolePerms.map(p => `${p.resource}.${p.action}`);
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
  const hasPermission = (resource, action) => {
    // HighestAdmin มีสิทธิ์ทุกอย่าง
    if (userRole === 'HighestAdmin') return true;
    
    const permKey = `${resource}.${action}`;
    return permissions.includes(permKey);
  };

  // เช็คว่ามีสิทธิ์อย่างใดอย่างหนึ่งใน array
  const hasAnyPermission = (permsList) => {
    if (userRole === 'HighestAdmin') return true;
    
    return permsList.some(({ resource, action }) => 
      permissions.includes(`${resource}.${action}`)
    );
  };

  // เช็คว่ามีสิทธิ์ read อย่างน้อย 1 resource
  const canAccessResource = (resource) => {
    if (userRole === 'HighestAdmin') return true;
    
    return permissions.some(p => p.startsWith(`${resource}.`));
  };

  return {
    permissions,
    loading,
    userRole,
    hasPermission,
    hasAnyPermission,
    canAccessResource,
    refreshPermissions: fetchUserPermissions
  };
};
