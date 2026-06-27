import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Instagram, Facebook, Youtube } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { cn } from "@/lib/utils";

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
  contact?: { whatsapp_number?: string; whatsapp_default_message?: string; email?: string; address?: string };
  social?: { instagram_url?: string; facebook_url?: string; tiktok_url?: string; youtube_url?: string };
}

/**
 * Public site shell. Header is sticky, transparent at the top, and gains a
 * solid ivory background + border once the user scrolls. Mobile collapses
 * the nav into a sheet-style overlay; floating WhatsApp lives in WhatsAppCTA.
 *
 * `transparentHero` defaults to true on routes with a full-bleed hero so the
 * header floats over it; pass `false` on inner pages.
 */
export function PublicLayout({
  children,
  settings,
  transparentHero = true,
}: {
  children: ReactNode;
  settings?: SiteSettings;
  transparentHero?: boolean;
}) {
  const brandName = settings?.branding?.website_name ?? "Errika Wedding Planner";
  const tagline = settings?.branding?.tagline ?? "Affordable Luxury, Perfectly Planned";
  const wa = settings?.contact?.whatsapp_number ?? "6281234567890";
  const waMsg =
    settings?.contact?.whatsapp_default_message ??
    "Halo Errika, saya ingin konsultasi gratis untuk pernikahan saya.";
  const waHref = `https://wa.me/${wa.replace(/[^\d]/g, "")}?text=${encodeURIComponent(waMsg)}`;

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || !transparentHero || open;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          solid
            ? "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            : "bg-transparent",
        )}
      >
        <div className="container-editorial grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:h-20 md:flex md:justify-between">
          <Link
            to="/"
            className={cn(
              "min-w-0 truncate font-heading text-xl tracking-tight md:text-2xl",
              solid ? "text-foreground" : "text-white drop-shadow-sm",
            )}
            onClick={() => setOpen(false)}
          >
            {brandName}
          </Link>

          <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative transition-colors",
                  solid ? "text-foreground/80 hover:text-primary" : "text-white/90 hover:text-white",
                )}
                activeProps={{ className: cn("text-primary", !solid && "text-white") }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:bg-primary/90 hover:shadow-[var(--shadow-gold)] md:inline-flex"
            >
              Konsultasi Gratis
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
                solid ? "text-foreground hover:bg-accent" : "text-white hover:bg-white/10",
              )}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <div
          className={cn(
            "lg:hidden",
            open ? "block" : "hidden",
            "border-t border-border bg-background",
          )}
        >
          <nav className="container-editorial flex flex-col py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-foreground/85 transition-colors hover:bg-accent hover:text-primary"
                activeProps={{ className: "text-primary bg-accent" }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Konsultasi Gratis via WhatsApp
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 bg-[oklch(0.22_0.01_80)] text-[oklch(0.92_0.008_80)]">
        <div className="container-editorial grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="font-heading text-2xl text-white">{brandName}</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">{tagline}</p>
            <div className="mt-6 flex items-center gap-3">
              {settings?.social?.instagram_url ? (
                <a href={settings.social.instagram_url} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              {settings?.social?.facebook_url ? (
                <a href={settings.social.facebook_url} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <Facebook className="h-4 w-4" />
                </a>
              ) : null}
              {settings?.social?.youtube_url ? (
                <a href={settings.social.youtube_url} aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <Youtube className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Explore</div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {NAV.slice(1).map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="transition-colors hover:text-primary">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Hubungi Kami</div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {settings?.contact?.email ? <li>Email: {settings.contact.email}</li> : <li>Email: hello@errika.id</li>}
              <li>WhatsApp: {wa}</li>
              <li>{settings?.contact?.address ?? "Jakarta, Indonesia"}</li>
            </ul>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Mulai Konsultasi Gratis
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-editorial flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/55 md:flex-row">
            <span>© {new Date().getFullYear()} {brandName}. All rights reserved.</span>
            <span>Affordable Luxury, Perfectly Planned.</span>
          </div>
        </div>
      </footer>

      <WhatsAppCTA phone={wa} message={waMsg} />
    </div>
  );
}
