import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, PackageOpen, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { buildMeta } from "@/lib/seo/meta";
import { getPublicSiteSettings } from "@/lib/site-settings.functions";
import {
  getPackageCatalog,
  type PackageCatalogItem,
  type PackageCatalogPayload,
} from "@/lib/packages.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "popular" | "price_asc" | "price_desc" | "alpha";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Lowest Starting Price" },
  { value: "price_desc", label: "Highest Starting Price" },
  { value: "alpha", label: "Alphabetical (A–Z)" },
];

const catalogQueryOptions = {
  queryKey: ["package-catalog"] as const,
  queryFn: () => getPackageCatalog(),
};

export const Route = createFileRoute("/packages")({
  head: () => {
    const m = buildMeta({
      title: "Paket Wedding Planner & Organizer",
      description:
        "Pilih paket wedding planner & organizer terbaik dari Errika. Wedding Minang, Gedung, Aula & Rumah, dan paket lainnya — fleksibel, transparan, dengan promo terkini.",
      canonical: "/packages",
      ogType: "website",
    });
    return {
      meta: m.meta,
      links: m.links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://errikawp.lovable.app/" },
              { "@type": "ListItem", position: 2, name: "Paket", item: "https://errikawp.lovable.app/packages" },
            ],
          }),
        },
      ],
    };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQueryOptions);
    context.queryClient.ensureQueryData({
      queryKey: ["site-settings"],
      queryFn: () => getPublicSiteSettings(),
    });
  },
  component: PackagesPage,
  errorComponent: ({ error }) => (
    <div className="container-editorial py-32 text-center">
      <h1 className="font-heading text-2xl">Tidak dapat memuat paket</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  pendingComponent: () => (
    <PublicLayout transparentHero={false}>
      <PackagesShell>
        <SkeletonGrid />
      </PackagesShell>
    </PublicLayout>
  ),
});

function PackagesPage() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getPublicSiteSettings(),
  });
  return (
    <PublicLayout transparentHero={false} settings={settings as any}>
      <PackagesShell>
        <CatalogBody />
      </PackagesShell>
    </PublicLayout>
  );
}

function PackagesShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeroBlock />
      <section className="container-editorial pb-24 pt-10 md:pb-32">{children}</section>
    </>
  );
}

function HeroBlock() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[oklch(0.97_0.012_85)] pt-28 md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--primary) 0, transparent 40%), radial-gradient(circle at 80% 60%, var(--primary) 0, transparent 45%)",
        }}
      />
      <div className="container-editorial relative py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span aria-current="page" className="text-foreground">Paket</span>
        </nav>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Wedding Packages</p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">
          Paket Pernikahan yang Dirancang Sesuai Cerita Anda
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Pilih dari koleksi paket Wedding Minang, Gedung, Aula &amp; Rumah, dan paket khusus lainnya.
          Setiap paket dapat disesuaikan agar pas dengan visi, jumlah tamu, dan anggaran Anda.
        </p>
      </div>
    </section>
  );
}

function CatalogBody() {
  const { data } = useSuspenseQuery<PackageCatalogPayload>(catalogQueryOptions);
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [tagSlugs, setTagSlugs] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data.packages.filter((p) => {
      if (categorySlug !== "all" && p.category?.slug !== categorySlug) return false;
      if (tagSlugs.length && !tagSlugs.every((s) => p.tags.some((t) => t.slug === s))) return false;
      if (q) {
        const hay = `${p.title} ${p.subtitle ?? ""} ${p.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return +new Date(b.created_at) - +new Date(a.created_at);
        case "price_asc":
          return a.starting_price_idr - b.starting_price_idr;
        case "price_desc":
          return b.starting_price_idr - a.starting_price_idr;
        case "alpha":
          return a.title.localeCompare(b.title);
        case "popular":
        default:
          return a.sort_order - b.sort_order;
      }
    });
    return list;
  }, [data.packages, search, categorySlug, tagSlugs, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategorySlug("all");
    setTagSlugs([]);
    setSort("popular");
  };

  const activeFilters = search || categorySlug !== "all" || tagSlugs.length > 0;

  return (
    <>
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari paket berdasarkan nama atau deskripsi…"
            className="h-12 rounded-full border-border/70 bg-background pl-11 pr-10 text-sm shadow-sm"
            aria-label="Cari paket"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-12 w-full rounded-full border-border/70 bg-background sm:w-[220px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category filter */}
      {data.categories.length > 0 && (
        <div className="mt-6 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex min-w-max items-center gap-2">
            <FilterPill active={categorySlug === "all"} onClick={() => setCategorySlug("all")}>
              Semua Kategori
            </FilterPill>
            {data.categories.map((c) => (
              <FilterPill
                key={c.id}
                active={categorySlug === c.slug}
                onClick={() => setCategorySlug(c.slug)}
              >
                {c.name}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {/* Tag filter */}
      {data.tags.length > 0 && (
        <div className="mt-3 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex min-w-max items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tag</span>
            {data.tags.map((t) => {
              const active = tagSlugs.includes(t.slug);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setTagSlugs((prev) =>
                      prev.includes(t.slug) ? prev.filter((s) => s !== t.slug) : [...prev, t.slug],
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/80 hover:border-primary/60 hover:text-primary",
                  )}
                  aria-pressed={active}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: t.color ?? "var(--primary)" }}
                    aria-hidden
                  />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results meta */}
      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Menampilkan <span className="font-medium text-foreground">{filtered.length}</span> paket
        </span>
        {activeFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Grid / Empty */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]"
          : "border-border bg-background text-foreground/80 hover:border-primary/60 hover:text-primary",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function PackageCard({ pkg }: { pkg: PackageCatalogItem }) {
  const hasPromo = pkg.promo_active;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-gold)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[oklch(0.95_0.012_85)]">
        {pkg.thumbnail_url ? (
          <img
            src={pkg.thumbnail_url}
            alt={pkg.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <PackageOpen className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {pkg.category ? (
            <span className="inline-flex items-center rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
              {pkg.category.name}
            </span>
          ) : null}
        </div>
        {hasPromo ? (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-full bg-[oklch(0.55_0.18_25)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
              {pkg.promo_label ?? "Promo"}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl leading-snug text-foreground">{pkg.title}</h3>
        {pkg.subtitle ? (
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary">{pkg.subtitle}</p>
        ) : null}
        {pkg.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {pkg.description}
          </p>
        ) : null}

        {pkg.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pkg.tags.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10.5px] font-medium text-foreground/80"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: t.color ?? "var(--primary)" }}
                  aria-hidden
                />
                {t.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Mulai dari
            </div>
            {hasPromo ? (
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="font-heading text-xl text-primary">
                  {formatIDR(pkg.promo_price_idr!)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatIDR(pkg.normal_price_idr)}
                </span>
              </div>
            ) : (
              <div className="mt-1 font-heading text-xl text-foreground">
                {formatIDR(pkg.normal_price_idr)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button asChild className="w-full rounded-full">
            <Link
              to="/packages/$slug"
              params={{ slug: pkg.slug }}
              // Detail route built in a later sprint — link is prepared.
            >
              Lihat Detail
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-heading text-2xl">Belum ada paket yang cocok</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Coba ubah kata kunci, kategori, atau tag yang Anda pilih. Tim kami juga siap merancang paket
        khusus sesuai kebutuhan Anda.
      </p>
      <Button onClick={onReset} variant="outline" className="mt-6 rounded-full">
        <X className="h-4 w-4" /> Reset Filter
      </Button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 w-full rounded-full sm:w-[220px]" />
      </div>
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-full" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="mt-4 h-9 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
