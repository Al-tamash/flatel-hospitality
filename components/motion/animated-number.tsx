"use client";

import * as React from "react";
import { gsap } from "@/lib/motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  /** Text shown before the number, e.g. a currency sign. */
  prefix?: string;
}

const format = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * A figure that counts to its new value when it changes (a fare recalculating after
 * the guest edits dates or add-ons). First render is static, so nothing animates on
 * load; reduced-motion visitors get the new value at once.
 */
export function AnimatedNumber({ value, className, prefix = "" }: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const shown = React.useRef(value);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || shown.current === value) return;

    const settle = () => {
      shown.current = value;
      el.textContent = prefix + format(value);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    const counter = { n: shown.current };
    const tween = gsap.to(counter, {
      n: value,
      duration: 0.45,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = prefix + format(counter.n);
      },
      onComplete: settle,
    });
    return () => {
      tween.kill();
      settle();
    };
  }, [value, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value)}
    </span>
  );
}
