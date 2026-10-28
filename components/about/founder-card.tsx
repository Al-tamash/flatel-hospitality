import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { CONTACT_PHONE } from "@/lib/constants";
import { FOUNDER_PHOTO, getAboutContent } from "@/lib/about-content";

/** Founder photo, or a gold-ring "F" monogram until the client sends one. */
export function FounderPortrait({ size, name }: { size: number; name: string }) {
  return (
    <div
      className="relative shrink-0 rounded-full p-[3px] bg-gradient-to-br from-[#E5C178] via-[#C69344] to-[#7A5A2A] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      style={{ width: size, height: size }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0E0A07] flex items-center justify-center">
        {FOUNDER_PHOTO ? (
          <Image src={FOUNDER_PHOTO} alt={name} fill sizes={`${size}px`} className="object-cover" />
        ) : (
          <span
            className="font-heading font-semibold text-[#E5C178] leading-none"
            style={{ fontSize: size * 0.42 }}
            aria-label={name}
          >
            F
          </span>
        )}
      </div>
    </div>
  );
}

export function FounderCard({ locale }: { locale: "en" | "ar" }) {
  const content = getAboutContent(locale);
  const { founder } = content;

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[rgba(212,163,89,0.28)] bg-[rgba(22,16,11,0.85)] backdrop-blur-sm p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <FounderPortrait size={176} name={founder.name} />
        <div className="text-center md:text-start space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5C178]">
            {founder.eyebrow}
          </span>
          <h3 className="font-heading text-3xl sm:text-4xl text-[#FAF4EB]">{founder.name}</h3>
          <p className="text-sm font-medium text-[#E5C178]">{founder.role}</p>
          <p className="text-sm text-[#D4C4B3] leading-relaxed max-w-xl">{founder.bio}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-sm text-[#E5C178] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">{CONTACT_PHONE}</span>
            </a>
            <a
              href={`mailto:${founder.email}`}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-[rgba(212,163,89,0.4)] hover:border-[#E5C178] text-sm text-[#E5C178] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span dir="ltr">{founder.email}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p className="font-heading text-lg text-[#FAF4EB]">{content.companyLine}</p>
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B8A692]">{content.companySub}</p>
      </div>
    </div>
  );
}
