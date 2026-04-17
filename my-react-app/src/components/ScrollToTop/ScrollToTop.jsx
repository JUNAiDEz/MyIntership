// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // เมื่อเปลี่ยนหน้า ให้เลื่อนไปที่ตำแหน่ง (0, 0) หรือบนสุดทันที
    window.scrollTo(0, 0);
  }, [pathname]); // ทำงานทุกครั้งที่ pathname เปลี่ยน

  return null;
}