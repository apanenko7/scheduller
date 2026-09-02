import { TIME_WEEKDAY } from "./times";

// Посилання зібрані в одному місці, щоб міняти зум лише раз для всіх уроків
const ZOOM = {
  polish: "https://us04web.zoom.us/j/5552520411?pwd=MlF4Y0pTVk11Ti9BZ3RGY3ZmRzNSZz09#success",
  english: "https://us02web.zoom.us/j/82089068912?pwd=azNVQ04xMnZueWxsbkR4cGhReEtEdz09#success",
  ukrainian: "https://us04web.zoom.us/j/75087881750?pwd=bwJR84quhawzyAebBlvBQt27rt68Cm.1#success",
  // Укр. література поки в тій самій кімнаті, що й укр. мова, але ключ окремий
  ukrainianLit: "https://us04web.zoom.us/j/75087881750?pwd=bwJR84quhawzyAebBlvBQt27rt68Cm.1",
  music: "https://us04web.zoom.us/j/2617768450?pwd=dHh5S3pRYzhaNHRZeEUxbEEyNHhvZz09",
  math: "https://us05web.zoom.us/j/81384953993?pwd=eHNjYlJ0R3RySDJFOEc4cEFGYUJYUT09#success",
  pe: "https://us05web.zoom.us/j/7247905558?pwd=OBgYb8sfHyJfFarbi132sEjC887uuz.1",
  zbd: "https://us04web.zoom.us/j/79726848608?pwd=XajQ4db89HNZxwSpk8cCVQQ4IWvqVb.1#success",
} as const;

// Заглушка для уроків, до яких посилання ще немає
const NONE = "#";

export const scheduleData = [
  {
    day: "Понеділок",
    times: TIME_WEEKDAY,
    lessons: [
      // Чергуються по тижнях, тому два окремих посилання в одному слоті
      {
        options: [
          { subject: "Інформатика", link: NONE },
          { subject: "СЕЕН", link: NONE },
        ],
      },
      { subject: "Математика", link: ZOOM.math },
      { subject: "Англ. мова", link: ZOOM.english },
      { subject: "Україн. мова", link: ZOOM.ukrainian },
      { subject: "Технології", link: NONE },
      { subject: "Образотв. мист.", link: NONE },
    ],
  },
  {
    day: "Вівторок",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "—", link: NONE },
      { subject: "Фізична культ.", link: ZOOM.pe },
      { subject: "Математика", link: ZOOM.math },
      { subject: "Інформатика", link: NONE },
      { subject: "Математика (сховище)", link: ZOOM.math, variant: "shelter" },
      { subject: "Українська літ. (сховище)", link: ZOOM.ukrainianLit, variant: "shelter" },
      { subject: "Англійська мова (сховище)", link: ZOOM.english, variant: "shelter" },
      { subject: "Пізнаємо природу (сховище)", link: NONE, variant: "shelter" },
    ],
  },
  {
    day: "Середа",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "Польс. мова", link: ZOOM.polish },
      { subject: "Англійська мова", link: ZOOM.english },
      { subject: "Укр. мова", link: ZOOM.ukrainian },
      { subject: "Математика", link: ZOOM.math },
      { subject: "Фізична культ.", link: ZOOM.pe },
      { subject: "ЗБД", link: ZOOM.zbd },
      { subject: "Укр. мова", link: ZOOM.ukrainian },
    ],
  },
  {
    day: "Четвер",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "—", link: NONE },
      { subject: "Музичне мист.", link: ZOOM.music },
      { subject: "Польс. мова", link: ZOOM.polish },
      { subject: "Укр. мова", link: ZOOM.ukrainian },
      { subject: "Фізична культура", link: ZOOM.pe },
      { subject: "Математика (Коротич)", link: ZOOM.math, variant: "korotych" },
      { subject: "Українська літ. (Коротич)", link: ZOOM.ukrainianLit, variant: "korotych" },
      { subject: "Англійська мова (Коротич)", link: ZOOM.english, variant: "korotych" },
    ],
  },
  {
    day: "П'ятниця",
    times: TIME_WEEKDAY,
    lessons: [
      { subject: "Зарубіжна літер. (сховище)", link: NONE, variant: "shelter" },
      { subject: "Історія (сховище)", link: ZOOM.zbd, variant: "shelter" },
      { subject: "Зарубіжна літер. (сховище)", link: NONE, variant: "shelter" },
      { subject: "Пізнаємо природу (сховище)", link: NONE, variant: "shelter" },
    ],
  },
  { day: "Субота", lessons: [], times: [] },
  { day: "Неділя", lessons: [], times: [] },
];
