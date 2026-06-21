// src/components/PageSections/PartnerSection.tsx
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/utils/api';

interface Dealer {
  id: number | string;
  name?: string;
  image_url?: string;
  is_active?: boolean;
  display_order?: number;
}

function PartnerSection() {
  // รูปภาพสำรองกรณีไม่ได้อัปโหลดรูป
  const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='none'><text x='50%' y='50%' dy='.3em' fill='%23ffffff' font-size='14' text-anchor='middle'>No Logo</text></svg>";

  const { data: partners = [], isLoading: loading } = useQuery({
    queryKey: ['dealers', 'active'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/dealers`);
      if (!res.ok) throw new Error('Failed to fetch dealers');
      const data = await res.json();
      const dealerList: Dealer[] = Array.isArray(data) ? data : data.data || [];
      return dealerList
        .filter((dealer) => dealer.is_active)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    },
  });

  return (
    <div className="relative z-[2] mt-5 w-full pb-10">
      <div className="mb-[30px] text-center">
        <h2 className="m-0 text-[1.8rem] font-black uppercase tracking-[2px] text-text-main transition-colors md:text-[2.5rem]">DEALER</h2>
        <p className="mt-[5px] text-base text-text-muted transition-colors">ตัวแทนจัดจำหน่ายผลิตภัณฑ์ชั้นนำ</p>
      </div>

      <div className="mx-auto grid max-w-[700px] grid-cols-2 items-center justify-items-center gap-x-[15px] gap-y-[25px] rounded-[20px] border border-themed bg-bg-card p-[30px_20px] shadow-[var(--card-shadow)] backdrop-blur-[15px] transition-all min-[480px]:grid-cols-3 md:gap-x-[30px] md:gap-y-10 md:p-[50px_40px] lg:max-w-[900px]">
        {loading ? (
          <div className="col-span-full text-center text-text-main">
            กำลังโหลดรายชื่อตัวแทนจำหน่าย...
          </div>
        ) : partners.length > 0 ? (
          partners.map((partner) => (
            <div key={partner.id} className="box-border flex h-[110px] w-full cursor-pointer items-center justify-center p-2.5 opacity-60 transition-all duration-300 hover:scale-110 hover:opacity-100 hover:[filter:drop-shadow(0_0_10px_rgba(255,199,9,0.4))] min-[480px]:h-[120px] md:h-[140px]" title={partner.name}>
              <img
                src={partner.image_url ? (partner.image_url.startsWith('http') || partner.image_url.startsWith('data:') ? partner.image_url : `${API_URL}${partner.image_url}`) : PLACEHOLDER_IMG}
                alt={partner.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-text-muted">
            ยังไม่มีข้อมูลตัวแทนจำหน่าย
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerSection;
