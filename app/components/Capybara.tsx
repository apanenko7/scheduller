"use client";

import React, { useEffect, useRef, useState } from "react";

type Mood = "walk" | "sleep" | "eat" | "chase";

const WIDTH = 66;
const WALK_SPEED = 38;
const CHASE_SPEED = 135;

// Скільки капібара тримається кожного настрою, мс
const DURATION: Record<Mood, [number, number]> = {
  walk: [3500, 7000],
  sleep: [5000, 10000],
  eat: [3000, 5500],
  chase: [3000, 6000],
};

const MOODS: Mood[] = ["walk", "walk", "walk", "sleep", "eat", "chase"];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const pickMood = (current: Mood) => {
  const options = MOODS.filter((mood) => mood !== current);
  return options[Math.floor(Math.random() * options.length)];
};

export default function Capybara() {
  const [mood, setMood] = useState<Mood>("walk");
  const [reduceMotion, setReduceMotion] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<Mood>(mood);
  const xRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  const pointerXRef = useRef(0);

  moodRef.current = mood;

  // Рух: положення міняємо напряму через ref, щоб не перемальовувати React на кожен кадр
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMedia = () => setReduceMotion(media.matches);
    syncMedia();
    media.addEventListener("change", syncMedia);

    const maxX = () => Math.max(0, window.innerWidth - WIDTH);

    xRef.current = Math.random() * maxX();
    pointerXRef.current = window.innerWidth / 2;

    const handlePointer = (event: PointerEvent) => {
      pointerXRef.current = event.clientX;
    };
    window.addEventListener("pointermove", handlePointer);

    let frame = 0;
    let last = 0;

    const apply = () => {
      if (wrapRef.current) wrapRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      if (facingRef.current) facingRef.current.style.transform = `scaleX(${dirRef.current})`;
    };

    const loop = (time: number) => {
      const delta = Math.min(50, time - last) / 1000;
      last = time;

      const limit = maxX();
      if (xRef.current > limit) xRef.current = limit;

      if (moodRef.current === "walk") {
        xRef.current += dirRef.current * WALK_SPEED * delta;
        if (xRef.current <= 0) {
          xRef.current = 0;
          dirRef.current = 1;
        } else if (xRef.current >= limit) {
          xRef.current = limit;
          dirRef.current = -1;
        }
      } else if (moodRef.current === "chase") {
        const target = Math.min(Math.max(pointerXRef.current - WIDTH / 2, 0), limit);
        const gap = target - xRef.current;
        if (Math.abs(gap) > 1) {
          dirRef.current = gap > 0 ? 1 : -1;
          const move = dirRef.current * CHASE_SPEED * delta;
          xRef.current = Math.abs(move) > Math.abs(gap) ? target : xRef.current + move;
        }
      }

      apply();
      frame = requestAnimationFrame(loop);
    };

    apply();
    if (!media.matches) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointer);
      media.removeEventListener("change", syncMedia);
    };
  }, []);

  // Настрій змінюється сам собою через випадковий проміжок часу
  useEffect(() => {
    if (reduceMotion) return;
    const [min, max] = DURATION[mood];
    const timer = setTimeout(() => setMood((current) => pickMood(current)), randomBetween(min, max));
    return () => clearTimeout(timer);
  }, [mood, reduceMotion]);

  const asleep = reduceMotion || mood === "sleep";
  const moving = mood === "walk" || mood === "chase";
  const legClass = moving ? `capybara-leg${mood === "chase" ? " capybara-leg--fast" : ""}` : "";

  return (
    <div ref={wrapRef} aria-hidden="true" className="fixed bottom-2 left-0 z-40 pointer-events-none will-change-transform">
      <div ref={facingRef} className="origin-center">
        <svg width={WIDTH} height={44} viewBox="0 0 66 44" className={asleep ? "capybara-breathe" : undefined}>
          <g transform={asleep ? "translate(0 5)" : undefined}>
            {/* Лапи */}
            <g fill="#6f4f34">
              <rect className={legClass} x="14" y="28" width="5.5" height={asleep ? 4 : 9} rx="2.5" />
              <rect className={legClass ? `${legClass} capybara-leg--offbeat` : ""} x="21" y="28" width="5.5" height={asleep ? 4 : 9} rx="2.5" />
              <rect className={legClass ? `${legClass} capybara-leg--offbeat` : ""} x="34" y="28" width="5.5" height={asleep ? 4 : 9} rx="2.5" />
              <rect className={legClass} x="41" y="28" width="5.5" height={asleep ? 4 : 9} rx="2.5" />
            </g>

            {/* Тулуб */}
            <ellipse cx="28" cy="20" rx="19" ry="11" fill="#8d6748" />

            {/* Голова */}
            <g className={mood === "eat" ? "capybara-chew" : undefined}>
              <ellipse cx="46.5" cy="4.2" rx="3.1" ry="2.9" fill="#6f4f34" />
              <ellipse cx="51" cy="14" rx="10.5" ry="9" fill="#8d6748" />
              <ellipse cx="60" cy="17" rx="2.4" ry="1.9" fill="#6f4f34" />
              {asleep ? (
                <path d="M52.6 12 q2.2 2 4.4 0" stroke="#2a1d13" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              ) : (
                <circle cx="55" cy="12" r="1.7" fill="#2a1d13" />
              )}
            </g>

            {/* Пучок трави, коли їсть */}
            {mood === "eat" && (
              <g stroke="#4ca64c" strokeWidth="1.6" strokeLinecap="round" fill="none">
                <path d="M63 26 q-1 -5 1.5 -7" />
                <path d="M63 26 q2 -4 4.5 -5" />
                <path d="M63 26 q-3 -3 -5 -3.5" />
              </g>
            )}

            {/* Сопіння під час сну */}
            {asleep && (
              <text className="capybara-snore" x="58" y="6" fontSize="8" fontWeight="700" fill="#9ec5ff">
                z
              </text>
            )}

            {/* Азарт під час погоні */}
            {mood === "chase" && (
              <text x="30" y="5" fontSize="9" fontWeight="900" fill="#ffd24a">
                !
              </text>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
