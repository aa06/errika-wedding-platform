import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { WhatsAppCTA } from "./WhatsAppCTA";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Packages", to: "/packages" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Budget Calculator", to: "/budget-calculator" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

interface SiteSettings {
  branding?: { website_name?: string; logo_url?: string; tagline?: string };
  contact?: { whatsapp_number?: string; whatsapp_default_message?: string; email?: string };
  social?: { instagram_url?: string; facebook_url?: string; tiktok_url?: string; youtube_url?: string };
}

export function PublicLayout({ children, settings }: { children: ReactNode; settings?: SiteSettings }) {
  const brandName = settings?.branding?.website_name ?? "Errika";
  const tagline = settings?.branding?.tagline ?? "Wedding Planner & Organizer Jakarta";
  const wa = settings?.contact?.whatsapp_number;
  const waMsg = settings?.contact?.whatsapp_default_message;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container-editorial flex h-16 items-center justify-between gap-6">
          <Link to="/" className="font-heading text-xl tracking-tight">
            {brandName}
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-foreground/75 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {wa ? (
            <a
              href={`https://wa.me/${wa.replace(/[^\d]/g, "")}?text=${encodeURIComponent(waMsg ?? "Halo Errika")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-border bg-card">
        <div className="container-editorial grid gap-10 py-12 md:grid-cols-3">
          <div>
            <div className="font-heading text-lg">{brandName}</div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{tagline}</p>
          </div>
          <div>
            <div className="text-sm font-medium">Explore</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {NAV.slice(1, 6).map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="hover:text-primary">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium">Contact</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {settings?.contact?.email ? <li>{settings.contact.email}</li> : null}
              {wa ? <li>WhatsApp: {wa}</li> : null}
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container-editorial py-5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </div>
        </div>
      </footer>

      <WhatsAppCTA phone={wa} message={waMsg} />
    </div>
  );
}
