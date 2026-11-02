"use client";

import React, { useEffect, useState } from "react";

const SCIENCE_FACTS = [
  "Світло від Сонця летить до Землі приблизно 8 хвилин",
  "Восьминіг має три серця і блакитну кров",
  "На Венері доба триває довше, ніж рік",
  "Мед не псується: його знаходили їстівним у давньоєгипетських гробницях",
  "Блискавка в кілька разів гарячіша за поверхню Сонця",
  "Капібара — найбільший гризун на Землі",
  "Банан — це ягода, а полуниця — ні",
  "У людини близько 206 кісток, а в немовляти — понад 270",
  "Сатурн такий легкий, що в гігантській ванні він би плавав",
  "Звук у воді поширюється приблизно в 4 рази швидше, ніж у повітрі",
  "Серце синього кита важить майже 200 кілограмів",
  "Щоб зібрати ложку меду, бджоли облітають тисячі квітів",
  "Сліди астронавтів на Місяці можуть зберегтися мільйони років: там немає вітру",
  "Вода — єдина речовина, яку на Землі легко побачити твердою, рідкою і газом",
  "Коала спить до 20 годин на добу",
  "Найближча до нас зірка — Сонце",
  "Морська зірка не має мозку",
  "Рослини виділяють кисень, яким ми дихаємо",
  "На Марсі є найвища гора Сонячної системи — Олімп",
];

const ENGLISH_WORDS: [string, string][] = [
  ["star", "зірка"],
  ["moon", "місяць"],
  ["rocket", "ракета"],
  ["planet", "планета"],
  ["tangerine", "мандаринка"],
  ["crocodile", "крокодил"],
  ["butterfly", "метелик"],
  ["rainbow", "веселка"],
  ["friendship", "дружба"],
  ["curious", "допитливий"],
  ["brave", "сміливий"],
  ["library", "бібліотека"],
  ["homework", "домашнє завдання"],
  ["breakfast", "сніданок"],
  ["weather", "погода"],
  ["thunder", "грім"],
  ["mountain", "гора"],
  ["ocean", "океан"],
  ["island", "острів"],
  ["journey", "подорож"],
  ["squirrel", "білка"],
  ["owl", "сова"],
  ["pencil", "олівець"],
  ["holiday", "свято, канікули"],
  ["delicious", "смачний"],
];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** Навпіл: або факт про науку, або англійське слово з перекладом */
const randomTidbit = () => {
  if (Math.random() < 0.5) return `🔬 ${pick(SCIENCE_FACTS)}`;

  const [word, translation] = pick(ENGLISH_WORDS);
  return `🔤 ${word} — ${translation}`;
};

/** Новий факт, але не той самий, що вже на екрані */
const nextTidbit = (current: string) => {
  let next = randomTidbit();
  while (next === current) next = randomTidbit();
  return next;
};

export default function FunFact() {
  const [text, setText] = useState("");

  // Випадковість лише в браузері, інакше розійдеться з серверним HTML
  useEffect(() => {
    setText(randomTidbit());
  }, []);

  return (
    <div className="flex min-h-9 items-center gap-3 px-4">
      <p aria-live="polite" className="text-lg font-medium text-cyan-200">
        {text}
      </p>
      {text && (
        <button
          type="button"
          onClick={() => setText(nextTidbit(text))}
          className="shrink-0 rounded-lg border border-cyan-400/40 px-2.5 py-1 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/15 focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          🔄 Ще
        </button>
      )}
    </div>
  );
}
