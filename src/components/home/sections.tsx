import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarCheck,
  Compass,
  HandHeart,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Users,
  Wallet,
  ListChecks,
  Star,
  Quote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Award,
  Crown,
  Gem,
  ArrowUpRight,
} from "lucide-react";

import heroImg from "@/assets/hero-wedding.jpg";
import catMinang from "@/assets/cat-minang.jpg";
import catGedung from "@/assets/cat-gedung.jpg";
import catRumah from "@/assets/cat-rumah.jpg";
import catLainnya from "@/assets/cat-lainnya.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import p5 from "@/assets/portfolio-5.jpg";

const WA_HREF =
  "https://wa.me/6281234567890?text=" +
  encodeURIComponent("Halo Errika, saya ingin konsultasi gratis untuk pernikahan saya.");

/* ----------------------------- 1. HERO ----------------------------- */
export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Pernikahan elegan diatur oleh Errika Wedding Planner"
        width={1600}
        height={1200}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="container-editorial pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl text-white">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Affordable Luxury, Perfectly Planned
          </p>
          <h1 className="mt-6 text-balance font-heading text-white">
            Wujudkan Pernikahan Impian Anda dengan Perencanaan yang Tepat
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/85 md:text-lg">
            Paket wedding lengkap, konsultasi profesional, dan pendampingan dari tim
            berpengalaman untuk mewujudkan hari bahagia yang berkesan.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:scale-[1.02] hover:bg-primary/90"
            >
              Konsultasi Gratis <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/packages"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/15"
            >
              Lihat Paket
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 flex justify-center text-white/70">
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}

/* -------------------------- 2. TRUST STATS ------------------------- */
const STATS = [
  { value: "500+", label: "Wedding Projects" },
  { value: "10+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "1,200+", label: "Happy Couples" },
];

export function TrustStatsSection() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container-editorial grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center bg-card px-4 py-10 text-center md:py-14">
            <div className="font-heading text-4xl text-primary md:text-5xl">{s.value}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------- Section heading helper ------------------- */
function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-4 text-balance font-heading text-foreground">{title}</h2>
      {description ? (
        <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <div className={`mt-6 h-px w-20 editorial-rule ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}

/* -------------------------- 3. PROBLEMS ---------------------------- */
const PROBLEMS = [
  { icon: Compass, title: "Bingung memulai persiapan", desc: "Tidak tahu langkah pertama, prioritas, atau timeline yang realistis." },
  { icon: Wallet, title: "Takut budget membengkak", desc: "Estimasi biaya tidak akurat dan biaya tersembunyi sering muncul di tengah jalan." },
  { icon: Users, title: "Sulit memilih vendor", desc: "Banyak pilihan vendor tanpa referensi terpercaya dan kualitas yang konsisten." },
  { icon: ShieldCheck, title: "Takut acara tidak lancar", desc: "Cemas hari-H kacau, kurang koordinasi, dan tidak ada tim yang mendampingi." },
];

export function ProblemsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Kami Mengerti"
          title="Setiap Calon Pengantin Menghadapi Tantangan yang Sama"
          description="Persiapan pernikahan terasa kompleks dan penuh keputusan besar. Anda tidak perlu menghadapinya sendiri."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- 4. HOW WE HELP -------------------------- */
const HELP = [
  { icon: ListChecks, title: "Planning", desc: "Perencanaan terstruktur mulai dari konsep, timeline, hingga rencana anggaran detail." },
  { icon: HeartHandshake, title: "Coordination", desc: "Koordinasi end-to-end antara vendor, venue, keluarga, dan tim pelaksana." },
  { icon: Users, title: "Vendor Management", desc: "Akses ke jaringan vendor tepercaya dengan kualitas dan harga yang transparan." },
  { icon: CalendarCheck, title: "Execution", desc: "Eksekusi profesional di hari-H — Anda fokus menikmati, kami yang memastikan semua berjalan." },
];

export function HowWeHelpSection() {
  return (
    <section className="bg-[oklch(0.96_0.012_80)] py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Cara Kami Membantu"
          title="Pendekatan End-to-End yang Profesional"
          description="Empat pilar layanan yang membuat persiapan pernikahan Anda terasa mudah, terkendali, dan menyenangkan."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HELP.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl bg-card p-8 shadow-[var(--shadow-elegant)]">
              <div className="font-heading text-3xl text-primary/30">0{i + 1}</div>
              <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 5. JOURNEY ----------------------------- */
const JOURNEY = [
  { step: "01", title: "Konsultasi", desc: "Diskusi visi, preferensi, dan kebutuhan untuk memahami pernikahan impian Anda." },
  { step: "02", title: "Pilih Paket", desc: "Rekomendasi paket yang sesuai dengan budget, gaya, dan skala acara." },
  { step: "03", title: "Persiapan", desc: "Eksekusi rencana — vendor, dekorasi, rundown, dan koordinasi keluarga." },
  { step: "04", title: "Hari Pernikahan", desc: "Tim Errika hadir penuh — Anda hanya perlu hadir dan menikmati momen." },
  { step: "05", title: "After Event", desc: "Penutupan acara, pengembalian aset, dokumentasi akhir, dan ucapan terima kasih." },
];

export function JourneySection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Wedding Planning Journey"
          title="Perjalanan Persiapan Pernikahan Bersama Errika"
          description="Lima tahap terstruktur — transparan, terdokumentasi, dan didampingi tim profesional di setiap langkah."
        />
        <div className="relative mt-16">
          <div className="absolute left-5 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <ol className="space-y-12 md:space-y-16">
            {JOURNEY.map((j, i) => (
              <li key={j.step} className={`relative grid gap-6 md:grid-cols-2 md:gap-12 ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
                <div className={`pl-14 md:pl-0 ${i % 2 === 1 ? "md:text-left md:pl-12" : "md:text-right md:pr-12"}`}>
                  <div className="font-heading text-5xl text-primary/30 md:text-6xl">{j.step}</div>
                  <h3 className="mt-2 font-heading text-2xl">{j.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:max-w-sm md:[.text-right_&]:ml-auto">
                    {j.desc}
                  </p>
                </div>
                <div className="hidden md:block" />
                <span className="absolute left-5 top-2 -translate-x-1/2 inline-flex h-3 w-3 rounded-full bg-primary ring-4 ring-background md:left-1/2" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* --------------------- 6. BUDGET CALCULATOR ------------------------ */
export function BudgetCalculatorPreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.27_0_0)] to-[oklch(0.32_0.02_80)] px-8 py-16 md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-xl text-white">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/80">
                <Calculator className="h-3.5 w-3.5 text-primary" />
                Budget Calculator
              </p>
              <h2 className="mt-5 font-heading text-white">Hitung Budget Wedding Anda</h2>
              <p className="mt-4 text-balance text-base leading-relaxed text-white/75">
                Bantu calon pengantin mendapatkan estimasi budget dan rekomendasi paket yang
                sesuai — dalam beberapa langkah singkat dan transparan.
              </p>
              <Link
                to="/budget-calculator"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Mulai Kalkulasi <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative hidden h-48 w-48 shrink-0 items-center justify-center md:flex">
              <div className="absolute inset-0 rounded-full border border-primary/30" />
              <div className="absolute inset-4 rounded-full border border-primary/20" />
              <Calculator className="h-20 w-20 text-primary" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 7. PACKAGES ---------------------------- */
const CATEGORIES = [
  { slug: "minang", name: "Wedding Minang", desc: "Pernikahan adat Minang lengkap dengan prosesi tradisional autentik.", price: "Mulai 75 Juta", img: catMinang },
  { slug: "gedung", name: "Wedding Gedung", desc: "Resepsi mewah di ballroom dengan kapasitas hingga 1.000 tamu.", price: "Mulai 120 Juta", img: catGedung },
  { slug: "rumah", name: "Wedding Aula & Rumah", desc: "Intimate wedding di aula atau rumah dengan suasana hangat.", price: "Mulai 50 Juta", img: catRumah },
  { slug: "lainnya", name: "Paket Lainnya", desc: "Paket custom — destination, garden, atau bespoke wedding.", price: "On Request", img: catLainnya },
];

export function PackageCategoriesSection() {
  return (
    <section className="bg-[oklch(0.96_0.012_80)] py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Paket Wedding"
          title="Pilih Paket yang Sesuai dengan Visi Anda"
          description="Dari intimate wedding hingga grand ballroom — setiap paket dirancang fleksibel dan transparan."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/packages"
              className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-gold)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.img}
                  alt={c.name}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/85">{c.price}</div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-xl">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Lihat Detail
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 8. PORTFOLIO --------------------------- */
const PORTFOLIO = [
  { img: p1, title: "Sarah & Adit", subtitle: "Intimate Garden Wedding" },
  { img: p2, title: "Reza & Nadia", subtitle: "Grand Ballroom Reception" },
  { img: p3, title: "Bayu & Maya", subtitle: "Chapel Wedding" },
  { img: p4, title: "Hari & Lina", subtitle: "On-site Coordination" },
  { img: p5, title: "Dimas & Putri", subtitle: "Reception First Dance" },
];

export function PortfolioCarouselSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 480), behavior: "smooth" });
  };
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Portfolio Highlights</p>
            <h2 className="mt-4 font-heading">Cerita di Balik Setiap Pernikahan</h2>
            <div className="mt-5 h-px w-20 editorial-rule" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scroll(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scroll(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:px-[max(1.25rem,calc((100vw-72rem)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {PORTFOLIO.map((item) => (
          <figure
            key={item.title}
            className="group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[420px]"
          >
            <img
              src={item.img}
              alt={item.title}
              width={900}
              height={1100}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5 text-white">
              <div className="font-heading text-xl">{item.title}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">{item.subtitle}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="container-editorial mt-10 text-center">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Lihat Semua Portfolio <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------ 9. TESTIMONIALS -------------------------- */
const TESTIMONIALS = [
  { name: "Sarah & Adit", venue: "Intimate Garden, Bogor", rating: 5, quote: "Errika benar-benar memahami visi kami. Dari konsep sampai hari-H semuanya berjalan mulus tanpa kami harus pusing." },
  { name: "Reza & Nadia", venue: "Ballroom Grand Hyatt", rating: 5, quote: "Tim Errika sangat profesional. Vendor recommendation mereka tepat banget, dan budgeting transparan dari awal." },
  { name: "Bayu & Maya", venue: "Chapel & Reception", rating: 5, quote: "Komunikasi rapi, timeline jelas, eksekusi sempurna. Tamu-tamu kami sampai bilang ini wedding terbaik yang mereka hadiri." },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[oklch(0.96_0.012_80)] py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Testimonial"
          title="Cerita Calon Pengantin yang Telah Mempercayai Errika"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="relative flex flex-col rounded-2xl bg-card p-8 shadow-[var(--shadow-elegant)]">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/15" />
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </div>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
              <footer className="mt-6 border-t border-border pt-4">
                <div className="font-heading text-base">{t.name}</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.venue}</div>
              </footer>
            </article>
          ))}
        </div>
        {/* video-ready placeholder row */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[oklch(0.92_0.012_80)] to-[oklch(0.88_0.018_80)]"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div className="absolute bottom-3 left-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Video Testimonial {i}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- 10. SATISFACTION CENTER ---------------------- */
const SATISFACTION = [
  { label: "Overall Satisfaction", value: 98 },
  { label: "Communication", value: 97 },
  { label: "Coordination", value: 99 },
  { label: "Timeline", value: 96 },
  { label: "Recommendation Rate", value: 99 },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-heading text-2xl text-primary">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.81_0.07_82)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function SatisfactionCenterSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Satisfaction Center"
              title="Dipercaya Ratusan Pasangan, Diukur Secara Transparan"
              description="Kami mengukur kepuasan klien di setiap proyek dan membagikan hasilnya secara terbuka."
              align="left"
            />
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary to-[oklch(0.81_0.07_82)]" />
                ))}
              </div>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
                <span className="ml-2 text-sm font-medium text-foreground">4.98 / 5.0</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)] md:p-10">
            {SATISFACTION.map((s) => (
              <ScoreBar key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 11. WHY US ----------------------------- */
const WHY = [
  { icon: Award, title: "10+ Tahun Pengalaman", desc: "Lebih dari 500 pernikahan ditangani dengan dedikasi dan standar profesional tinggi." },
  { icon: Crown, title: "Tim Profesional", desc: "Wedding planner bersertifikasi dengan jaringan vendor pilihan di seluruh Indonesia." },
  { icon: Gem, title: "End-to-End Service", desc: "Dari konsultasi pertama hingga after event — satu tim, satu tanggung jawab." },
  { icon: HandHeart, title: "Proses Transparan", desc: "Budget, timeline, dan progress dilaporkan terbuka di setiap tahap perencanaan." },
];

export function WhyChooseUsSection() {
  return (
    <section className="bg-[oklch(0.22_0.01_80)] py-20 text-white md:py-28">
      <div className="container-editorial">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">Why Choose Errika</p>
          <h2 className="mt-4 font-heading text-white">Alasan Pasangan Mempercayakan Hari Bahagianya Kepada Kami</h2>
          <div className="mt-5 h-px w-20 editorial-rule" />
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {WHY.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5">
              <div className="shrink-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-xl text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- 12. FAQ ----------------------------- */
const FAQ = [
  { q: "Kapan waktu terbaik untuk mulai merencanakan pernikahan?", a: "Idealnya 6–12 bulan sebelum tanggal pernikahan, terutama jika ingin venue atau vendor populer. Untuk intimate wedding, 3–6 bulan masih sangat memungkinkan." },
  { q: "Apakah Errika hanya melayani pernikahan di Jakarta?", a: "Tidak. Basis kami di Jakarta, namun kami menangani pernikahan di seluruh Indonesia termasuk destination wedding di Bali, Yogyakarta, dan luar negeri." },
  { q: "Bagaimana sistem pembayaran dan apakah ada biaya tersembunyi?", a: "Pembayaran bertahap dengan kontrak yang jelas. Semua biaya transparan sejak proposal — tidak ada biaya tersembunyi di tengah jalan." },
  { q: "Apakah kami bisa custom paket?", a: "Bisa. Setiap paket fleksibel dan dapat disesuaikan dengan kebutuhan, budget, serta jumlah tamu Anda." },
  { q: "Berapa lama proses konsultasi awal?", a: "Konsultasi awal gratis 30–60 menit, baik online maupun offline. Tidak ada komitmen — Anda bebas memutuskan setelahnya." },
  { q: "Apakah Errika menyediakan dokumentasi foto dan video?", a: "Ya. Kami bekerja sama dengan fotografer dan videografer terpilih yang dapat dimasukkan dalam paket atau direkomendasikan secara terpisah." },
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-heading text-lg text-foreground">{q}</span>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Frequently Asked"
          title="Pertanyaan yang Sering Ditanyakan"
          description="Beberapa hal yang sering ditanyakan calon pengantin sebelum memulai persiapan."
        />
        <div className="mx-auto mt-12 max-w-3xl">
          {FAQ.map((item, i) => (
            <FaqItem key={item.q} {...item} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- 13. BLOG ------------------------------- */
const POSTS = [
  { img: p3, tag: "Planning", title: "Checklist Lengkap Persiapan Pernikahan 6 Bulan", excerpt: "Panduan praktis bulan demi bulan agar persiapan tidak overwhelming dan tetap terkendali." },
  { img: p2, tag: "Budgeting", title: "Cara Menyusun Budget Wedding yang Realistis", excerpt: "Breakdown alokasi anggaran dan tips menghindari biaya membengkak di tengah jalan." },
  { img: p5, tag: "Inspirasi", title: "5 Tema Wedding yang Tren di 2026", excerpt: "Dari intimate garden hingga modern editorial — pilih tema yang sesuai dengan visi Anda." },
];

export function BlogPreviewSection() {
  return (
    <section className="bg-[oklch(0.96_0.012_80)] py-20 md:py-28">
      <div className="container-editorial">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Journal</p>
            <h2 className="mt-4 font-heading">Tips & Inspirasi Wedding Planning</h2>
            <div className="mt-5 h-px w-20 editorial-rule" />
          </div>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            Lihat Semua Artikel <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {POSTS.map((post) => (
            <article key={post.title} className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-1">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.img}
                  alt={post.title}
                  width={900}
                  height={563}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">{post.tag}</span>
                <h3 className="mt-4 font-heading text-xl leading-snug">{post.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Baca Artikel <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- 14. FINAL CTA --------------------------- */
export function FinalCtaSection() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-32">
      <img
        src={heroImg}
        alt=""
        aria-hidden
        width={1600}
        height={1200}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[oklch(0.22_0.01_80/0.92)] to-[oklch(0.18_0.01_80/0.95)]" />
      <div className="container-editorial text-center text-white">
        <Sparkles className="mx-auto h-7 w-7 text-primary" />
        <h2 className="mx-auto mt-6 max-w-2xl text-balance font-heading text-white">
          Siap Merencanakan Pernikahan Impian Anda?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-white/80">
          Mulai dengan konsultasi gratis 30 menit. Kami akan membantu Anda memahami pilihan,
          budget, dan langkah pertama tanpa komitmen apapun.
        </p>
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:scale-[1.02] hover:bg-primary/90"
        >
          Konsultasi Gratis via WhatsApp <ArrowRight className="h-5 w-5" />
        </a>
        <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/55">
          Respon dalam &lt; 1 jam · Tidak ada komitmen
        </p>
      </div>
    </section>
  );
}

// Add useEffect import compatibility helper used by FaqItem
export { useEffect };
