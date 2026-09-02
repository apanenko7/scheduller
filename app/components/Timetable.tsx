"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useHideWeekends } from "../context/HideWeekendsContext";

interface Lesson {
  subject: string;
  link: string;
  /** Де відбувається урок: у сховищі або в Коротичі. Задає колір кнопки */
  variant?: string;
}

/** Урок без посилання нікуди не веде, тому лишається сірим і не клікабельним */
const NO_LINK = "#";

const lessonTone = (lesson: Lesson, isToday: boolean) => {
  if (lesson.variant === "korotych") return "bg-red-600 text-white hover:bg-red-700";
  if (lesson.variant === "shelter") return "bg-green-600 text-white hover:bg-green-700";
  if (lesson.link === NO_LINK) return "bg-gray-300 text-gray-600";
  return isToday ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-gray-700 border border-gray-100 hover:border-blue-400";
};

interface DaySchedule {
  day: string;
  times: string[];
  lessons: Lesson[];
}

interface TimetableProps {
  scheduleData: DaySchedule[];
}

export default function Timetable({ scheduleData }: TimetableProps) {
  const [now, setNow] = useState(new Date());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastPlayedTime, setLastPlayedTime] = useState("");
  const { hideWeekends } = useHideWeekends();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return <div className="p-4 w-full min-h-screen" />;

  return (
    <div className="p-4 w-full">
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
      <div className="grid grid-cols-1 md:flex md:*:flex-1 gap-4">
        {scheduleData?.map((dayData) => {
          const normalize = (str: string) =>
            str
              .toLowerCase()
              .replace(/['ʼ`‘]/g, "'")
              .trim();
          const isToday = normalize(dayData.day.toLowerCase()) === normalize(todayName.toLowerCase());

          if (hideWeekends && (!dayData.lessons || dayData.lessons.length === 0)) {
            return null;
          }

          return (
            <div
              key={dayData.day}
              className={`rounded-2xl border-2 transition-all duration-500 bg-white overflow-hidden
              ${isToday ? "border-blue-500 shadow-xl ring-4 ring-blue-500/5 scale-[1.02] z-10" : "border-gray-100 opacity-60 hover:opacity-100"}
              `}
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

                        {lesson.link === NO_LINK ? (
                          <span
                            className={`text-md font-black p-2 rounded-lg text-center transition-all shadow-sm opacity-70
                            ${active ? "bg-yellow-400 text-yellow-900 scale-105" : lessonTone(lesson, isToday)}`}
                          >
                            {lesson.subject}
                          </span>
                        ) : (
                          <Link
                            target="_blank"
                            href={lesson.link}
                            className={`text-md font-black p-2 rounded-lg text-center transition-all shadow-sm
                            ${active ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 scale-105" : lessonTone(lesson, isToday)}`}
                          >
                            {lesson.subject}
                          </Link>
                        )}

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
