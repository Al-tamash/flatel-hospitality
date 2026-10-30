"use client";

import * as React from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/**
 * Check-in-a-circle that draws itself once, for the booking-confirmed moment.
 * Rendered fully drawn by default, so failed scripts or reduced-motion visitors
 * simply see the finished mark.
 */
export function SuccessMark({ className }: { className?: string }) {
  const ref = React.useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-mark-ring]", { strokeDashoffset: 1, duration: 0.6 })
          .from("[data-mark-check]", { strokeDashoffset: 1, duration: 0.4 }, "-=0.1")
          .from(ref.current, { scale: 0.9, transformOrigin: "50% 50%", duration: 0.5, clearProps: "transform" }, 0);
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle data-mark-ring cx="12" cy="12" r="10" pathLength={1} strokeDasharray={1} strokeDashoffset={0} />
      <path data-mark-check d="m9 12 2 2 4-4" pathLength={1} strokeDasharray={1} strokeDashoffset={0} />
    </svg>
  );
}
