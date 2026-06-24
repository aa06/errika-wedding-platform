/**
 * Analytics foundation: GA4 / Google Tag Manager / Meta Pixel wrappers.
 * IDs are sourced from `site_settings.analytics` at runtime (CMS-editable);
 * the boot helpers below are called once after hydration from the public layout.
 *
 * No events fire by default — call `track(...)` from feature code in later sprints.
 */

type AnalyticsConfig = {
  ga4Id?: string;
  gtmId?: string;
  metaPixelId?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __errika_analytics_booted?: boolean;
  }
}

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[data-errika-src="${src}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  s.dataset.errikaSrc = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

export function bootAnalytics(config: AnalyticsConfig) {
  if (typeof window === "undefined") return;
  if (window.__errika_analytics_booted) return;
  window.__errika_analytics_booted = true;

  window.dataLayer = window.dataLayer || [];

  if (config.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`);
  }

  if (config.ga4Id) {
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4Id)}`);
    window.gtag = window.gtag || function gtag(...args: unknown[]) {
      (window.dataLayer as unknown[]).push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", config.ga4Id, { send_page_view: true });
  }

  if (config.metaPixelId) {
    // Minimal fbq bootstrap
    if (!window.fbq) {
      const n: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string } =
        function (...args: unknown[]) {
          if (n.callMethod) (n.callMethod as (...a: unknown[]) => void)(...args);
          else (n.queue as unknown[]).push(args);
        };
      n.queue = [];
      n.loaded = true;
      n.version = "2.0";
      window.fbq = n;
      injectScript("https://connect.facebook.net/en_US/fbevents.js");
    }
    window.fbq?.("init", config.metaPixelId);
    window.fbq?.("track", "PageView");
  }
}

export type AnalyticsEvent =
  | { type: "page_view"; path: string }
  | { type: "whatsapp_clicked"; source: string }
  | { type: "lead_submitted"; source: string; package_id?: string }
  | { type: "calculator_started" }
  | { type: "calculator_completed"; budget_idr?: number }
  | { type: "recommendation_clicked"; package_slug: string }
  | { type: string; [key: string]: unknown };

/** Single tracking entry-point. Fans out to GA4 + GTM dataLayer + Meta Pixel. */
export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const { type, ...payload } = event as Record<string, unknown> & { type: string };
  window.dataLayer?.push({ event: type, ...payload });
  window.gtag?.("event", type, payload);
  window.fbq?.("trackCustom", type, payload);
}
