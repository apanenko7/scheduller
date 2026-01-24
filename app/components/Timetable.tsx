"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";

const TIME_WEEKDAY = ["08:00 - 08:40", "08:55 - 09:35", "10:00 - 10:40", "11:05 - 11:45", "12:00 - 12:40", "12:55 - 13:35"];
const TIME_SATURDAY = ["08:30 - 09:10", "09:20 - 10:00", "10:10 - 10:50", "11:00 - 11:40", "11:55 - 12:35"];

// Дані розкладу (скорочено для прикладу, залиш свій повний список)
const scheduleData = [
  {
    day: "Вівторок",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "ЯДС", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Математика", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Укр. Мова", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Читання", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Фізкультура", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
    ],
  },
  {
    day: "Середа",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "Англ. Мова", link: "https://us02web.zoom.us/j/82089068912?pwd=azNVQ04xMnZueWxsbkR4cGhReEtEdz09&authuser=0" },
      { subject: "ЯДС", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Математика", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Укр. Мова", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Образотворче Мистецтво", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Інформатика", link: "https://us04web.zoom.us/j/7815597413?pwd=VE5vMVRUc0gwL25ocGU5L2dkR3FVZz09" },
    ],
  },
  {
    day: "Четвер",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "Читання", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Математика", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Укр. Мова", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Дизайн та Технології", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Фізкультура", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
    ],
  },
  {
    day: "П'ятниця",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "ЯДС", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Математика", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Англ. Мова", link: "https://us02web.zoom.us/j/82089068912?pwd=azNVQ04xMnZueWxsbkR4cGhReEtEdz09&authuser=0" },
      { subject: "Укр. Мова", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Читання", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
    ],
  },
  {
    day: "Субота",
    times: TIME_SATURDAY,
    lessons: [
      { subject: "Читання", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Музичне Мистецтво", link: "https://us04web.zoom.us/j/2617768450?pwd=dHh5S3pRYzhaNHRZeEUxbEEyNHhvZz09" },
      { subject: "Англ. Мова", link: "https://us02web.zoom.us/j/82089068912?pwd=azNVQ04xMnZueWxsbkR4cGhReEtEdz09&authuser=0" },
      { subject: "Математика", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
      { subject: "Фізкультура", link: "https://us05web.zoom.us/j/81591285811?pwd=N6ltxdUAmJi0RbjumcPaUVixf0SE2G.1" },
    ],
  },
  { day: "Неділя", lessons: [], times: [] },
  { day: "Понеділок", lessons: [], times: [] },
];
export default function Timetable() {
  const [now, setNow] = useState(new Date());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastPlayedTime, setLastPlayedTime] = useState("");

  useEffect(() => {
    // Звук дзвінка
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current.load();

    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      checkForBell(currentTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastPlayedTime, isAudioEnabled]);

  const checkForBell = (currentTime: Date) => {
    if (!isAudioEnabled) return;

    const todayName = new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(currentTime);
    const todayData = scheduleData.find((d) => d.day.toLowerCase() === todayName.toLowerCase());

    if (todayData) {
      todayData.times.forEach((timeRange) => {
        const startTimeStr = timeRange.split(" - ")[0];
        const [h, m] = startTimeStr.split(":").map(Number);

        const lessonStart = new Date(currentTime);
        lessonStart.setHours(h, m, 0, 0);

        const diff = lessonStart.getTime() - currentTime.getTime();

        // Граємо за 5 секунд до початку (між 5000мс та 4000мс до старту)
        if (diff <= 5000 && diff > 4000 && lastPlayedTime !== startTimeStr) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e) => console.error("Помилка відтворення:", e));
            setLastPlayedTime(startTimeStr);
          }
        }
      });
    }
  };

  const enableAudio = () => {
    setIsAudioEnabled(true);
    // Робимо тестовий запуск, щоб браузер дозволив звуки
    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.muted = false;
        audioRef.current!.currentTime = 0;
      });
    }
  };

  const playTestSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const isCurrentLesson = (timeRange: string, isToday: boolean) => {
    if (!isToday || !timeRange) return false;
    const [start, end] = timeRange.split(" - ");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startTime = new Date(now).setHours(startH, startM, 0);
    const endTime = new Date(now).setHours(endH, endM, 0);
    const currentTime = now.getTime();

    return currentTime >= startTime && currentTime <= endTime;
  };

  const todayName = new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(now);

  return (
    <div className="p-4 w-full">
      {/* ПАНЕЛЬ КЕРУВАННЯ ЗВУКОМ */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {!isAudioEnabled ? (
          <button
            onClick={enableAudio}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce transition-all transform hover:scale-105"
          >
            <span className="text-2xl">🔔</span>
            <div className="text-left">
              <p className="font-bold text-sm leading-tight">УВІМКНУТИ ДЗВІНОК</p>
              <p className="text-[10px] opacity-80">Потрібно для роботи звуку</p>
            </div>
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={playTestSound} className="bg-white border-2 border-blue-500 text-blue-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50">
              Перевірити звук 🔊
            </button>
            <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Дзвінок активований</span>
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
        )}
      </div>

      {/* ШАПКА */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-cyan-500 uppercase tracking-tighter">Мій Розклад</h1>
          <p className="text-lg font-medium">
            Сьогодні: <span className="capitalize text-blue-600">{todayName}</span>, {now.toLocaleTimeString("uk-UA")}
          </p>
        </div>
      </div>

      {/* СІТКА РОЗКЛАДУ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
        {scheduleData.map((dayData) => {
          const isToday = dayData.day.toLowerCase() === todayName.toLowerCase();

          return (
            <div
              key={dayData.day}
              className={`rounded-2xl border-2 transition-all duration-500 bg-white overflow-hidden
                ${isToday ? "border-blue-500 shadow-xl ring-4 ring-blue-500/5 scale-[1.02] z-10" : "border-gray-100 opacity-60 hover:opacity-100"}`}
            >
              <div
                className={`p-3 text-center font-black uppercase text-xs tracking-widest
                ${isToday ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                {dayData.day}
              </div>

              <div className="p-2 space-y-2">
                {dayData.lessons.length > 0 ? (
                  dayData.lessons.map((lesson, idx) => {
                    const active = isCurrentLesson(dayData.times[idx], isToday);

                    return (
                      <div
                        key={idx}
                        className={`group relative flex flex-col gap-1 px-2.5 rounded-xl border transition-all duration-300
                          ${active ? "bg-yellow-50 border-yellow-400 shadow-inner" : "border-gray-50 bg-gray-50/30"}`}
                      >
                        <div className="flex justify-between items-center">
                          <time className={`text-sm ${active ? "text-yellow-700" : "text-gray-400"}`}>{dayData.times[idx]}</time>
                          {active && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                        </div>

                        <Link
                          target="_blank"
                          href={lesson.link}
                          className={`text-md font-black p-2 rounded-lg text-center transition-all shadow-sm
                            ${
                              active
                                ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 scale-105"
                                : isToday
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-white text-gray-700 border border-gray-100 hover:border-blue-400"
                            }`}
                        >
                          {lesson.subject}
                        </Link>

                        {active && <p className="text-[9px] text-center font-bold text-yellow-600 uppercase mt-1 animate-pulse">Зараз іде урок</p>}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">Вихідний</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
