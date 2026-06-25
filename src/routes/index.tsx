import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/site-settings.functions";
import { buildMeta } from "@/lib/seo/meta";
import {
  HeroSection,
  TrustStatsSection,
  ProblemsSection,
  HowWeHelpSection,
  JourneySection,
  BudgetCalculatorPreview,
  PackageCategoriesSection,
  PortfolioCarouselSection,
  TestimonialsSection,
  SatisfactionCenterSection,
  WhyChooseUsSection,
  FaqSection,
  BlogPreviewSection,
  FinalCtaSection,
} from "@/components/home/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildMeta({
      title: "Errika Wedding Planner & Organizer Jakarta",
      description:
        "Wedding planner & organizer terpercaya di Jakarta. Konsultasi gratis, paket fleksibel, dan pendampingan profesional untuk mewujudkan pernikahan impian Anda.",
      ogType: "website",
      canonical: "/",
    }),
    meta: [
      ...buildMeta({
        title: "Errika Wedding Planner & Organizer Jakarta",
        description:
          "Wedding planner & organizer terpercaya di Jakarta. Konsultasi gratis, paket fleksibel, dan pendampingan profesional untuk mewujudkan pernikahan impian Anda.",
        ogType: "website",
        canonical: "/",
      }).meta,
      { property: "og:url", content: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Errika Wedding Planner & Organizer",
          description: "Wedding planner & organizer di Jakarta — Affordable Luxury, Perfectly Planned.",
          areaServed: "Indonesia",
          slogan: "Affordable Luxury, Perfectly Planned",
        }),
      },
    ],
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
    <PublicLayout settings={settings as PublicSiteSettings | undefined} transparentHero>
      <HeroSection />
      <TrustStatsSection />
      <ProblemsSection />
      <HowWeHelpSection />
      <JourneySection />
      <BudgetCalculatorPreview />
      <PackageCategoriesSection />
      <PortfolioCarouselSection />
      <TestimonialsSection />
      <SatisfactionCenterSection />
      <WhyChooseUsSection />
      <FaqSection />
      <BlogPreviewSection />
      <FinalCtaSection />
    </PublicLayout>
  );
}
