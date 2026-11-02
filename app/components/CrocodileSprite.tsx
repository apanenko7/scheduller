"use client";

import React from "react";

export const CROC_W = 92;
export const CROC_H = 34;

const SKIN = "#4a8a4a";
const SKIN_DARK = "#3f7d3f";
const SKIN_FAR = "#2f6a2f";
const SCUTE = "#2f5f2f";
const BELLY = "#a8c98a";

/** Коротка лапа з кігтиками. Анімація крокує всю групу від «плеча» */
function Leg({ x, className, fill }: { x: number; className: string; fill: string }) {
  return (
    <g className={className}>
      <rect x={x} y="21" width="5" height="9" rx="2.3" fill={fill} />
      <path d={`M${x - 0.5} 30 h6.5 l-1 -1.6 h-4.5 Z`} fill={SCUTE} />
    </g>
  );
}

export default function CrocodileSprite({ stepping }: { stepping: boolean }) {
  const legClass = stepping ? "critter-leg critter-leg--fast" : "";
  const legOffbeat = stepping ? `${legClass} critter-leg--offbeat` : "";

  return (
    <svg width={CROC_W} height={CROC_H} viewBox="0 0 92 34">
      {/* Дальні лапи темніші й ховаються за тулубом */}
      <Leg x={28} className={legOffbeat} fill={SKIN_FAR} />
      <Leg x={48} className={legClass} fill={SKIN_FAR} />

      <g className={stepping ? "critter-bob critter-bob--fast" : undefined}>
        {/* Хвіст виляє від основи, з рядом гребенів */}
        <g className={stepping ? "croc-tail" : undefined}>
          <path d="M24 14 C16 14.5 8 17 0.5 21 C8 22.5 16 24.5 24 24.5 Z" fill={SKIN_DARK} />
          <g fill={SCUTE}>
            <path d="M5 19 l1.8 -2.4 l1.8 2" />
            <path d="M10 17.6 l1.8 -2.6 l1.8 2.2" />
            <path d="M15 16.4 l1.8 -2.8 l1.8 2.4" />
            <path d="M20 15.4 l1.8 -3 l1.8 2.6" />
          </g>
        </g>

        {/* Тулуб зі світлим черевом */}
        <path d="M21 14 C27 10 48 10 56 12.5 L58 24.5 C48 28 29 28 21 24.5 Z" fill={SKIN} />
        <path d="M25 25 C33 27.4 46 27.4 55 24.6" stroke={BELLY} strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* Гребені на спині й лусочки на боці */}
        <g fill={SCUTE}>
          <path d="M26 12.4 l2 -3 l2 2.8" />
          <path d="M32 11.4 l2 -3.2 l2 3" />
          <path d="M38 11 l2 -3.2 l2 3" />
          <path d="M44 11 l2 -3.2 l2 3" />
          <path d="M50 11.5 l2 -3 l2 2.8" />
        </g>
        <g fill={SKIN_DARK} opacity="0.8">
          <circle cx="30" cy="16.5" r="1.2" />
          <circle cx="36" cy="15.8" r="1.2" />
          <circle cx="42" cy="15.8" r="1.2" />
          <circle cx="48" cy="16.3" r="1.2" />
          <circle cx="33" cy="20.5" r="1" />
          <circle cx="39" cy="20.2" r="1" />
          <circle cx="45" cy="20.4" r="1" />
        </g>

        {/* Паща зсередини видна, коли нижня щелепа відкривається */}
        <path d="M55 17.5 L86 17.8 L86 19.5 L57 22 Z" fill="#7a2b2b" />

        {/* Нижня щелепа клацає */}
        <g className={stepping ? "critter-chomp" : undefined}>
          <path d="M54 18 L85.5 18.4 C88.5 18.6 89 20.6 86.8 21.6 L57 24 C55 23.4 54 21 54 18 Z" fill={SKIN_DARK} />
          <g fill="#ffffff">
            <path d="M63 18.6 l1.4 -2 l1.4 2 Z" />
            <path d="M71 18.7 l1.4 -2 l1.4 2 Z" />
            <path d="M79 18.8 l1.4 -2 l1.4 2 Z" />
          </g>
        </g>

        {/* Верхня щелепа: довга морда з горбиком ніздрів і зубами */}
        <path d="M53 11.5 C58 9 64 10 70 10.8 L86 12.2 C89.2 12.6 90.6 14 90.6 16 L90.6 17.2 L54 18 Z" fill={SKIN} />
        <g fill="#ffffff">
          <path d="M59 17.8 l1.4 2.4 l1.4 -2.4 Z" />
          <path d="M66 17.7 l1.4 2.4 l1.4 -2.4 Z" />
          <path d="M74 17.6 l1.4 2.4 l1.4 -2.4 Z" />
          <path d="M82 17.4 l1.4 2.4 l1.4 -2.4 Z" />
        </g>
        <ellipse cx="87.6" cy="12.4" rx="2" ry="1.4" fill={SKIN_DARK} />
        <circle cx="88.2" cy="12" r="0.55" fill="#1c2b1c" />

        {/* Око на горбику, з вертикальною зіницею */}
        <ellipse cx="60" cy="9.6" rx="4.2" ry="3.4" fill={SKIN} />
        <g className="critter-blink">
          <ellipse cx="60.5" cy="9.3" rx="2.5" ry="2.2" fill="#ffe066" />
          <ellipse cx="61" cy="9.3" rx="0.7" ry="1.9" fill="#1c2b1c" />
        </g>
        <path d="M57 7.4 q3.5 -1.6 7 0" stroke={SCUTE} strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>

      {/* Ближні лапи поверх тулуба */}
      <Leg x={24} className={legClass} fill={SKIN_DARK} />
      <Leg x={44} className={legOffbeat} fill={SKIN_DARK} />
    </svg>
  );
}
