// components/DynamicRenderer/PageBuilder.js
import React from 'react';
import { ComponentMap } from './ComponentMap';

const PageBuilder = ({ layoutData, pricingData }) => {
  if (!layoutData || !Array.isArray(layoutData)) return null;

  return (
    <>
      {layoutData.map((block, index) => {
        const normalizeType = (type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        const Component = ComponentMap[block.type] || ComponentMap[normalizeType(block.type)];

        if (!Component) {
          console.warn(`Component type "${block.type}" ไม่ถูกนิยามไว้ใน ComponentMap`);
          return null;
        }

        // Inject pricingData for PriceSelector/PRICING section
        if (normalizeType(block.type) === 'Pricing') {
          return <Component key={`${block.type}-${index}`} pricingData={pricingData} {...block.props} />;
        }
        return <Component key={`${block.type}-${index}`} {...block.props} />;
      })}
    </>
  );
};

export default PageBuilder;