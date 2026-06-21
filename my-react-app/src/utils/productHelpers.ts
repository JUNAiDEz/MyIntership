import { API_URL } from './api';
import type { Product } from '@/types';

const PLACEHOLDER_SMALL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
const PLACEHOLDER_MED = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";

export function getImageUrl(imageUrl: unknown, fallback: string = PLACEHOLDER_MED): string {
  if (!imageUrl) return fallback;
  if (typeof imageUrl !== 'string') return fallback;
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
  // normalize
  const base = API_URL.replace(/\/$/, '');
  const path = imageUrl.replace(/^\//, '');
  return `${base}/${path}`;
}

export interface CalculatedPrices {
  displayPrice: string;
  displayOldPrice: string | null;
}

export function calculatePrices(product: Pick<Product, 'price' | 'discount'>): CalculatedPrices {
  const originalPrice = parseFloat(String(product.price)) || 0;
  const discountPercent = Math.abs(parseFloat(String(product.discount))) || 0;
  let finalPrice = originalPrice;
  let oldPrice: number | null = null;
  if (discountPercent > 0 && originalPrice > 0) {
    finalPrice = originalPrice - (originalPrice * discountPercent / 100);
    oldPrice = originalPrice;
  }
  return {
    displayPrice: Number(finalPrice).toFixed(0),
    displayOldPrice: oldPrice ? Number(oldPrice).toFixed(0) : null,
  };
}

export { PLACEHOLDER_SMALL, PLACEHOLDER_MED };

export default {
  getImageUrl,
  calculatePrices,
};
