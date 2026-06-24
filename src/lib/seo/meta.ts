/**
 * SEO meta builder. Returns the `meta` array shape TanStack `head()` expects.
 * Use in every route's `head()` — never hardcode meta tags inline.
 */
export interface MetaInput {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  keywords?: string[];
  noindex?: boolean;
}

const SITE_NAME = "Errika Wedding Planner & Organizer";

export function buildMeta(input: MetaInput) {
  const title = input.title.includes(SITE_NAME) ? input.title : `${input.title} — ${SITE_NAME}`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: input.description },
    { property: "og:title", content: title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.ogType ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "id_ID" },
    { name: "twitter:card", content: input.twitterCard ?? (input.ogImage ? "summary_large_image" : "summary") },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: input.description },
  ];
  if (input.ogImage) {
    meta.push({ property: "og:image", content: input.ogImage });
    meta.push({ name: "twitter:image", content: input.ogImage });
  }
  if (input.keywords?.length) {
    meta.push({ name: "keywords", content: input.keywords.join(", ") });
  }
  if (input.noindex) {
    meta.push({ name: "robots", content: "noindex,nofollow" });
  }
  return { meta, links: input.canonical ? [{ rel: "canonical", href: input.canonical }] : [] };
}

export function buildCanonical(path: string, origin?: string) {
  const base = origin ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
