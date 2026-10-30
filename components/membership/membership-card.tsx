import { cn } from "@/lib/utils";
import type { MembershipCardContent, MembershipTierId } from "@/lib/membership/membership-content";

/** Class strings are written out in full so Tailwind can see them. */
const THEMES: Record<
  MembershipTierId,
  { frame: string; pattern: string; glow: string; sheen: string; accent: string; chip: string; chipLine: string }
> = {
  golden: {
    frame:
      "border-line-strong bg-[linear-gradient(135deg,#1d140c_0%,#0d0905_55%,#1a1109_100%)] shadow-[0_30px_70px_rgba(0,0,0,0.75),0_0_60px_color-mix(in_srgb,var(--gold)_12%,transparent)]",
    pattern: "[background:repeating-radial-gradient(circle,transparent_0_3.2cqw,rgba(229,193,120,0.09)_3.2cqw_3.5cqw)]",
    glow: "bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_srgb,var(--gold)_22%,transparent)_0%,transparent_55%)]",
    sheen: "via-[rgba(255,236,190,0.18)]",
    accent: "text-gold",
    chip: "bg-[linear-gradient(135deg,var(--gold-bright),#b98a3e_55%,var(--gold))]",
    chipLine: "bg-[rgba(60,40,10,0.45)]",
  },
  platinum: {
    frame:
      "border-[rgba(214,222,235,0.6)] bg-[linear-gradient(135deg,#1b1f25_0%,#0a0c0f_55%,#161a20_100%)] shadow-[0_30px_70px_rgba(0,0,0,0.75),0_0_60px_rgba(214,222,235,0.12)]",
    pattern: "[background:repeating-radial-gradient(circle,transparent_0_3.2cqw,rgba(214,222,235,0.09)_3.2cqw_3.5cqw)]",
    glow: "bg-[radial-gradient(ellipse_at_12%_0%,rgba(214,222,235,0.22)_0%,transparent_55%)]",
    sheen: "via-[rgba(235,241,250,0.2)]",
    accent: "text-[#D9E0EA]",
    chip: "bg-[linear-gradient(135deg,#eef2f7,#8d97a6_55%,#d9e0ea)]",
    chipLine: "bg-[rgba(30,36,46,0.45)]",
  },
};

/**
 * The Flatel member card, in gold or platinum. Sizes use container-query units so the whole
 * card scales with its width; the card is a brand artefact, so it stays left-to-right in Arabic too.
 */
export function MembershipCard({
  content,
  className,
}: {
  content: MembershipCardContent;
  className?: string;
}) {
  const theme = THEMES[content.tier];

  return (
    <div
      dir="ltr"
      className={cn("w-full max-w-[440px] [perspective:1200px]", className)}
      role="img"
      aria-label={`Flatel ${content.cardTier} member card`}
    >
      <div
        className={cn(
          "group relative aspect-[1.586] w-full overflow-hidden rounded-[5.5%/8.7%] border transition-transform duration-500 motion-safe:hover:[transform:rotateY(-6deg)_rotateX(4deg)]",
          theme.frame
        )}
        style={{ containerType: "inline-size" }}
      >
        {/* Engraved concentric pattern */}
        <div
          aria-hidden="true"
          className={cn("absolute -right-[18%] -top-[40%] h-[130%] aspect-square rounded-full opacity-60", theme.pattern)}
        />
        <div aria-hidden="true" className={cn("absolute inset-0", theme.glow)} />
        {/* Light sweep */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-[card-sheen_5.5s_ease-in-out_infinite]",
            theme.sheen
          )}
        />

        <div className="relative flex h-full flex-col justify-between p-[6.5cqw]">
          <div className="flex items-start justify-between">
            <div>
              <p className={cn("font-heading text-[7.2cqw] leading-none tracking-[0.18em]", theme.accent)}>
                {content.cardTitle}
              </p>
              <p className="mt-[1.2cqw] text-[2.6cqw] font-semibold tracking-[0.42em] text-fg-soft">
                {content.cardTier}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[6cqw] font-bold leading-none text-fg">{content.price}</p>
              <p className="mt-[1cqw] text-[2.2cqw] tracking-[0.18em] text-fg-muted">ONE-TIME</p>
            </div>
          </div>

          <div className="flex items-center gap-[4cqw]">
            {/* Chip */}
            <div
              aria-hidden="true"
              className={cn("relative h-[9.5cqw] w-[13cqw] rounded-[1.6cqw] border border-[rgba(60,40,10,0.6)]", theme.chip)}
            >
              <span className={cn("absolute inset-x-0 top-1/2 h-px", theme.chipLine)} />
              <span className={cn("absolute inset-y-0 left-1/3 w-px", theme.chipLine)} />
              <span className={cn("absolute inset-y-0 right-1/3 w-px", theme.chipLine)} />
            </div>
            <p className="font-mono text-[4.4cqw] tracking-[0.28em] text-fg/90">{content.cardId}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[2cqw] tracking-[0.26em] text-fg-muted">MEMBER</p>
              <p className="mt-[0.8cqw] text-[3.6cqw] font-semibold tracking-[0.18em] text-fg">
                {content.cardHolder}
              </p>
            </div>
            <p className={cn("text-[2.3cqw] font-semibold tracking-[0.18em]", theme.accent)}>{content.cardValid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
