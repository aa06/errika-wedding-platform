import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public read for site_settings — uses the server publishable client (anon role).
 * Safe to call from public route loaders during SSR.
 */
export type PublicSiteSettings = {
  branding: { website_name?: string; logo_url?: string; favicon_url?: string; tagline?: string };
  contact: { whatsapp_number?: string; whatsapp_default_message?: string; email?: string; address?: string };
  social: { instagram_url?: string; facebook_url?: string; tiktok_url?: string; youtube_url?: string };
  location: { google_maps_url?: string; lat?: number | null; lng?: number | null };
  analytics: { ga4_id?: string; gtm_id?: string; meta_pixel_id?: string };
  seo_defaults: { title?: string; description?: string; og_image_url?: string; twitter_handle?: string; keywords?: string[] };
  feature_flags: { show_promo_banner?: boolean; enable_budget_calculator?: boolean };
};

const EMPTY_SETTINGS: PublicSiteSettings = {
  branding: {},
  contact: {},
  social: {},
  location: {},
  analytics: {},
  seo_defaults: {},
  feature_flags: {},
};

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSiteSettings> => {
    // Resilient: if env vars are missing (e.g. fresh Vercel deploy without
    // Supabase secrets) or the query fails, return empty defaults so SSR
    // still renders the public homepage instead of crashing with a 500.
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      console.warn("[site-settings] Supabase env vars missing; returning empty defaults.");
      return EMPTY_SETTINGS;
    }
    try {
      const supabase = createClient<Database>(url, key, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["branding", "contact", "social", "location", "analytics", "seo_defaults", "feature_flags"]);
      if (error) throw error;
      const out: Record<string, unknown> = {};
      for (const row of data ?? []) out[row.key] = row.value ?? {};
      return {
        branding: (out.branding ?? {}) as PublicSiteSettings["branding"],
        contact: (out.contact ?? {}) as PublicSiteSettings["contact"],
        social: (out.social ?? {}) as PublicSiteSettings["social"],
        location: (out.location ?? {}) as PublicSiteSettings["location"],
        analytics: (out.analytics ?? {}) as PublicSiteSettings["analytics"],
        seo_defaults: (out.seo_defaults ?? {}) as PublicSiteSettings["seo_defaults"],
        feature_flags: (out.feature_flags ?? {}) as PublicSiteSettings["feature_flags"],
      };
    } catch (err) {
      console.error("[site-settings] Failed to load; returning empty defaults.", err);
      return EMPTY_SETTINGS;
    }
  },
);
