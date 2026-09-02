export interface LessonOption {
  subject: string;
  link: string;
  /** Де відбувається урок: у сховищі або в Коротичі. Задає колір кнопки */
  variant?: string;
}

export interface Lesson extends Partial<LessonOption> {
  /** Предмети, що чергуються по тижнях: показуємо кілька кнопок в одному слоті */
  options?: LessonOption[];
}

export interface DaySchedule {
  day: string;
  times: string[];
  lessons: Lesson[];
}

/** Урок без посилання нікуди не веде, тому лишається сірим і не клікабельним */
export const NO_LINK = "#";

/** Порожній слот у середині дня. Тримає вирівнювання lessons з times за індексом */
export const PLACEHOLDER = "—";

/** Слот може містити один урок або кілька, що чергуються по тижнях */
export const lessonOptions = (lesson: Lesson): LessonOption[] =>
  lesson.options?.length ? lesson.options : [{ subject: lesson.subject ?? "", link: lesson.link ?? NO_LINK, variant: lesson.variant }];

/** Назви днів приходять з різними апострофами, тому зводимо їх до одного вигляду */
export const normalizeDay = (value: string) =>
  value
    .toLowerCase()
    .replace(/['ʼ`‘]/g, "'")
    .trim();

/** Чи момент reference потрапляє в проміжок "08:00 - 08:45" того ж дня */
export const isWithinLesson = (timeRange: string, reference: Date) => {
  if (!timeRange) return false;

  const [start, end] = timeRange.split(" - ");
  if (!start || !end) return false;

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  if ([startH, startM, endH, endM].some(Number.isNaN)) return false;

  const time = reference.getTime();
  return time >= new Date(reference).setHours(startH, startM, 0, 0) && time <= new Date(reference).setHours(endH, endM, 0, 0);
};

/**
 * Чи саме зараз іде урок у сьогоднішньому дні розкладу.
 * Заглушки-прочерки за урок не рахуються, як і слоти часу без уроку.
 */
export const isLessonNow = (scheduleData: DaySchedule[], reference: Date) => {
  const todayName = normalizeDay(new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(reference));
  const today = scheduleData.find((day) => normalizeDay(day.day) === todayName);
  if (!today) return false;

  return today.lessons.some((lesson, idx) => {
    const isRealLesson = lessonOptions(lesson).some((option) => option.subject && option.subject !== PLACEHOLDER);
    return isRealLesson && isWithinLesson(today.times[idx], reference);
  });
};
