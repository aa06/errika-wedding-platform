import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/site-settings.functions";
import { buildMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/")({
  head: () =>
    buildMeta({
      title: "Errika Wedding Planner & Organizer Jakarta",
      description:
        "Wedding planner & organizer terpercaya di Jakarta. Konsultasi gratis, paket fleksibel 30jt–150jt IDR.",
      ogType: "website",
    }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["site-settings"],
      queryFn: () => getPublicSiteSettings(),
    }),
  component: Index,
});

function Index() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getPublicSiteSettings(),
  });

  return (
    <PublicLayout settings={settings as never}>
      <section className="container-editorial py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Foundation Sprint</p>
          <h1 className="mt-4 text-balance font-heading text-foreground">
            Wedding Planner & Organizer Jakarta
          </h1>
          <div className="mx-auto mt-6 h-px w-24 editorial-rule" />
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground">
            Platform sedang dalam tahap pembangunan. Halaman, paket, portfolio, dan kalkulator
            anggaran akan hadir di sprint berikutnya.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
