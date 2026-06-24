/**
 * JSON-LD helpers. Render the output via:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 */

export function organizationJsonLd(opts: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  telephone?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: opts.name,
    url: opts.url,
    ...(opts.logo ? { logo: opts.logo } : {}),
    ...(opts.sameAs ? { sameAs: opts.sameAs } : {}),
    ...(opts.telephone ? { telephone: opts.telephone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
  };
}

export function articleJsonLd(opts: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    image: opts.image ? [opts.image] : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: opts.authorName ? { "@type": "Person", name: opts.authorName } : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  priceIdr?: number;
  promoPriceIdr?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    provider: { "@type": "Organization", name: "Errika Wedding Planner & Organizer" },
    areaServed: "Jakarta",
    offers: opts.priceIdr
      ? {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: opts.promoPriceIdr ?? opts.priceIdr,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
