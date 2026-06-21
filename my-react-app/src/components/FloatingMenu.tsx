import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';

interface SubItem {
  label: string;
  path: string;
}
interface MenuItem {
  label: string;
  path?: string;
  subItems?: SubItem[];
}

// กำหนดข้อมูลเมนูแบบมีหัวข้อย่อย (SubItems)
const menuItems: MenuItem[] = [
  {
    label: 'บริการดูแลรักษาเครื่องยนต์',
    subItems: [
      { label: 'ล้างท่อร่วมไอดี', path: '/services/pipe-cleaning' },
      { label: 'เปลี่ยนถ่ายของเหลว', path: '/services/fluid-change' },
      { label: 'สปาเครื่องยนต์', path: '/services/engine-spa' },
      { label: 'ล้างแอร์', path: '/services/air-con-cleaning' },
    ],
  },
  {
    label: 'บริการจัดทรง',
    subItems: [
      { label: 'โหลดหน้า - หลัง', path: '/services/suspension' },
      { label: 'โช๊คอัพ', path: '/services/shock-absorber' },
      { label: 'ล้อแม็กซ์ - ยาง', path: '/services/wheels-tyres' },
      { label: 'ตั้งศูนย์', path: '/services/alignment' },
      { label: 'ลูกหมาก', path: '/services/ball-joints' },
    ],
  },
  {
    label: 'บริการอัพเกรดเครื่องยนต์',
    subItems: [
      { label: 'รีแมพ', path: '/services/remap' },
      { label: 'ท่อแทน', path: '/services/custom-exhaust' },
      { label: 'เทอร์โบ อินเตอร์', path: '/services/turbo-inter' },
      { label: 'แก้วาล์ว', path: '/services/valve-service' },
      { label: 'รีโมทควบคุมระยะไกล', path: '/services/remote-control' },
    ],
  },
  {
    label: 'บริการประดับยนต์ & แร็ปสติ๊กเกอร์',
    subItems: [
      { label: 'ฟิล์มป้องกันรอย', path: '/services/film-protect' },
      { label: 'สติ๊กเกอร์', path: '/services/sticker' },
      { label: 'วัดบูส', path: '/services/boost-gauge' },
      { label: 'ท่อ', path: '/services/exhaust' },
    ],
  },
  {
    label: 'สินค้าภายในร้าน',
    subItems: [
      { label: 'GT7', path: '/product/gt7' },
      { label: 'STEP 1', path: '/product/step1' },
      { label: 'Nano', path: '/product/nano' },
      { label: 'Mmax', path: '/product/mmax' },
      { label: 'น้ำหอม', path: '/product/perfume' },
    ],
  },
];

const menuItemCls =
  'group flex w-full cursor-pointer items-center justify-between border-none bg-white px-4 py-3 text-left font-medium text-[#374151] transition-colors duration-200 hover:bg-[#fffbe6] hover:text-black';

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // เมื่อเปิดเมนู ให้เช็ค path ปัจจุบันแล้วเปิด subMenu ที่ตรงกับ path
  useEffect(() => {
    if (isOpen) {
      const foundIndex = menuItems.findIndex(item =>
        item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path)),
      );
      setActiveMenuIndex(foundIndex !== -1 ? foundIndex : null);
    }
  }, [isOpen, location.pathname]);

  const showMenu =
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/product') ||
    location.pathname.startsWith('/ourservices');

  if (!showMenu) return null;

  // ฟังก์ชันกดหัวข้อหลัก
  const handleMainItemClick = (index: number, item: MenuItem) => {
    if (item.subItems) {
      setActiveMenuIndex(activeMenuIndex === index ? null : index);
    } else {
      handleNavigate(item.path);
    }
  };

  // ฟังก์ชันเปลี่ยนหน้า
  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      setIsOpen(false);
      setActiveMenuIndex(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-4">
      {/* ส่วน Popup Menu */}
      <div
        className={`flex max-h-[80vh] w-[260px] origin-bottom-left flex-col overflow-y-auto rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'pointer-events-auto mb-2 translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="sticky top-0 z-10 bg-accent px-4 py-3">
          <span className="font-bold text-black">เมนูนำทาง</span>
        </div>

        <div className="bg-white p-0">
          {menuItems.map((item, index) => (
            <div key={index} className="border-b border-[#f3f4f6] last:border-b-0">
              {/* ปุ่มหัวข้อหลัก */}
              <button
                onClick={() => handleMainItemClick(index, item)}
                className={`${menuItemCls} ${activeMenuIndex === index ? 'bg-[#fffbe6] text-black' : ''}`}
              >
                <span>{item.label}</span>
                {item.subItems ? (
                  activeMenuIndex === index
                    ? <ChevronDown size={16} className="text-accent" />
                    : <ChevronRight size={16} className="text-[#d1d5db] group-hover:text-accent" />
                ) : (
                  <ChevronRight size={16} className="text-[#d1d5db] group-hover:text-accent" />
                )}
              </button>

              {/* ส่วนแสดงรายการย่อย (Dropdown accordion) */}
              <div
                className={`overflow-hidden bg-[#f9fafb] transition-[max-height] duration-300 ease-out ${
                  activeMenuIndex === index ? 'max-h-[500px] border-t border-[#e5e7eb]' : 'max-h-0'
                }`}
              >
                {item.subItems && item.subItems.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => handleNavigate(subItem.path)}
                    className="w-full cursor-pointer border-none border-l-[3px] border-l-transparent bg-none px-4 py-2.5 pl-8 text-left text-[0.9em] text-[#4b5563] transition-all duration-200 hover:border-l-accent hover:bg-[#eeeeee] hover:text-black"
                  >
                    - {subItem.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่ม FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-accent text-black shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors duration-200 hover:bg-[#ffe066]"
        aria-label="Toggle Menu"
      >
        <div className={`flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[-1] cursor-default" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default FloatingMenu;
