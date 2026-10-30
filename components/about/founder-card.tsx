import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { CONTACT_PHONE } from "@/lib/constants";
import { FOUNDER_PHOTO, getAboutContent } from "@/lib/about-content";

/** Founder photo, or a gold-ring "F" monogram until the client sends one. */
export function FounderPortrait({ size, name }: { size: number; name: string }) {
  return (
    <div
      className="relative shrink-0 rounded-full p-[3px] bg-gradient-to-br from-gold via-gold-deep to-bronze shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      style={{ width: size, height: size }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full bg-canvas flex items-center justify-center">
        {FOUNDER_PHOTO ? (
          <Image src={FOUNDER_PHOTO} alt={name} fill sizes={`${size}px`} className="object-cover" />
        ) : (
          <span
            className="font-heading font-semibold text-gold leading-none"
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
      <div className="border-y border-line py-8 sm:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <FounderPortrait size={176} name={founder.name} />
        <div className="text-center md:text-start space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {founder.eyebrow}
          </span>
          <h3 className="font-heading text-3xl sm:text-4xl text-fg">{founder.name}</h3>
          <p className="text-sm font-medium text-gold">{founder.role}</p>
          <p className="text-sm text-fg-soft leading-relaxed max-w-xl">{founder.bio}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-line-strong hover:border-gold text-sm text-gold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">{CONTACT_PHONE}</span>
            </a>
            <a
              href={`mailto:${founder.email}`}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-line-strong hover:border-gold text-sm text-gold transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span dir="ltr">{founder.email}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p className="font-heading text-lg text-fg">{content.companyLine}</p>
        <p className="text-xs sm:text-xs uppercase tracking-[0.3em] text-fg-muted">{content.companySub}</p>
      </div>
    </div>
  );
}
