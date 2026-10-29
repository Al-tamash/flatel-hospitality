import { cn } from "@/lib/utils";
import type { MembershipContent } from "@/lib/membership/membership-content";

/**
 * The Flatel member card. Sizes use container-query units so the whole card scales
 * with its width; the card is a brand artefact, so it stays left-to-right in Arabic too.
 */
export function MembershipCard({
  content,
  className,
}: {
  content: Pick<MembershipContent, "cardTitle" | "cardTier" | "cardHolder" | "cardValid" | "cardId">;
  className?: string;
}) {
  return (
    <div
      dir="ltr"
      className={cn("w-full max-w-[440px] [perspective:1200px]", className)}
      role="img"
      aria-label="Flatel Member card"
    >
      <div
        className="group relative aspect-[1.586] w-full overflow-hidden rounded-[5.5%/8.7%] border border-[rgba(229,193,120,0.55)] bg-[linear-gradient(135deg,#1d140c_0%,#0d0905_55%,#1a1109_100%)] shadow-[0_30px_70px_rgba(0,0,0,0.75),0_0_60px_rgba(229,193,120,0.12)] transition-transform duration-500 motion-safe:hover:[transform:rotateY(-6deg)_rotateX(4deg)]"
        style={{ containerType: "inline-size" }}
      >
        {/* Engraved concentric pattern */}
        <div
          aria-hidden="true"
          className="absolute -right-[18%] -top-[40%] h-[130%] aspect-square rounded-full opacity-60 [background:repeating-radial-gradient(circle,transparent_0_3.2cqw,rgba(229,193,120,0.09)_3.2cqw_3.5cqw)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(229,193,120,0.22)_0%,transparent_55%)]"
        />
        {/* Light sweep */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[rgba(255,236,190,0.18)] to-transparent motion-safe:animate-[card-sheen_5.5s_ease-in-out_infinite]"
        />

        <div className="relative flex h-full flex-col justify-between p-[6.5cqw]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-heading text-[7.2cqw] leading-none tracking-[0.18em] text-[#E5C178]">
                {content.cardTitle}
              </p>
              <p className="mt-[1.2cqw] text-[2.6cqw] font-semibold tracking-[0.42em] text-[#D4C4B3]">
                {content.cardTier}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[6cqw] font-bold leading-none text-[#FAF4EB]">₹777</p>
              <p className="mt-[1cqw] text-[2.2cqw] tracking-[0.2em] text-[#B8A692]">ONE-TIME</p>
            </div>
          </div>

          <div className="flex items-center gap-[4cqw]">
            {/* Chip */}
            <div
              aria-hidden="true"
              className="relative h-[9.5cqw] w-[13cqw] rounded-[1.6cqw] border border-[rgba(60,40,10,0.6)] bg-[linear-gradient(135deg,#f3d99a,#b98a3e_55%,#e5c178)]"
            >
              <span className="absolute inset-x-0 top-1/2 h-px bg-[rgba(60,40,10,0.45)]" />
              <span className="absolute inset-y-0 left-1/3 w-px bg-[rgba(60,40,10,0.45)]" />
              <span className="absolute inset-y-0 right-1/3 w-px bg-[rgba(60,40,10,0.45)]" />
            </div>
            <p className="font-mono text-[4.4cqw] tracking-[0.28em] text-[#FAF4EB]/90">{content.cardId}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[2cqw] tracking-[0.26em] text-[#B8A692]">MEMBER</p>
              <p className="mt-[0.8cqw] text-[3.6cqw] font-semibold tracking-[0.2em] text-[#FAF4EB]">
                {content.cardHolder}
              </p>
            </div>
            <p className="text-[2.3cqw] font-semibold tracking-[0.2em] text-[#E5C178]">{content.cardValid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
