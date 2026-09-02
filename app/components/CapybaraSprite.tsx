"use client";

import React from "react";

export const CAPY_W = 66;
export const CAPY_H = 46;

interface CapybaraSpriteProps {
  /** Лапи крокують */
  stepping: boolean;
  /** Швидкий біг: лапи частіше */
  fast?: boolean;
  /** Очі закриті, лапи підібрані */
  asleep?: boolean;
  /** Голова жує */
  chewing?: boolean;
  /** Пучок трави біля морди */
  grass?: boolean;
  /** Присіла, щоб покакати */
  squatting?: boolean;
  /** Азарт: погоня або втеча */
  excited?: boolean;
}

export default function CapybaraSprite({ stepping, fast, asleep, chewing, grass, squatting, excited }: CapybaraSpriteProps) {
  const legClass = stepping ? `critter-leg${fast ? " critter-leg--fast" : ""}` : "";
  const legOffbeat = stepping ? `${legClass} critter-leg--offbeat` : "";
  const legHeight = asleep ? 4 : squatting ? 5.5 : 9;
  const bodyClass = asleep ? "critter-breathe" : stepping ? `critter-bob${fast ? " critter-bob--fast" : ""}` : undefined;

  return (
    <svg width={CAPY_W} height={CAPY_H} viewBox="0 0 66 46">
      <g transform={asleep ? "translate(0 6)" : squatting ? "translate(0 4)" : undefined}>
        <g fill="#6f4f34">
          <rect className={legClass} x="14" y="28" width="5.5" height={legHeight} rx="2.5" />
          <rect className={legOffbeat} x="21" y="28" width="5.5" height={legHeight} rx="2.5" />
          <rect className={legOffbeat} x="34" y="28" width="5.5" height={legHeight} rx="2.5" />
          <rect className={legClass} x="41" y="28" width="5.5" height={legHeight} rx="2.5" />
        </g>

        <g className={bodyClass}>
          <ellipse cx="28" cy="20" rx="19" ry="11" fill="#8d6748" />

          <g className={chewing ? "critter-chew" : undefined}>
            <ellipse cx="46.5" cy="4.2" rx="3.1" ry="2.9" fill="#6f4f34" />
            <ellipse cx="51" cy="14" rx="10.5" ry="9" fill="#8d6748" />
            <ellipse cx="60" cy="17" rx="2.4" ry="1.9" fill="#6f4f34" />
            {asleep ? (
              <path d="M52.6 12 q2.2 2 4.4 0" stroke="#2a1d13" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            ) : (
              <circle cx="55" cy="12" r="1.7" fill="#2a1d13" />
            )}
          </g>
        </g>

        {grass && (
          <g stroke="#4ca64c" strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M63 26 q-1 -5 1.5 -7" />
            <path d="M63 26 q2 -4 4.5 -5" />
            <path d="M63 26 q-3 -3 -5 -3.5" />
          </g>
        )}

        {asleep && (
          <text className="critter-snore" x="58" y="6" fontSize="8" fontWeight="700" fill="#9ec5ff">
            z
          </text>
        )}

        {excited && (
          <text x="30" y="5" fontSize="9" fontWeight="900" fill="#ffd24a">
            !
          </text>
        )}
      </g>
    </svg>
  );
}
