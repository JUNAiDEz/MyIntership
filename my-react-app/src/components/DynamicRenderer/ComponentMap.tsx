// components/DynamicRenderer/ComponentMap.tsx
import type { ComponentType } from 'react';
import HeroSection from '../ServicePage/HeroSection';
import PriceSelector from '../ServicePage/PriceSelector';
import ServiceCatalog from '../ServicePage/ServiceCatalog';
import ReviewGallery from '../ServicePage/ReviewGallery';
import ShopMap from '../Map/ShopMap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentMap: Record<string, ComponentType<any>> = {
  Hero: HeroSection,
  Pricing: PriceSelector,
  Catalog: ServiceCatalog,
  Reviews: ReviewGallery,
  Map: ShopMap,
};
