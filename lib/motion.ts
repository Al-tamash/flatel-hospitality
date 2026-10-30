"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Only animate when the visitor has not asked for reduced motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export const EASE_OUT = "power3.out";

export { gsap, ScrollTrigger, useGSAP };
