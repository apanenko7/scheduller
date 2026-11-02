"use client";

import React, { useId } from "react";

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
  /** Сидить по шию в теплій воді з мандаринкою на голові */
  bathing?: boolean;
  /** Задерла голову до неба */
  lookingUp?: boolean;
  /** Мружиться — от-от чхне */
  squinting?: boolean;
}

const FUR = "#8d6748";
const FUR_DARK = "#6f4f34";
const FUR_FAR = "#5e4229";
const FUR_LIGHT = "#a9825f";
const INK = "#2a1d13";

/** Лапа з темною ступнею. Анімація крокує всю групу від «плеча» */
function Leg({ x, width, height, className, fill }: { x: number; width: number; height: number; className: string; fill: string }) {
  return (
    <g className={className}>
      <rect x={x} y="27" width={width} height={height} rx={width / 2} fill={fill} />
      <ellipse cx={x + width / 2 + 0.6} cy={27 + height - 0.8} rx={width / 2 + 0.6} ry="1.3" fill={INK} opacity="0.55" />
    </g>
  );
}

export default function CapybaraSprite({ stepping, fast, asleep, chewing, grass, squatting, excited, bathing, lookingUp, squinting }: CapybaraSpriteProps) {
  // id градієнта унікальний, щоб кілька спрайтів на сторінці не ділили один
  const furId = `capy-fur-${useId().replace(/:/g, "")}`;

  const legClass = stepping ? `critter-leg${fast ? " critter-leg--fast" : ""}` : "";
  const legOffbeat = stepping ? `${legClass} critter-leg--offbeat` : "";
  const legHeight = asleep ? 4 : squatting ? 6 : 12;
  const bodyClass = asleep ? "critter-breathe" : stepping ? `critter-bob${fast ? " critter-bob--fast" : ""}` : undefined;
  // Коли стоїть і нічим не зайнята — роззирається довкола
  const idle = !stepping && !asleep && !chewing && !squatting && !lookingUp;
  const lift = bathing ? "translate(0 12)" : asleep ? "translate(0 6)" : squatting ? "translate(0 4)" : undefined;

  return (
    <svg width={CAPY_W} height={CAPY_H} viewBox="0 0 66 46">
      <defs>
        <linearGradient id={furId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9c7553" />
          <stop offset="0.6" stopColor={FUR} />
          <stop offset="1" stopColor="#7a583b" />
        </linearGradient>
      </defs>

      <g transform={lift}>
        {/* Дальні лапи темніші — так читається глибина. У воді лап не видно */}
        {!bathing && (
          <>
            <Leg x={21} width={5} height={legHeight} className={legOffbeat} fill={FUR_FAR} />
            <Leg x={41} width={5} height={legHeight} className={legClass} fill={FUR_FAR} />
          </>
        )}

        <g className={bodyClass}>
          {/* Тулуб-бочка з високим заокругленим задом */}
          <path d="M9 21 C9 11 17 7.5 29 7.5 C41 7.5 47 11.5 47 19.5 C47 27.5 40 31 28 31 C16 31 9 28.5 9 21 Z" fill={`url(#${furId})`} />
          <path d="M16 28.5 C22 31 34 31 41 28" stroke={FUR_LIGHT} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* Шерсть: кілька коротких штрихів */}
          <g stroke={FUR_DARK} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7">
            <path d="M17 13 q2 -1.6 4 -1.2" />
            <path d="M25 11 q2 -1.6 4 -1.2" />
            <path d="M33 11.5 q2 -1.6 4 -1.2" />
            <path d="M13.5 19 q2 -1.6 4 -1.2" />
            <path d="M22 17.5 q2 -1.6 4 -1.2" />
            <path d="M31 18 q2 -1.6 4 -1.2" />
          </g>

          {/* Голова задирається від шиї */}
          <g transform={lookingUp ? "rotate(-22 44 20)" : undefined}>
            <g className={idle ? "critter-look" : undefined}>
              <g className={chewing ? "critter-chew" : undefined}>
                {/* Вухо */}
                <g className={asleep ? undefined : "critter-ear"}>
                  <ellipse cx="46" cy="5" rx="3.1" ry="2.9" fill={FUR_DARK} />
                  <ellipse cx="46.3" cy="5.4" rx="1.5" ry="1.4" fill="#c98f7a" />
                </g>

                {/* Голова: широка, з тупою «прямокутною» мордою */}
                <path d="M41.5 13 C41.5 7.5 46 5.5 51.5 6 C56 6.4 59.5 8.5 62.5 12 C64.6 14.5 64.6 19 62 20.8 C59.5 22.6 53 23.2 48.5 22.4 C44 21.6 41.5 18 41.5 13 Z" fill={FUR} />
                <path d="M58 9.5 C61 11 64 13.5 64 16.5" stroke={FUR_LIGHT} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />

                {/* Ніс і рот */}
                <ellipse cx="61.6" cy="14.6" rx="2.5" ry="2.1" fill="#5c3f28" />
                <ellipse cx="62.6" cy="14.3" rx="0.8" ry="0.55" fill={INK} />
                <path d="M59.2 19.6 q1.6 1 3.2 -0.2" stroke={INK} strokeWidth="0.8" strokeLinecap="round" fill="none" />

                {/* Вуса */}
                <g stroke={INK} strokeWidth="0.4" strokeLinecap="round" opacity="0.5">
                  <path d="M60 17 l5 -0.8" />
                  <path d="M60 17.8 l5 0.8" />
                </g>

                {/* Рум'янець — для милоти */}
                <ellipse cx="55" cy="16.8" rx="2.3" ry="1.3" fill="#e89a8a" opacity="0.5" />

                {bathing && (
                  <g>
                    <circle cx="52.5" cy="3.4" r="3.3" fill="#f59027" />
                    <circle cx="51.4" cy="2.4" r="0.9" fill="#ffb45c" />
                    <path d="M52.6 0.4 q2 -1.6 3.6 -0.6 q-1.4 1.6 -3.6 0.6" fill="#4ca64c" />
                  </g>
                )}

                {asleep ? (
                  <path d="M51.6 11.6 q2 1.8 4 0" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                ) : squinting ? (
                  <path d="M52.2 9.8 l2.6 1.6 l-2.6 1.6" stroke={INK} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ) : (
                  <g className="critter-blink">
                    <circle cx="53.6" cy="11.4" r={excited ? 2.1 : 1.8} fill={INK} />
                    <circle cx="54.2" cy="10.7" r="0.6" fill="#fff" />
                  </g>
                )}
              </g>
            </g>
          </g>
        </g>

        {/* Ближні лапи поверх тулуба, задня товща — це стегно */}
        {!bathing && (
          <>
            <Leg x={13.5} width={6} height={legHeight} className={legClass} fill={FUR_DARK} />
            <Leg x={34} width={5} height={legHeight} className={legOffbeat} fill={FUR_DARK} />
          </>
        )}

        {/* Тепла калюжка з парою. Зсунута разом з капібарою, тому координати з поправкою на lift */}
        {bathing && (
          <g transform="translate(0 -12)">
            <ellipse cx="33" cy="38.5" rx="32" ry="7" fill="#4f9fdc" opacity="0.9" />
            <path d="M8 36 q5 -2 10 0 M40 37 q5 -2 10 0 M24 41 q4 -1.6 8 0" stroke="#bfe3ff" strokeWidth="1" strokeLinecap="round" fill="none" />
            <g stroke="#e6f2ff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7">
              <path className="critter-snore" d="M10 28 q-2 -3 0 -6" />
              <path className="critter-snore" style={{ animationDelay: "-1.2s" }} d="M20 27 q-2 -3 0 -6" />
            </g>
          </g>
        )}

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
