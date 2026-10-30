"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { EASE_OUT, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/** Task flows where people work fast and repeatedly: no entrance or press motion. */
const SKIP_PREFIXES = ["/admin", "/ar/admin", "/checkout", "/ar/checkout"];
const MAX_WAIT_FRAMES = 90;
const CLEAR = "transform,opacity,visibility";

/**
 * React tags every DOM node it owns with a `__reactFiber$…` key once hydration
 * has reached it. This template sits above the page's Suspense boundaries, so its
 * effect can run while parts of the server HTML are still waiting to hydrate;
 * styling those early makes React report a hydration mismatch.
 */
const isHydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

/** A direct child of <main>, or any element that opts in with `data-reveal` (sections nested deeper in a page). */
const isSection = (el: Element) =>
  !el.hasAttribute("data-motion") && (el.hasAttribute("data-reveal") || el.parentElement?.tagName === "MAIN");

/**
 * Route-level motion, mounted once from app/template.tsx so every page gets it
 * without per-page edits:
 *  - each direct child of <main> fades up when it scrolls into view;
 *  - any element tagged `data-reveal` (a section nested inside a page) does the same;
 *  - the children of any `[data-stagger]` container cascade in one after another;
 *  - sections, groups and cards that React adds later (data loads, new search
 *    results) get the same treatment as they appear.
 * Opt out with `data-motion` (already animated elsewhere, e.g. the hero and <Reveal>).
 * Admin and checkout routes are left alone (they are tagged `data-no-motion`, which also
 * switches off the global press feedback), and reduced-motion visitors get static content.
 */
export function PageMotion({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const skipped = SKIP_PREFIXES.some((p) => pathname.startsWith(p));

  useGSAP(
    (_context, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe || skipped) return;

      let mm: gsap.MatchMedia | undefined;
      let raf = 0;
      let frames = 0;

      const collect = () => ({
        sections: Array.from(
          new Set(root.querySelectorAll<HTMLElement>("main > :not([data-motion]), [data-reveal]:not([data-motion])"))
        ),
        groups: Array.from(root.querySelectorAll<HTMLElement>("[data-stagger]")),
      });

      // Elements already handled, so the observer never animates one twice.
      const seen = new WeakSet<Element>();

      const animateSection = (el: HTMLElement) => {
        seen.add(el);
        gsap.from(el, {
          autoAlpha: 0,
          y: 28,
          duration: 0.8,
          ease: EASE_OUT,
          clearProps: CLEAR,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      };

      const animateGroup = (group: HTMLElement) => {
        seen.add(group);
        Array.from(group.children).forEach((c) => seen.add(c));
        gsap.from(group.children, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: EASE_OUT,
          stagger: 0.08,
          clearProps: CLEAR,
          scrollTrigger: { trigger: group, start: "top 88%", once: true },
        });
      };

      // Cards added to a group that has already been set up (e.g. new search results).
      const animateNewCards = (cards: HTMLElement[]) => {
        cards.forEach((c) => seen.add(c));
        gsap.from(cards, {
          autoAlpha: 0,
          y: 18,
          duration: 0.5,
          ease: EASE_OUT,
          stagger: 0.06,
          clearProps: CLEAR,
        });
      };

      const onMutations = contextSafe((records: MutationRecord[]) => {
        const newCards: HTMLElement[] = [];
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement) || seen.has(node)) return;

            const parent = node.parentElement;
            if (parent && seen.has(parent) && parent.hasAttribute("data-stagger")) {
              newCards.push(node);
              return;
            }
            if (isSection(node)) {
              animateSection(node);
              return;
            }
            if (node.childElementCount === 0) return;

            const groups = node.matches("[data-stagger]")
              ? [node]
              : Array.from(node.querySelectorAll<HTMLElement>("[data-stagger]"));
            groups.forEach((g) => {
              if (!seen.has(g) && g.children.length > 0) animateGroup(g);
            });
            node.querySelectorAll<HTMLElement>("[data-reveal]:not([data-motion])").forEach((el) => {
              if (!seen.has(el)) animateSection(el);
            });
          });
        }
        if (newCards.length > 0) animateNewCards(newCards);
      });

      const play = contextSafe(() => {
        const { sections, groups } = collect();
        mm = gsap.matchMedia();
        mm.add(MOTION_OK, () => {
          sections.filter(isHydrated).forEach(animateSection);
          groups
            .filter((g) => isHydrated(g) && g.children.length > 0 && Array.from(g.children).every(isHydrated))
            .forEach(animateGroup);

          const observer = new MutationObserver(onMutations);
          observer.observe(root, { childList: true, subtree: true });
          return () => observer.disconnect();
        });
      });

      const attempt = () => {
        const { sections, groups } = collect();
        const ready = sections.length > 0 && [...sections, ...groups].every(isHydrated);
        if (!ready && frames++ < MAX_WAIT_FRAMES) {
          raf = requestAnimationFrame(attempt);
          return;
        }
        play();
      };
      attempt();

      return () => {
        cancelAnimationFrame(raf);
        mm?.revert();
      };
    },
    { scope: ref, dependencies: [pathname] }
  );

  // `contents` keeps the wrapper out of layout so existing flex/sticky rules are unaffected.
  return (
    <div ref={ref} className="contents" data-no-motion={skipped ? "" : undefined}>
      {children}
    </div>
  );
}
