"use client";

import * as React from "react";
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** CSS selector of descendants to stagger in. Without it the wrapper itself fades up. */
  stagger?: string;
  /** Vertical travel in px. Vertical only, so it reads the same in LTR and RTL. */
  y?: number;
  delay?: number;
  duration?: number;
  /** ScrollTrigger start, e.g. "top 85%" = when the top edge reaches 85% of the viewport. */
  start?: string;
}

/**
 * Scroll-triggered entrance. Plays once, then clears its inline styles so the
 * wrapper leaves no transform behind (a leftover transform would trap fixed
 * modals/popovers inside it). Renders plain content for reduced-motion visitors.
 */
export function Reveal({
  children,
  className,
  stagger,
  y = 32,
  delay = 0,
  duration = 0.8,
  start = "top 88%",
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const targets = stagger ? root.querySelectorAll(stagger) : root;
        if (stagger && targets instanceof NodeList && targets.length === 0) return;

        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration,
          delay,
          ease: EASE_OUT,
          stagger: stagger ? 0.09 : 0,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: root, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [stagger, y, delay, duration, start] }
  );

  return (
    <div ref={ref} data-motion className={cn(className)}>
      {children}
    </div>
  );
}
