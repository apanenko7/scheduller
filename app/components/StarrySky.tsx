"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  phase: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  duration: number;
  tail: number; // довжина хвоста в секундах шляху
  width: number;
}

// Скільки разів хвиля мерехтіння встигає пройти по всьому небу
const CASCADES = 6;
const TWINKLE_SPEED = 0.0012;
const STAR_AREA = 9000;
const MAX_STARS = 420;

// Падаючі зірки: поодинокі, з довгими випадковими паузами
const METEOR_PAUSE_MIN = 3500;
const METEOR_PAUSE_MAX = 12000;
const MAX_METEORS = 2;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export default function StarrySky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let nextMeteorAt = 0;

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

    const spawnMeteor = () => {
      // Летить згори вниз під невеликим кутом, вліво або вправо
      const toRight = Math.random() < 0.5;
      const speed = randomBetween(380, 640);
      const angle = randomBetween(0.32, 0.72); // радіани від горизонту
      const duration = randomBetween(0.75, 1.4);

      meteors.push({
        x: toRight ? randomBetween(-60, width * 0.7) : randomBetween(width * 0.3, width + 60),
        y: randomBetween(-20, height * 0.42),
        vx: (toRight ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        duration,
        tail: randomBetween(0.1, 0.17),
        width: randomBetween(1.3, 2.2),
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      meteors = [];
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

    const drawMeteors = (delta: number) => {
      ctx.lineCap = "round";

      meteors.forEach((meteor) => {
        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;
        meteor.life += delta;

        // Плавно з'являється й так само гасне
        const alpha = Math.sin(Math.PI * Math.min(1, meteor.life / meteor.duration));
        const tailX = meteor.x - meteor.vx * meteor.tail;
        const tailY = meteor.y - meteor.vy * meteor.tail;

        const trail = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        trail.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        trail.addColorStop(0.35, `rgba(188, 216, 255, ${alpha * 0.4})`);
        trail.addColorStop(1, "rgba(188, 216, 255, 0)");

        ctx.strokeStyle = trail;
        ctx.lineWidth = meteor.width;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.width * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      meteors = meteors.filter((meteor) => meteor.life < meteor.duration && meteor.x > -240 && meteor.x < width + 240 && meteor.y < height + 240);
    };

    const draw = (time: number, delta: number) => {
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

      if (delta > 0) {
        if (time >= nextMeteorAt && meteors.length < MAX_METEORS) {
          spawnMeteor();
          nextMeteorAt = time + randomBetween(METEOR_PAUSE_MIN, METEOR_PAUSE_MAX);
        }
        drawMeteors(delta);
      }
    };

    const loop = (time: number) => {
      const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
      lastTime = time;
      draw(time, delta);
      frame = requestAnimationFrame(loop);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (reduceMotion.matches) {
        draw(0, 0);
      } else {
        nextMeteorAt = performance.now() + randomBetween(1200, 4000);
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
