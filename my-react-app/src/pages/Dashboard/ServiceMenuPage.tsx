import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  FaListUl, FaCarSide, FaTools, FaRocket, FaStickyNote, FaChevronRight
} from 'react-icons/fa';

const iconColorClasses: Record<string, string> = {
  blue: 'bg-[#eff6ff] text-[#2563eb]',
  orange: 'bg-[#fff7ed] text-[#ea580c]',
  green: 'bg-[#f0fdf4] text-[#16a34a]',
  red: 'bg-[#fef2f2] text-[#dc2626]',
  purple: 'bg-[#faf5ff] text-[#9333ea]',
};

interface MenuItem {
  id: string;
  title: string;
  desc: string;
  path: string;
  icon: ReactNode;
  color: keyof typeof iconColorClasses;
  isFullWidth?: boolean;
  count?: number;
}

const ServiceMenuPage = () => {
  // รวมข้อมูลไว้ใน Array เพื่อให้จัดการง่าย และรองรับการดึง API ในอนาคต
  const menuItems: MenuItem[] = [
    {
      id: 'manage',
      title: 'จัดการข้อมูลบริการ',
      desc: 'รายการบริการทั่วไป และข้อมูลพื้นฐาน',
      path: '/dashboard/services/manage',
      icon: <FaListUl />,
      color: 'blue',
      isFullWidth: true, // ตัวนี้อยู่บนสุด เต็มจอ
      count: 120 // ตัวอย่าง: จำนวนรายการ (รอต่อ API)
    },
    {
      id: 'fitment',
      title: 'จัดการข้อมูลจัดทรง',
      desc: 'ศูนย์ล้อ, ลูกหมาก, โช้คอัพ, ล้อ-ยาง',
      path: '/dashboard/services/fitment',
      icon: <FaCarSide />,
      color: 'orange',
      count: 45
    },
    {
      id: 'maintenance',
      title: 'บำรุงรักษา (Maintenance)',
      desc: 'ล้างท่อ, Engine Spa, เปลี่ยนถ่ายของเหลว',
      path: '/dashboard/services/maintenance',
      icon: <FaTools />,
      color: 'green',
      count: 8
    },
    {
      id: 'upgrade',
      title: 'ข้อมูลอัปเกรดความแรง',
      desc: 'ท่อไอเสีย, รีแมพ, เทอร์โบ, วาล์ว',
      path: '/dashboard/services/upgrade',
      icon: <FaRocket />,
      color: 'red',
      count: 32
    },
    {
      id: 'wrap',
      title: 'Wrap & Sticker',
      desc: 'ฟิล์มกรองแสง, สติ๊กเกอร์, เกจวัด',
      path: '/dashboard/services/wrapcar',
      icon: <FaStickyNote />,
      color: 'purple',
      count: 15
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6">
      <div className="mb-6">
        <h2 className="mt-0 mb-2 text-2xl font-semibold text-[#111827]">บริการค่าแรง</h2>
        <p className="m-0 text-sm text-[#6b7280]">เลือกเมนูเพื่อจัดการข้อมูลในส่วนต่างๆ</p>
      </div>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {menuItems.map((item: MenuItem) => (
          <Link
            key={item.id}
            to={item.path}
            className={`group relative flex items-center overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-6 no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-[#d1d5db] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] max-md:p-5 ${item.isFullWidth ? 'col-[1/-1]' : ''}`}
          >
            {/* Icon Section */}
            <div className={`mr-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl max-md:mr-4 max-md:h-12 max-md:w-12 max-md:text-xl ${iconColorClasses[item.color]}`}>
              {item.icon}
            </div>

            {/* Content Section */}
            <div className="mr-4 grow">
              <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                <h3 className="m-0 text-lg font-semibold text-[#1f2937]">{item.title}</h3>
                {/* Badge แสดงจำนวนรายการ (Feature ใหม่) */}
                {item.count !== undefined && (
                  <span className="rounded-[20px] border border-[#e5e7eb] bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-semibold tracking-[0.5px] text-[#4b5563] transition-colors duration-200 group-hover:bg-[#e5e7eb] group-hover:text-[#111827] max-md:mt-1">
                    {item.count} รายการ
                  </span>
                )}
              </div>
              <span className="block text-sm leading-[1.5] text-[#6b7280]">{item.desc}</span>
            </div>

            {/* Arrow */}
            <div className="text-sm text-[#9ca3af] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#4b5563]">
              <FaChevronRight />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceMenuPage;