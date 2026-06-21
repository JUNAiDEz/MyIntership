import { useState } from 'react';

interface PackageItem {
  name?: string;
  brand?: string;
  price?: string | number;
  image_url?: string;
}

interface ServiceCatalogProps {
  allPackages?: PackageItem[];
  onOpenModal: (item: PackageItem) => void;
}

const pageBtnCls =
  'flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd] bg-white font-semibold text-[#333] transition-all duration-300 hover:border-[#333] hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-50';

const ServiceCatalog = ({ allPackages = [], onOpenModal }: ServiceCatalogProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allPackages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allPackages.length / itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <section className="bg-[#f4f4f4] px-5 py-20 text-[#333]" id="catalog-start">
      <h2 className="mb-10 text-center text-[2rem] font-extrabold uppercase tracking-[2px] text-black">PRICE LIST</h2>
      <div>
        <div className="mb-[100px] grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-[35px] gap-y-20">
          {currentItems.map((item, idx) => {
            const idList = ['1492144534655-ae79c964c9d7', '1550355291-bbee04a92027', '1503376780353-7e6692767b70'];
            const imgBase = `https://images.unsplash.com/photo-${idList[idx % idList.length]}`;
            const imgSmall = `${imgBase}?w=400&h=300&fit=crop&q=80`;
            const imgLarge = `${imgBase}?w=800&h=600&fit=crop&q=80`;
            const carImg = item.image_url && item.image_url.length > 10 ? item.image_url : imgSmall;
            return (
              <div key={idx} className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-[5px] hover:border-accent hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]" onClick={() => onOpenModal(item)}>
                <div className="relative h-[200px] w-full overflow-hidden">
                  <img
                    src={carImg}
                    srcSet={carImg === imgSmall ? `${imgLarge} 800w, ${imgSmall} 400w` : undefined}
                    sizes="(max-width: 600px) 400px, 800px"
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="300"
                    onError={(e) => { e.currentTarget.src = imgSmall; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="rounded-[25px] bg-accent px-[25px] py-2.5 text-[0.9rem] font-bold uppercase text-black">ดูรายละเอียด</span>
                  </div>
                </div>
                <div className="flex grow flex-col p-5">
                  <span className="mb-2.5 w-fit self-start rounded-[20px] bg-accent px-3 py-1 text-[0.8rem] font-bold uppercase tracking-[1px] text-black">{item.brand}</span>
                  <h4 className="my-2.5 grow text-[1.3rem] font-extrabold leading-[1.2] text-black">{item.name}</h4>

                  <div className="mt-auto flex items-end justify-between border-t border-dashed border-[#ddd] pt-[15px]">
                    <span className="text-[#888]">ราคาเริ่มต้น</span>
                    <div className="flex flex-col gap-0.5 text-right text-[1.2rem] font-extrabold leading-[1.3] text-[#d32f2f]">
                      {typeof item.price === 'string' && item.price.includes('/') ? (
                        item.price.split('/').map((p, i) => (
                          <div key={i}>{p.trim()}</div>
                        ))
                      ) : (
                        item.price
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-[50px] flex justify-center gap-2">
            <button className={pageBtnCls} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`${pageBtnCls} ${currentPage === num ? '!border-accent !bg-accent font-bold text-black hover:!bg-[#e0b000]' : ''}`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}
            <button className={pageBtnCls} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              &gt;
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceCatalog;
