const SW_PATH = "/sw.js";
const DEFAULT_ICON = "/images/icons/icon-01.svg";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch (err) {
    console.warn("Service worker registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";

  if (Notification.permission === "granted") {
    await registerServiceWorker();
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await registerServiceWorker();
  }
  return permission;
}

export interface ShowNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  url?: string;
}

export async function showBrowserNotification(
  title: string,
  options: ShowNotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const { body, icon = DEFAULT_ICON, tag, url } = options;
  const notificationOptions: NotificationOptions = {
    body,
    icon,
    tag,
    data: { url },
  };

  try {
    if ("serviceWorker" in navigator) {
      await registerServiceWorker();
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notificationOptions);
      return true;
    }

    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.error("Service worker notification failed, falling back:", err);

    try {
      new Notification(title, { body, icon, tag });
      return true;
    } catch (fallbackErr) {
      console.error("Notification fallback failed:", fallbackErr);
      return false;
    }
  }
}
