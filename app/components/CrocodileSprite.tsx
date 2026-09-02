"use client";

import React from "react";

export const CROC_W = 92;
export const CROC_H = 34;

export default function CrocodileSprite({ stepping }: { stepping: boolean }) {
  const legClass = stepping ? "critter-leg critter-leg--fast" : "";
  const legOffbeat = stepping ? `${legClass} critter-leg--offbeat` : "";

  return (
    <svg width={CROC_W} height={CROC_H} viewBox="0 0 92 34">
      <g className={stepping ? "critter-bob critter-bob--fast" : undefined}>
        {/* Хвіст */}
        <path d="M0 19 L20 13 L20 25 Z" fill="#3f7d3f" />

        {/* Гребінь на спині */}
        <g fill="#2f5f2f">
          <path d="M24 12 l3 -4 l3 4 Z" />
          <path d="M32 11 l3 -4 l3 4 Z" />
          <path d="M40 11 l3 -4 l3 4 Z" />
        </g>

        <g fill="#6f4f34">
          <rect className={legClass} x="26" y="23" width="5" height="7" rx="2.2" />
          <rect className={legOffbeat} x="46" y="23" width="5" height="7" rx="2.2" />
        </g>

        {/* Тулуб */}
        <ellipse cx="38" cy="19" rx="20" ry="8" fill="#4a8a4a" />

        {/* Верхня щелепа з зубами */}
        <path d="M54 12 h32 q4 0 4 3 v2 h-36 Z" fill="#4a8a4a" />
        <g fill="#ffffff">
          <path d="M60 17 l2 3 l2 -3 Z" />
          <path d="M67 17 l2 3 l2 -3 Z" />
          <path d="M74 17 l2 3 l2 -3 Z" />
          <path d="M81 17 l2 3 l2 -3 Z" />
        </g>

        {/* Нижня щелепа клацає */}
        <g className={stepping ? "critter-chomp" : undefined}>
          <path d="M54 18 h30 q3 0 3 2.5 v1.5 h-33 Z" fill="#3f7d3f" />
        </g>

        {/* Око */}
        <circle cx="57" cy="10" r="3.2" fill="#ffe066" />
        <circle cx="57.8" cy="10" r="1.5" fill="#1c2b1c" />
      </g>
    </svg>
  );
}
