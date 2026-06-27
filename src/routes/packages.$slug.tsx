import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Sparkles,
  MessageCircle,
  Tag as TagIcon,
  Play,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { buildMeta } from "@/lib/seo/meta";
import { getPublicSiteSettings } from "@/lib/site-settings.functions";
import {
  getPackageDetail,
  extractYouTubeId,
  type PackageDetail,
} from "@/lib/package-detail.functions";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const SITE_ORIGIN = "https://errikawp.lovable.app";

const detailQueryOptions = (slug: string) => ({
  queryKey: ["package-detail", slug] as const,
  queryFn: () => getPackageDetail({ data: { slug } }),
});

export const Route = createFileRoute("/packages/$slug")({
  loader: async ({ params, context }) => {
    const pkg = await context.queryClient.ensureQueryData(detailQueryOptions(params.slug));
    if (!pkg) throw notFound();
    context.queryClient.ensureQueryData({
      queryKey: ["site-settings"],
      queryFn: () => getPublicSiteSettings(),
    });
    return { pkg };
  },
  head: ({ params, loaderData }) => {
    const pkg = loaderData?.pkg;
    const url = `${SITE_ORIGIN}/packages/${params.slug}`;
    const title = pkg?.seo_title ?? pkg?.title ?? "Paket Wedding";
    const description =
      pkg?.seo_description ??
      pkg?.subtitle ??
      (pkg?.description ? pkg.description.slice(0, 155) : "Paket wedding planner & organizer dari Errika.");
    const ogImage = pkg?.seo_og_image ?? pkg?.thumbnail_url ?? undefined;
    const m = buildMeta({
      title,
      description,
      canonical: `/packages/${params.slug}`,
      ogImage: ogImage ?? undefined,
      ogType: "product",
    });
    return {
      meta: [
        ...m.meta,
        { property: "og:url", content: url },
      ],
      links: m.links,
      scripts: pkg
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
                  { "@type": "ListItem", position: 2, name: "Paket", item: `${SITE_ORIGIN}/packages` },
                  { "@type": "ListItem", position: 3, name: pkg.title, item: url },
                ],
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: pkg.title,
                description,
                image: ogImage ? [ogImage] : undefined,
                category: pkg.category?.name,
                offers: {
                  "@type": "Offer",
                  priceCurrency: "IDR",
                  price: pkg.starting_price_idr,
                  availability: "https://schema.org/InStock",
                  url,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: PackageDetailPage,
  notFoundComponent: () => (
    <PublicLayout transparentHero={false}>
      <div className="container-editorial py-32 text-center">
        <h1 className="font-heading text-3xl md:text-4xl">Paket tidak ditemukan</h1>
        <p className="mt-3 text-muted-foreground">
          Paket yang Anda cari mungkin sudah tidak tersedia atau telah diarsipkan.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link to="/packages">Lihat Semua Paket</Link>
        </Button>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout transparentHero={false}>
      <div className="container-editorial py-32 text-center">
        <h1 className="font-heading text-2xl">Tidak dapat memuat paket</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PublicLayout>
  ),
});

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPromoPeriod(start: string | null, end: string | null) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  if (start && end) return `Berlaku ${fmt(start)} – ${fmt(end)}`;
  if (end) return `Berlaku hingga ${fmt(end)}`;
  if (start) return `Berlaku mulai ${fmt(start)}`;
  return null;
}

function PackageDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(detailQueryOptions(slug));
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getPublicSiteSettings(),
  });
  if (!data) return null;
  const pkg = data;
  const wa = settings?.contact?.whatsapp_number ?? "6281234567890";
  const waMsg = `Halo Errika, saya tertarik dengan paket "${pkg.title}". Mohon info lebih lanjut.`;
  const waHref = `https://wa.me/${wa.replace(/[^\d]/g, "")}?text=${encodeURIComponent(waMsg)}`;

  return (
    <PublicLayout settings={settings ?? undefined} transparentHero={false}>
      <div className="pt-20 md:pt-24" />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container-editorial pb-4 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link to="/packages" className="hover:text-primary">
              Paket
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="truncate text-foreground">
            {pkg.title}
          </li>
        </ol>
      </nav>

      <HeroSection pkg={pkg} waHref={waHref} />
      <MediaGallerySection pkg={pkg} />
      {pkg.description ? <OverviewSection description={pkg.description} /> : null}
      {pkg.benefits.length ? <BenefitsSection benefits={pkg.benefits} /> : null}
      {pkg.benefits.length ? <IncludedServicesSection benefits={pkg.benefits} /> : null}
      <PricingSection pkg={pkg} waHref={waHref} />
      {pkg.videos.length ? <VideoGallerySection videos={pkg.videos} /> : null}
      {pkg.faqs.length ? <FaqSection faqs={pkg.faqs} /> : null}
      <FinalCtaSection pkg={pkg} waHref={waHref} />

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="container-editorial flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
              Mulai dari
            </div>
            <div className="truncate font-heading text-base text-foreground">
              {formatIDR(pkg.starting_price_idr)}
            </div>
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Konsultasi
          </a>
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </PublicLayout>
  );
}

function HeroSection({ pkg, waHref }: { pkg: PackageDetail; waHref: string }) {
  return (
    <section className="container-editorial">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {pkg.category ? (
              <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 font-medium uppercase tracking-wide text-foreground/80">
                {pkg.category.name}
              </span>
            ) : null}
            {pkg.promo_active && pkg.promo_label ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
                <Sparkles className="h-3 w-3" /> {pkg.promo_label}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-heading text-4xl leading-tight md:text-5xl">{pkg.title}</h1>
          {pkg.subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{pkg.subtitle}</p>
          ) : null}

          {pkg.tags.length ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {pkg.tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/80"
                  style={t.color ? { borderColor: t.color, color: t.color } : undefined}
                >
                  <TagIcon className="h-3 w-3" /> {t.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-7 rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Mulai dari
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-3xl text-foreground md:text-4xl">
                {formatIDR(pkg.starting_price_idr)}
              </span>
              {pkg.promo_active ? (
                <span className="text-base text-muted-foreground line-through">
                  {formatIDR(pkg.normal_price_idr)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" /> Konsultasi via WhatsApp
            </a>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/packages">Lihat Paket Lainnya</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          {pkg.thumbnail_url ? (
            <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)]">
              <img
                src={pkg.thumbnail_url}
                alt={pkg.title}
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
              />
            </div>
          ) : (
            <div className="aspect-[4/3] w-full rounded-2xl bg-accent" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}

function MediaGallerySection({ pkg }: { pkg: PackageDetail }) {
  const items = pkg.media;
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setOpen((i) => (i === null ? null : (i - 1 + items.length) % items.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, items.length]);

  if (!items.length) return null;

  return (
    <section className="container-editorial mt-20">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heading text-2xl md:text-3xl">Galeri</h2>
        <span className="text-sm text-muted-foreground">{items.length} foto</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative overflow-hidden rounded-xl bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Buka foto ${i + 1}`}
          >
            <img
              src={m.url}
              alt={m.alt ?? `${pkg.title} foto ${i + 1}`}
              loading="lazy"
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(null);
            }}
          >
            <X className="h-5 w-5" />
          </button>
          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Sebelumnya"
                className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? null : (i - 1 + items.length) % items.length));
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Berikutnya"
                className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? null : (i + 1) % items.length));
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <img
            src={items[open].url}
            alt={items[open].alt ?? `${pkg.title} foto ${open + 1}`}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

function OverviewSection({ description }: { description: string }) {
  return (
    <section className="container-editorial mt-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-heading text-2xl md:text-3xl">Tentang Paket Ini</h2>
        <div className="prose prose-neutral mt-6 max-w-none text-base leading-[1.85] text-foreground/85">
          {description.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="mb-5">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ benefits }: { benefits: PackageDetail["benefits"] }) {
  return (
    <section className="container-editorial mt-20">
      <h2 className="font-heading text-2xl md:text-3xl">Keuntungan Untuk Anda</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-elegant)]"
          >
            <div
              className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              {b.icon ? <span className="text-lg">{b.icon}</span> : <Check className="h-5 w-5" />}
            </div>
            <div className="font-heading text-lg leading-snug text-foreground">{b.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncludedServicesSection({ benefits }: { benefits: PackageDetail["benefits"] }) {
  return (
    <section className="container-editorial mt-20">
      <h2 className="font-heading text-2xl md:text-3xl">Yang Termasuk Dalam Paket</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Daftar lengkap layanan yang Anda dapatkan dalam paket ini.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <Accordion type="single" collapsible defaultValue="all" className="bg-card">
          <AccordionItem value="all" className="border-0">
            <AccordionTrigger className="px-5 font-heading text-base text-foreground">
              Layanan Termasuk ({benefits.length})
            </AccordionTrigger>
            <AccordionContent className="px-5">
              <ul className="grid gap-3 sm:grid-cols-2">
                {benefits.map((b) => (
                  <li key={b.id} className="flex items-start gap-2 text-sm text-foreground/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{b.label}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

function PricingSection({ pkg, waHref }: { pkg: PackageDetail; waHref: string }) {
  const period = formatPromoPeriod(pkg.promo_starts_at, pkg.promo_ends_at);
  return (
    <section className="container-editorial mt-20">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-10">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Investasi Pernikahan Anda
          </div>
          <h2 className="mt-2 font-heading text-3xl md:text-4xl">{pkg.title}</h2>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="font-heading text-4xl text-foreground md:text-5xl">
              {formatIDR(pkg.starting_price_idr)}
            </span>
            {pkg.promo_active ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatIDR(pkg.normal_price_idr)}
                </span>
                {pkg.promo_label ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> {pkg.promo_label}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
          {period && pkg.promo_active ? (
            <p className="mt-2 text-sm text-muted-foreground">{period}</p>
          ) : null}
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Harga dapat menyesuaikan dengan kebutuhan, jumlah tamu, dan venue Anda. Konsultasikan
            terlebih dahulu untuk mendapatkan penawaran yang paling sesuai.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" /> Konsultasi via WhatsApp
            </a>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/packages">Lihat Paket Lainnya</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoGallerySection({ videos }: { videos: PackageDetail["videos"] }) {
  return (
    <section className="container-editorial mt-20">
      <h2 className="font-heading text-2xl md:text-3xl">Video</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {videos.map((v) => (
          <YouTubeLite key={v.id} url={v.video_url} title={v.title ?? "Video"} />
        ))}
      </div>
    </section>
  );
}

function YouTubeLite({ url, title }: { url: string; title: string }) {
  const id = extractYouTubeId(url);
  const [playing, setPlaying] = useState(false);
  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-border bg-card p-4 text-sm text-foreground hover:bg-accent"
      >
        {title}
      </a>
    );
  }
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Putar ${title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105">
                <Play className="h-7 w-7 translate-x-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function FaqSection({ faqs }: { faqs: PackageDetail["faqs"] }) {
  return (
    <section className="container-editorial mt-20">
      <h2 className="font-heading text-2xl md:text-3xl">Pertanyaan Yang Sering Ditanyakan</h2>
      <div className="mx-auto mt-6 max-w-3xl">
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-b last:border-b-0">
              <AccordionTrigger className="text-left font-heading text-base text-foreground">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/80">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCtaSection({ pkg, waHref }: { pkg: PackageDetail; waHref: string }) {
  return (
    <section
      className={cn(
        "mt-24 bg-[oklch(0.22_0.01_80)] text-white",
        "before:pointer-events-none",
      )}
    >
      <div className="container-editorial py-20 text-center md:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">Konsultasi Gratis</div>
          <h2 className="mt-3 font-heading text-3xl leading-tight md:text-4xl">
            Diskusikan {pkg.title} bersama tim Errika
          </h2>
          <p className="mt-4 text-white/70">
            Setiap pernikahan berbeda. Kami siap membantu menyesuaikan paket dengan visi, jumlah
            tamu, dan budget Anda — tanpa biaya konsultasi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" /> Konsultasi via WhatsApp
            </a>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Lihat Paket Lainnya
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
