import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PackageCatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PackageCatalogTag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type PackageCatalogItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  normal_price_idr: number;
  promo_price_idr: number | null;
  promo_label: string | null;
  promo_active: boolean;
  starting_price_idr: number;
  created_at: string;
  sort_order: number;
  category: PackageCatalogCategory | null;
  tags: PackageCatalogTag[];
};

export type PackageCatalogPayload = {
  packages: PackageCatalogItem[];
  categories: PackageCatalogCategory[];
  tags: PackageCatalogTag[];
};

const EMPTY: PackageCatalogPayload = { packages: [], categories: [], tags: [] };

export const getPackageCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<PackageCatalogPayload> => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return EMPTY;
    try {
      const supabase = createClient<Database>(url, key, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });

      const [pkgRes, catRes, tagRes] = await Promise.all([
        supabase
          .from("packages")
          .select(
            "id, slug, title, subtitle, description, thumbnail_url, normal_price_idr, promo_price_idr, promo_label, promo_starts_at, promo_ends_at, created_at, sort_order, category:package_categories(id, name, slug), tag_mappings:package_tag_mappings(tag:package_tags(id, name, slug, color, is_active))",
          )
          .eq("status", "published")
          .order("sort_order", { ascending: true }),
        supabase
          .from("package_categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("package_tags")
          .select("id, name, slug, color")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (pkgRes.error) throw pkgRes.error;
      const now = Date.now();
      const packages: PackageCatalogItem[] = (pkgRes.data ?? []).map((p: any) => {
        const startsOk = !p.promo_starts_at || new Date(p.promo_starts_at).getTime() <= now;
        const endsOk = !p.promo_ends_at || new Date(p.promo_ends_at).getTime() >= now;
        const promo_active =
          p.promo_price_idr != null && p.promo_price_idr < p.normal_price_idr && startsOk && endsOk;
        const starting_price_idr = promo_active ? p.promo_price_idr : p.normal_price_idr;
        const tags = (p.tag_mappings ?? [])
          .map((m: any) => m.tag)
          .filter((t: any) => t && t.is_active !== false)
          .map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color ?? null }));
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          description: p.description,
          thumbnail_url: p.thumbnail_url,
          normal_price_idr: p.normal_price_idr,
          promo_price_idr: p.promo_price_idr,
          promo_label: p.promo_label,
          promo_active,
          starting_price_idr,
          created_at: p.created_at,
          sort_order: p.sort_order,
          category: p.category
            ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
            : null,
          tags,
        };
      });

      return {
        packages,
        categories: catRes.data ?? [],
        tags: (tagRes.data ?? []).map((t) => ({ ...t, color: t.color ?? null })),
      };
    } catch (e) {
      console.warn("[packages] fetch failed:", e);
      return EMPTY;
    }
  },
);
