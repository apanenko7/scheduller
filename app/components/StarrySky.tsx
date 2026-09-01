"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  phase: number;
}

// Скільки разів хвиля мерехтіння встигає пройти по всьому небу
const CASCADES = 6;
const TWINKLE_SPEED = 0.0012;
const STAR_AREA = 9000;
const MAX_STARS = 420;

export default function StarrySky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const createStars = () => {
      const count = Math.min(MAX_STARS, Math.round((width * height) / STAR_AREA));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.4,
        brightness: Math.random() * 0.5 + 0.5,
        phase: 0,
      }));

      // Зірки мерехтять одна за одною: фаза наростає вздовж послідовності
      stars.forEach((star, idx) => {
        star.phase = (idx / stars.length) * Math.PI * 2 * CASCADES;
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    };

    const drawSky = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#050817");
      sky.addColorStop(0.55, "#0b1230");
      sky.addColorStop(1, "#131a3d");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);
    };

    const draw = (time: number) => {
      drawSky();

      stars.forEach((star) => {
        const wave = 0.5 + 0.5 * Math.sin(time * TWINKLE_SPEED + star.phase);
        const alpha = star.brightness * (0.2 + 0.8 * wave);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Помітніші зірки отримують сяйво на піку мерехтіння
        if (star.radius > 1.1 && wave > 0.6) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 220, 255, ${alpha * 0.12})`;
          ctx.fill();
        }
      });
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      cancelAnimationFrame(frame);
      if (reduceMotion.matches) {
        draw(0);
      } else {
        frame = requestAnimationFrame(loop);
      }
    };

    const handleResize = () => {
      resize();
      start();
    };

    resize();
    start();

    window.addEventListener("resize", handleResize);
    reduceMotion.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      reduceMotion.removeEventListener("change", start);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 -z-10 h-full w-full pointer-events-none" />;
}
