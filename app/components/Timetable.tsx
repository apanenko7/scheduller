"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { DaySchedule, LessonOption, NO_LINK, activeOptionIndex, isWithinLesson, lessonOptions, normalizeDay } from "../lib/schedule";
import { subjectIcon } from "../lib/subjectIcons";
import { isMobileDevice, openInZoomApp, zoomAppLink } from "../lib/zoom";

const BELL_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

/** Чи користувач уже увімкнув дзвінок. Переживає рефреш сторінки */
const BELL_KEY = "bellEnabled";

const lessonTone = (option: LessonOption, isToday: boolean) => {
  if (option.variant === "korotych") return "bg-red-600 text-white hover:bg-red-700";
  if (option.variant === "shelter") return "bg-green-600 text-white hover:bg-green-700";
  if (option.link === NO_LINK) return "bg-gray-300 text-gray-600";
  return isToday ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-gray-700 border border-gray-100 hover:border-blue-400";
};

function LessonButton({ option, active, isToday, compact, muted, withIcon }: { option: LessonOption; active: boolean; isToday: boolean; compact: boolean; muted?: boolean; withIcon?: boolean }) {
  // У рядку з кількох кнопок місця вдвічі менше, тому шрифт дрібніший
  const size = compact ? "text-xs p-1.5 flex-1 min-w-0" : "text-md p-2";
  const shared = `${size} font-black rounded-lg text-center transition-all shadow-sm`;
  const icon = withIcon ? subjectIcon(option.subject) : "";
  const label = (
    <>
      {icon && (
        <span aria-hidden="true" className="mr-1 font-normal">
          {icon}
        </span>
      )}
      {option.subject}
    </>
  );

  if (option.link === NO_LINK) {
    return <span className={`${shared} ${muted ? "opacity-40" : "opacity-70"} ${active ? "bg-yellow-400 text-yellow-900 scale-105" : lessonTone(option, isToday)}`}>{label}</span>;
  }

  const appLink = zoomAppLink(option.link);

  // Звичайний клік веде одразу в застосунок Zoom. Ctrl/середня кнопка й телефони
  // працюють як раніше — через веб-посилання
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!appLink || isMobileDevice() || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    openInZoomApp(appLink, option.link);
  };

  return (
    <Link
      target="_blank"
      href={option.link}
      onClick={handleClick}
      className={`${shared} ${muted ? "opacity-40" : ""} ${active ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 scale-105" : lessonTone(option, isToday)}`}
    >
      {label}
    </Link>
  );
}

interface TimetableProps {
  scheduleData: DaySchedule[];
  /** Іконки біля назв предметів — для молодших класів */
  withIcons?: boolean;
}

export default function Timetable({ scheduleData, withIcons }: TimetableProps) {
  const [now, setNow] = useState(new Date());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastPlayedTime, setLastPlayedTime] = useState("");
  const [mounted, setMounted] = useState(false);

  // Audio створюємо один раз: якби елемент перестворювався, губився б дозвіл
  // на звук, який браузер видає лише після клацання користувача
  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio(BELL_SOUND);
    audioRef.current.load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      checkForBell(currentTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastPlayedTime, isAudioEnabled]);

  /** Тиха спроба розблокувати звук. Повертає false, якщо браузер відмовив */
  const unlockAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.muted = true;
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      return true;
    } catch {
      return false;
    } finally {
      audio.muted = false;
    }
  };

  // Після рефрешу дозвіл на автоплей може не діяти, тому вибір користувача
  // відновлюємо лише якщо звук справді вдалося розблокувати
  useEffect(() => {
    if (!mounted) return;
    if (localStorage.getItem(BELL_KEY) !== "true") return;

    let cancelled = false;
    unlockAudio().then((ok) => {
      if (ok && !cancelled) setIsAudioEnabled(true);
    });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

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

  const enableAudio = async () => {
    if (!(await unlockAudio())) return;

    setIsAudioEnabled(true);
    localStorage.setItem(BELL_KEY, "true");
  };

  const playTestSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const isCurrentLesson = (timeRange: string, isToday: boolean) => isToday && isWithinLesson(timeRange, now);

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
          const isToday = normalizeDay(dayData.day) === normalizeDay(todayName);

          // Вихідні (дні без уроків) не показуємо зовсім
          if (dayData.lessons.length === 0) {
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
                {dayData.lessons.map((lesson, idx) => {
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

                        {(() => {
                          const options = lessonOptions(lesson);
                          const alternating = options.length > 1;
                          const activeIdx = alternating ? activeOptionIndex(now, options.length) : 0;

                          return (
                            <div className="flex flex-col gap-1">
                              {/* Предмети, що чергуються, стоять поруч в один рядок.
                                  Активний саме цього тижня — звичайний колір, інший — приглушений */}
                              <div className={alternating ? "flex gap-1" : "flex flex-col"}>
                                {options.map((option, optionIdx) => {
                                  const isThisWeek = !alternating || optionIdx === activeIdx;
                                  return (
                                    <LessonButton
                                      key={optionIdx}
                                      option={option}
                                      active={active && isThisWeek}
                                      isToday={isToday}
                                      compact={alternating}
                                      muted={alternating && !isThisWeek}
                                      withIcon={withIcons}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {active && <p className="text-[9px] text-center font-bold text-yellow-600 uppercase mt-1 animate-pulse">Зараз іде урок</p>}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
