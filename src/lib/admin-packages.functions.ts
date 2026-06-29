import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============================================================================
// Types
// ============================================================================

export type AdminPackageStatus = "draft" | "published" | "archived";

export type AdminPackageCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AdminPackageTag = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AdminPackageListItem = {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  normal_price_idr: number;
  promo_price_idr: number | null;
  status: AdminPackageStatus;
  sort_order: number;
  category: { id: string; name: string } | null;
  updated_at: string;
};

export type AdminPackageMedia = {
  id?: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type AdminPackageVideo = {
  id?: string;
  video_url: string;
  title: string | null;
  sort_order: number;
};

export type AdminPackageBenefit = {
  id?: string;
  label: string;
  icon: string | null;
  sort_order: number;
};

export type AdminPackageFaq = {
  id?: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type AdminPackageRule = {
  id?: string;
  min_guests: number | null;
  max_guests: number | null;
  venue_type: string | null;
  wedding_type: string | null;
  budget_min_idr: number | null;
  budget_max_idr: number | null;
  priority: number;
  is_active: boolean;
  notes: string | null;
};

export type AdminPackageDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category_id: string;
  normal_price_idr: number;
  promo_price_idr: number | null;
  promo_label: string | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  thumbnail_url: string | null;
  status: AdminPackageStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  media: AdminPackageMedia[];
  videos: AdminPackageVideo[];
  benefits: AdminPackageBenefit[];
  faqs: AdminPackageFaq[];
  rules: AdminPackageRule[];
  tag_ids: string[];
};

export type PackageInput = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category_id: string;
  normal_price_idr: number;
  promo_price_idr: number | null;
  promo_label: string | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  thumbnail_url: string | null;
  status: AdminPackageStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
};

// ============================================================================
// Categories
// ============================================================================

export const getPackageCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("package_categories")
      .select("id, slug, name, description, sort_order, is_active")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminPackageCategory[];
  });

export const createPackageCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; slug: string; description?: string | null; sort_order?: number; is_active?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("package_categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePackageCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name?: string; slug?: string; description?: string | null; sort_order?: number; is_active?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("package_categories").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePackageCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("package_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============================================================================
// Tags
// ============================================================================

export const getPackageTagsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("package_tags")
      .select("id, slug, name, color, sort_order, is_active")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminPackageTag[];
  });

export const createPackageTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; slug: string; color?: string | null; sort_order?: number; is_active?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("package_tags")
      .insert({
        name: data.name,
        slug: data.slug,
        color: data.color ?? null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePackageTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name?: string; slug?: string; color?: string | null; sort_order?: number; is_active?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("package_tags").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePackageTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("package_tags").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============================================================================
// Packages — list & detail
// ============================================================================

export const getAdminPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category_id?: string | null; status?: AdminPackageStatus | null; sort?: "title" | "sort_order" } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("packages")
      .select(
        "id, slug, title, thumbnail_url, normal_price_idr, promo_price_idr, status, sort_order, updated_at, category:package_categories(id, name)",
      );
    if (data.category_id) q = q.eq("category_id", data.category_id);
    if (data.status) q = q.eq("status", data.status);
    q = q.order(data.sort === "title" ? "title" : "sort_order", { ascending: true });
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as AdminPackageListItem[];
  });

export const getAdminPackageById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }): Promise<AdminPackageDetail> => {
    const { supabase } = context;
    const [pkg, media, videos, benefits, faqs, rules, tagMaps] = await Promise.all([
      supabase.from("packages").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("package_media").select("*").eq("package_id", data.id).order("sort_order"),
      supabase.from("package_videos").select("*").eq("package_id", data.id).order("sort_order"),
      supabase.from("package_benefits").select("*").eq("package_id", data.id).order("sort_order"),
      supabase.from("package_faqs").select("*").eq("package_id", data.id).order("sort_order"),
      supabase.from("package_rules").select("*").eq("package_id", data.id).order("priority"),
      supabase.from("package_tag_mappings").select("tag_id").eq("package_id", data.id),
    ]);
    if (pkg.error) throw new Error(pkg.error.message);
    if (!pkg.data) throw new Error("Package not found");
    const p = pkg.data;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      category_id: p.category_id,
      normal_price_idr: Number(p.normal_price_idr),
      promo_price_idr: p.promo_price_idr == null ? null : Number(p.promo_price_idr),
      promo_label: p.promo_label,
      promo_starts_at: p.promo_starts_at,
      promo_ends_at: p.promo_ends_at,
      thumbnail_url: p.thumbnail_url,
      status: p.status as AdminPackageStatus,
      sort_order: p.sort_order,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      seo_og_image: p.seo_og_image,
      media: (media.data ?? []) as AdminPackageMedia[],
      videos: (videos.data ?? []) as AdminPackageVideo[],
      benefits: (benefits.data ?? []) as AdminPackageBenefit[],
      faqs: (faqs.data ?? []) as AdminPackageFaq[],
      rules: ((rules.data ?? []) as any[]).map((r) => ({
        ...r,
        budget_min_idr: r.budget_min_idr == null ? null : Number(r.budget_min_idr),
        budget_max_idr: r.budget_max_idr == null ? null : Number(r.budget_max_idr),
      })) as AdminPackageRule[],
      tag_ids: ((tagMaps.data ?? []) as { tag_id: string }[]).map((m) => m.tag_id),
    };
  });

export const createPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: PackageInput) => d)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("packages")
      .insert({ ...data, created_by: context.userId, updated_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updatePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; patch: Partial<PackageInput> }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("packages")
      .update({ ...data.patch, updated_by: context.userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============================================================================
// Related collections (replace-all semantics)
// ============================================================================

async function replaceAll(supabase: any, table: string, packageId: string, rows: any[]) {
  const del = await supabase.from(table).delete().eq("package_id", packageId);
  if (del.error) throw new Error(del.error.message);
  if (rows.length === 0) return;
  const withPkg = rows.map((r) => ({ ...r, package_id: packageId }));
  const ins = await supabase.from(table).insert(withPkg);
  if (ins.error) throw new Error(ins.error.message);
}

export const upsertPackageMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; items: AdminPackageMedia[] }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((m, i) => ({
      url: m.url,
      alt: m.alt,
      sort_order: m.sort_order ?? i,
    }));
    await replaceAll(context.supabase, "package_media", data.packageId, rows);
    return { ok: true };
  });

export const upsertPackageVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; items: AdminPackageVideo[] }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((v, i) => ({
      video_url: v.video_url,
      title: v.title,
      sort_order: v.sort_order ?? i,
    }));
    await replaceAll(context.supabase, "package_videos", data.packageId, rows);
    return { ok: true };
  });

export const upsertPackageBenefits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; items: AdminPackageBenefit[] }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((b, i) => ({
      label: b.label,
      icon: b.icon,
      sort_order: b.sort_order ?? i,
    }));
    await replaceAll(context.supabase, "package_benefits", data.packageId, rows);
    return { ok: true };
  });

export const upsertPackageFaqs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; items: AdminPackageFaq[] }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((f, i) => ({
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order ?? i,
    }));
    await replaceAll(context.supabase, "package_faqs", data.packageId, rows);
    return { ok: true };
  });

export const upsertPackageRules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; items: AdminPackageRule[] }) => d)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((r) => ({
      min_guests: r.min_guests,
      max_guests: r.max_guests,
      venue_type: r.venue_type,
      wedding_type: r.wedding_type,
      budget_min_idr: r.budget_min_idr,
      budget_max_idr: r.budget_max_idr,
      priority: r.priority ?? 100,
      is_active: r.is_active ?? true,
      notes: r.notes,
    }));
    await replaceAll(context.supabase, "package_rules", data.packageId, rows);
    return { ok: true };
  });

export const setPackageTagMappings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; tagIds: string[] }) => d)
  .handler(async ({ data, context }) => {
    const del = await context.supabase
      .from("package_tag_mappings")
      .delete()
      .eq("package_id", data.packageId);
    if (del.error) throw new Error(del.error.message);
    if (data.tagIds.length === 0) return { ok: true };
    const rows = data.tagIds.map((tag_id) => ({ package_id: data.packageId, tag_id }));
    const ins = await context.supabase.from("package_tag_mappings").insert(rows);
    if (ins.error) throw new Error(ins.error.message);
    return { ok: true };
  });
