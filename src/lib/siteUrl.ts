// The app lives at app.aisom.co.za; the marketing site lives at aisom.co.za.
// In development/preview we fall back to the current origin so OAuth still works.
const APP_URL = import.meta.env.VITE_APP_URL || "https://app.aisom.co.za";

export function siteUrl(path = ""): string {
  const base = import.meta.env.PROD ? APP_URL : window.location.origin;
  return `${base}${path}`;
}
