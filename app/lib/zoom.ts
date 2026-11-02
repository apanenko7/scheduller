/**
 * Перетворює веб-посилання Zoom на протокол настільного клієнта:
 * https://us04web.zoom.us/j/123?pwd=abc  →  zoommtg://zoom.us/join?action=join&confno=123&pwd=abc
 * Так браузер одразу пропонує відкрити застосунок, без проміжної сторінки зуму.
 * Повертає null, якщо посилання не схоже на запрошення в конференцію.
 */
export const zoomAppLink = (link: string) => {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith("zoom.us")) return null;

  const meetingId = url.pathname.match(/^\/j\/(\d+)/)?.[1];
  if (!meetingId) return null;

  const params = new URLSearchParams({ action: "join", confno: meetingId });
  const password = url.searchParams.get("pwd");
  if (password) params.set("pwd", password);

  return `zoommtg://zoom.us/join?${params}`;
};

/** На телефонах https-посилання зуму й так відкриває застосунок, а zoommtg там не працює */
export const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** Скільки чекаємо, чи відкрився застосунок, перш ніж відкрити зум у браузері */
const APP_FALLBACK_MS = 2500;

/**
 * Відкриває урок одразу в застосунку Zoom. Якщо застосунок так і не перехопив
 * фокус (не встановлений або користувач відмовився), відкриває звичайне посилання.
 */
export const openInZoomApp = (appLink: string, webLink: string) => {
  let appOpened = false;
  const markOpened = () => {
    appOpened = true;
  };

  window.addEventListener("blur", markOpened, { once: true });
  document.addEventListener("visibilitychange", markOpened, { once: true });
  window.location.href = appLink;

  setTimeout(() => {
    window.removeEventListener("blur", markOpened);
    document.removeEventListener("visibilitychange", markOpened);
    if (!appOpened) window.open(webLink, "_blank", "noopener");
  }, APP_FALLBACK_MS);
};
