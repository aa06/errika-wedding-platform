import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PackageDetailMedia = { id: string; url: string; alt: string | null; sort_order: number };
export type PackageDetailVideo = { id: string; video_url: string; title: string | null; sort_order: number };
export type PackageDetailBenefit = { id: string; label: string; icon: string | null; sort_order: number };
export type PackageDetailFaq = { id: string; question: string; answer: string; sort_order: number };
export type PackageDetailTag = { id: string; name: string; slug: string; color: string | null };

export type PackageDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  normal_price_idr: number;
  promo_price_idr: number | null;
  promo_label: string | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  promo_active: boolean;
  starting_price_idr: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: PackageDetailTag[];
  media: PackageDetailMedia[];
  videos: PackageDetailVideo[];
  benefits: PackageDetailBenefit[];
  faqs: PackageDetailFaq[];
};

export const getPackageDetail = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => {
    if (!d?.slug || typeof d.slug !== "string") throw new Error("slug required");
    return { slug: d.slug.toLowerCase() };
  })
  .handler(async ({ data }): Promise<PackageDetail | null> => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    try {
      const supabase = createClient<Database>(url, key, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data: pkg, error } = await supabase
        .from("packages")
        .select(
          "id, slug, title, subtitle, description, thumbnail_url, normal_price_idr, promo_price_idr, promo_label, promo_starts_at, promo_ends_at, seo_title, seo_description, seo_og_image, category:package_categories(id, name, slug), tag_mappings:package_tag_mappings(tag:package_tags(id, name, slug, color, is_active)), media:package_media(id, url, alt, sort_order), videos:package_videos(id, video_url, title, sort_order), benefits:package_benefits(id, label, icon, sort_order), faqs:package_faqs(id, question, answer, sort_order)",
        )
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!pkg) return null;

      const now = Date.now();
      const startsOk = !pkg.promo_starts_at || new Date(pkg.promo_starts_at).getTime() <= now;
      const endsOk = !pkg.promo_ends_at || new Date(pkg.promo_ends_at).getTime() >= now;
      const promo_active =
        pkg.promo_price_idr != null && pkg.promo_price_idr < pkg.normal_price_idr && startsOk && endsOk;
      const starting_price_idr = promo_active ? (pkg.promo_price_idr as number) : pkg.normal_price_idr;
      const tags = ((pkg as any).tag_mappings ?? [])
        .map((m: any) => m.tag)
        .filter((t: any) => t && t.is_active !== false)
        .map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color ?? null }));
      const sortBy = (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

      return {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        subtitle: pkg.subtitle,
        description: pkg.description,
        thumbnail_url: pkg.thumbnail_url,
        normal_price_idr: pkg.normal_price_idr,
        promo_price_idr: pkg.promo_price_idr,
        promo_label: pkg.promo_label,
        promo_starts_at: pkg.promo_starts_at,
        promo_ends_at: pkg.promo_ends_at,
        promo_active,
        starting_price_idr,
        seo_title: pkg.seo_title,
        seo_description: pkg.seo_description,
        seo_og_image: pkg.seo_og_image,
        category: (pkg as any).category
          ? {
              id: (pkg as any).category.id,
              name: (pkg as any).category.name,
              slug: (pkg as any).category.slug,
            }
          : null,
        tags,
        media: (((pkg as any).media ?? []) as PackageDetailMedia[]).slice().sort(sortBy),
        videos: (((pkg as any).videos ?? []) as PackageDetailVideo[]).slice().sort(sortBy),
        benefits: (((pkg as any).benefits ?? []) as PackageDetailBenefit[]).slice().sort(sortBy),
        faqs: (((pkg as any).faqs ?? []) as PackageDetailFaq[]).slice().sort(sortBy),
      };
    } catch (e) {
      console.warn("[package-detail] fetch failed:", e);
      return null;
    }
  });

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "v");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    /* ignore */
  }
  return null;
}
