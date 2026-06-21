interface ServiceModalData {
  brand?: string;
  name?: string;
  price?: string | number | Array<string | number>;
  stage?: string;
  note?: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  data?: ServiceModalData | null;
  onClose: () => void;
}

const ServiceModal = ({ isOpen, data, onClose }: ServiceModalProps) => {
  if (!isOpen || !data) return null;

  // แยกข้อความราคาด้วยเครื่องหมาย /
  let priceList: string[] = [];
  if (typeof data.price === 'string') {
    priceList = data.price.split('/');
  } else if (typeof data.price === 'number') {
    priceList = [data.price.toLocaleString()];
  } else if (Array.isArray(data.price)) {
    priceList = data.price.map((p) => String(p));
  } else if (data.price) {
    priceList = [String(data.price)];
  }

  return (
    <div className="fixed inset-0 z-[9999] flex h-full w-full animate-fade-in items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-h-[90vh] w-[90%] max-w-[600px] animate-slide-up overflow-y-auto rounded-2xl bg-white text-[#333]" onClick={(e) => e.stopPropagation()}>
        <span className="absolute right-5 top-5 z-[1] cursor-pointer text-[2rem] leading-none text-[#666] transition-colors hover:text-black" onClick={onClose}>&times;</span>

        <div className="border-b-2 border-[#f0f0f0] p-[30px_30px_20px]">
          <span className="mb-[15px] inline-block rounded-[20px] bg-accent px-4 py-1.5 text-[0.85rem] font-bold uppercase tracking-[1px] text-black">{data.brand}</span>
          <h3 className="m-0 text-[1.8rem] font-extrabold text-black">{data.name}</h3>
        </div>

        <div className="p-[30px]">

          <div className="mb-[25px] rounded-xl border border-[#ffeeba] bg-[#fff9e6] p-5">
            <label className="mb-[15px] block text-[0.9rem] font-bold uppercase tracking-[1px] text-[#666]">ราคาค่าบริการ</label>
            <div className="flex flex-col gap-2.5">
              {priceList.map((p, index) => (
                <div key={index} className="flex items-center rounded-lg bg-white p-[12px_15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <span className="mr-[15px] h-2.5 w-2.5 shrink-0 rounded-full bg-accent"></span>
                  <span className="text-[1.2rem] font-extrabold leading-[1.2] text-[#d32f2f] min-[481px]:text-[1.5rem]">{p.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="m-0 mb-[15px] text-[1.2rem] font-bold text-black">รายละเอียด</h4>
            <div className="flex items-center justify-between border-b border-dashed border-[#e0e0e0] py-3">
              <span className="text-[#333]">Stage</span>
              <span className="text-[1.1rem] font-bold text-black">{data.stage || 'Standard'}</span>
            </div>
          </div>

          {data.note && (
            <div className="mt-5 rounded border-l-4 border-accent bg-[#fff9e6] p-[15px] text-[0.9rem] text-[#666]">
              <strong className="text-black">หมายเหตุ:</strong> {data.note}
            </div>
          )}
        </div>

        <div className="flex justify-center border-t-2 border-[#f0f0f0] p-[20px_30px]">
          <button className="cursor-pointer rounded-[25px] border-none bg-[#333] px-10 py-3 text-base font-bold uppercase text-white transition-all duration-300 hover:bg-accent hover:text-black hover:shadow-[0_5px_15px_rgba(255,199,9,0.4)]" onClick={onClose}>ปิดหน้าต่าง</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
