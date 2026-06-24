import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  phone?: string;
  message?: string;
  className?: string;
}

/**
 * Floating WhatsApp CTA — visible on every public page. Number + default
 * message come from `site_settings.contact`. Hidden if no number configured.
 */
export function WhatsAppCTA({ phone, message, className }: Props) {
  if (!phone) return null;
  const normalized = phone.replace(/[^\d]/g, "");
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message ?? "Halo Errika")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[oklch(0.7_0.18_150)] text-white shadow-[var(--shadow-elegant)] transition-transform hover:scale-105",
        className,
      )}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
