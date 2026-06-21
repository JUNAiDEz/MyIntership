import { useState, type ChangeEvent } from 'react';

interface ModelData {
  name: string;
  hood?: string;
  roof?: string;
  fullWrap?: string;
  price?: string;
  stage?: string;
  note?: string;
}
interface BrandData {
  brand: string;
  models: ModelData[];
}
interface PriceSelectorProps {
  pricingData?: BrandData[];
}

const PriceSelector = ({ pricingData = [] }: PriceSelectorProps) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [resultData, setResultData] = useState<ModelData | null>(null);

  const handleBrandChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
    setSelectedModel('');
    setResultData(null);
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const modelName = e.target.value;
    setSelectedModel(modelName);
    if (selectedBrand && modelName) {
      const brandData = pricingData.find(b => b.brand === selectedBrand);
      const modelData = brandData?.models.find(m => m.name === modelName);
      setResultData(modelData ?? null);
    }
  };

  const availableModels = selectedBrand
    ? pricingData.find(b => b.brand === selectedBrand)?.models || []
    : [];

  return (
    <section className="relative z-10 -mt-[60px] px-5 md:-mt-[100px]">
      <div className="mx-auto max-w-[900px] rounded-[20px] border border-accent/30 bg-[rgba(20,20,20,0.85)] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-[15px]">
        <div className="grid grid-cols-1 items-end gap-[30px] md:grid-cols-2">
          <div>
            <label className="mb-2.5 block text-[0.9rem] font-semibold uppercase tracking-[1px] text-accent">BRAND</label>
            <select className="w-full cursor-pointer rounded-lg border border-[#333] bg-black px-5 py-[15px] text-[1.1rem] text-white transition-all duration-300 focus:border-accent focus:shadow-[0_0_15px_rgba(255,199,9,0.2)] focus:outline-none" value={selectedBrand} onChange={handleBrandChange}>
              <option value="">เลือกยี่ห้อรถ...</option>
              {pricingData.map((b, idx) => (
                <option key={idx} value={b.brand}>{b.brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2.5 block text-[0.9rem] font-semibold uppercase tracking-[1px] text-accent">MODEL</label>
            <select className="w-full cursor-pointer rounded-lg border border-[#333] bg-black px-5 py-[15px] text-[1.1rem] text-white transition-all duration-300 focus:border-accent focus:shadow-[0_0_15px_rgba(255,199,9,0.2)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand}>
              <option value="">เลือกรุ่น...</option>
              {availableModels.map((m, idx) => (
                <option key={idx} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {resultData && (
          <div className="mt-[30px] animate-slide-down overflow-hidden rounded-lg border-l-[5px] border-accent bg-gradient-to-br from-[#1a1a1a] to-black">
            <div className="bg-accent px-5 py-2.5 font-black uppercase text-black">{selectedBrand} {resultData.name}</div>
            <div className="p-5">
              {resultData.hood && (
                <div className="mb-[15px] flex items-center justify-between border-b border-[#333] pb-[15px]">
                  <span>ฝากระโปรง (Hood)</span>
                  <span className="text-[2rem] font-bold text-accent [text-shadow:0_0_10px_rgba(255,199,9,0.4)]">{resultData.hood}</span>
                </div>
              )}
              {resultData.roof && (
                <div className="mb-[15px] flex items-center justify-between border-b border-[#333] pb-[15px]">
                  <span>หลังคา (Roof)</span>
                  <span className="text-[2rem] font-bold text-accent [text-shadow:0_0_10px_rgba(255,199,9,0.4)]">{resultData.roof}</span>
                </div>
              )}
              {resultData.fullWrap && (
                <div className="mb-[15px] flex items-center justify-between border-b border-[#333] pb-[15px]">
                  <span>รอบคัน (Full Wrap)</span>
                  <span className="text-[2rem] font-bold text-accent [text-shadow:0_0_10px_rgba(255,199,9,0.4)]">{resultData.fullWrap}</span>
                </div>
              )}
              {resultData.price && !resultData.hood && !resultData.roof && !resultData.fullWrap && (
                <div className="mb-[15px] flex items-center justify-between border-b border-[#333] pb-[15px]">
                  <span>ค่าบริการ</span>
                  <span className="text-[2rem] font-bold text-accent [text-shadow:0_0_10px_rgba(255,199,9,0.4)]">{resultData.price}</span>
                </div>
              )}
              {resultData.stage && (
                <div className="text-[0.9rem] leading-[1.6] text-[#888]">
                  Stage: <span className="text-white">{resultData.stage}</span>
                </div>
              )}
              {resultData.note && (
                <div className="mt-[15px] text-[0.8rem] text-accent">
                  * {resultData.note}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PriceSelector;
