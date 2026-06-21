/// <reference types="vite/client" />
/// <reference types="google.maps" />

interface ImportMetaEnv {
  /** Base URL of the backend API (e.g. https://api.gt7motor.com). Empty string = same origin. */
  readonly VITE_API_URL?: string;
  /** Google Maps JS API key — ว่าง = fallback ไปใช้ iframe */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* Allow importing static assets that aren't covered by vite/client's defaults. */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
