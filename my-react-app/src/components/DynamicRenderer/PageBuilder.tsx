// components/DynamicRenderer/PageBuilder.tsx
import { ComponentMap } from './ComponentMap';

interface Block {
  type: string;
  props?: Record<string, unknown>;
}

interface PageBuilderProps {
  layoutData?: Block[];
  pricingData?: unknown;
}

const PageBuilder = ({ layoutData, pricingData }: PageBuilderProps) => {
  if (!layoutData || !Array.isArray(layoutData)) return null;

  return (
    <>
      {layoutData.map((block, index) => {
        const normalizeType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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
