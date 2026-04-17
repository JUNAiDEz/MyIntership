// src/pages/Services/Remap/components/PriceSelector.jsx
import React, { useState } from 'react';
import styles from './PriceSelector.module.css';

const PriceSelector = ({ pricingData = [] }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [resultData, setResultData] = useState(null);

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setSelectedModel('');
    setResultData(null);
  };

  const handleModelChange = (e) => {
    const modelName = e.target.value;
    setSelectedModel(modelName);
    if (selectedBrand && modelName) {
      const brandData = pricingData.find(b => b.brand === selectedBrand);
      const modelData = brandData?.models.find(m => m.name === modelName);
      setResultData(modelData);
    }
  };

  const availableModels = selectedBrand 
    ? pricingData.find(b => b.brand === selectedBrand)?.models || [] 
    : [];

  return (
    <section className={styles.selectorSection}>
      <div className={styles.selectorContainer}>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>BRAND</label>
            <select className={styles.customSelect} value={selectedBrand} onChange={handleBrandChange}>
              <option value="">เลือกยี่ห้อรถ...</option>
              {pricingData.map((b, idx) => (
                <option key={idx} value={b.brand}>{b.brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label}>MODEL</label>
            <select className={styles.customSelect} value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand}>
              <option value="">เลือกรุ่น...</option>
              {availableModels.map((m, idx) => (
                <option key={idx} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {resultData && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>{selectedBrand} {resultData.name}</div>
            <div className={styles.resultBody}>
              {resultData.hood && (
                <div className={styles.priceItem}>
                  <span>ฝากระโปรง (Hood)</span>
                  <span className={styles.priceValue}>{resultData.hood}</span>
                </div>
              )}
              {resultData.roof && (
                <div className={styles.priceItem}>
                  <span>หลังคา (Roof)</span>
                  <span className={styles.priceValue}>{resultData.roof}</span>
                </div>
              )}
              {resultData.fullWrap && (
                <div className={styles.priceItem}>
                  <span>รอบคัน (Full Wrap)</span>
                  <span className={styles.priceValue}>{resultData.fullWrap}</span>
                </div>
              )}
              {resultData.price && !resultData.hood && !resultData.roof && !resultData.fullWrap && (
                <div className={styles.priceItem}>
                  <span>ค่าบริการ</span>
                  <span className={styles.priceValue}>{resultData.price}</span>
                </div>
              )}
              {resultData.stage && (
                <div style={{color:'#888', fontSize:'0.9rem', lineHeight: '1.6'}}>
                  Stage: <span style={{color:'#fff'}}>{resultData.stage}</span>
                </div>
              )}
              {resultData.note && (
                <div style={{marginTop: '15px', color: '#ffc709', fontSize:'0.8rem'}}>
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