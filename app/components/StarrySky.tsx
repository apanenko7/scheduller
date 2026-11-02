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

/** Рідкісний гість, що повільно пропливає верхньою смугою неба */
interface Flyer {
  emoji: string;
  x: number;
  baseY: number;
  vx: number;
  life: number;
  size: number;
  /** Ракета летить носом уперед, тому її треба нахилити */
  tilt: boolean;
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

// Ракета чи НЛО — сюрприз, а не постійний рух: з'являються раз на хвилину-дві
const FLYER_PAUSE_MIN = 60000;
const FLYER_PAUSE_MAX = 150000;
const FLYERS = [
  { emoji: "🚀", tilt: true },
  { emoji: "🛸", tilt: false },
  { emoji: "🛰️", tilt: false },
];

interface Planet {
  color: string;
  radius: number;
  /** Період обертання в роках — з нього рахується кутова швидкість */
  years: number;
  ring?: boolean;
  moon?: boolean;
}

// Розміри не в масштабі: інакше Меркурій був би невидимою цяткою
const PLANETS: Planet[] = [
  { color: "#b7aca0", radius: 2, years: 0.24 },
  { color: "#e8c27a", radius: 3, years: 0.62 },
  { color: "#4f8fe0", radius: 3.2, years: 1, moon: true },
  { color: "#d0643c", radius: 2.6, years: 1.88 },
  { color: "#d9a066", radius: 6, years: 11.9 },
  { color: "#e6cf8f", radius: 5, years: 29.5, ring: true },
  { color: "#9fd9e6", radius: 4, years: 84 },
  { color: "#4f6ee0", radius: 3.8, years: 165 },
];

// Меркурій робить коло за MERCURY_ORBIT_MS. Справжні періоди розходяться в сотні
// разів, тому беремо корінь: зовнішні планети повільні, але таки рухаються
const MERCURY_ORBIT_MS = 30000;
// Орбіти видно майже з ребра, тож уся система вміщується у смугу шапки
const ORBIT_TILT = 0.12;
const SYSTEM_TOP = 58;

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
    let flyers: Flyer[] = [];
    let nextFlyerAt = 0;

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

    const spawnFlyer = () => {
      const kind = FLYERS[Math.floor(Math.random() * FLYERS.length)];
      const toRight = Math.random() < 0.5;
      const size = randomBetween(26, 34);

      flyers.push({
        ...kind,
        x: toRight ? -size : width + size,
        // Крізь смугу сонячної системи над таблицею: там гість не закриває уроки
        baseY: randomBetween(SYSTEM_TOP - 30, SYSTEM_TOP + 30),
        vx: (toRight ? 1 : -1) * randomBetween(45, 75),
        life: 0,
        size,
      });
    };

    const drawFlyers = (delta: number) => {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      flyers.forEach((flyer) => {
        flyer.x += flyer.vx * delta;
        flyer.life += delta;

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.font = `${flyer.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        // Легке погойдування, щоб гість виглядав живим
        ctx.translate(flyer.x, flyer.baseY + Math.sin(flyer.life * 1.6) * 6);
        // Емодзі дивляться вправо, тож для польоту вліво дзеркалимо
        if (flyer.vx < 0) ctx.scale(-1, 1);
        // Ніс ракети в емодзі дивиться вгору-вправо, повертаємо його по курсу
        if (flyer.tilt) ctx.rotate(Math.PI / 4);
        ctx.fillText(flyer.emoji, 0, 0);
        ctx.restore();
      });

      flyers = flyers.filter((flyer) => flyer.x > -80 && flyer.x < width + 80);
    };

    // Початкові кути випадкові, щоб планети не стояли в ряд при кожному відкритті
    const planetPhase = PLANETS.map(() => Math.random() * Math.PI * 2);

    const drawPlanet = (planet: Planet, x: number, y: number, time: number) => {
      if (planet.ring) {
        ctx.strokeStyle = "rgba(230, 207, 143, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(x, y, planet.radius * 2.1, planet.radius * 0.6, -0.35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Освітлений бік дивиться на Сонце
      const light = ctx.createRadialGradient(x - planet.radius * 0.4, y - planet.radius * 0.4, 0, x, y, planet.radius);
      light.addColorStop(0, "#ffffff");
      light.addColorStop(0.25, planet.color);
      light.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = light;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (planet.moon) {
        const angle = time / 2500;
        ctx.fillStyle = "#d8d8d8";
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * 7, y + Math.sin(angle) * 7 * ORBIT_TILT * 3, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    /** Сонячна система в смузі шапки: орбіти-еліпси, планети за Сонцем ховаються */
    const drawSolarSystem = (time: number) => {
      const cx = width / 2;
      const cy = SYSTEM_TOP;
      const maxOrbit = width * 0.46;
      const minOrbit = Math.min(36, maxOrbit * 0.12);

      const orbits = PLANETS.map((planet, idx) => {
        const rx = minOrbit + ((maxOrbit - minOrbit) * idx) / (PLANETS.length - 1);
        const angle = planetPhase[idx] + ((time / MERCURY_ORBIT_MS) * Math.PI * 2) / Math.sqrt(planet.years / PLANETS[0].years);
        return { planet, rx, x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * rx * ORBIT_TILT };
      });

      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      orbits.forEach(({ rx }) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, rx * ORBIT_TILT, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Спершу ті, що позаду Сонця (вище за центр), потім Сонце, потім передні
      orbits.filter((orbit) => orbit.y < cy).forEach((orbit) => drawPlanet(orbit.planet, orbit.x, orbit.y, time));

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
      glow.addColorStop(0, "rgba(255, 214, 102, 0.55)");
      glow.addColorStop(1, "rgba(255, 170, 51, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      orbits.filter((orbit) => orbit.y >= cy).forEach((orbit) => drawPlanet(orbit.planet, orbit.x, orbit.y, time));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      meteors = [];
      flyers = [];
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

        if (time >= nextFlyerAt && flyers.length === 0) {
          spawnFlyer();
          nextFlyerAt = time + randomBetween(FLYER_PAUSE_MIN, FLYER_PAUSE_MAX);
        }
        drawFlyers(delta);
      }

      drawSolarSystem(time);
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
        nextFlyerAt = performance.now() + randomBetween(15000, 40000);
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
