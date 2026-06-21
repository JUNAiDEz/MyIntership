// components/DynamicRenderer/ComponentMap.tsx
import type { ComponentType } from 'react';
import HeroSection from '../ServicePage/HeroSection';
import PriceSelector from '../ServicePage/PriceSelector';
import ServiceCatalog from '../ServicePage/ServiceCatalog';
import ReviewGallery from '../ServicePage/ReviewGallery';
import ShopMap from '../Map/ShopMap';

/**
 * props ของ block เป็น dynamic (มาจาก layout JSON) จึง type เป็น Record<string, unknown>
 * — แต่ละ component มี props จริงต่างกัน เลย cast ตอนใส่ใน map (boundary ของ DynamicRenderer)
 */
type DynamicComponent = ComponentType<Record<string, unknown>>;

export const ComponentMap: Record<string, DynamicComponent> = {
  Hero: HeroSection as unknown as DynamicComponent,
  Pricing: PriceSelector as unknown as DynamicComponent,
  Catalog: ServiceCatalog as unknown as DynamicComponent,
  Reviews: ReviewGallery as unknown as DynamicComponent,
  Map: ShopMap as unknown as DynamicComponent,
};
