// Thin GA4 wrapper. Events are no-ops until a GA4 tag is present on the page.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export const trackGenerateLead = (params: Record<string, unknown> = {}) =>
  track("generate_lead", { currency: "ZAR", ...params });

export const trackContactClick = (method: string) => track("contact_click", { method });

export const trackViewItem = (itemName: string) =>
  track("view_item", { currency: "ZAR", items: [{ item_name: itemName }] });
