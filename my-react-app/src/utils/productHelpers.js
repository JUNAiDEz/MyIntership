import { API_URL } from './api';

const PLACEHOLDER_SMALL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
const PLACEHOLDER_MED = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";

export function getImageUrl(imageUrl, fallback = PLACEHOLDER_MED) {
  if (!imageUrl) return fallback;
  if (typeof imageUrl !== 'string') return fallback;
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
  // normalize
  const base = API_URL.replace(/\/$/, '');
  const path = imageUrl.replace(/^\//, '');
  return `${base}/${path}`;
}

export function calculatePrices(product) {
  const originalPrice = parseFloat(product.price) || 0;
  const discountPercent = Math.abs(parseFloat(product.discount)) || 0;
  let finalPrice = originalPrice;
  let oldPrice = null;
  if (discountPercent > 0 && originalPrice > 0) {
    finalPrice = originalPrice - (originalPrice * discountPercent / 100);
    oldPrice = originalPrice;
  }
  return {
    displayPrice: Number(finalPrice).toFixed(0),
    displayOldPrice: oldPrice ? Number(oldPrice).toFixed(0) : null
  };
}

export default {
  getImageUrl,
  calculatePrices
};
