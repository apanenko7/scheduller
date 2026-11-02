"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import CapybaraSprite, { CAPY_H, CAPY_W } from "./CapybaraSprite";
import CrocodileSprite, { CROC_H, CROC_W } from "./CrocodileSprite";
import { DaySchedule, isLessonNow } from "../lib/schedule";

type Mood = "walk" | "sleep" | "eat" | "chase" | "seek" | "tangerine" | "poop" | "bath" | "hop" | "butterfly" | "think" | "sneeze" | "stargaze";

const FLOOR_GAP = 10;
const PET_SPEED = 38;
const PET_CHASE_SPEED = 135;

const GAME_CAPY_SPEED = 250;
const GAME_CAPY_MAX_SPEED = 470;
const FRUIT_BOOST = 22; // кожна зібрана мандаринка додає капібарі стільки px/s
const CROC_START_SPEED = 145;
const CROC_RAMP = 6; // на скільки px/s крокодил прискорюється за кожну секунду гри
const CROC_MAX_SPEED = 430;
const CATCH_DISTANCE = 30;
const CROC_TURN = 3.2; // як швидко крокодил доводить курс до цілі: менше — ширші розвороти
const CROC_LUNGE_RANGE = 150;
const CROC_LUNGE_BOOST = 1.7;
const CROC_LUNGE_MS = 380;
const CROC_LUNGE_COOLDOWN = 2200;
const CROC_MAX_TILT = 0.45; // радіан: нахил тулуба вгору-вниз по курсу

/** Гра керується курсором миші, тож на сенсорних і вузьких екранах її не показуємо */
const NO_GAME_QUERY = "(pointer: coarse), (max-width: 767px)";

const FRUIT_W = 18;
const FRUIT_H = 20;
const FRUIT_MAX = 3;
const FRUIT_TTL = 9000;
const FRUIT_TICK = 700;
const FRUIT_SPAWN_CHANCE = 0.6;
const COLLECT_DISTANCE = 30;

const MAX_POOPS = 6;
const POOP_LIFETIME = 18000;
const LESSON_CHECK_MS = 5000;
const BEST_TIME_KEY = "capybaraBestScore";
const BEST_FRUIT_KEY = "capybaraBestFruit";

const DURATION: Record<Mood, [number, number]> = {
  walk: [3500, 7000],
  sleep: [5000, 10000],
  eat: [3000, 5500],
  chase: [3000, 6000],
  seek: [11000, 13000], // запобіжник, якщо до мандаринки чомусь не дійти
  tangerine: [2400, 3400],
  poop: [2000, 2800],
  bath: [7000, 11000],
  hop: [1800, 2600],
  butterfly: [5000, 8000],
  think: [3500, 5500],
  sneeze: [1600, 1900],
  stargaze: [4000, 7000],
};

const MOOD_POOL: Mood[] = [
  "walk",
  "walk",
  "walk",
  "walk",
  "sleep",
  "eat",
  "chase",
  "seek",
  "seek",
  "poop",
  "bath",
  "hop",
  "butterfly",
  "think",
  "sneeze",
  "stargaze",
];

// Про що мріє капібара в бульбашці думок
const THOUGHTS = ["🍊", "🍉", "🪐", "⭐", "📚", "🛁", "🐊", "🌈", "🍎", "💤"];

interface Poop {
  id: number;
  x: number;
}

interface Fruit {
  id: number;
  x: number;
  y: number;
  bornAt: number;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const pickMood = (current: Mood) => {
  const options = MOOD_POOL.filter((mood) => mood !== current);
  return options[Math.floor(Math.random() * options.length)];
};

function Tangerine() {
  return (
    <svg width={FRUIT_W} height={FRUIT_H} viewBox="0 0 18 20">
      <rect x="8.3" y="4.5" width="1.6" height="3.5" rx="0.8" fill="#6b4a2b" />
      <path d="M9 6.5 q3.5 -3 6 -2 q-2 3 -5.5 3" fill="#4ca64c" />
      <circle cx="9" cy="13" r="6.5" fill="#f59027" />
      <circle cx="6.8" cy="11" r="1.8" fill="#ffb45c" />
    </svg>
  );
}

export default function Capybara({ scheduleData }: { scheduleData: DaySchedule[] }) {
  const [mood, setMood] = useState<Mood>("walk");
  const [gameOn, setGameOn] = useState(false);
  const [lessonNow, setLessonNow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [gameAvailable, setGameAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [tangerine, setTangerine] = useState<number | null>(null);
  const [poops, setPoops] = useState<Poop[]>([]);
  const [thought, setThought] = useState(THOUGHTS[0]);
  const [fruit, setFruit] = useState<Fruit[]>([]);
  const [collected, setCollected] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [bestFruit, setBestFruit] = useState(0);
  const [result, setResult] = useState<{ time: number; fruit: number } | null>(null);

  const capyRef = useRef<HTMLDivElement>(null);
  const capyFaceRef = useRef<HTMLDivElement>(null);
  const crocRef = useRef<HTMLDivElement>(null);
  const crocFaceRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);

  const moodRef = useRef<Mood>("walk");
  const tangerineRef = useRef<number | null>(null);
  const fruitRef = useRef<Fruit[]>([]);
  const collectedRef = useRef(0);
  const capyPos = useRef({ x: 0, y: 0 });
  const crocPos = useRef({ x: 0, y: 0 });
  const capyDir = useRef<1 | -1>(1);
  const crocDir = useRef<1 | -1>(1);
  const crocVel = useRef({ x: 0, y: 0 });
  const crocTilt = useRef(0);
  const lungeUntil = useRef(0);
  const lungeReadyAt = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const startedAt = useRef(0);
  const caught = useRef(false);
  const poopId = useRef(0);
  const fruitId = useRef(0);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    tangerineRef.current = tangerine;
  }, [tangerine]);

  const floorY = () => window.innerHeight - CAPY_H - FLOOR_GAP;

  // Стартові координати, курсор, реакція на prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMedia = () => setReduceMotion(media.matches);
    syncMedia();
    media.addEventListener("change", syncMedia);

    const noGame = window.matchMedia(NO_GAME_QUERY);
    const syncGame = () => setGameAvailable(!noGame.matches);
    syncGame();
    noGame.addEventListener("change", syncGame);

    capyPos.current = { x: Math.random() * Math.max(0, window.innerWidth - CAPY_W), y: floorY() };
    crocPos.current = { x: -CROC_W, y: floorY() };
    pointer.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setBestTime(Number(localStorage.getItem(BEST_TIME_KEY)) || 0);
    setBestFruit(Number(localStorage.getItem(BEST_FRUIT_KEY)) || 0);
    setReady(true);

    const handlePointer = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", handlePointer);

    return () => {
      window.removeEventListener("pointermove", handlePointer);
      media.removeEventListener("change", syncMedia);
      noGame.removeEventListener("change", syncGame);
    };
  }, []);

  const finishGame = useCallback((time: number, fruitCount: number) => {
    setGameOn(false);
    setResult({ time, fruit: fruitCount });
    setFruit([]);
    fruitRef.current = [];

    setBestTime((current) => {
      if (time <= current) return current;
      localStorage.setItem(BEST_TIME_KEY, String(time));
      return time;
    });
    setBestFruit((current) => {
      if (fruitCount <= current) return current;
      localStorage.setItem(BEST_FRUIT_KEY, String(fruitCount));
      return fruitCount;
    });
  }, []);

  // Головний цикл руху: позиції пишемо в DOM напряму, щоб не смикати React щокадру
  useEffect(() => {
    if (reduceMotion && !gameOn) return;

    let frame = 0;
    let last = performance.now();

    const paint = () => {
      if (capyRef.current) capyRef.current.style.transform = `translate3d(${capyPos.current.x}px, ${capyPos.current.y}px, 0)`;
      if (capyFaceRef.current) capyFaceRef.current.style.transform = `scaleX(${capyDir.current})`;
      if (crocRef.current) crocRef.current.style.transform = `translate3d(${crocPos.current.x}px, ${crocPos.current.y}px, 0)`;
      if (crocFaceRef.current) crocFaceRef.current.style.transform = `scaleX(${crocDir.current}) rotate(${crocTilt.current}rad)`;
    };

    const loop = (time: number) => {
      const delta = Math.min(50, time - last) / 1000;
      last = time;

      const maxX = Math.max(0, window.innerWidth - CAPY_W);
      const capy = capyPos.current;

      if (gameOn) {
        const maxY = Math.max(0, window.innerHeight - CAPY_H);
        const targetX = clamp(pointer.current.x - CAPY_W / 2, 0, maxX);
        const targetY = clamp(pointer.current.y - CAPY_H / 2, 0, maxY);
        const dx = targetX - capy.x;
        const dy = targetY - capy.y;
        const gap = Math.hypot(dx, dy);

        // Кожна зібрана мандаринка робить капібару швидшою
        const capySpeed = Math.min(GAME_CAPY_MAX_SPEED, GAME_CAPY_SPEED + collectedRef.current * FRUIT_BOOST);

        if (gap > 0.5) {
          const stride = Math.min(gap, capySpeed * delta);
          capy.x += (dx / gap) * stride;
          capy.y += (dy / gap) * stride;
          if (Math.abs(dx) > 1) capyDir.current = dx > 0 ? 1 : -1;
        }

        // Збір мандаринок
        const capyCx = capy.x + CAPY_W / 2;
        const capyCy = capy.y + CAPY_H / 2;
        const eaten = fruitRef.current.filter((item) => Math.hypot(capyCx - (item.x + FRUIT_W / 2), capyCy - (item.y + FRUIT_H / 2)) < COLLECT_DISTANCE);

        if (eaten.length > 0) {
          const eatenIds = new Set(eaten.map((item) => item.id));
          fruitRef.current = fruitRef.current.filter((item) => !eatenIds.has(item.id));
          collectedRef.current += eaten.length;
          setFruit(fruitRef.current);
          setCollected(collectedRef.current);
        }

        const elapsed = (time - startedAt.current) / 1000;
        const croc = crocPos.current;
        const cdx = capyCx - (croc.x + CROC_W / 2);
        const cdy = capyCy - (croc.y + CROC_H / 2);
        const chase = Math.hypot(cdx, cdy);

        // Зблизька крокодил робить короткий ривок, потім мусить перепочити
        if (chase < CROC_LUNGE_RANGE && time >= lungeReadyAt.current) {
          lungeUntil.current = time + CROC_LUNGE_MS;
          lungeReadyAt.current = time + CROC_LUNGE_COOLDOWN;
        }
        const lunging = time < lungeUntil.current;
        crocFaceRef.current?.classList.toggle("croc-lunge", lunging);

        const crocSpeed = Math.min(CROC_MAX_SPEED, CROC_START_SPEED + CROC_RAMP * elapsed) * (lunging ? CROC_LUNGE_BOOST : 1);

        if (chase > 0.5) {
          // Не повертає миттєво, а плавно доводить швидкість до бажаної:
          // різкий маневр капібари дає кілька кроків фори
          const vel = crocVel.current;
          const turn = Math.min(1, CROC_TURN * delta);
          vel.x += ((cdx / chase) * crocSpeed - vel.x) * turn;
          vel.y += ((cdy / chase) * crocSpeed - vel.y) * turn;

          const step = Math.hypot(vel.x, vel.y) * delta;
          const scale = step > chase ? chase / step : 1;
          croc.x += vel.x * delta * scale;
          croc.y += vel.y * delta * scale;

          // Розвертається лише при помітному русі вбік, щоб не смикався на місці
          if (vel.x > 25) crocDir.current = 1;
          else if (vel.x < -25) crocDir.current = -1;
          crocTilt.current = clamp(Math.atan2(vel.y, Math.abs(vel.x) + 1), -CROC_MAX_TILT, CROC_MAX_TILT);
        }

        if (timerRef.current) timerRef.current.textContent = elapsed.toFixed(1);

        if (chase < CATCH_DISTANCE && !caught.current) {
          caught.current = true;
          paint();
          finishGame(Number(elapsed.toFixed(1)), collectedRef.current);
          return;
        }
      } else {
        capy.y = floorY();
        capy.x = Math.min(capy.x, maxX);

        if (moodRef.current === "walk") {
          capy.x += capyDir.current * PET_SPEED * delta;
          if (capy.x <= 0) {
            capy.x = 0;
            capyDir.current = 1;
          } else if (capy.x >= maxX) {
            capy.x = maxX;
            capyDir.current = -1;
          }
        } else if (moodRef.current === "chase") {
          const target = clamp(pointer.current.x - CAPY_W / 2, 0, maxX);
          const dx = target - capy.x;
          if (Math.abs(dx) > 1) {
            capyDir.current = dx > 0 ? 1 : -1;
            capy.x += capyDir.current * Math.min(Math.abs(dx), PET_CHASE_SPEED * delta);
          }
        } else if (moodRef.current === "seek" && tangerineRef.current !== null) {
          const target = clamp(tangerineRef.current - CAPY_W / 2, 0, maxX);
          const dx = target - capy.x;
          if (Math.abs(dx) > 2) {
            capyDir.current = dx > 0 ? 1 : -1;
            capy.x += capyDir.current * Math.min(Math.abs(dx), PET_SPEED * 1.6 * delta);
          } else {
            // Дійшла до мандаринки. Ref міняємо теж, щоб не викликати setState щокадру
            moodRef.current = "tangerine";
            setMood("tangerine");
          }
        }
      }

      paint();
      frame = requestAnimationFrame(loop);
    };

    paint();
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [gameOn, reduceMotion, finishGame]);

  // Під час уроку гра недоступна: setState з тим самим значенням React відкидає,
  // тому щоп'ятисекундна перевірка не викликає лишніх перемальовувань
  useEffect(() => {
    const check = () => setLessonNow(isLessonNow(scheduleData, new Date()));
    check();
    const timer = setInterval(check, LESSON_CHECK_MS);
    return () => clearInterval(timer);
  }, [scheduleData]);

  // Якщо урок почався посеред гри або екран став сенсорним чи вузьким,
  // гра зупиняється без запису результату
  useEffect(() => {
    if ((!lessonNow && gameAvailable) || !gameOn) return;
    setGameOn(false);
    setFruit([]);
    fruitRef.current = [];
  }, [lessonNow, gameAvailable, gameOn]);

  // Настрій змінюється сам, поки гра не увімкнена
  useEffect(() => {
    if (gameOn || reduceMotion) return;
    const [min, max] = DURATION[mood];
    const timer = setTimeout(() => {
      const next = pickMood(mood);
      // Щоразу нова думка в бульбашці
      if (next === "think") setThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]);
      setMood(next);
    }, randomBetween(min, max));
    return () => clearTimeout(timer);
  }, [mood, gameOn, reduceMotion]);

  // Мандаринка на підлозі живе лише поки капібара по неї йде або її їсть
  useEffect(() => {
    if (gameOn) return;
    if (mood === "seek") {
      setTangerine(randomBetween(30, Math.max(40, window.innerWidth - 30)));
    } else if (mood !== "tangerine") {
      setTangerine(null);
    }
  }, [mood, gameOn]);

  // У грі мандаринки з'являються самі й через час зникають
  useEffect(() => {
    if (!gameOn) return;

    const tick = setInterval(() => {
      const now = performance.now();
      let next = fruitRef.current.filter((item) => now - item.bornAt < FRUIT_TTL);

      if (next.length < FRUIT_MAX && Math.random() < FRUIT_SPAWN_CHANCE) {
        next = [
          ...next,
          {
            id: ++fruitId.current,
            x: randomBetween(40, Math.max(60, window.innerWidth - 40 - FRUIT_W)),
            y: randomBetween(90, Math.max(120, window.innerHeight - 90 - FRUIT_H)),
            bornAt: now,
          },
        ];
      }

      if (next.length !== fruitRef.current.length) {
        fruitRef.current = next;
        setFruit(next);
      }
    }, FRUIT_TICK);

    return () => clearInterval(tick);
  }, [gameOn]);

  // Купка з'являється не одразу, а трохи згодом, і потім тане
  useEffect(() => {
    if (mood !== "poop" || gameOn) return;
    const drop = setTimeout(() => {
      const id = ++poopId.current;
      setPoops((current) => [...current, { id, x: capyPos.current.x + CAPY_W / 2 - 20 }].slice(-MAX_POOPS));
      setTimeout(() => setPoops((current) => current.filter((poop) => poop.id !== id)), POOP_LIFETIME);
    }, 900);
    return () => clearTimeout(drop);
  }, [mood, gameOn]);

  const toggleGame = () => {
    if (gameOn) {
      setGameOn(false);
      setFruit([]);
      fruitRef.current = [];
      return;
    }

    if (lessonNow) return;

    setResult(null);
    setPoops([]);
    setTangerine(null);
    setMood("walk");
    setCollected(0);
    setFruit([]);
    fruitRef.current = [];
    collectedRef.current = 0;
    caught.current = false;
    startedAt.current = performance.now();

    // Крокодил заходить з протилежного від капібари боку екрана
    const fromLeft = capyPos.current.x > window.innerWidth / 2;
    crocPos.current = {
      x: fromLeft ? -CROC_W : window.innerWidth,
      y: clamp(capyPos.current.y - randomBetween(-120, 120), 0, Math.max(0, window.innerHeight - CROC_H)),
    };
    crocDir.current = fromLeft ? 1 : -1;
    crocVel.current = { x: crocDir.current * CROC_START_SPEED, y: 0 };
    crocTilt.current = 0;
    lungeUntil.current = 0;
    lungeReadyAt.current = performance.now() + CROC_LUNGE_COOLDOWN;
    setGameOn(true);
  };

  const asleep = !gameOn && (reduceMotion || mood === "sleep");
  const stepping = gameOn || (!asleep && (mood === "walk" || mood === "chase" || mood === "seek"));
  const calm = !gameOn && !asleep;
  const speedNow = Math.min(GAME_CAPY_MAX_SPEED, GAME_CAPY_SPEED + collected * FRUIT_BOOST);

  return (
    <>
      <div
        ref={capyRef}
        aria-hidden="true"
        className={`fixed left-0 top-0 z-40 pointer-events-none will-change-transform transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {/* Стрибки й чхання — анімації на окремій обгортці: capyFaceRef крутить transform для розвороту */}
        <div className={calm && mood === "hop" ? "capybara-hop" : calm && mood === "sneeze" ? "capybara-sneeze" : undefined}>
          <div ref={capyFaceRef}>
            <CapybaraSprite
              stepping={stepping}
              fast={gameOn || mood === "chase"}
              asleep={asleep}
              chewing={mood === "eat" || mood === "tangerine"}
              grass={!gameOn && mood === "eat"}
              squatting={!gameOn && mood === "poop"}
              excited={gameOn || mood === "chase" || (calm && mood === "hop")}
              bathing={calm && mood === "bath"}
              lookingUp={calm && (mood === "stargaze" || mood === "butterfly")}
              squinting={calm && mood === "sneeze"}
            />
          </div>
        </div>

        {/* Підказки над капібарою не розвертаються разом з нею, тому вони поза capyFaceRef */}
        {calm && mood === "butterfly" && (
          <span className="capybara-butterfly absolute left-1/2 -top-6 text-base leading-none">
            <span className="capybara-flap inline-block">🦋</span>
          </span>
        )}

        {calm && mood === "think" && (
          <span className="critter-pop absolute left-1/2 -top-9 -ml-4 flex size-8 items-center justify-center rounded-full bg-white text-base shadow-md">
            {thought}
          </span>
        )}

        {calm && mood === "sneeze" && (
          <span className="capybara-achoo absolute left-1/2 -top-6 -ml-6 whitespace-nowrap rounded-lg bg-white px-1.5 py-0.5 text-[10px] font-black text-amber-700 shadow-md">
            Апчхи!
          </span>
        )}

        {calm && mood === "stargaze" && (
          <span className="critter-snore absolute left-1/2 -top-5 text-sm leading-none" style={{ animationDuration: "1.8s" }}>
            ✨
          </span>
        )}
      </div>

      {gameOn && (
        <div ref={crocRef} aria-hidden="true" className="fixed left-0 top-0 z-40 pointer-events-none will-change-transform">
          <div ref={crocFaceRef}>
            <CrocodileSprite stepping />
          </div>
        </div>
      )}

      {/* Мандаринки, які капібара збирає під час гри.
          Зовнішній div тримає координати, внутрішній анімується:
          critter-pop теж керує transform і перебив би позицію. */}
      {gameOn &&
        fruit.map((item) => (
          <div key={item.id} aria-hidden="true" className="fixed left-0 top-0 z-30 pointer-events-none" style={{ transform: `translate3d(${item.x}px, ${item.y}px, 0)` }}>
            <div className="critter-pop">
              <Tangerine />
            </div>
          </div>
        ))}

      {/* Мандаринка, яку капібара знаходить у спокійному режимі */}
      {tangerine !== null && !gameOn && (
        <div aria-hidden="true" className="fixed z-30 pointer-events-none critter-pop" style={{ left: tangerine, bottom: FLOOR_GAP }}>
          <Tangerine />
        </div>
      )}

      {poops.map((poop) => (
        <div key={poop.id} aria-hidden="true" className="fixed z-30 pointer-events-none critter-fade" style={{ left: poop.x, bottom: FLOOR_GAP }}>
          <svg width="14" height="10" viewBox="0 0 14 10">
            <ellipse cx="7" cy="7.5" rx="5.5" ry="2.2" fill="#4a3520" />
            <ellipse cx="7" cy="4.5" rx="3.6" ry="2" fill="#5c452c" />
          </svg>
        </div>
      ))}

      {gameAvailable && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
          {gameOn && (
            <div className="rounded-xl bg-black/70 px-3 py-2 text-[11px] font-bold text-white shadow-lg">
              <p>
                ⏱ <span ref={timerRef}>0.0</span> с · 🍊 {collected} · {speedNow} px/s
              </p>
              {(bestTime > 0 || bestFruit > 0) && (
                <p className="mt-0.5 opacity-70">
                  Рекорд: {bestTime.toFixed(1)} с · {bestFruit} 🍊
                </p>
              )}
              <p className="mt-0.5 font-medium opacity-70">Збирай мандаринки — з ними капібара швидша за крокодила!</p>
            </div>
          )}

          {result !== null && !gameOn && (
            <div className="rounded-xl bg-red-600/90 px-3 py-2 text-[11px] font-bold text-white shadow-lg">
              <p>
                🐊 Наздогнав! {result.time.toFixed(1)} с · зібрано {result.fruit} 🍊
              </p>
              {(result.time >= bestTime && result.time > 0) || (result.fruit >= bestFruit && result.fruit > 0) ? <p className="mt-0.5 opacity-80">Новий рекорд!</p> : null}
            </div>
          )}

          {lessonNow && (
            <div className="rounded-xl bg-black/70 px-3 py-2 text-[11px] font-bold text-white shadow-lg">
              <p>📚 Зараз урок</p>
              <p className="mt-0.5 font-medium opacity-70">Гра буде доступна на перерві</p>
            </div>
          )}

          <button
            type="button"
            onClick={toggleGame}
            aria-pressed={gameOn}
            disabled={lessonNow}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition ${
              lessonNow ? "bg-gray-600 opacity-60 cursor-not-allowed" : gameOn ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {lessonNow ? "🐊 Гра після уроку" : gameOn ? "🐊 Зупинити гру" : "🐊 Гра з крокодилом"}
          </button>
        </div>
      )}
    </>
  );
}
