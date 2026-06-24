import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public read for site_settings — uses the server publishable client (anon role).
 * Safe to call from public route loaders during SSR.
 */
export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["branding", "contact", "social", "location", "analytics", "seo_defaults", "feature_flags"]);
  if (error) throw error;
  const out: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    out[row.key] = (row.value as Record<string, unknown>) ?? {};
  }
  return out;
});

export type PublicSiteSettings = Awaited<ReturnType<typeof getPublicSiteSettings>>;
