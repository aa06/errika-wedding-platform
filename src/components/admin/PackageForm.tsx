import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Save, Send, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlugInput, slugify } from "@/components/admin/SlugInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RepeaterField } from "@/components/admin/RepeaterField";
import {
  createPackage,
  getPackageCategoriesAdmin,
  getPackageTagsAdmin,
  setPackageTagMappings,
  updatePackage,
  upsertPackageBenefits,
  upsertPackageFaqs,
  upsertPackageMedia,
  upsertPackageRules,
  upsertPackageVideos,
  type AdminPackageDetail,
  type PackageInput,
} from "@/lib/admin-packages.functions";

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category_id: string;
  normal_price_idr: number;
  promo_price_idr: number | null;
  promo_label: string;
  promo_starts_at: string;
  promo_ends_at: string;
  thumbnail_url: string | null;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  seo_og_image: string | null;
};

const empty: FormState = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  category_id: "",
  normal_price_idr: 0,
  promo_price_idr: null,
  promo_label: "",
  promo_starts_at: "",
  promo_ends_at: "",
  thumbnail_url: null,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  seo_og_image: null,
};

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function PackageForm({ initial }: { initial?: AdminPackageDetail }) {
  const navigate = useNavigate();
  const cats = useQuery({ queryKey: ["admin", "pkg-categories"], queryFn: () => getPackageCategoriesAdmin() });
  const tags = useQuery({ queryKey: ["admin", "pkg-tags"], queryFn: () => getPackageTagsAdmin() });

  const [state, setState] = useState<FormState>(() =>
    initial
      ? {
          slug: initial.slug,
          title: initial.title,
          subtitle: initial.subtitle ?? "",
          description: initial.description ?? "",
          category_id: initial.category_id,
          normal_price_idr: initial.normal_price_idr,
          promo_price_idr: initial.promo_price_idr,
          promo_label: initial.promo_label ?? "",
          promo_starts_at: initial.promo_starts_at ?? "",
          promo_ends_at: initial.promo_ends_at ?? "",
          thumbnail_url: initial.thumbnail_url,
          sort_order: initial.sort_order,
          seo_title: initial.seo_title ?? "",
          seo_description: initial.seo_description ?? "",
          seo_og_image: initial.seo_og_image,
        }
      : empty,
  );
  const [slugLocked, setSlugLocked] = useState(!initial);
  const [media, setMedia] = useState(initial?.media ?? []);
  const [videos, setVideos] = useState(initial?.videos ?? []);
  const [benefits, setBenefits] = useState(initial?.benefits ?? []);
  const [faqs, setFaqs] = useState(initial?.faqs ?? []);
  const [rules, setRules] = useState(initial?.rules ?? []);
  const [tagIds, setTagIds] = useState<string[]>(initial?.tag_ids ?? []);
  const [saving, setSaving] = useState(false);

  // Server fns
  const createFn = useServerFn(createPackage);
  const updateFn = useServerFn(updatePackage);
  const upsertMedia = useServerFn(upsertPackageMedia);
  const upsertVideos = useServerFn(upsertPackageVideos);
  const upsertBenefits = useServerFn(upsertPackageBenefits);
  const upsertFaqs = useServerFn(upsertPackageFaqs);
  const upsertRules = useServerFn(upsertPackageRules);
  const setTagMap = useServerFn(setPackageTagMappings);

  // Default category for new packages
  useEffect(() => {
    if (!initial && !state.category_id && cats.data && cats.data.length > 0) {
      setState((s) => ({ ...s, category_id: cats.data![0].id }));
    }
  }, [cats.data, initial, state.category_id]);

  const buildInput = (status: "draft" | "published" | "archived"): PackageInput => ({
    slug: state.slug || slugify(state.title),
    title: state.title.trim(),
    subtitle: state.subtitle.trim() || null,
    description: state.description.trim() || null,
    category_id: state.category_id,
    normal_price_idr: Number(state.normal_price_idr) || 0,
    promo_price_idr: state.promo_price_idr == null || state.promo_price_idr === 0 ? null : Number(state.promo_price_idr),
    promo_label: state.promo_label.trim() || null,
    promo_starts_at: state.promo_starts_at || null,
    promo_ends_at: state.promo_ends_at || null,
    thumbnail_url: state.thumbnail_url,
    status,
    sort_order: Number(state.sort_order) || 0,
    seo_title: state.seo_title.trim() || null,
    seo_description: state.seo_description.trim() || null,
    seo_og_image: state.seo_og_image,
  });

  const saveChildren = async (packageId: string) => {
    await Promise.all([
      upsertMedia({ data: { packageId, items: media.map((m, i) => ({ ...m, sort_order: i })) } }),
      upsertVideos({ data: { packageId, items: videos.map((v, i) => ({ ...v, sort_order: i })) } }),
      upsertBenefits({ data: { packageId, items: benefits.map((b, i) => ({ ...b, sort_order: i })) } }),
      upsertFaqs({ data: { packageId, items: faqs.map((f, i) => ({ ...f, sort_order: i })) } }),
      upsertRules({ data: { packageId, items: rules } }),
      setTagMap({ data: { packageId, tagIds } }),
    ]);
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!state.title.trim()) { toast.error("Title is required"); return; }
    if (!state.category_id) { toast.error("Category is required"); return; }
    setSaving(true);
    try {
      const input = buildInput(status);
      if (initial) {
        await updateFn({ data: { id: initial.id, patch: input } });
        await saveChildren(initial.id);
        toast.success(status === "published" ? "Published" : "Saved");
      } else {
        const { id } = await createFn({ data: input });
        await saveChildren(id);
        toast.success("Package created");
        navigate({ to: "/admin/packages/$id/edit", params: { id } });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const setThumbFromMedia = (url: string) => setState((s) => ({ ...s, thumbnail_url: url }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Content</p>
          <h1 className="font-heading text-3xl text-foreground">
            {initial ? `Edit: ${initial.title}` : "New Package"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/admin/packages" })} disabled={saving}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />} Publish
          </Button>
        </div>
      </header>

      <Tabs defaultValue="general">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="faqs">FAQ</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={state.title} onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <SlugInput
                value={state.slug}
                onChange={(v) => setState((s) => ({ ...s, slug: v }))}
                sourceValue={state.title}
                locked={slugLocked}
                onLockChange={setSlugLocked}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={state.category_id} onValueChange={(v) => setState((s) => ({ ...s, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={state.sort_order} onChange={(e) => setState((s) => ({ ...s, sort_order: Number(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subtitle / short description <span className="text-xs text-muted-foreground">(max 160 chars)</span></Label>
            <Textarea maxLength={160} rows={2} value={state.subtitle} onChange={(e) => setState((s) => ({ ...s, subtitle: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={8} value={state.description} onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Normal price (IDR) *</Label>
              <Input type="number" value={state.normal_price_idr} onChange={(e) => setState((s) => ({ ...s, normal_price_idr: Number(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Promo price (IDR)</Label>
              <Input type="number" value={state.promo_price_idr ?? ""} onChange={(e) => setState((s) => ({ ...s, promo_price_idr: e.target.value === "" ? null : Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Promo label (e.g. "Early Bird")</Label>
              <Input value={state.promo_label} onChange={(e) => setState((s) => ({ ...s, promo_label: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Promo starts</Label>
                <Input type="datetime-local" value={state.promo_starts_at ? state.promo_starts_at.slice(0, 16) : ""} onChange={(e) => setState((s) => ({ ...s, promo_starts_at: e.target.value ? new Date(e.target.value).toISOString() : "" }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Promo ends</Label>
                <Input type="datetime-local" value={state.promo_ends_at ? state.promo_ends_at.slice(0, 16) : ""} onChange={(e) => setState((s) => ({ ...s, promo_ends_at: e.target.value ? new Date(e.target.value).toISOString() : "" }))} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Cover / thumbnail</Label>
            <ImageUploader pathPrefix="packages/thumbnails" value={state.thumbnail_url} onChange={(url) => setState((s) => ({ ...s, thumbnail_url: url }))} label="Upload cover" />
          </div>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Gallery images shown on the package detail page. Click ★ to set the cover (also updates the thumbnail).</p>
          <RepeaterField
            items={media}
            createNew={() => ({ url: "", alt: "", sort_order: media.length })}
            addLabel="Add image"
            emptyLabel="No images yet."
            onChange={setMedia}
            renderItem={(item, _i, update) => (
              <div className="space-y-2">
                <ImageUploader pathPrefix="packages/gallery" value={item.url || null} onChange={(url) => update({ url: url ?? "" })} />
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input placeholder="Alt text (for accessibility)" value={item.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} />
                  <Button
                    type="button"
                    variant={state.thumbnail_url === item.url && item.url ? "default" : "outline"}
                    size="sm"
                    onClick={() => item.url && setThumbFromMedia(item.url)}
                    disabled={!item.url}
                  >
                    <Star className="mr-1 h-4 w-4" /> Cover
                  </Button>
                </div>
              </div>
            )}
          />
        </TabsContent>

        {/* VIDEOS */}
        <TabsContent value="videos" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">YouTube videos shown on the package detail page.</p>
          <RepeaterField
            items={videos}
            createNew={() => ({ video_url: "", title: "", sort_order: videos.length })}
            addLabel="Add video"
            emptyLabel="No videos yet."
            onChange={setVideos}
            renderItem={(item, _i, update) => {
              const ytId = extractYouTubeId(item.video_url);
              return (
                <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                  {ytId ? (
                    <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" className="h-24 w-40 rounded object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-24 w-40 items-center justify-center rounded bg-muted text-xs text-muted-foreground">No preview</div>
                  )}
                  <div className="space-y-2">
                    <Input placeholder="YouTube URL" value={item.video_url} onChange={(e) => update({ video_url: e.target.value })} />
                    <Input placeholder="Title (optional)" value={item.title ?? ""} onChange={(e) => update({ title: e.target.value })} />
                  </div>
                </div>
              );
            }}
          />
        </TabsContent>

        {/* TAGS */}
        <TabsContent value="tags" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tag this package (e.g. Best Seller, Promo).</p>
          {tags.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading tags…</div>
          ) : tags.data && tags.data.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {tags.data.map((t) => {
                const checked = tagIds.includes(t.id);
                return (
                  <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 hover:border-primary/60">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) =>
                        setTagIds((prev) => (c ? [...prev, t.id] : prev.filter((x) => x !== t.id)))
                      }
                    />
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                      style={{ borderColor: t.color ?? undefined, color: t.color ?? undefined, background: t.color ? `${t.color}14` : undefined }}
                    >
                      {t.name}
                    </span>
                    {!t.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags created yet. Add some in the Tags admin page.</p>
          )}
        </TabsContent>

        {/* BENEFITS */}
        <TabsContent value="benefits" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <RepeaterField
            items={benefits}
            createNew={() => ({ label: "", icon: "", sort_order: benefits.length })}
            addLabel="Add benefit"
            emptyLabel="No benefits yet."
            onChange={setBenefits}
            renderItem={(item, _i, update) => (
              <div className="grid gap-2 md:grid-cols-[1fr_180px]">
                <Input placeholder="Benefit label (e.g. Free consultation)" value={item.label} onChange={(e) => update({ label: e.target.value })} />
                <Input placeholder="Icon name (optional)" value={item.icon ?? ""} onChange={(e) => update({ icon: e.target.value })} />
              </div>
            )}
          />
        </TabsContent>

        {/* FAQS */}
        <TabsContent value="faqs" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <RepeaterField
            items={faqs}
            createNew={() => ({ question: "", answer: "", sort_order: faqs.length })}
            addLabel="Add FAQ"
            emptyLabel="No FAQs yet."
            onChange={setFaqs}
            renderItem={(item, _i, update) => (
              <div className="space-y-2">
                <Input placeholder="Question" value={item.question} onChange={(e) => update({ question: e.target.value })} />
                <Textarea rows={3} placeholder="Answer" value={item.answer} onChange={(e) => update({ answer: e.target.value })} />
              </div>
            )}
          />
        </TabsContent>

        {/* RULES */}
        <TabsContent value="rules" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Recommendation rules — used by the budget calculator (Sprint 4). Leave fields blank for "any".
          </p>
          <RepeaterField
            items={rules}
            createNew={() => ({
              min_guests: null, max_guests: null, venue_type: null, wedding_type: null,
              budget_min_idr: null, budget_max_idr: null, priority: 100, is_active: true, notes: null,
            })}
            addLabel="Add rule"
            emptyLabel="No rules yet."
            onChange={setRules}
            renderItem={(item, _i, update) => (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Min guests</Label>
                    <Input type="number" value={item.min_guests ?? ""} onChange={(e) => update({ min_guests: e.target.value === "" ? null : Number(e.target.value) })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Max guests</Label>
                    <Input type="number" value={item.max_guests ?? ""} onChange={(e) => update({ max_guests: e.target.value === "" ? null : Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Venue type</Label>
                    <Input placeholder="e.g. gedung" value={item.venue_type ?? ""} onChange={(e) => update({ venue_type: e.target.value || null })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Wedding type</Label>
                    <Input placeholder="e.g. minang" value={item.wedding_type ?? ""} onChange={(e) => update({ wedding_type: e.target.value || null })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Budget min (IDR)</Label>
                    <Input type="number" value={item.budget_min_idr ?? ""} onChange={(e) => update({ budget_min_idr: e.target.value === "" ? null : Number(e.target.value) })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Budget max (IDR)</Label>
                    <Input type="number" value={item.budget_max_idr ?? ""} onChange={(e) => update({ budget_max_idr: e.target.value === "" ? null : Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                  <div className="space-y-1"><Label className="text-xs">Priority</Label>
                    <Input type="number" value={item.priority ?? 100} onChange={(e) => update({ priority: Number(e.target.value) || 100 })} /></div>
                  <div className="flex h-9 items-center gap-2"><Switch checked={item.is_active} onCheckedChange={(c) => update({ is_active: c })} /><span className="text-xs text-muted-foreground">Active</span></div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Input value={item.notes ?? ""} onChange={(e) => update({ notes: e.target.value || null })} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label>SEO title</Label>
            <Input value={state.seo_title} onChange={(e) => setState((s) => ({ ...s, seo_title: e.target.value }))} placeholder={state.title} />
          </div>
          <div className="space-y-1.5">
            <Label>SEO description</Label>
            <Textarea rows={3} value={state.seo_description} onChange={(e) => setState((s) => ({ ...s, seo_description: e.target.value }))} placeholder={state.subtitle} />
          </div>
          <div className="space-y-1.5">
            <Label>OG image (social share)</Label>
            <ImageUploader pathPrefix="packages/og" value={state.seo_og_image} onChange={(url) => setState((s) => ({ ...s, seo_og_image: url }))} label="Upload OG image" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="space-y-3 p-10 text-center">
      <p className="text-sm text-muted-foreground">Package not found.</p>
      <Button variant="outline" asChild><a href="/admin/packages"><Trash2 className="mr-1 h-4 w-4" />Back to list</a></Button>
    </div>
  );
}
