/**
 * Local notifications sit behind a driver, exactly like audio/speech: the
 * screens and hooks stay free of native modules, and the daily reminder can be
 * wired to any library (Notifee, expo-notifications, …) — or left unregistered,
 * in which case the app still saves the preference and simply doesn't schedule.
 *
 * See docs/NOTIFICATIONS.md for a worked example of wiring a real scheduler.
 */
export interface DailyReminder {
  /** 0-23, device local time. */
  hour: number;
  /** 0-59. */
  minute: number;
  title: string;
  body: string;
}

export interface NotificationDriver {
  /** Prompt for permission if needed; resolve true when granted. */
  requestPermission(): Promise<boolean>;
  /** Schedule (or replace) the single daily reminder. */
  scheduleDailyReminder(reminder: DailyReminder): Promise<void>;
  /** Cancel the daily reminder. Safe to call when none is set. */
  cancelDailyReminder(): Promise<void>;
}

let driver: NotificationDriver | null = null;

export const registerNotificationDriver = (next: NotificationDriver | null) => {
  driver = next;
};

export const isNotificationsAvailable = () => driver !== null;

export const notificationScheduler: NotificationDriver = {
  async requestPermission() {
    return driver ? driver.requestPermission() : false;
  },
  async scheduleDailyReminder(reminder) {
    await driver?.scheduleDailyReminder(reminder);
  },
  async cancelDailyReminder() {
    await driver?.cancelDailyReminder();
  },
};
