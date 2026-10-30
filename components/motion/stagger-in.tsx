"use client";

import * as React from "react";
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

interface StaggerInProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds before the first child starts, so a parent's own fade can land first. */
  delay?: number;
}

/**
 * Cascades its direct children in on mount, for panels that open on demand (the
 * mobile menu). Short on purpose: users open these often, so the whole sequence
 * stays under half a second. Vertical-only so LTR and RTL read the same, and it
 * clears its inline styles so no leftover transform traps fixed descendants.
 */
export function StaggerIn({ children, className, delay = 0.06 }: StaggerInProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(root.children, {
          autoAlpha: 0,
          y: 14,
          duration: 0.35,
          delay,
          ease: EASE_OUT,
          stagger: 0.04,
          clearProps: "transform,opacity,visibility",
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
