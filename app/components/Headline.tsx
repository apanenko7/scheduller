"use client";

import React, { useEffect, useState } from "react";
import { useHideWeekends } from "../context/HideWeekendsContext";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Додаємо цей хук

export default function Headline() {
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const { hideWeekends, setHideWeekends } = useHideWeekends();

  const pathname = usePathname(); // Отримуємо поточний шлях
  const isHomePage = pathname === "/"; // Перевіряємо, чи ми на головній

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Функція для нормалізації апострофа (як ми обговорювали раніше)
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/['ʼ`‘]/g, "'")
      .trim();

  const todayName = new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(now);

  return (
    <div className="p-4 w-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex gap-2.5 mb-2">
            {!isHomePage && (
              <Link href="/" className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition group">
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              </Link>
            )}

            <h1 className="text-2xl font-black text-cyan-500 uppercase tracking-tighter">Мій Розклад</h1>
          </div>
          {mounted ? (
            <p className="text-lg font-medium">
              Сьогодні: <span className="capitalize text-blue-600">{todayName}</span>, {now.toLocaleTimeString("uk-UA")}
            </p>
          ) : (
            <p className="text-lg font-medium opacity-0">Завантаження...</p>
          )}
        </div>

        {mounted && (
          <button onClick={() => setHideWeekends(!hideWeekends)} className="mt-3 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            {hideWeekends ? "Показати вихідні" : "Сховати вихідні"}
          </button>
        )}
      </div>
    </div>
  );
}
