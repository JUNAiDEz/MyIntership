// components/DynamicRenderer/ComponentMap.js
import HeroSection from '../ServicePage/HeroSection';
import PriceSelector from '../ServicePage/PriceSelector';
import ServiceCatalog from '../ServicePage/ServiceCatalog';
import ReviewGallery from '../ServicePage/ReviewGallery';
import ShopMap from '../Map/ShopMap';

export const ComponentMap = {
  Hero: HeroSection,
  Pricing: PriceSelector,
  Catalog: ServiceCatalog,
  Reviews: ReviewGallery,
  Map: ShopMap
};