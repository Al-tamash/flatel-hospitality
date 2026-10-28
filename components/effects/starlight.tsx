"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { generateStars, type Star } from "@/lib/starlight/generate-stars";

interface StarlightProps {
  className?: string;
  density?: number;
  /** Fixed per instance so the sky doesn't jump between renders. */
  seed?: number;
}

const TWINKLE_DEPTH = 0.3;

function drawStar(ctx: CanvasRenderingContext2D, star: Star, width: number, height: number, alpha: number) {
  const x = star.x * width;
  const y = star.y * height;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = star.color;
  ctx.beginPath();
  ctx.arc(x, y, star.r, 0, Math.PI * 2);
  ctx.fill();

  if (star.flare) {
    // Soft halo + four-point glint, like fibre-optic headliner stars
    const glow = ctx.createRadialGradient(x, y, 0, x, y, star.r * 5);
    glow.addColorStop(0, star.color);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, star.r * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = star.color;
    ctx.lineWidth = 0.6;
    const len = star.r * 6;
    ctx.beginPath();
    ctx.moveTo(x - len, y);
    ctx.lineTo(x + len, y);
    ctx.moveTo(x, y - len);
    ctx.lineTo(x, y + len);
    ctx.stroke();
  }
}

/** Sparse, slowly twinkling warm-gold star field behind a section's content. */
export function Starlight({ className, density = 130, seed = 11 }: StarlightProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const stars = generateStars({ seed, count: density });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let inView = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = reducedMotion ? 1 : 1 - TWINKLE_DEPTH * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.phase));
        drawStar(ctx, star, width, height, star.baseAlpha * twinkle);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      render(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reducedMotion || frame || !inView || document.visibilityState !== "visible") return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    render(0);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    resizeObserver.observe(canvas);

    const viewObserver = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      if (inView) start();
      else stop();
    });
    viewObserver.observe(canvas);

    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full opacity-70", className)}
    />
  );
}
