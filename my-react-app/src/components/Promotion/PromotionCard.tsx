interface PromotionItem {
  title?: string;
  description?: string;
  image?: string;
  active?: boolean;
  products?: unknown[];
  services?: unknown[];
}

interface PromotionCardProps {
  promotion: PromotionItem;
  onSelect: (promotion: PromotionItem) => void;
}

export default function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  const productCount = (promotion.products || []).length;
  const serviceCount = (promotion.services || []).length;

  return (
    <div
      className="flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-[120ms] hover:-translate-y-1 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] md:flex-row md:gap-3"
      onClick={() => onSelect(promotion)}
    >
      {promotion.image && (
        <div className="h-[140px] w-full shrink-0 overflow-hidden md:h-[110px] md:w-[160px]">
          <img src={promotion.image} alt={promotion.title} className="block h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:gap-0 md:p-3">
        <h3 className="m-0 mb-1 text-[0.95rem] md:mb-1.5 md:text-[1.05rem]">{promotion.title}</h3>
        <p className="m-0 mb-1.5 text-[0.85rem] text-[#444] md:mb-2 md:text-[0.95rem]">{promotion.description}</p>

        <div className="mt-auto flex items-center gap-1.5 text-[0.75rem] md:gap-2 md:text-base">
          <span className="rounded-xl bg-[#f1f1f1] px-1.5 py-[3px] text-[0.75rem] md:px-2 md:py-1 md:text-[0.85rem]">{productCount} สินค้า</span>
          <span className="rounded-xl bg-[#f1f1f1] px-1.5 py-[3px] text-[0.75rem] md:px-2 md:py-1 md:text-[0.85rem]">{serviceCount} บริการ</span>
          {promotion.active
            ? <span className="ml-2 font-semibold text-[green]">กำลังใช้งาน</span>
            : <span className="ml-2 font-semibold text-[#888]">ไม่แสดง</span>}
        </div>

        <div className="mt-2">
          <button
            className="cursor-pointer rounded-md border-0 bg-[#1f7a8c] px-3 py-1.5 text-[0.75rem] text-white hover:opacity-95 md:py-2 md:text-base"
            onClick={(e) => { e.stopPropagation(); onSelect(promotion); }}
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>
  );
}
