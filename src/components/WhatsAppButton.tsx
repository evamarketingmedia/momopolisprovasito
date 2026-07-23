import { MessageCircle, Phone } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";

export default function WhatsAppButton({ dict }: { dict: Dictionary }) {
  const waHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    dict.whatsapp.defaultMessage
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <a
        href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
        aria-label={dict.cta.callUs}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-momo-black text-white shadow-lg ring-2 ring-white/10 transition-transform hover:scale-110 sm:hidden"
      >
        <Phone size={20} />
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.whatsapp.tooltip}
        className="group flex animate-momo-bounce items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 text-white shadow-glow-orange transition-transform hover:scale-105"
      >
        <MessageCircle size={22} />
        <span className="hidden text-sm font-extrabold sm:inline">
          {dict.whatsapp.tooltip}
        </span>
      </a>
    </div>
  );
}
