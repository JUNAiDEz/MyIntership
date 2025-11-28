// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ token, children }) {
  // ถ้า token ไม่ถูกส่งเข้ามา ให้ fallback ไปอ่านจาก localStorage
  const storedToken = token || localStorage.getItem('adminToken');
  if (!storedToken) {
    // ถ้าไม่มี token (ยังไม่ Login) ให้ไปหน้าแรกพร้อม query เพื่อเปิด LoginModal
    return <Navigate to="/?login=1" replace />;
  }

  // ถ้ามี token, ให้แสดง children (คือหน้า Dashboard)
  return children;
}

export default ProtectedRoute;